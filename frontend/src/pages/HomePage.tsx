import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSheetStore } from '../store';
import { AssetTypeLabel, AssetTypeIcon, StatusLabel, StatusColor } from '../types';
import { SCORE_THRESHOLDS } from '../data/templates';
import { useThemeStore } from '../store/theme';
import { getDailyQuote } from '../data/quotes';

const QUOTES_MORE_URL = 'http://www.luliming.xyz/investmentQuotes';

export default function HomePage() {
  const sheets = useSheetStore(s => s.sheets);
  const navigate = useNavigate();
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';

  // 每日大师投资名言（按日期稳定；点"换一条"会在本地切换索引）
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
    <div className={`max-w-5xl mx-auto space-y-6 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
      {/* Hero Banner */}
      <div className={`t-gradient rounded-2xl p-8 relative overflow-hidden ${isCyber ? 'glow-border' : ''}`}>
        {isCyber && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-transparent" />}
        <div className="relative z-10">
          <h2 className={`text-2xl font-bold text-white text-center ${isCyber ? 'glow-text' : ''}`}>
            {isCyber ? '⚡ ' : '💹 '}投资决策系统
          </h2>
          <p className="text-white/60 mt-3 text-sm leading-relaxed max-w-2xl mx-auto text-center">
            把"拍脑袋"变成"填决策表"，把"我觉得"变成"我验证过"。先过滤，再评分；先看风险，再看收益；先定计划，再谈买卖。
          </p>

          {/* 每日大师投资名言 */}
          <div className="mt-6 relative rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/15 px-6 pt-9 pb-5 max-w-2xl mx-auto overflow-hidden group hover:bg-white/[0.1] transition-colors">
            {/* 顶部小标签 */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.15em] text-white/70">
                <span>📖</span>
                <span>每日大师名言</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuoteOffset(o => o + 1)}
                  className="px-2 py-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="换一条"
                >
                  ↻ 换一条
                </button>
                <a
                  href={QUOTES_MORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="查看更多名言"
                >
                  更多 →
                </a>
              </div>
            </div>

            {/* 名言正文（前后成对装饰引号） */}
            <blockquote className="text-white text-[15px] leading-[1.75] font-medium tracking-wide text-center">
              <span
                className="font-serif text-white/30 text-[26px] leading-none mr-1 align-[-4px] select-none"
                aria-hidden
              >
                &ldquo;
              </span>
              {quote.text}
              <span
                className="font-serif text-white/30 text-[26px] leading-none ml-1 align-[-4px] select-none"
                aria-hidden
              >
                &rdquo;
              </span>
            </blockquote>

            {/* 分隔线 + 作者（居中） */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-white/25" />
              <span className="text-xs text-white/80 font-medium">{quote.author}</span>
              {quote.title && (
                <span className="text-[11px] text-white/45">· {quote.title}</span>
              )}
              <span className="h-px w-8 bg-white/25" />
            </div>
          </div>
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
