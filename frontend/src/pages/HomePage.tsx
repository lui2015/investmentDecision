import { Link, useNavigate } from 'react-router-dom';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor } from '../types';
import { SCORE_THRESHOLDS } from '../data/templates';
import { useThemeStore } from '../store/theme';

export default function HomePage() {
  const sheets = useSheetStore(s => s.sheets);
  const navigate = useNavigate();
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';

  const stats = {
    total: sheets.length,
    byType: Object.fromEntries(['stock', 'fund', 'bond', 'futures'].map(t => [t, sheets.filter(s => s.assetType === t).length])) as Record<string, number>,
    avgScore: sheets.filter(s => s.totalScore > 0).length > 0 ? Math.round(sheets.filter(s => s.totalScore > 0).reduce((a, s) => a + s.totalScore, 0) / sheets.filter(s => s.totalScore > 0).length) : 0,
    drafts: sheets.filter(s => s.status === 'draft').length,
    vetoFailed: sheets.filter(s => s.vetoConclusion === 'failed').length,
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
      {/* Hero Banner */}
      <div className={`t-gradient rounded-2xl p-8 relative overflow-hidden ${isCyber ? 'glow-border' : ''}`}>
        {isCyber && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-transparent" />}
        <div className="relative z-10">
          <h2 className={`text-2xl font-bold text-white ${isCyber ? 'glow-text' : ''}`}>
            {isCyber ? '⚡ ' : '💹 '}投资决策系统
          </h2>
          <p className="text-white/60 mt-3 text-sm leading-relaxed max-w-xl">
            把"拍脑袋"变成"填决策表"，把"我觉得"变成"我验证过"。<br/>
            先过滤，再评分；先看风险，再看收益；先定计划，再谈买卖。
          </p>
        </div>
      </div>

      {/* 4 asset type cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
          <button key={type} onClick={() => navigate('/sheets')}
            className={`t-card t-card-hover p-5 text-left transition-all ${isCyber ? 'glow-pulse' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{AssetTypeIcon[type]}</span>
              <span className="text-sm font-semibold t-text">{AssetTypeLabel[type]}</span>
            </div>
            <div className="text-3xl font-bold t-accent">{stats.byType[type]}</div>
            <div className="text-xs t-muted mt-1">已创建</div>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="t-card p-5">
          <div className="text-xs t-muted uppercase tracking-wider">平均评分</div>
          <div className="text-3xl font-bold t-text mt-2">{stats.avgScore || '—'}<span className="text-sm t-muted ml-1">/100</span></div>
        </div>
        <div className="t-card p-5">
          <div className="text-xs t-muted uppercase tracking-wider">进行中</div>
          <div className="text-3xl font-bold t-accent mt-2">{stats.drafts}</div>
        </div>
        <div className="t-card p-5">
          <div className="text-xs t-muted uppercase tracking-wider">否决触发</div>
          <div className="text-3xl font-bold t-danger mt-2">{stats.vetoFailed}</div>
          <div className="text-xs t-muted mt-1">帮助你认识能力圈边界</div>
        </div>
      </div>

      {/* Recent sheets */}
      {sheets.length > 0 && (
        <div className="t-card overflow-hidden">
          <div className="px-5 py-3 t-bg3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--t-border)' }}>
            <h3 className="font-semibold t-text text-sm">最近的决策表</h3>
            <Link to="/sheets" className="text-xs t-accent hover:underline">查看全部 →</Link>
          </div>
          <div>
            {sheets.slice(0, 5).map((sheet, i) => {
              const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';
              const t = SCORE_THRESHOLDS[sheet.assetType];
              const scoreColor = sheet.totalScore >= t.high ? 't-success' : sheet.totalScore >= t.mid ? 't-accent' : 't-danger';
              return (
                <Link key={sheet.id} to={`/sheet/${sheet.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:t-bg3 transition-colors"
                  style={i > 0 ? { borderTop: '1px solid var(--t-border)' } : {}}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{AssetTypeIcon[sheet.assetType]}</span>
                    <div>
                      <div className="text-sm font-medium t-text">{name}</div>
                      <div className="text-xs t-muted">{new Date(sheet.updatedAt).toLocaleDateString('zh-CN')}</div>
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

      {/* Empty state */}
      {sheets.length === 0 && (
        <div className={`text-center py-20 t-card ${isCyber ? 'glow-border' : ''}`}>
          <div className={`text-5xl mb-4 ${isCyber ? 'glow-text' : ''}`}>{isCyber ? '⚡' : '📋'}</div>
          <h3 className="text-lg font-semibold t-text mb-2">还没有决策表</h3>
          <p className="text-sm t-muted mb-6">每一笔投资决策前，都值得填写一张决策表</p>
          <Link to="/sheets" className="t-btn-primary inline-block">创建第一张决策表</Link>
        </div>
      )}
    </div>
  );
}
