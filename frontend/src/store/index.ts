import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DecisionSheet, AssetType } from '../types';
import { VETO_ITEMS, QUAL_DIMENSIONS, QUANT_METRICS, RISK_TYPES, FUTURES_RISK_CONFIRMS } from '../data/templates';
import { apiRequest, useAuthStore } from './auth';

function createEmptySheet(assetType: AssetType): DecisionSheet {
  const now = new Date().toISOString();
  return {
    id: `ds_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    assetType,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    currentStep: 0,
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

// 防抖保存到服务器
const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSaveToServer(sheet: DecisionSheet) {
  if (!useAuthStore.getState().token) return;
  if (saveTimers[sheet.id]) clearTimeout(saveTimers[sheet.id]);
  saveTimers[sheet.id] = setTimeout(() => {
    apiRequest(`/sheets/${sheet.id}`, {
      method: 'PUT',
      body: JSON.stringify(sheet),
    }).catch(err => console.warn('保存失败:', err.message));
  }, 1000);
}

interface SheetStore {
  sheets: DecisionSheet[];
  syncing: boolean;
  createSheet: (assetType: AssetType) => DecisionSheet;
  updateSheet: (id: string, updates: Partial<DecisionSheet>) => void;
  deleteSheet: (id: string) => void;
  getSheet: (id: string) => DecisionSheet | undefined;
  recalcScore: (id: string) => void;
  syncFromServer: () => Promise<void>;
  setSyncing: (v: boolean) => void;
}

export const useSheetStore = create<SheetStore>()(
  persist(
    (set, get) => ({
      sheets: [],
      syncing: false,
      setSyncing: (v) => set({ syncing: v }),

      createSheet: (assetType) => {
        const sheet = createEmptySheet(assetType);
        set({ sheets: [sheet, ...get().sheets] });
        debouncedSaveToServer(sheet);
        return sheet;
      },

      updateSheet: (id, updates) => {
        const sheets = get().sheets.map(s =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        );
        set({ sheets });
        const updated = sheets.find(s => s.id === id);
        if (updated) debouncedSaveToServer(updated);
      },

      deleteSheet: (id) => {
        set({ sheets: get().sheets.filter(s => s.id !== id) });
        if (useAuthStore.getState().token) {
          apiRequest(`/sheets/${id}`, { method: 'DELETE' }).catch(() => {});
        }
      },

      getSheet: (id) => get().sheets.find(s => s.id === id),

      recalcScore: (id) => {
        const sheet = get().sheets.find(s => s.id === id);
        if (!sheet) return;
        const qualTotal = sheet.qualDimensions.reduce((a, d) => a + d.score, 0);
        const vetoConclusion = sheet.vetoItems.every(v => v.passed === true) ? 'passed' as const :
          sheet.vetoItems.some(v => v.passed === false) ? 'failed' as const : 'pending' as const;
        const totalScore = qualTotal + sheet.quantScore + sheet.valuationScore + sheet.riskPlanScore;
        const sheets = get().sheets.map(s =>
          s.id === id ? { ...s, qualTotal, vetoConclusion, totalScore, updatedAt: new Date().toISOString() } : s
        );
        set({ sheets });
        const updated = sheets.find(s => s.id === id);
        if (updated) debouncedSaveToServer(updated);
      },

      syncFromServer: async () => {
        if (!useAuthStore.getState().token) return;
        set({ syncing: true });
        try {
          const serverSheets = await apiRequest('/sheets');
          if (Array.isArray(serverSheets)) {
            set({ sheets: serverSheets });
          }
        } catch (err) {
          console.warn('同步失败:', err);
        } finally {
          set({ syncing: false });
        }
      },
    }),
    { name: 'ids-sheets-v3' }
  )
);
