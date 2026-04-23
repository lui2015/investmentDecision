import { Link, useNavigate } from 'react-router-dom';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor } from '../types';
import { SCORE_THRESHOLDS } from '../data/templates';

export default function HomePage() {
  const sheets = useSheetStore(s => s.sheets);
  const navigate = useNavigate();

  const stats = {
    total: sheets.length,
    byType: Object.fromEntries(['stock', 'fund', 'bond', 'futures'].map(t => [t, sheets.filter(s => s.assetType === t).length])) as Record<string, number>,
    avgScore: sheets.filter(s => s.totalScore > 0).length > 0 ? Math.round(sheets.filter(s => s.totalScore > 0).reduce((a, s) => a + s.totalScore, 0) / sheets.filter(s => s.totalScore > 0).length) : 0,
    drafts: sheets.filter(s => s.status === 'draft').length,
    vetoFailed: sheets.filter(s => s.vetoConclusion === 'failed').length,
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">投资决策系统</h2>
        <p className="text-slate-300 mt-2 text-sm leading-relaxed">把"拍脑袋"变成"填决策表"，把"我觉得"变成"我验证过"。<br/>先过滤，再评分；先看风险，再看收益；先定计划，再谈买卖。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
          <button key={type} onClick={() => navigate('/sheets')}
            className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{AssetTypeIcon[type]}</span>
              <span className="text-sm font-semibold text-slate-800">{AssetTypeLabel[type]}决策表</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.byType[type]}</div>
            <div className="text-xs text-slate-400">已创建</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="text-sm text-slate-500">平均评分</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.avgScore || '—'}<span className="text-sm text-slate-400">/100</span></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="text-sm text-slate-500">进行中</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.drafts}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="text-sm text-slate-500">一票否决触发</div>
          <div className="text-2xl font-bold text-red-500 mt-1">{stats.vetoFailed}</div>
          <div className="text-xs text-slate-400">帮助你认识能力圈边界</div>
        </div>
      </div>

      {sheets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">最近的决策表</h3>
            <Link to="/sheets" className="text-xs text-blue-600 hover:underline">查看全部 →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {sheets.slice(0, 5).map(sheet => {
              const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';
              const t = SCORE_THRESHOLDS[sheet.assetType];
              const scoreColor = sheet.totalScore >= t.high ? 'text-green-600' : sheet.totalScore >= t.mid ? 'text-blue-600' : sheet.totalScore >= t.low ? 'text-amber-600' : 'text-red-500';
              return (
                <Link key={sheet.id} to={`/sheet/${sheet.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{AssetTypeIcon[sheet.assetType]}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{name}</div>
                      <div className="text-xs text-slate-400">{new Date(sheet.updatedAt).toLocaleDateString('zh-CN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sheet.totalScore > 0 && <span className={`text-sm font-bold ${scoreColor}`}>{sheet.totalScore}分</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${StatusColor[sheet.status]}`}>{StatusLabel[sheet.status]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {sheets.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">还没有决策表</h3>
          <p className="text-sm text-slate-500 mb-4">每一笔投资决策前，都值得填写一张决策表</p>
          <Link to="/sheets" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">创建第一张决策表</Link>
        </div>
      )}
    </div>
  );
}
