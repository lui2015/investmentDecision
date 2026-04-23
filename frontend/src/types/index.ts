// ===== 资产类型 =====
export type AssetType = 'stock' | 'fund' | 'bond' | 'futures';
export const AssetTypeLabel: Record<AssetType, string> = { stock: '股票', fund: '基金', bond: '债券', futures: '期货' };
export const AssetTypeIcon: Record<AssetType, string> = { stock: '📈', fund: '🏦', bond: '📜', futures: '🔥' };

// ===== 决策表状态 =====
export type DecisionStatus = 'draft' | 'completed' | 'abandoned' | 'holding' | 'closed';
export const StatusLabel: Record<DecisionStatus, string> = { draft: '进行中', completed: '已完成', abandoned: '已放弃', holding: '持仓中', closed: '已了结' };
export const StatusColor: Record<DecisionStatus, string> = { draft: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', abandoned: 'bg-slate-100 text-slate-500', holding: 'bg-amber-100 text-amber-700', closed: 'bg-purple-100 text-purple-700' };

// ===== 一票否决项 =====
export interface VetoItem {
  id: string;
  text: string;
  passed: boolean | null; // null=未填, true=通过, false=否决
  note: string;
  rebuttal: string; // 反驳理由（仅否决时填写）
}

// ===== 定性维度 =====
export interface QualDimension {
  id: string;
  name: string;
  question: string;
  score: number; // 0=未评, 1-5
  note: string;
}

// ===== 定量指标 =====
export interface QuantMetric {
  id: string;
  name: string;
  historical: string;
  current: string;
  rating: '' | 'good' | 'medium' | 'poor';
  note: string;
}

// ===== 风险项 =====
export interface RiskItem {
  id: string;
  type: string;
  detail: string;
  probability: '' | 'low' | 'medium' | 'high';
  impact: '' | 'low' | 'medium' | 'high';
  response: string;
}

// ===== 投后跟踪记录 =====
export interface TrackingRecord {
  id: string;
  date: string;
  event: string;
  affectsLogic: boolean | null;
  action: string;
  note: string;
}

// ===== 风险收益比（期货专属）=====
export interface RiskRewardCalc {
  entryPrice: number;
  stopLoss: number;
  target: number;
  lots: number;
  multiplier: number;
  totalCapital: number;
}

// ===== 完整决策表 =====
export interface DecisionSheet {
  id: string;
  assetType: AssetType;
  status: DecisionStatus;
  createdAt: string;
  updatedAt: string;
  currentStep: number;

  // 板块〇（期货专属）
  futuresRiskConfirm: boolean[];

  // 板块一：基础信息
  basicInfo: Record<string, string>;

  // 板块二：一票否决
  vetoItems: VetoItem[];
  vetoConclusion: 'passed' | 'failed' | 'pending';

  // 板块三：定性分析
  qualDimensions: QualDimension[];
  qualTotal: number; // /40

  // 板块四：定量分析
  quantMetrics: QuantMetric[];
  quantConclusions: Record<string, string>;
  quantScore: number; // /30

  // 板块五：估值判断
  valuationFields: Record<string, string>;
  valuationSummary: string;
  valuationScore: number; // /20

  // 板块六：风险清单
  risks: RiskItem[];
  worstCase: Record<string, string>;

  // 板块七：投资逻辑卡片
  logicPoints: string[];
  counterArgument: string;
  weakestAssumption: string;

  // 板块八：买入/交易计划
  tradePlan: Record<string, string>;

  // 板块九：评分与决策
  riskPlanScore: number; // /10
  totalScore: number;
  decision: '' | 'invest' | 'watch' | 'abandon';
  decisionAction: string;
  decisionReason: string;

  // 板块十：投后跟踪
  trackingRecords: TrackingRecord[];
  reviewAnswers: string[];

  // 板块五特殊（期货）
  riskReward: RiskRewardCalc;

  // 纪律提醒（展示用，不存储用户数据）
}
