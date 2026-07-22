import { Router, type Request, type Response } from 'express';

const router = Router();

// ===== 工具函数 =====

// 东方财富 secid 推断：6 开头沪市(1.)，0/3 开头深市(0.)，5 位数字港股(116.)
function guessSecid(code: string): string {
  const c = code.trim();
  if (/^\d{5}$/.test(c)) return `116.${c}`;
  if (/^6/.test(c)) return `1.${c}`;
  return `0.${c}`;
}

// 还原 \uXXXX 形式的 unicode 转义为真实字符
function decodeUnicodeEscapes(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) =>
    String.fromCharCode(parseInt(h, 16)),
  );
}

// 通用带超时的 fetch（extraHeaders 可覆盖默认 Referer 等）
async function fetchWithTimeout(
  url: string,
  timeoutMs = 6000,
  extraHeaders: Record<string, string> = {},
): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Referer: 'https://quote.eastmoney.com/',
        ...extraHeaders,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

// ===== 行情查询 =====
router.get('/quote', async (req: Request, res: Response) => {
  const code = String(req.query.code || '').trim();
  if (!/^\d{5,6}$/.test(code)) {
    return res.status(400).json({ error: '无法识别的股票代码' });
  }
  const secid = guessSecid(code);
  const fields = 'f43,f57,f58,f84,f85,f107,f116,f117,f162,f167,f127,f100';
  const url = `https://push2delay.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}&fltt=2&invt=2`;
  try {
    const r = await fetchWithTimeout(url);
    const json: any = await r.json();
    const d = json?.data;
    if (!d) return res.status(404).json({ error: '未查询到该股票' });
    const price = Number(d.f43);
    const marketCap = Number(d.f116);
    res.json({
      code,
      name: d.f58,
      industry: d.f100 || d.f127 || '',
      price: Number.isFinite(price) ? price : 0,
      marketCap: Number.isFinite(marketCap) ? marketCap : 0,
      circMarketCap: Number(d.f117) || 0,
      peTtm: Number(d.f162) || 0,
      pb: Number(d.f167) || 0,
      market: Number(d.f107) || 0,
    });
  } catch {
    res.status(502).json({ error: '行情接口请求失败' });
  }
});

// ===== 股票搜索 =====
// 使用新浪 suggest 接口（部分服务器网络下腾讯 smartbox 会返回空）。
// 返回格式：var suggestvalue="名称,type,纯代码,带前缀代码,全称,,全称,99,1,...;下一条...";
// 记录以 ; 分隔，字段以 , 分隔；中文为原始 GBK。
// type: 11=沪深A股（parts[3] 形如 sh600519/sz002594），31=港股（parts[3] 无前缀，如 00700）。
router.get('/search', async (req: Request, res: Response) => {
  const kw = String(req.query.kw || '').trim();
  if (!kw) return res.json([]);
  const url = `https://suggest3.sinajs.cn/suggest/type=11,12,13,14,15,31,33&key=${encodeURIComponent(
    kw,
  )}`;
  try {
    const r = await fetchWithTimeout(url, 6000, {
      Referer: 'https://finance.sina.com.cn/',
    });
    const buf = await r.arrayBuffer();
    // 响应为 GBK 编码；若出现 \uXXXX 转义再兜底反转义
    let text = new TextDecoder('gbk').decode(buf);
    text = decodeUnicodeEscapes(text);
    const m = text.match(/="([^"]*)"/);
    if (!m || !m[1]) return res.json([]);
    const items = m[1].split(';').filter(Boolean);
    const results = items.map((item) => {
      const parts = item.split(',');
      const name = parts[0] || '';
      const type = parts[1] || '';
      const code = parts[2] || ''; // 纯数字代码
      const prefixed = parts[3] || ''; // sh600519 / sz002594 / 00700
      let marketName = '';
      let secid = '';
      if (type === '11') {
        if (prefixed.startsWith('sh')) {
          marketName = '沪A';
          secid = `1.${code}`;
        } else if (prefixed.startsWith('sz')) {
          marketName = '深A';
          secid = `0.${code}`;
        } else if (/^6/.test(code)) {
          marketName = '沪A';
          secid = `1.${code}`;
        } else {
          marketName = '深A';
          secid = `0.${code}`;
        }
      } else if (type === '31') {
        marketName = '港股';
        secid = `116.${code}`;
      }
      return { code, name, secid, marketName, pinyin: '' };
    });
    const filtered = results.filter(
      (x) =>
        /^\d{5,6}$/.test(x.code) &&
        ['沪A', '深A', '港股'].includes(x.marketName) &&
        // 过滤港股人民币柜台/临时 R 股（8xxxx），行情接口通常无法查询
        !(x.marketName === '港股' && x.code.startsWith('8')),
    );
    const seen = new Set<string>();
    const dedup = filtered.filter((x) => {
      if (seen.has(x.secid)) return false;
      seen.add(x.secid);
      return true;
    });
    res.json(dedup.slice(0, 12));
  } catch {
    res.json([]);
  }
});

// ===== 财务指标（定量分析自动拉取）=====
// 数据源：东方财富 F10「主要财务指标」RPT_F10_FINANCE_MAINFINADATA。
// 仅支持 A 股（沪深）；港股/其他返回 supported=false，由前端提示手动填写。
// 返回最新一期(latest)与最近若干年报(annual[])，供“当前情况 / 近3年·历史”对照。
function fmtPct(v: any): string {
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toFixed(2)}%` : '';
}
function fmtNum(v: any, digits = 2): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(digits) : '';
}

router.get('/financials', async (req: Request, res: Response) => {
  const code = String(req.query.code || '').trim();
  if (!/^\d{5,6}$/.test(code)) {
    return res.status(400).json({ error: '无法识别的股票代码' });
  }
  // 仅 A 股支持：6 开头沪(SH)，0/3 开头深(SZ)；其余（港股 5 位等）不支持
  let suffix = '';
  if (/^6\d{5}$/.test(code)) suffix = 'SH';
  else if (/^[03]\d{5}$/.test(code)) suffix = 'SZ';
  if (!suffix) {
    return res.json({ supported: false, code, latest: null, annual: [] });
  }
  const secucode = `${code}.${suffix}`;
  const columns = [
    'SECURITY_NAME_ABBR',
    'REPORT_DATE',
    'REPORT_TYPE',
    'REPORT_DATE_NAME',
    'TOTALOPERATEREVETZ', // 营收同比增长
    'PARENTNETPROFITTZ', // 归母净利润同比增长
    'ROEJQ', // 加权ROE
    'ROIC', // ROIC
    'XSMLL', // 毛利率
    'XSJLL', // 净利率
    'MGJYXJJE', // 每股经营现金流
    'ZCFZL', // 资产负债率
    'LD', // 流动比率
    'SD', // 速动比率
  ].join(',');
  const url =
    `https://datacenter.eastmoney.com/securities/api/data/v1/get?reportName=RPT_F10_FINANCE_MAINFINADATA` +
    `&columns=${columns}` +
    `&filter=${encodeURIComponent(`(SECUCODE="${secucode}")`)}` +
    `&pageNumber=1&pageSize=20&sortColumns=REPORT_DATE&sortTypes=-1&source=HSF10&client=PC`;
  try {
    const r = await fetchWithTimeout(url, 8000, {
      Referer: 'https://emweb.securities.eastmoney.com/',
    });
    const json: any = await r.json();
    const rows: any[] = json?.result?.data || [];
    if (!rows.length) {
      return res.json({ supported: true, code, latest: null, annual: [] });
    }
    const mapRow = (d: any) => ({
      reportDate: d.REPORT_DATE ? String(d.REPORT_DATE).slice(0, 10) : '',
      reportName: d.REPORT_DATE_NAME || '',
      reportType: d.REPORT_TYPE || '',
      revenueGrowth: fmtPct(d.TOTALOPERATEREVETZ),
      netProfitGrowth: fmtPct(d.PARENTNETPROFITTZ),
      roe: fmtPct(d.ROEJQ),
      roic: fmtPct(d.ROIC),
      grossMargin: fmtPct(d.XSMLL),
      netMargin: fmtPct(d.XSJLL),
      opCashPerShare: fmtNum(d.MGJYXJJE),
      debtRatio: fmtPct(d.ZCFZL),
      currentRatio: fmtNum(d.LD),
      quickRatio: fmtNum(d.SD),
    });
    const latest = mapRow(rows[0]);
    const annual = rows
      .filter((d) => d.REPORT_TYPE === '年报')
      .slice(0, 3)
      .map(mapRow);
    res.json({
      supported: true,
      code,
      name: rows[0].SECURITY_NAME_ABBR || '',
      latest,
      annual,
    });
  } catch {
    res.status(502).json({ error: '财务数据接口请求失败' });
  }
});

export default router;
