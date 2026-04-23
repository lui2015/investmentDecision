// ===== 免费股票行情查询服务 =====
// 通过东方财富 push2 接口的 JSONP 协议在浏览器端直接拉取股票基础信息，
// 该接口无需鉴权、支持沪深/港/美股，返回 UTF-8 JSON，且允许跨域（JSONP 绕过 CORS）。
// 字段说明参考：f57=代码 f58=名称 f43=最新价 f100=行业 f116=总市值 f117=流通市值 f162=市盈(动) f167=市净率

export interface StockQuote {
  /** 股票代码（不含市场前缀），例如 600519 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 所属行业 */
  industry: string;
  /** 最新价 */
  price: number;
  /** 总市值（元） */
  marketCap: number;
  /** 流通市值（元） */
  circMarketCap: number;
  /** 市盈率（动） */
  peTtm: number;
  /** 市净率 */
  pb: number;
  /** 市场标识：0=深圳 1=上海 116=港股 105/106/107=美股 */
  market: number;
}

// 东方财富返回字段（部分）
interface EastMoneyRaw {
  data?: {
    f57?: string;
    f58?: string;
    f43?: number;
    f100?: string;
    f116?: number;
    f117?: number;
    f162?: number;
    f167?: number;
    f107?: number; // market
  } | null;
}

/**
 * 根据股票代码推断东方财富需要的 secid 前缀
 * - A 股：6 位数字，6/9 开头 → 沪市(1)，其它 → 深市(0)
 * - 港股：5 位数字 → 116
 */
function resolveSecId(rawCode: string): string | null {
  const code = rawCode.trim().toUpperCase();
  if (/^\d{6}$/.test(code)) {
    const head = code[0];
    const market = head === '6' || head === '9' ? 1 : 0; // 9 开头为 B 股沪市
    return `${market}.${code}`;
  }
  if (/^\d{5}$/.test(code)) {
    return `116.${code}`; // 港股
  }
  // 美股：大写字母，默认 105/106 需用户指明，暂不支持
  return null;
}

/**
 * 用 JSONP 方式调用东方财富行情接口，绕过浏览器 CORS。
 */
function jsonp<T>(url: string, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const cbName = `__em_cb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement('script');
    let timer: number | undefined;

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    (window as unknown as Record<string, unknown>)[cbName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('网络错误：无法访问行情接口'));
    };

    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('行情接口响应超时'));
    }, timeoutMs);

    const sep = url.includes('?') ? '&' : '?';
    script.src = `${url}${sep}cb=${cbName}`;
    document.body.appendChild(script);
  });
}

/**
 * 查询股票行情基础信息。
 * @param stockCode 股票代码，如 600519、000001、00700
 */
export async function fetchStockQuote(stockCode: string): Promise<StockQuote> {
  const secid = resolveSecId(stockCode);
  if (!secid) {
    throw new Error('无法识别的股票代码（支持 6 位 A 股 / 5 位港股）');
  }

  const fields = ['f57', 'f58', 'f43', 'f100', 'f116', 'f117', 'f162', 'f167', 'f107'].join(',');
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}&invt=2&fltt=1`;

  const raw = await jsonp<EastMoneyRaw>(url);
  const d = raw?.data;
  if (!d || !d.f58) {
    throw new Error('未查询到该股票，请确认代码是否正确');
  }

  // f43 / f116 / f117 需要按 fltt=1 已做了处理；价格字段为分，需 /100
  // 市值字段返回单位为"元"，直接使用
  // 注：不同字段精度策略，东方财富返回的 f43 已乘以 100，需除回
  const priceRaw = d.f43 ?? 0;
  const price = priceRaw > 0 ? priceRaw / 100 : 0;

  return {
    code: d.f57 ?? stockCode,
    name: d.f58 ?? '',
    industry: (d.f100 ?? '').toString(),
    price,
    marketCap: d.f116 ?? 0,
    circMarketCap: d.f117 ?? 0,
    peTtm: d.f162 && d.f162 > 0 ? d.f162 / 100 : 0,
    pb: d.f167 && d.f167 > 0 ? d.f167 / 100 : 0,
    market: d.f107 ?? 0,
  };
}
