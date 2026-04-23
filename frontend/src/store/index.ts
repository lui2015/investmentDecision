import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DecisionSheet, AssetType } from '../types';
import { VETO_ITEMS, QUAL_DIMENSIONS, QUANT_METRICS, RISK_TYPES, FUTURES_RISK_CONFIRMS } from '../data/templates';

function createEmptySheet(assetType: AssetType): DecisionSheet {
  const now = new Date().toISOString();
  return {
    id: `ds_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    assetType,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    currentStep: assetType === 'futures' ? 0 : 0,
    futuresRiskConfirm: FUTURES_RISK_CONFIRMS.map(() => false),
    basicInfo: assetType === 'stock' ? { trackDate: now.split('T')[0] } : assetType === 'fund' ? { trackDate: now.split('T')[0] } : {},
    vetoItems: VETO_ITEMS[assetType].map(v => ({ ...v, passed: null, note: '', rebuttal: '' })),
    vetoConclusion: 'pending',
    qualDimensions: QUAL_DIMENSIONS[assetType].map(q => ({ ...q, score: 0, note: '' })),
    qualTotal: 0,
    quantMetrics: QUANT_METRICS[assetType].map(m => ({ ...m, historical: '', current: '', rating: '' as const, note: '' })),
    quantConclusions: {},
    quantScore: 0,
    valuationFields: {},
    valuationSummary: '',
    valuationScore: 0,
    risks: RISK_TYPES[assetType].map((t, i) => ({ id: `r${i}`, type: t, detail: '', probability: '' as const, impact: '' as const, response: '' })),
    worstCase: {},
    logicPoints: ['', '', '', '', ''],
    counterArgument: '',
    weakestAssumption: '',
    tradePlan: {},
    riskPlanScore: 0,
    totalScore: 0,
    decision: '',
    decisionAction: '',
    decisionReason: '',
    trackingRecords: [],
    reviewAnswers: ['', '', '', '', ''],
    riskReward: { entryPrice: 0, stopLoss: 0, target: 0, lots: 0, multiplier: 1, totalCapital: 0 },
  };
}

interface SheetStore {
  sheets: DecisionSheet[];
  createSheet: (assetType: AssetType) => DecisionSheet;
  updateSheet: (id: string, updates: Partial<DecisionSheet>) => void;
  deleteSheet: (id: string) => void;
  getSheet: (id: string) => DecisionSheet | undefined;
  recalcScore: (id: string) => void;
}

export const useSheetStore = create<SheetStore>()(
  persist(
    (set, get) => ({
      sheets: [],
      createSheet: (assetType) => {
        const sheet = createEmptySheet(assetType);
        set({ sheets: [sheet, ...get().sheets] });
        return sheet;
      },
      updateSheet: (id, updates) => {
        set({
          sheets: get().sheets.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s),
        });
      },
      deleteSheet: (id) => set({ sheets: get().sheets.filter(s => s.id !== id) }),
      getSheet: (id) => get().sheets.find(s => s.id === id),
      recalcScore: (id) => {
        const sheet = get().sheets.find(s => s.id === id);
        if (!sheet) return;
        const qualTotal = sheet.qualDimensions.reduce((a, d) => a + d.score, 0);
        const vetoConclusion = sheet.vetoItems.every(v => v.passed === true) ? 'passed' as const :
          sheet.vetoItems.some(v => v.passed === false) ? 'failed' as const : 'pending' as const;
        const totalScore = qualTotal + sheet.quantScore + sheet.valuationScore + sheet.riskPlanScore;
        set({
          sheets: get().sheets.map(s => s.id === id ? { ...s, qualTotal, vetoConclusion, totalScore, updatedAt: new Date().toISOString() } : s),
        });
      },
    }),
    { name: 'ids-sheets-v3' }
  )
);
