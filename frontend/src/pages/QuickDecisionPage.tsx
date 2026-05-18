import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AssetTypeLabel, AssetTypeIcon, type AssetType } from '../types';
import { useThemeStore } from '../store/theme';
import { useSheetStore } from '../store';
import { QUIZ_DATA, type QuizConfig } from '../data/quiz';

type Phase = 'select' | 'quiz' | 'result';

export default function QuickDecisionPage() {
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const { createSheet, updateSheet } = useSheetStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [phase, setPhase] = useState<Phase>('select');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  // 保存相关
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState('');

  // 从 URL 参数读取类型，自动跳过选择步骤
  useEffect(() => {
    const typeParam = searchParams.get('type') as AssetType | null;
    if (typeParam && ['stock', 'fund', 'bond', 'futures'].includes(typeParam)) {
      startQuiz(typeParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const quiz: QuizConfig = QUIZ_DATA[assetType];

  const startQuiz = (type: AssetType) => {
    setAssetType(type);
    setCurrentQ(0);
    setAnswers(new Array(QUIZ_DATA[type].questions.length).fill(null));
    setPhase('quiz');
    setSaved(false);
    setSavedId('');
  };

  const selectOption = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = score;
    setAnswers(newAnswers);
    if (currentQ < quiz.questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => setPhase('result'), 400);
    }
  };

  const totalScore = answers.reduce<number>((a, s) => a + (s ?? 0), 0);
  const percentage = Math.round((totalScore / quiz.totalMax) * 100);
  const resultLevel = quiz.thresholds.find(t => totalScore >= t.score) || quiz.thresholds[quiz.thresholds.length - 1];

  const reset = () => { setPhase('select'); setCurrentQ(0); setAnswers([]); setSaved(false); setSavedId(''); setSaveName(''); };

  // 保存快速决策表
  const handleSave = () => {
    if (!saveName.trim()) return;
    const sheet = createSheet(assetType);
    // 标记为快速决策
    const nameKey = assetType === 'stock' ? 'companyName' : assetType === 'fund' ? 'fundName' : assetType === 'bond' ? 'bondName' : 'productName';
    updateSheet(sheet.id, {
      isQuick: true,
      quickScore: totalScore,
      quickAnswers: answers.map(a => a ?? 0),
      basicInfo: { ...sheet.basicInfo, [nameKey]: saveName.trim() },
      totalScore: Math.round(percentage * 100 / 100), // 按百分比换算到100分制
      status: 'completed',
    });
    setSaved(true);
    setSavedId(sheet.id);
    setShowSave(false);
  };

  // 转换为普通决策表
  const handleConvertToFull = () => {
    if (savedId) {
      updateSheet(savedId, { isQuick: false, status: 'draft', totalScore: 0 });
      navigate(`/sheet/${savedId}`);
    } else {
      // 没保存过的，先保存再跳转
      const sheet = createSheet(assetType);
      updateSheet(sheet.id, {
        isQuick: false,
        quickScore: totalScore,
        quickAnswers: answers.map(a => a ?? 0),
        status: 'draft',
      });
      navigate(`/sheet/${sheet.id}`);
    }
  };

  // ====== Phase: Select Asset Type ======
  if (phase === 'select') {
    return (
      <div className={`max-w-lg mx-auto py-8 sm:py-12 px-3 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
        <div className="text-center mb-8">
          <h2 className={`text-xl sm:text-2xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>⚡ 快速决策</h2>
          <p className="text-sm t-text2 mt-2">选择题问卷，3分钟得出结论</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(['stock', 'fund', 'bond', 'futures'] as const).map(type => (
            <button key={type} onClick={() => startQuiz(type)}
              className="t-card t-card-hover p-5 text-center transition-all">
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
          <div className="flex items-center gap-2">
            <span className="text-xs">{AssetTypeIcon[assetType]}</span>
            <span className="text-xs t-muted">{AssetTypeLabel[assetType]} · {currentQ + 1}/{quiz.questions.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full t-bg3 mb-6 overflow-hidden">
          <div className="h-full t-accent-bg rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

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
            const borderStyle = opt.tag === 'danger' ? 'border-l-red-400' : opt.tag === 'warning' ? 'border-l-amber-400' : opt.tag === 'success' ? 'border-l-green-400' : 'border-l-transparent';
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
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">{AssetTypeIcon[assetType]}</span>
          <span className="text-sm font-medium t-text2">{AssetTypeLabel[assetType]}快速评估</span>
        </div>
        <div className="text-4xl sm:text-5xl font-bold t-text mb-1">{totalScore}<span className="text-lg t-muted">/{quiz.totalMax}</span></div>
        <div className="text-sm t-muted mb-4">百分制：{percentage}分</div>

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
        <div className="px-4 py-2.5 t-bg3 text-xs font-semibold t-text" style={{ borderBottom: '1px solid var(--t-border)' }}>各维度得分</div>
        <div className="divide-y" style={{ borderColor: 'var(--t-border)' }}>
          {quiz.questions.map((q, i) => {
            const score = answers[i] ?? 0;
            const pct = (score / 5) * 100;
            return (
              <div key={q.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-xs t-muted w-16 flex-shrink-0">{q.category}</span>
                <div className="flex-1 h-2 rounded-full t-bg3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${score >= 4 ? 'bg-green-500' : score >= 2 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold t-text w-8 text-right">{score}/5</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2.5">
        {/* 保存按钮 */}
        {!saved ? (
          <button onClick={() => setShowSave(true)} className="w-full t-btn-primary text-sm py-3">
            💾 保存快速决策记录
          </button>
        ) : (
          <div className="t-card p-3 text-center">
            <span className="text-sm t-success font-medium">✅ 已保存</span>
            <button onClick={() => { if (savedId) navigate(`/sheet/${savedId}`); }}
              className="ml-3 text-xs t-accent hover:underline">查看 →</button>
          </div>
        )}

        {/* 转为完整决策表 */}
        <button onClick={handleConvertToFull} className="w-full t-btn-ghost text-sm py-2.5 border t-border rounded-lg">
          📋 转为完整决策表深入分析
        </button>

        <button onClick={reset} className="w-full t-btn-ghost text-sm py-2.5">
          ↻ 再评估一个标的
        </button>
      </div>

      {/* Save modal */}
      {showSave && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSave(false)}>
          <div className={`t-card p-5 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl animate-fade-in ${isCyber ? 'glow-border' : ''}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold t-text mb-3">保存快速决策</h3>
            <p className="text-xs t-muted mb-3">输入标的名称以保存本次评估结果</p>
            <input value={saveName} onChange={e => setSaveName(e.target.value)}
              placeholder={assetType === 'stock' ? '例：贵州茅台' : assetType === 'fund' ? '例：沪深300ETF' : assetType === 'bond' ? '例：国开2301' : '例：螺纹钢2401'}
              className="t-input w-full mb-4" autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <div className="flex gap-2">
              <button onClick={() => setShowSave(false)} className="flex-1 t-btn-ghost text-sm">取消</button>
              <button onClick={handleSave} disabled={!saveName.trim()} className="flex-1 t-btn-primary text-sm disabled:opacity-40">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] t-muted text-center mt-5">
        快速决策仅为初筛工具，不构成投资建议。重要决策请使用完整决策表。
      </p>
    </div>
  );
}
