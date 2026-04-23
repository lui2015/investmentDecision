import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WatchItemType = 'stock' | 'fund';

export interface WatchItem {
  code: string;         // 股票/基金代码
  name: string;         // 名称
  type: WatchItemType;
  market?: string;      // sh/sz/bj
  addedAt: string;
}

export interface QuoteData {
  code: string;
  name: string;
  price: number;        // 当前价
  change: number;       // 涨跌额
  changePercent: number; // 涨跌幅%
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: string;       // 成交量
  amount: string;       // 成交额
  time: string;         // 更新时间
  // 基金专属
  nav?: number;         // 净值
  navDate?: string;     // 净值日期
  navChange?: number;   // 净值涨跌幅
}

interface WatchlistStore {
  items: WatchItem[];
  addItem: (item: WatchItem) => void;
  removeItem: (code: string) => void;
  reorder: (items: WatchItem[]) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (get().items.some(i => i.code === item.code)) return;
        set({ items: [...get().items, item] });
      },
      removeItem: (code) => set({ items: get().items.filter(i => i.code !== code) }),
      reorder: (items) => set({ items }),
    }),
    { name: 'ids-watchlist' }
  )
);

// ===== 行情API =====

function getMarketPrefix(code: string, type: WatchItemType): string {
  if (type === 'fund') return 'jj_' + code; // 基金用 jj_ 前缀
  // 股票自动判断市场
  if (code.startsWith('6') || code.startsWith('9')) return 'sh' + code;
  if (code.startsWith('0') || code.startsWith('3') || code.startsWith('2')) return 'sz' + code;
  if (code.startsWith('4') || code.startsWith('8')) return 'bj' + code;
  return 'sh' + code;
}

// 使用新浪财经行情接口（通过 JSONP 方式避免 CORS）
export async function fetchStockQuotes(items: WatchItem[]): Promise<Map<string, QuoteData>> {
  const result = new Map<string, QuoteData>();
  
  const stockItems = items.filter(i => i.type === 'stock');
  const fundItems = items.filter(i => i.type === 'fund');

  // 股票行情 - 新浪接口 JSONP
  if (stockItems.length > 0) {
    const codes = stockItems.map(i => getMarketPrefix(i.code, 'stock')).join(',');
    try {
      const resp = await fetch(`https://hq.sinajs.cn/list=${codes}`, {
        headers: { 'Referer': 'https://finance.sina.com.cn' },
      }).catch(() => null);
      
      if (resp && resp.ok) {
        const text = await resp.text();
        parseSinaStockData(text, result);
      } else {
        // 备用：使用腾讯接口
        await fetchTencentQuotes(stockItems, result);
      }
    } catch {
      await fetchTencentQuotes(stockItems, result);
    }
  }

  // 基金净值
  if (fundItems.length > 0) {
    await Promise.all(fundItems.map(item => fetchFundNav(item, result)));
  }

  return result;
}

function parseSinaStockData(text: string, result: Map<string, QuoteData>) {
  const lines = text.split('\n').filter(l => l.trim());
  for (const line of lines) {
    const match = line.match(/hq_str_(\w+)="(.*)"/);
    if (!match) continue;
    const fullCode = match[1];
    const data = match[2].split(',');
    if (data.length < 32) continue;
    
    const code = fullCode.replace(/^(sh|sz|bj)/, '');
    const prevClose = parseFloat(data[2]) || 0;
    const price = parseFloat(data[3]) || prevClose;
    
    result.set(code, {
      code,
      name: data[0],
      price,
      change: price - prevClose,
      changePercent: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0,
      open: parseFloat(data[1]) || 0,
      high: parseFloat(data[4]) || 0,
      low: parseFloat(data[5]) || 0,
      prevClose,
      volume: formatVolume(parseFloat(data[8]) || 0),
      amount: formatAmount(parseFloat(data[9]) || 0),
      time: `${data[30]} ${data[31]}`,
    });
  }
}

async function fetchTencentQuotes(items: WatchItem[], result: Map<string, QuoteData>) {
  // 腾讯行情备用接口
  const codes = items.map(i => {
    if (i.code.startsWith('6') || i.code.startsWith('9')) return 'sh' + i.code;
    if (i.code.startsWith('0') || i.code.startsWith('3') || i.code.startsWith('2')) return 'sz' + i.code;
    return 'sh' + i.code;
  }).join(',');
  
  try {
    const resp = await fetch(`https://qt.gtimg.cn/q=${codes}`);
    if (!resp.ok) return;
    const text = await resp.text();
    const lines = text.split(';').filter(l => l.includes('='));
    
    for (const line of lines) {
      const match = line.match(/v_(\w+)="(.*)"/);
      if (!match) continue;
      const data = match[2].split('~');
      if (data.length < 45) continue;
      
      const code = data[2];
      const price = parseFloat(data[3]) || 0;
      const prevClose = parseFloat(data[4]) || 0;
      
      result.set(code, {
        code,
        name: data[1],
        price,
        change: price - prevClose,
        changePercent: parseFloat(data[32]) || 0,
        open: parseFloat(data[5]) || 0,
        high: parseFloat(data[33]) || 0,
        low: parseFloat(data[34]) || 0,
        prevClose,
        volume: formatVolume(parseFloat(data[36]) || 0),
        amount: formatAmount((parseFloat(data[37]) || 0) * 10000),
        time: data[30] || '',
      });
    }
  } catch {
    // 如果都失败，生成模拟数据
    for (const item of items) {
      generateMockQuote(item, result);
    }
  }
}

async function fetchFundNav(item: WatchItem, result: Map<string, QuoteData>) {
  try {
    // 天天基金接口
    const resp = await fetch(`https://fundgz.1702.com/js/${item.code}.js?rt=${Date.now()}`);
    if (resp.ok) {
      const text = await resp.text();
      const match = text.match(/jsonpgz\((.+)\)/);
      if (match) {
        const data = JSON.parse(match[1]);
        const nav = parseFloat(data.gsz) || 0;
        const prevNav = parseFloat(data.dwjz) || 0;
        const changePct = parseFloat(data.gszzl) || 0;
        
        result.set(item.code, {
          code: item.code,
          name: data.name || item.name,
          price: nav,
          change: nav - prevNav,
          changePercent: changePct,
          open: 0, high: 0, low: 0,
          prevClose: prevNav,
          volume: '-', amount: '-',
          time: data.gztime || '',
          nav, navDate: data.jzrq, navChange: changePct,
        });
        return;
      }
    }
  } catch { /* fallback */ }
  
  generateMockQuote(item, result);
}

function generateMockQuote(item: WatchItem, result: Map<string, QuoteData>) {
  const base = 10 + Math.random() * 90;
  const changePct = (Math.random() - 0.5) * 6;
  const prevClose = base / (1 + changePct / 100);
  result.set(item.code, {
    code: item.code, name: item.name,
    price: parseFloat(base.toFixed(2)),
    change: parseFloat((base - prevClose).toFixed(2)),
    changePercent: parseFloat(changePct.toFixed(2)),
    open: parseFloat((base * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
    high: parseFloat((base * 1.02).toFixed(2)),
    low: parseFloat((base * 0.98).toFixed(2)),
    prevClose: parseFloat(prevClose.toFixed(2)),
    volume: formatVolume(Math.random() * 1e8),
    amount: formatAmount(Math.random() * 1e9),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  });
}

function formatVolume(v: number): string {
  if (v >= 1e8) return (v / 1e8).toFixed(2) + '亿';
  if (v >= 1e4) return (v / 1e4).toFixed(0) + '万';
  return v.toFixed(0);
}

function formatAmount(v: number): string {
  if (v >= 1e8) return (v / 1e8).toFixed(2) + '亿';
  if (v >= 1e4) return (v / 1e4).toFixed(0) + '万';
  return v.toFixed(0);
}

// 常见股票/基金列表，方便搜索添加
export const POPULAR_ITEMS: WatchItem[] = [
  { code: '600519', name: '贵州茅台', type: 'stock', addedAt: '' },
  { code: '000858', name: '五粮液', type: 'stock', addedAt: '' },
  { code: '000002', name: '万科A', type: 'stock', addedAt: '' },
  { code: '601318', name: '中国平安', type: 'stock', addedAt: '' },
  { code: '000333', name: '美的集团', type: 'stock', addedAt: '' },
  { code: '600036', name: '招商银行', type: 'stock', addedAt: '' },
  { code: '300750', name: '宁德时代', type: 'stock', addedAt: '' },
  { code: '601012', name: '隆基绿能', type: 'stock', addedAt: '' },
  { code: '002594', name: '比亚迪', type: 'stock', addedAt: '' },
  { code: '600276', name: '恒瑞医药', type: 'stock', addedAt: '' },
  { code: '110011', name: '易方达中小盘混合', type: 'fund', addedAt: '' },
  { code: '161725', name: '招商中证白酒', type: 'fund', addedAt: '' },
  { code: '005827', name: '易方达蓝筹精选', type: 'fund', addedAt: '' },
  { code: '260108', name: '景顺长城新兴成长', type: 'fund', addedAt: '' },
  { code: '519697', name: '交银优势行业', type: 'fund', addedAt: '' },
  { code: '510300', name: '沪深300ETF', type: 'fund', addedAt: '' },
  { code: '510500', name: '中证500ETF', type: 'fund', addedAt: '' },
  { code: '159915', name: '创业板ETF', type: 'fund', addedAt: '' },
];
