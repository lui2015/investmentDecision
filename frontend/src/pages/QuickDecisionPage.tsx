import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AssetTypeLabel, AssetTypeIcon, type AssetType } from '../types';
import { useThemeStore } from '../store/theme';
import { QUIZ_DATA, type QuizConfig } from '../data/quiz';

type Phase = 'select' | 'quiz' | 'result';

export default function QuickDecisionPage() {
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const [phase, setPhase] = useState<Phase>('select');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [targetName, setTargetName] = useState('');

  const quiz: QuizConfig = QUIZ_DATA[assetType];

  const startQuiz = (type: AssetType) => {
    setAssetType(type);
    setCurrentQ(0);
    setAnswers(new Array(QUIZ_DATA[type].questions.length).fill(null));
    setPhase('quiz');
  };

  const selectOption = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = score;
    setAnswers(newAnswers);
    // 自动前进到下一题
    if (currentQ < quiz.questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => setPhase('result'), 400);
    }
  };

  const totalScore = answers.reduce<number>((a, s) => a + (s ?? 0), 0);
  const percentage = Math.round((totalScore / quiz.totalMax) * 100);
  const resultLevel = quiz.thresholds.find(t => totalScore >= t.score) || quiz.thresholds[quiz.thresholds.length - 1];

  const reset = () => { setPhase('select'); setCurrentQ(0); setAnswers([]); setTargetName(''); };

  // ====== Phase: Select Asset Type ======
  if (phase === 'select') {
    return (
      <div className={`max-w-lg mx-auto py-8 sm:py-12 px-3 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
        <div className="text-center mb-8">
          <h2 className={`text-xl sm:text-2xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>⚡ 快速决策</h2>
          <p className="text-sm t-text2 mt-2">选择题问卷，3分钟得出结论</p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium t-text mb-1.5">标的名称（选填）</label>
          <input value={targetName} onChange={e => setTargetName(e.target.value)}
            placeholder="例：贵州茅台 / 沪深300ETF"
            className="t-input w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
            <button key={type} onClick={() => startQuiz(type)}
              className={`t-card t-card-hover p-5 text-center transition-all`}>
              <div className="text-3xl mb-2">{AssetTypeIcon[type]}</div>
              <div className="font-semibold t-text text-sm">{AssetTypeLabel[type]}</div>
              <div className="text-[10px] t-muted mt-1">{QUIZ_DATA[type].questions.length}道选择题</div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/sheets" className="text-xs t-text2 hover:t-accent">← 返回完整决策表</Link>
        </div>
      </div>
    );
  }

  // ====== Phase: Quiz ======
  if (phase === 'quiz') {
    const q = quiz.questions[currentQ];
    const progress = ((currentQ + 1) / quiz.questions.length) * 100;

    return (
      <div className={`max-w-lg mx-auto py-6 sm:py-10 px-3 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={reset} className="text-xs t-text2 hover:t-accent">← 重新开始</button>
          <span className="text-xs t-muted">{currentQ + 1} / {quiz.questions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full t-bg3 mb-6 overflow-hidden">
          <div className="h-full t-accent-bg rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Target name badge */}
        {targetName && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">{AssetTypeIcon[assetType]}</span>
            <span className="text-sm font-medium t-text">{targetName}</span>
          </div>
        )}

        {/* Question */}
        <div className="mb-6">
          <div className="text-[10px] t-accent uppercase tracking-wider mb-1">{q.category}</div>
          <h3 className="text-base sm:text-lg font-bold t-text leading-snug">{q.question}</h3>
          {q.tip && <p className="text-xs t-muted mt-2 italic">💡 {q.tip}</p>}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, oi) => {
            const isSelected = answers[currentQ] === opt.score;
            const borderStyle = opt.tag === 'danger' ? 'border-l-red-400' : opt.tag === 'warning' ? 'border-l-amber-400' : opt.tag === 'success' ? 'border-l-green-400' : '';
            return (
              <button key={oi} onClick={() => selectOption(opt.score)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-l-4 transition-all ${borderStyle} ${
                  isSelected ? 't-accent-light ring-2 ring-offset-1' : 't-card t-card-hover'
                }`}
                style={isSelected ? { '--tw-ring-color': 'var(--t-accent)' } as React.CSSProperties : {}}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm t-text">{opt.label}</span>
                  {isSelected && <span className="text-xs t-accent flex-shrink-0">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
            className="t-btn-ghost text-xs disabled:opacity-30">← 上一题</button>
          {answers[currentQ] !== null && currentQ < quiz.questions.length - 1 && (
            <button onClick={() => setCurrentQ(currentQ + 1)}
              className="t-btn-primary text-xs">下一题 →</button>
          )}
          {answers[currentQ] !== null && currentQ === quiz.questions.length - 1 && (
            <button onClick={() => setPhase('result')}
              className="t-btn-primary text-xs">查看结果 →</button>
          )}
        </div>
      </div>
    );
  }

  // ====== Phase: Result ======
  return (
    <div className={`max-w-lg mx-auto py-6 sm:py-10 px-3 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
      {/* Score */}
      <div className={`t-card p-6 sm:p-8 text-center ${isCyber ? 'glow-border' : ''}`}>
        {targetName && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-lg">{AssetTypeIcon[assetType]}</span>
            <span className="text-base font-semibold t-text">{targetName}</span>
          </div>
        )}
        <div className="text-4xl sm:text-5xl font-bold t-text mb-1">{totalScore}<span className="text-lg t-muted">/{quiz.totalMax}</span></div>
        <div className="text-sm t-muted mb-4">{percentage}分（百分制换算：{Math.round(percentage * 2.5)}分）</div>

        {/* Circular indicator */}
        <div className="flex justify-center mb-4">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="var(--t-border)" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="var(--t-accent)"
                strokeDasharray={`${percentage * 2.64} 999`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">{resultLevel.emoji}</span>
            </div>
          </div>
        </div>

        <div className={`text-base sm:text-lg font-bold ${resultLevel.color}`}>{resultLevel.label}</div>
      </div>

      {/* Detail breakdown */}
      <div className="mt-5 t-card overflow-hidden">
        <div className="px-4 py-2.5 t-bg3 text-xs font-semibold t-text" style={{ borderBottom: '1px solid var(--t-border)' }}>各维度得分明细</div>
        <div className="divide-y" style={{ borderColor: 'var(--t-border)' }}>
          {quiz.questions.map((q, i) => {
            const score = answers[i] ?? 0;
            const maxScore = 5;
            const pct = (score / maxScore) * 100;
            return (
              <div key={q.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-xs t-muted w-16 flex-shrink-0">{q.category}</span>
                <div className="flex-1 h-2 rounded-full t-bg3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${score >= 4 ? 'bg-green-500' : score >= 2 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold t-text w-8 text-right">{score}/{maxScore}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2.5">
        <Link to="/sheets" className="block w-full t-btn-primary text-center text-sm py-3">
          📋 创建完整决策表深入分析
        </Link>
        <button onClick={reset} className="w-full t-btn-ghost text-sm py-2.5">
          ↻ 再评估一个标的
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] t-muted text-center mt-5">
        快速决策仅为初筛工具，不构成投资建议。重要决策请使用完整决策表。
      </p>
    </div>
  );
}
