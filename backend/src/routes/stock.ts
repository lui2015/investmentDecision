import { Router, Request, Response } from 'express';

// ===== 股票行情代理（服务器端请求东方财富，规避浏览器 JSONP / 客户端 IP 限制）=====
// 说明：东财行情接口对部分客户端网络返回空，但服务器端请求稳定；
// 统一由后端代理，前端只调用自身 API，避免 CORS / CSP / referer 等问题。

const router = Router();

const EM_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  Referer: 'https://quote.eastmoney.com/',
};

/** 带超时的 fetch */
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { headers: EM_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** 将 \uXXXX 字面转义序列还原为真实字符（腾讯 smartbox 的中文以此形式返回） */
function decodeUnicodeEscapes(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/**
 * 根据股票代码推断东方财富 secid：
 * - 6 位 A 股：6/9 开头 → 沪市(1)，其余 → 深市(0)
 * - 5 位港股 → 116
 */
function resolveSecId(rawCode: string): string | null {
  const code = rawCode.trim().toUpperCase();
  if (/^\d{6}$/.test(code)) {
    const head = code[0];
    const market = head === '6' || head === '9' ? 1 : 0;
    return `${market}.${code}`;
  }
  if (/^\d{5}$/.test(code)) {
    return `116.${code}`;
  }
  return null;
}

// GET /api/stock/search?kw=茅台
// 使用腾讯 smartbox 搜索（GBK 编码），东财搜索域名在该服务器网络被拦截，故改用腾讯源。
router.get('/search', async (req: Request, res: Response) => {
  const kw = String(req.query.kw ?? '').trim();
  // 输入校验：限制长度，防止异常输入
  if (!kw || kw.length > 32) {
    return res.json([]);
  }
  try {
    const url = `https://smartbox.gtimg.cn/s3/?q=${encodeURIComponent(kw)}&t=all`;
    const resp = await fetchWithTimeout(url);
    const buf = Buffer.from(await resp.arrayBuffer());
    // 腾讯返回 GBK 编码：v_hint="市场~代码~名称~拼音~类型^..."
    const text = new TextDecoder('gbk').decode(buf);
    const m = text.match(/"([\s\S]*)"/);
    const body = m ? m[1] : '';
    if (!body) return res.json([]);

    const marketNameMap: Record<string, string> = { sh: '沪', sz: '深', hk: '港股', us: '美股' };
    // 排除基金 / ETF / 指数等非个股类型
    const excludeTypes = new Set(['ETF', 'LOF', 'FJ', 'ZS', 'REIT', 'QZ', 'WACC', 'FB']);

    const results = body
      .split('^')
      .map(item => item.split('~'))
      .filter(p => p.length >= 5)
      .map(p => {
        const [mkt, code, name, pinyin, type] = p;
        return { mkt, code, name, pinyin, type };
      })
      .filter(r => r.code && r.name && !excludeTypes.has(r.type))
      // 仅保留 A 股 / 港股个股（quote 支持数字代码；美股代码非数字，暂不支持）
      .filter(r => (r.mkt === 'sh' || r.mkt === 'sz' || r.mkt === 'hk') && /^\d{5,6}$/.test(r.code))
      .map(r => {
        const mktLabel = marketNameMap[r.mkt] || r.mkt;
        // A 股补充 A/B 标识
        const marketName =
          r.mkt === 'sh' || r.mkt === 'sz' ? `${mktLabel}${r.type === 'GP-A' ? 'A' : ''}` : mktLabel;
        return {
          code: r.code,
          name: decodeUnicodeEscapes(r.name),
          secid: `${r.mkt}${r.code}`,
          marketName,
          pinyin: r.pinyin || '',
        };
      });
    res.json(results);
  } catch {
    res.status(502).json({ error: '行情搜索服务暂时不可用' });
  }
});

// GET /api/stock/quote?code=600519
router.get('/quote', async (req: Request, res: Response) => {
  const code = String(req.query.code ?? '').trim();
  // 输入校验：仅允许 5-6 位数字，防止 SSRF / 异常输入
  if (!/^\d{5,6}$/.test(code)) {
    return res.status(400).json({ error: '无法识别的股票代码（支持 6 位 A 股 / 5 位港股）' });
  }
  const secid = resolveSecId(code);
  if (!secid) {
    return res.status(400).json({ error: '无法识别的股票代码' });
  }
  try {
    // fltt=2：返回真实数值（价格/PE/PB 无需再除以 100）
    // 使用 push2delay 域名（该服务器 IP 下 push2 主域名被限流，delay 域名稳定可用，为延迟行情）
    // 行业字段：f100 常为空，实际行业名在 f127（如"白酒Ⅱ"）
    const fields = ['f57', 'f58', 'f43', 'f100', 'f127', 'f107', 'f116', 'f117', 'f162', 'f167'].join(',');
    const url = `https://push2delay.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}&invt=2&fltt=2`;
    const resp = await fetchWithTimeout(url);
    const raw = (await resp.json()) as {
      data?: {
        f57?: string;
        f58?: string;
        f43?: number;
        f100?: string;
        f127?: string;
        f107?: number;
        f116?: number;
        f117?: number;
        f162?: number;
        f167?: number;
      } | null;
    };
    const d = raw?.data;
    if (!d || !d.f58) {
      return res.status(404).json({ error: '未查询到该股票，请确认代码是否正确' });
    }
    const num = (v: unknown) => (typeof v === 'number' && isFinite(v) && v > 0 ? v : 0);
    res.json({
      code: d.f57 ?? code,
      name: d.f58 ?? '',
      industry: (d.f100 || d.f127 || '').toString(),
      price: num(d.f43),
      marketCap: num(d.f116),
      circMarketCap: num(d.f117),
      peTtm: num(d.f162),
      pb: num(d.f167),
      market: d.f107 ?? 0,
    });
  } catch {
    res.status(502).json({ error: '行情服务暂时不可用，请稍后重试' });
  }
});

export default router;
