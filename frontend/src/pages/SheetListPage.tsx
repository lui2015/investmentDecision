import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor, type AssetType, type DecisionStatus } from '../types';
import { useThemeStore } from '../store/theme';

export default function SheetListPage() {
  const { sheets, createSheet, deleteSheet } = useSheetStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | DecisionStatus>('all');

  // 从URL读取资产类型，默认stock
  const urlType = searchParams.get('type') as AssetType | null;
  const assetType: AssetType = urlType && ['stock', 'fund', 'bond', 'futures'].includes(urlType) ? urlType : 'stock';

  const filtered = sheets.filter(s =>
    s.assetType === assetType &&
    (filterStatus === 'all' || s.status === filterStatus)
  );

  const handleCreate = () => {
    const sheet = createSheet(assetType);
    setShowCreate(false);
    navigate(`/sheet/${sheet.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{AssetTypeIcon[assetType]}</span>
          <h2 className={`text-lg sm:text-xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>{AssetTypeLabel[assetType]}决策表</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/quick?type=${assetType}`} className="t-btn-primary text-xs sm:text-sm">⚡ 快速决策</Link>
          <button onClick={() => setShowCreate(true)} className="t-btn-primary text-xs sm:text-sm">+ 新建</button>
        </div>
      </div>

      {/* Status filter only */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[{ k: 'all', l: '全部状态' }, ...Object.entries(StatusLabel).map(([k, l]) => ({ k, l }))].map(f => (
          <button key={f.k} onClick={() => setFilterStatus(f.k as typeof filterStatus)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0 ${filterStatus === f.k ? 't-accent-light font-medium' : 't-card'}`}
            style={filterStatus === f.k ? {} : { color: 'var(--t-text-secondary)' }}>
            {f.l}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 sm:py-20 t-card ${isCyber ? 'glow-border' : ''}`}>
          <div className="text-3xl sm:text-4xl mb-3">{isCyber ? '⚡' : '📋'}</div>
          <h3 className="text-base sm:text-lg font-semibold t-text mb-2">还没有{AssetTypeLabel[assetType]}决策表</h3>
          <p className="text-xs sm:text-sm t-muted">先写理由，再下单。</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sheet => {
            const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';
            const code = sheet.basicInfo.stockCode || sheet.basicInfo.fundCode || sheet.basicInfo.bondCode || sheet.basicInfo.contractCode || '';
            return (
              <div key={sheet.id} className="t-card t-card-hover p-3 sm:p-4">
                <Link to={`/sheet/${sheet.id}`} className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0">{AssetTypeIcon[sheet.assetType]}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold t-text text-sm truncate">{name}</span>
                        {code && <span className="text-[10px] t-muted">{code}</span>}
                      </div>
                      <div className="text-[10px] sm:text-xs t-muted mt-0.5 flex items-center gap-1 flex-wrap">
                        {sheet.isQuick && <span className="px-1 py-0.5 rounded text-[9px] font-bold" style={{ background: 'var(--t-accent-light)', color: 'var(--t-accent-text)' }}>⚡快速</span>}
                        <span>{new Date(sheet.updatedAt).toLocaleDateString('zh-CN')}</span>
                        {sheet.vetoConclusion === 'failed' && <span className="t-danger">⛔ 否决</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {sheet.totalScore > 0 && <span className={`text-xs sm:text-sm font-bold ${sheet.totalScore >= 85 ? 't-success' : sheet.totalScore >= 70 ? 't-accent' : 't-danger'}`}>{sheet.totalScore}</span>}
                    <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${StatusColor[sheet.status]}`}>{StatusLabel[sheet.status]}</span>
                    <button onClick={(e) => { e.preventDefault(); deleteSheet(sheet.id); }} className="t-muted hover:t-danger text-xs sm:text-sm ml-1">🗑</button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Create confirm */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className={`t-card p-5 sm:p-6 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl animate-fade-in ${isCyber ? 'glow-border' : ''}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-base sm:text-lg font-bold t-text mb-3 ${isCyber ? 'glow-text' : ''}`}>新建{AssetTypeLabel[assetType]}决策表</h3>
            <p className="text-xs sm:text-sm t-muted mb-4">将创建一份完整的{AssetTypeLabel[assetType]}决策表（{assetType === 'futures' ? '12+1' : '12'}个板块），逐步填写。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 t-btn-ghost text-sm">取消</button>
              <button onClick={handleCreate} className="flex-1 t-btn-primary text-sm">确认创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
