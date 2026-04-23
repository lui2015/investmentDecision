import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor, type AssetType, type DecisionStatus } from '../types';

export default function SheetListPage() {
  const { sheets, createSheet, deleteSheet } = useSheetStore();
  const navigate = useNavigate();
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
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">投资决策表</h2>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ 新建决策表</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ k: 'all', l: '全部' }, ...Object.entries(AssetTypeLabel).map(([k, l]) => ({ k, l }))].map(f => (
          <button key={f.k} onClick={() => setFilterType(f.k as typeof filterType)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterType === f.k ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f.l}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-1" />
        {[{ k: 'all', l: '全部状态' }, ...Object.entries(StatusLabel).map(([k, l]) => ({ k, l }))].map(f => (
          <button key={f.k} onClick={() => setFilterStatus(f.k as typeof filterStatus)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStatus === f.k ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">{sheets.length === 0 ? '还没有决策表' : '没有匹配的决策表'}</h3>
          <p className="text-sm text-slate-500">先写理由，再下单。如果逻辑无法写清楚，说明还没想清楚。</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sheet => {
            const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';
            const code = sheet.basicInfo.stockCode || sheet.basicInfo.fundCode || sheet.basicInfo.bondCode || sheet.basicInfo.contractCode || '';
            return (
              <div key={sheet.id} className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <Link to={`/sheet/${sheet.id}`} className="flex-1 flex items-center gap-3">
                    <span className="text-xl">{AssetTypeIcon[sheet.assetType]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{name}</span>
                        {code && <span className="text-xs text-slate-400">{code}</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {AssetTypeLabel[sheet.assetType]} · {new Date(sheet.updatedAt).toLocaleDateString('zh-CN')}
                        {sheet.vetoConclusion === 'failed' && <span className="ml-2 text-red-500">⛔ 否决项未通过</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    {sheet.totalScore > 0 && (
                      <span className={`text-sm font-bold ${sheet.totalScore >= 85 ? 'text-green-600' : sheet.totalScore >= 70 ? 'text-blue-600' : sheet.totalScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                        {sheet.totalScore}分
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${StatusColor[sheet.status]}`}>{StatusLabel[sheet.status]}</span>
                    <button onClick={(e) => { e.preventDefault(); deleteSheet(sheet.id); }} className="text-slate-400 hover:text-red-500 text-sm">🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">选择决策表类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
                <button key={type} onClick={() => handleCreate(type)}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                  <div className="text-2xl mb-2">{AssetTypeIcon[type]}</div>
                  <div className="font-semibold text-slate-800">{AssetTypeLabel[type]}决策表</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {type === 'stock' ? '12板块 · 7项否决' : type === 'fund' ? '12板块 · 7项否决' : type === 'bond' ? '12板块 · 7项否决' : '12+1板块 · 10项否决(最严)'}
                  </div>
                  {type === 'futures' && <div className="text-xs text-red-500 mt-1">⚠️ 含强制风险确认</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
