import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor } from '../types';
import { SCORE_THRESHOLDS } from '../data/templates';
import { useThemeStore } from '../store/theme';
import { getDailyQuote } from '../data/quotes';

const QUOTES_MORE_URL = 'http://www.luliming.xyz/investmentQuotes';

export default function HomePage() {
  const sheets = useSheetStore(s => s.sheets);
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const [quoteOffset, setQuoteOffset] = useState(0);
  const quote = getDailyQuote(quoteOffset);

  const stats = {
    total: sheets.length,
    byType: Object.fromEntries(['stock', 'fund', 'bond', 'futures'].map(t => [t, sheets.filter(s => s.assetType === t).length])) as Record<string, number>,
    avgScore: sheets.filter(s => s.totalScore > 0).length > 0 ? Math.round(sheets.filter(s => s.totalScore > 0).reduce((a, s) => a + s.totalScore, 0) / sheets.filter(s => s.totalScore > 0).length) : 0,
    drafts: sheets.filter(s => s.status === 'draft').length,
    vetoFailed: sheets.filter(s => s.vetoConclusion === 'failed').length,
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
      {/* Hero Banner */}
      <div className={`t-gradient rounded-xl sm:rounded-2xl p-5 sm:p-8 relative overflow-hidden ${isCyber ? 'glow-border' : ''}`}>
        {isCyber && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-transparent" />}
        <div className="relative z-10">
          <h2 className={`text-lg sm:text-2xl font-bold text-white text-center ${isCyber ? 'glow-text' : ''}`}>
            {isCyber ? '⚡ ' : '💹 '}投资决策系统
          </h2>
          <p className="text-white/60 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center">
            把"拍脑袋"变成"填决策表"，把"我觉得"变成"我验证过"。
          </p>

          {/* 每日名言 */}
          <div className="mt-4 sm:mt-6 relative rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/15 px-4 sm:px-6 pt-8 sm:pt-9 pb-4 sm:pb-5 max-w-2xl mx-auto">
            <div className="absolute top-2 sm:top-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/70">
                <span>📖</span><span>每日名言</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                <button type="button" onClick={() => setQuoteOffset(o => o + 1)} className="px-1.5 py-0.5 rounded text-white/70 hover:text-white hover:bg-white/10">↻ 换一条</button>
                <a href={QUOTES_MORE_URL} target="_blank" rel="noopener noreferrer" className="px-1.5 py-0.5 rounded text-white/70 hover:text-white hover:bg-white/10">更多 →</a>
              </div>
            </div>
            <blockquote className="text-white text-sm sm:text-[15px] leading-relaxed sm:leading-[1.75] font-medium text-center">
              <span className="font-serif text-white/30 text-xl sm:text-[26px] leading-none mr-1 select-none" aria-hidden>&ldquo;</span>
              {quote.text}
              <span className="font-serif text-white/30 text-xl sm:text-[26px] leading-none ml-1 select-none" aria-hidden>&rdquo;</span>
            </blockquote>
            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">
              <span className="h-px w-6 sm:w-8 bg-white/25" />
              <span className="text-xs text-white/80 font-medium">{quote.author}</span>
              {quote.title && <span className="text-[10px] text-white/45 hidden sm:inline">· {quote.title}</span>}
              <span className="h-px w-6 sm:w-8 bg-white/25" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 asset cards - 2x2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
          <a key={type} href={`${import.meta.env.BASE_URL}sheets?type=${type}`} target="_blank" rel="noopener noreferrer"
            className={`t-card t-card-hover p-3 sm:p-5 text-left transition-all ${isCyber ? 'glow-pulse' : ''} block`}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <span className="text-lg sm:text-2xl">{AssetTypeIcon[type]}</span>
              <span className="text-xs sm:text-sm font-semibold t-text">{AssetTypeLabel[type]}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold t-accent">{stats.byType[type]}</div>
            <div className="text-[10px] sm:text-xs t-muted mt-0.5 sm:mt-1">已创建</div>
          </a>
        ))}
      </div>

      {/* Stats - stack on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="t-card p-3 sm:p-5">
          <div className="text-[10px] sm:text-xs t-muted uppercase tracking-wider">平均评分</div>
          <div className="text-xl sm:text-3xl font-bold t-text mt-1 sm:mt-2">{stats.avgScore || '—'}<span className="text-[10px] sm:text-sm t-muted ml-0.5">/100</span></div>
        </div>
        <div className="t-card p-3 sm:p-5">
          <div className="text-[10px] sm:text-xs t-muted uppercase tracking-wider">进行中</div>
          <div className="text-xl sm:text-3xl font-bold t-accent mt-1 sm:mt-2">{stats.drafts}</div>
        </div>
        <div className="t-card p-3 sm:p-5">
          <div className="text-[10px] sm:text-xs t-muted uppercase tracking-wider">否决触发</div>
          <div className="text-xl sm:text-3xl font-bold t-danger mt-1 sm:mt-2">{stats.vetoFailed}</div>
        </div>
      </div>

      {/* Recent sheets */}
      {sheets.length > 0 && (
        <div className="t-card overflow-hidden">
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 t-bg3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--t-border)' }}>
            <h3 className="font-semibold t-text text-xs sm:text-sm">最近的决策表</h3>
            <Link to="/sheets" className="text-xs t-accent hover:underline">查看全部 →</Link>
          </div>
          <div>
            {sheets.slice(0, 5).map((sheet, i) => {
              const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';
              const t = SCORE_THRESHOLDS[sheet.assetType];
              const scoreColor = sheet.totalScore >= t.high ? 't-success' : sheet.totalScore >= t.mid ? 't-accent' : 't-danger';
              return (
                <Link key={sheet.id} to={`/sheet/${sheet.id}`}
                  className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 hover:t-bg3 transition-colors"
                  style={i > 0 ? { borderTop: '1px solid var(--t-border)' } : {}}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-base sm:text-lg flex-shrink-0">{AssetTypeIcon[sheet.assetType]}</span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium t-text truncate">{name}</div>
                      <div className="text-[10px] sm:text-xs t-muted">{new Date(sheet.updatedAt).toLocaleDateString('zh-CN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {sheet.totalScore > 0 && <span className={`text-xs sm:text-sm font-bold ${scoreColor}`}>{sheet.totalScore}分</span>}
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${StatusColor[sheet.status]}`}>{StatusLabel[sheet.status]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {sheets.length === 0 && (
        <div className={`text-center py-12 sm:py-20 t-card ${isCyber ? 'glow-border' : ''}`}>
          <div className={`text-4xl sm:text-5xl mb-3 sm:mb-4 ${isCyber ? 'glow-text' : ''}`}>{isCyber ? '⚡' : '📋'}</div>
          <h3 className="text-base sm:text-lg font-semibold t-text mb-2">还没有决策表</h3>
          <p className="text-xs sm:text-sm t-muted mb-4 sm:mb-6">每一笔投资决策前，都值得填写一张决策表</p>
          <Link to="/sheets" className="t-btn-primary inline-block text-sm">创建第一张决策表</Link>
        </div>
      )}
    </div>
  );
}
