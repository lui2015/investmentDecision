import { useState, useEffect, useCallback } from 'react';
import { useWatchlistStore, fetchStockQuotes, POPULAR_ITEMS, type QuoteData, type WatchItem } from '../store/watchlist';
import { useThemeStore } from '../store/theme';

export default function WatchlistPage() {
  const { items, addItem, removeItem } = useWatchlistStore();
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const [quotes, setQuotes] = useState<Map<string, QuoteData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [addType, setAddType] = useState<'stock' | 'fund'>('stock');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const data = await fetchStockQuotes(items);
      setQuotes(data);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    } catch (e) {
      console.error('行情刷新失败', e);
    }
    setLoading(false);
  }, [items]);

  // 首次加载和自动刷新
  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const timer = setInterval(refresh, 15000); // 15秒刷新
    return () => clearInterval(timer);
  }, [refresh, autoRefresh]);

  const handleAddCustom = () => {
    if (!searchText.trim()) return;
    const code = searchText.trim();
    addItem({ code, name: code, type: addType, addedAt: new Date().toISOString() });
    setSearchText('');
  };

  const handleAddPopular = (item: WatchItem) => {
    addItem({ ...item, addedAt: new Date().toISOString() });
  };

  const filteredPopular = POPULAR_ITEMS.filter(p =>
    !items.some(i => i.code === p.code) &&
    (p.code.includes(searchText) || p.name.includes(searchText))
  );

  const stockItems = items.filter(i => i.type === 'stock');
  const fundItems = items.filter(i => i.type === 'fund');

  return (
    <div className={`max-w-5xl mx-auto space-y-5 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>我的自选</h2>
          <div className="flex items-center gap-3 mt-1">
            {lastUpdate && <span className="text-xs t-muted">最后更新: {lastUpdate}</span>}
            {loading && <span className="text-xs t-accent animate-pulse">刷新中...</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${autoRefresh ? 't-accent-bg' : 't-card t-text2'}`}>
            {autoRefresh ? '⏱ 自动刷新' : '⏸ 已暂停'}
          </button>
          <button onClick={refresh} className="t-btn-ghost text-xs" disabled={loading}>🔄 手动刷新</button>
          <button onClick={() => setShowAdd(true)} className="t-btn-primary">+ 添加自选</button>
        </div>
      </div>

      {/* Stock watchlist */}
      {stockItems.length > 0 && (
        <div className="t-card overflow-hidden">
          <div className="px-4 py-3 t-bg3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
            <span>📈</span>
            <span className="text-sm font-semibold t-text">股票自选</span>
            <span className="text-xs t-muted">({stockItems.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="t-bg3" style={{ borderBottom: '1px solid var(--t-border)' }}>
                  <th className="text-left px-4 py-2.5 t-muted font-medium text-xs">名称/代码</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">最新价</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">涨跌幅</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">涨跌额</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">今开</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">最高</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">最低</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">成交量</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">成交额</th>
                  <th className="text-center px-4 py-2.5 t-muted font-medium text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map(item => {
                  const q = quotes.get(item.code);
                  const up = q ? q.changePercent >= 0 : true;
                  const color = !q ? 't-muted' : q.changePercent > 0 ? 't-danger' : q.changePercent < 0 ? 't-success' : 't-text';
                  return (
                    <tr key={item.code} className="hover:t-bg3 transition-colors" style={{ borderBottom: '1px solid var(--t-border)' }}>
                      <td className="px-4 py-3">
                        <div className="font-medium t-text">{q?.name || item.name}</div>
                        <div className="text-xs t-muted">{item.code}</div>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${color} ${isCyber && q?.changePercent ? (up ? '' : 'glow-success') : ''}`}>
                        {q ? q.price.toFixed(2) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${color}`}>
                        {q ? `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%` : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right ${color}`}>
                        {q ? `${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right t-text2">{q?.open.toFixed(2) || '—'}</td>
                      <td className="px-4 py-3 text-right t-text2">{q?.high.toFixed(2) || '—'}</td>
                      <td className="px-4 py-3 text-right t-text2">{q?.low.toFixed(2) || '—'}</td>
                      <td className="px-4 py-3 text-right t-muted text-xs">{q?.volume || '—'}</td>
                      <td className="px-4 py-3 text-right t-muted text-xs">{q?.amount || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.code)} className="t-muted hover:t-danger text-xs transition-colors">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fund watchlist */}
      {fundItems.length > 0 && (
        <div className="t-card overflow-hidden">
          <div className="px-4 py-3 t-bg3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
            <span>🏦</span>
            <span className="text-sm font-semibold t-text">基金自选</span>
            <span className="text-xs t-muted">({fundItems.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="t-bg3" style={{ borderBottom: '1px solid var(--t-border)' }}>
                  <th className="text-left px-4 py-2.5 t-muted font-medium text-xs">名称/代码</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">估算净值</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">估算涨幅</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">昨日净值</th>
                  <th className="text-right px-4 py-2.5 t-muted font-medium text-xs">更新时间</th>
                  <th className="text-center px-4 py-2.5 t-muted font-medium text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {fundItems.map(item => {
                  const q = quotes.get(item.code);
                  const color = !q ? 't-muted' : q.changePercent > 0 ? 't-danger' : q.changePercent < 0 ? 't-success' : 't-text';
                  return (
                    <tr key={item.code} className="hover:t-bg3 transition-colors" style={{ borderBottom: '1px solid var(--t-border)' }}>
                      <td className="px-4 py-3">
                        <div className="font-medium t-text">{q?.name || item.name}</div>
                        <div className="text-xs t-muted">{item.code}</div>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${color}`}>{q ? q.price.toFixed(4) : '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${color}`}>
                        {q ? `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right t-text2">{q?.prevClose.toFixed(4) || '—'}</td>
                      <td className="px-4 py-3 text-right t-muted text-xs">{q?.time || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.code)} className="t-muted hover:t-danger text-xs transition-colors">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className={`text-center py-20 t-card ${isCyber ? 'glow-border' : ''}`}>
          <div className={`text-5xl mb-4 ${isCyber ? 'glow-text' : ''}`}>⭐</div>
          <h3 className="text-lg font-semibold t-text mb-2">还没有自选</h3>
          <p className="text-sm t-muted mb-6">添加股票或基金到自选，实时跟踪行情</p>
          <button onClick={() => setShowAdd(true)} className="t-btn-primary">+ 添加自选</button>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className={`t-card p-6 w-full max-w-lg animate-fade-in ${isCyber ? 'glow-border' : ''}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-lg font-bold t-text mb-4 ${isCyber ? 'glow-text' : ''}`}>添加自选</h3>

            {/* Manual add */}
            <div className="flex gap-2 mb-4">
              <div className="flex">
                {(['stock', 'fund'] as const).map(t => (
                  <button key={t} onClick={() => setAddType(t)}
                    className={`px-3 py-2 text-xs first:rounded-l-lg last:rounded-r-lg ${addType === t ? 't-accent-bg' : 't-bg3 t-text2'}`}>
                    {t === 'stock' ? '股票' : '基金'}
                  </button>
                ))}
              </div>
              <input value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                placeholder={addType === 'stock' ? '输入股票代码，如 600519' : '输入基金代码，如 110011'}
                className="t-input flex-1" autoFocus />
              <button onClick={handleAddCustom} className="t-btn-primary">添加</button>
            </div>

            {/* Popular picks */}
            <div className="text-xs t-muted mb-2">热门自选</div>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredPopular.map(item => (
                <button key={item.code} onClick={() => handleAddPopular(item)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:t-bg3 transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.type === 'stock' ? '📈' : '🏦'}</span>
                    <div>
                      <span className="text-sm t-text font-medium">{item.name}</span>
                      <span className="text-xs t-muted ml-2">{item.code}</span>
                    </div>
                  </div>
                  <span className="text-xs t-accent">+ 添加</span>
                </button>
              ))}
              {filteredPopular.length === 0 && <p className="text-xs t-muted text-center py-4">无匹配项</p>}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setShowAdd(false)} className="t-btn-ghost">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
