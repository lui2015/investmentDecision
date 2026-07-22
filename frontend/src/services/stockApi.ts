// ===== 股票行情查询服务 =====
// 统一走后端代理（/api/stock/*）：东财行情接口对部分客户端网络返回空/受限，
// 由服务器端请求更稳定，同时规避浏览器 JSONP / CORS / CSP / referer 等限制。

// API base URL（与 store/auth.ts 保持一致）
const API_BASE = import.meta.env.PROD
  ? '/investmentDecision/api'
  : 'http://localhost:3001/api';

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
  /** 市场标识：0=深圳 1=上海 116=港股 */
  market: number;
}

/**
 * 查询股票行情基础信息（经后端代理）。
 * @param stockCode 股票代码，如 600519、000001、00700
 */
export async function fetchStockQuote(stockCode: string): Promise<StockQuote> {
  const code = stockCode.trim();
  if (!/^\d{5,6}$/.test(code)) {
    throw new Error('无法识别的股票代码（支持 6 位 A 股 / 5 位港股）');
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/stock/quote?code=${encodeURIComponent(code)}`);
  } catch {
    throw new Error('网络错误：无法访问行情接口');
  }
  if (!res.ok) {
    let msg = '未查询到该股票，请确认代码是否正确';
    try {
      const err = await res.json();
      if (err?.error) msg = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as StockQuote;
}

// ===== 按公司名称 / 拼音 / 代码模糊搜索股票 =====

export interface StockSearchResult {
  /** 6 位股票代码，如 600519 */
  code: string;
  /** 股票名称（公司名） */
  name: string;
  /** 东方财富 secid，如 1.600519 */
  secid: string;
  /** 市场名称，如 沪A / 深A */
  marketName: string;
  /** 拼音首字母，用于匹配 */
  pinyin: string;
}

/**
 * 按公司名称 / 拼音 / 代码模糊搜索股票（经后端代理）。
 */
export async function searchStocks(keyword: string): Promise<StockSearchResult[]> {
  const kw = keyword.trim();
  if (!kw) return [];
  try {
    const res = await fetch(`${API_BASE}/stock/search?kw=${encodeURIComponent(kw)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as StockSearchResult[]) : [];
  } catch {
    return [];
  }
}
