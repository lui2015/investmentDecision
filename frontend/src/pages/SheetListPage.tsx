import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor, type AssetType, type DecisionStatus } from '../types';
import { useThemeStore } from '../store/theme';

export default function SheetListPage() {
  const { sheets, createSheet, deleteSheet } = useSheetStore();
  const navigate = useNavigate();
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState<'all' | AssetType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | DecisionStatus>('all');

  const filtered = sheets.filter(s =>
    (filterType === 'all' || s.assetType === filterType) &&
    (filterStatus === 'all' || s.status === filterStatus)
  );

  const handleCreate = (type: AssetType) => {
    const sheet = createSheet(type);
    setShowCreate(false);
    navigate(`/sheet/${sheet.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>投资决策表</h2>
        <button onClick={() => setShowCreate(true)} className="t-btn-primary">+ 新建决策表</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ k: 'all', l: '全部' }, ...Object.entries(AssetTypeLabel).map(([k, l]) => ({ k, l }))].map(f => (
          <button key={f.k} onClick={() => setFilterType(f.k as typeof filterType)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filterType === f.k ? 't-accent-bg' : 't-card hover:t-bg3'}`}
            style={filterType === f.k ? {} : { color: 'var(--t-text-secondary)' }}>
            {f.l}
          </button>
        ))}
        <div className="w-px" style={{ background: 'var(--t-border)' }} />
        {[{ k: 'all', l: '全部状态' }, ...Object.entries(StatusLabel).map(([k, l]) => ({ k, l }))].map(f => (
          <button key={f.k} onClick={() => setFilterStatus(f.k as typeof filterStatus)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filterStatus === f.k ? 't-accent-light font-medium' : 't-card hover:t-bg3'}`}
            style={filterStatus === f.k ? {} : { color: 'var(--t-text-secondary)' }}>
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={`text-center py-20 t-card ${isCyber ? 'glow-border' : ''}`}>
          <div className="text-4xl mb-4">{isCyber ? '⚡' : '📋'}</div>
          <h3 className="text-lg font-semibold t-text mb-2">{sheets.length === 0 ? '还没有决策表' : '没有匹配的决策表'}</h3>
          <p className="text-sm t-muted">先写理由，再下单。如果逻辑无法写清楚，说明还没想清楚。</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sheet => {
            const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';
            const code = sheet.basicInfo.stockCode || sheet.basicInfo.fundCode || sheet.basicInfo.bondCode || sheet.basicInfo.contractCode || '';
            return (
              <div key={sheet.id} className="t-card t-card-hover p-4">
                <div className="flex items-center justify-between">
                  <Link to={`/sheet/${sheet.id}`} className="flex-1 flex items-center gap-3">
                    <span className="text-xl">{AssetTypeIcon[sheet.assetType]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold t-text">{name}</span>
                        {code && <span className="text-xs t-muted">{code}</span>}
                      </div>
                      <div className="text-xs t-muted mt-0.5">
                        {AssetTypeLabel[sheet.assetType]} · {new Date(sheet.updatedAt).toLocaleDateString('zh-CN')}
                        {sheet.vetoConclusion === 'failed' && <span className="ml-2 t-danger">⛔ 否决项未通过</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    {sheet.totalScore > 0 && <span className={`text-sm font-bold ${sheet.totalScore >= 85 ? 't-success' : sheet.totalScore >= 70 ? 't-accent' : 't-danger'}`}>{sheet.totalScore}分</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${StatusColor[sheet.status]}`}>{StatusLabel[sheet.status]}</span>
                    <button onClick={(e) => { e.preventDefault(); deleteSheet(sheet.id); }} className="t-muted hover:t-danger text-sm transition-colors">🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className={`t-card p-6 w-full max-w-md animate-fade-in ${isCyber ? 'glow-border' : ''}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-lg font-bold t-text mb-4 ${isCyber ? 'glow-text' : ''}`}>选择决策表类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
                <button key={type} onClick={() => handleCreate(type)}
                  className="t-card t-card-hover p-4 text-left transition-all">
                  <div className="text-2xl mb-2">{AssetTypeIcon[type]}</div>
                  <div className="font-semibold t-text">{AssetTypeLabel[type]}决策表</div>
                  <div className="text-xs t-muted mt-1">
                    {type === 'futures' ? '12+1板块 · 10项否决(最严)' : '12板块 · 7项否决'}
                  </div>
                  {type === 'futures' && <div className="text-xs t-danger mt-1">⚠️ 含强制风险确认</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
