import type { AssetType } from '../types';

export interface QuizOption {
  label: string;
  score: number; // 该选项对应的分值
  tag?: 'danger' | 'warning' | 'success'; // 可选的视觉标记
}

export interface QuizQuestion {
  id: string;
  category: string; // 所属维度
  question: string;
  tip?: string; // 提示语
  options: QuizOption[];
}

export interface QuizConfig {
  title: string;
  subtitle: string;
  totalMax: number; // 满分
  thresholds: { score: number; label: string; emoji: string; color: string }[];
  questions: QuizQuestion[];
}

// ===== 股票快速决策 =====
const stockQuiz: QuizConfig = {
  title: '股票快速决策',
  subtitle: '8道选择题，3分钟完成，快速评估一只股票是否值得深入研究',
  totalMax: 40,
  thresholds: [
    { score: 34, label: '非常值得深入研究，考虑建仓', emoji: '🟢', color: 't-success' },
    { score: 26, label: '有一定价值，建议完整填写决策表后再决定', emoji: '🟡', color: 't-warning' },
    { score: 18, label: '风险较大，需要更多证据', emoji: '🟠', color: 't-warning' },
    { score: 0, label: '不建议投资，放弃或等待', emoji: '🔴', color: 't-danger' },
  ],
  questions: [
    {
      id: 'sq1', category: '能力圈',
      question: '你对这家公司的业务理解程度如何？',
      tip: '段永平："不懂不做"',
      options: [
        { label: '能清楚解释它怎么赚钱，对行业很熟', score: 5, tag: 'success' },
        { label: '大致了解主营业务和商业模式', score: 3 },
        { label: '只知道名字和大概做什么', score: 1, tag: 'warning' },
        { label: '完全不了解，是别人推荐的', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq2', category: '护城河',
      question: '公司有没有持久的竞争优势（护城河）？',
      tip: '巴菲特：寻找"经济护城河"宽广的企业',
      options: [
        { label: '有明显且持久的护城河（品牌/牌照/网络效应/转换成本）', score: 5, tag: 'success' },
        { label: '有一定优势但不够突出', score: 3 },
        { label: '行业竞争激烈，优势不明显', score: 1, tag: 'warning' },
        { label: '没有护城河，靠价格战生存', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq3', category: '管理层',
      question: '你对管理层的评价如何？',
      tip: '巴菲特：与你欣赏的人一起工作',
      options: [
        { label: '诚信可靠，有能力，重视股东回报', score: 5, tag: 'success' },
        { label: '能力尚可，没有明显问题', score: 3 },
        { label: '有些担忧（频繁并购/大额减持/关联交易）', score: 1, tag: 'warning' },
        { label: '管理层有不诚信记录', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq4', category: '财务健康',
      question: '公司财务状况如何？',
      tip: '格雷厄姆：安全边际的基础是财务稳健',
      options: [
        { label: '现金流充裕，负债低，ROE持续>15%', score: 5, tag: 'success' },
        { label: '财务基本健康，个别指标一般', score: 3 },
        { label: '负债偏高或现金流不稳定', score: 1, tag: 'warning' },
        { label: '有财务红旗（高负债/现金流为负/存贷双高）', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq5', category: '估值',
      question: '当前估值水平如何？',
      tip: '巴菲特："好公司也要有合理价格"',
      options: [
        { label: '明显低估，有充足安全边际', score: 5, tag: 'success' },
        { label: '估值合理，接近历史中位数', score: 3 },
        { label: '估值偏高，在历史高位附近', score: 1, tag: 'warning' },
        { label: '严重高估，市场情绪狂热', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq6', category: '风险',
      question: '你能承受的最坏情况是？',
      tip: '芒格："反过来想，总是反过来想"',
      options: [
        { label: '已想清楚最坏情况，可以承受50%回撤', score: 5, tag: 'success' },
        { label: '能接受20-30%的短期波动', score: 3 },
        { label: '超过10%就会很焦虑', score: 1, tag: 'warning' },
        { label: '完全没想过可能亏钱', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq7', category: '动机',
      question: '你买入的真实原因是什么？',
      tip: '诚实面对自己，避免把情绪当逻辑',
      options: [
        { label: '经过独立分析，有清晰的投资逻辑', score: 5, tag: 'success' },
        { label: '看了一些研报，觉得有道理', score: 3 },
        { label: '最近涨了很多，怕错过', score: 1, tag: 'warning' },
        { label: '别人推荐/群里都在买/想翻本', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'sq8', category: '持有计划',
      question: '你打算持有多久？',
      tip: '巴菲特："不愿持有十年，就别持有十分钟"',
      options: [
        { label: '3年以上，做好了长期持有的准备', score: 5, tag: 'success' },
        { label: '1-3年，看基本面变化', score: 3 },
        { label: '几个月，做波段', score: 1, tag: 'warning' },
        { label: '没想好，看涨就拿着', score: 0, tag: 'danger' },
      ],
    },
  ],
};

// ===== 基金快速决策 =====
const fundQuiz: QuizConfig = {
  title: '基金快速决策',
  subtitle: '8道选择题，3分钟完成，快速评估一只基金是否值得配置',
  totalMax: 40,
  thresholds: [
    { score: 34, label: '优质选择，可以考虑建仓或定投', emoji: '🟢', color: 't-success' },
    { score: 26, label: '有一定价值，建议进一步研究', emoji: '🟡', color: 't-warning' },
    { score: 18, label: '存在不少疑虑，谨慎', emoji: '🟠', color: 't-warning' },
    { score: 0, label: '不建议配置，寻找更好的选择', emoji: '🔴', color: 't-danger' },
  ],
  questions: [
    {
      id: 'fq1', category: '理解度',
      question: '你了解这只基金投资的是什么吗？',
      options: [
        { label: '清楚底层资产、行业方向和投资策略', score: 5, tag: 'success' },
        { label: '大概知道是什么类型的基金', score: 3 },
        { label: '只看了名字和近期收益率', score: 1, tag: 'warning' },
        { label: '完全不了解，就是看别人推荐', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq2', category: '基金经理',
      question: '基金经理的经验和能力如何？',
      tip: '选基金的核心是选人',
      options: [
        { label: '从业>5年，穿越牛熊，理念清晰一致', score: 5, tag: 'success' },
        { label: '有几年经验，业绩还不错', score: 3 },
        { label: '新手经理或频繁更换经理', score: 1, tag: 'warning' },
        { label: '完全不了解基金经理是谁', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq3', category: '业绩质量',
      question: '基金的历史业绩质量如何？',
      options: [
        { label: '长期稳定超越基准，回撤可控', score: 5, tag: 'success' },
        { label: '业绩不错但波动较大', score: 3 },
        { label: '最近业绩好但历史表现一般', score: 1, tag: 'warning' },
        { label: '只看到最近排名靠前就想买', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq4', category: '费率',
      question: '你了解这只基金的费率吗？',
      tip: '博格："费率是确定的损耗，收益是不确定的"',
      options: [
        { label: '费率合理，在同类中有竞争力', score: 5, tag: 'success' },
        { label: '费率一般，可以接受', score: 3 },
        { label: '费率偏高但没太在意', score: 1, tag: 'warning' },
        { label: '完全没看过费率', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq5', category: '估值时机',
      question: '当前底层资产估值处于什么水平？',
      options: [
        { label: '估值偏低，处于历史低位区域', score: 5, tag: 'success' },
        { label: '估值中等，正常水平', score: 3 },
        { label: '估值偏高，需要谨慎', score: 1, tag: 'warning' },
        { label: '不清楚/没关注过估值', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq6', category: '回撤承受',
      question: '这只基金的最大回撤你能接受吗？',
      options: [
        { label: '了解历史最大回撤，完全能接受', score: 5, tag: 'success' },
        { label: '能接受一定回撤，但希望控制在20%内', score: 3 },
        { label: '不太能接受大幅回撤', score: 1, tag: 'warning' },
        { label: '没了解过回撤，以为基金不会亏', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq7', category: '规模风险',
      question: '基金规模是否合适？',
      options: [
        { label: '规模适中（2-200亿），适合策略执行', score: 5, tag: 'success' },
        { label: '规模略大或略小，影响不大', score: 3 },
        { label: '规模太大（>500亿）或太小（<1亿）', score: 1, tag: 'warning' },
        { label: '没关注过规模', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'fq8', category: '投资计划',
      question: '你的投资方式和持有计划是？',
      options: [
        { label: '定投或分批建仓，持有3年以上', score: 5, tag: 'success' },
        { label: '一次买入，持有1-3年', score: 3 },
        { label: '看短期表现再决定', score: 1, tag: 'warning' },
        { label: '没计划，先买了再说', score: 0, tag: 'danger' },
      ],
    },
  ],
};

// ===== 债券快速决策 =====
const bondQuiz: QuizConfig = {
  title: '债券快速决策',
  subtitle: '7道选择题，2分钟完成，快速评估一只债券的投资价值',
  totalMax: 35,
  thresholds: [
    { score: 30, label: '信用安全、收益合理，可以考虑买入', emoji: '🟢', color: 't-success' },
    { score: 22, label: '基本面尚可，等待更好的收益率', emoji: '🟡', color: 't-warning' },
    { score: 14, label: '存在信用或流动性风险，谨慎', emoji: '🟠', color: 't-warning' },
    { score: 0, label: '不建议买入', emoji: '🔴', color: 't-danger' },
  ],
  questions: [
    {
      id: 'bq1', category: '信用安全',
      question: '发行人的信用质量如何？',
      tip: '债券第一要务：能不能还钱',
      options: [
        { label: 'AAA/央企/大型国企，信用极好', score: 5, tag: 'success' },
        { label: 'AA+以上，信用良好', score: 3 },
        { label: 'AA级，需要关注', score: 1, tag: 'warning' },
        { label: 'AA以下或有违约记录', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'bq2', category: '偿债能力',
      question: '发行人的偿债能力如何？',
      options: [
        { label: '利息保障倍数>4，现金充裕', score: 5, tag: 'success' },
        { label: '利息保障倍数>2，基本安全', score: 3 },
        { label: '偿债指标刚好过线', score: 1, tag: 'warning' },
        { label: '偿债压力大或不清楚', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'bq3', category: '收益率',
      question: '收益率是否合理补偿了风险？',
      tip: '马克斯：高收益=高风险，没有例外',
      options: [
        { label: '收益率合理，在同类中有竞争力', score: 5, tag: 'success' },
        { label: '收益率一般，但信用安全', score: 3 },
        { label: '收益率异常高，需警惕', score: 1, tag: 'warning' },
        { label: '只看到收益率高就想买', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'bq4', category: '利率周期',
      question: '当前利率环境对持有债券有利吗？',
      options: [
        { label: '降息周期，对债券有利', score: 5, tag: 'success' },
        { label: '利率平稳，影响不大', score: 3 },
        { label: '加息周期，债券价格承压', score: 1, tag: 'warning' },
        { label: '完全不了解利率环境', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'bq5', category: '流动性',
      question: '这只债券的流动性如何？',
      options: [
        { label: '国债/大盘债券，流动性极好', score: 5, tag: 'success' },
        { label: '流动性一般，但计划持有到期', score: 3 },
        { label: '日成交量很小，可能难卖', score: 1, tag: 'warning' },
        { label: '没关注过流动性', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'bq6', category: '期限匹配',
      question: '债券期限与你的资金计划匹配吗？',
      options: [
        { label: '完全匹配，可以持有到期', score: 5, tag: 'success' },
        { label: '基本匹配，有少量灵活性', score: 3 },
        { label: '期限偏长，中途可能需要卖出', score: 1, tag: 'warning' },
        { label: '没考虑过期限问题', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'bq7', category: '条款',
      question: '你了解债券的特殊条款吗？',
      options: [
        { label: '了解所有条款，对投资者友好', score: 5, tag: 'success' },
        { label: '了解主要条款', score: 3 },
        { label: '有些条款不太理解', score: 1, tag: 'warning' },
        { label: '完全没看过条款', score: 0, tag: 'danger' },
      ],
    },
  ],
};

// ===== 期货快速决策 =====
const futuresQuiz: QuizConfig = {
  title: '期货快速决策',
  subtitle: '8道选择题，严格评估。期货容错率极低，80分以下直接放弃',
  totalMax: 40,
  thresholds: [
    { score: 36, label: '逻辑清晰、风控到位，可以执行', emoji: '🟢', color: 't-success' },
    { score: 32, label: '基本面支撑，但可适当缩小仓位', emoji: '🟡', color: 't-warning' },
    { score: 0, label: '放弃。期货市场不需要"凑合"的交易', emoji: '🔴', color: 't-danger' },
  ],
  questions: [
    {
      id: 'ftq1', category: '品种理解',
      question: '你对这个期货品种的理解程度？',
      tip: '段永平：不做不懂的东西',
      options: [
        { label: '深度理解供需基本面、产业链、季节性', score: 5, tag: 'success' },
        { label: '了解基本的供需逻辑', score: 3 },
        { label: '只看技术面，不了解基本面', score: 1, tag: 'warning' },
        { label: '完全不懂，跟风交易', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq2', category: '止损',
      question: '你设定了止损吗？',
      tip: '每笔交易必须有止损，没有例外',
      options: [
        { label: '有明确止损位，且单笔亏损≤总资金2%', score: 5, tag: 'success' },
        { label: '有止损位，但可能超过2%', score: 3 },
        { label: '大概有个心理价位', score: 1, tag: 'warning' },
        { label: '没设止损/不相信止损', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq3', category: '风险收益比',
      question: '这笔交易的风险收益比如何？',
      options: [
        { label: '≥ 3:1，赔率很好', score: 5, tag: 'success' },
        { label: '≥ 2:1，可以接受', score: 3 },
        { label: '约 1:1', score: 1, tag: 'warning' },
        { label: '没算过/不到1:1', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq4', category: '仓位',
      question: '你的仓位控制如何？',
      options: [
        { label: '总保证金<20%，留有充足安全垫', score: 5, tag: 'success' },
        { label: '总保证金<30%', score: 3 },
        { label: '保证金占比较高（30-50%）', score: 1, tag: 'warning' },
        { label: '重仓或满仓操作', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq5', category: '数据支撑',
      question: '有数据支撑你的交易方向吗？',
      options: [
        { label: '库存/基差/持仓/季节性多维度印证', score: 5, tag: 'success' },
        { label: '有部分数据支撑', score: 3 },
        { label: '主要靠技术分析', score: 1, tag: 'warning' },
        { label: '靠感觉/消息/别人观点', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq6', category: '资金来源',
      question: '你用什么钱做期货？',
      tip: '段永平：不借钱',
      options: [
        { label: '纯闲置资金，亏完不影响生活', score: 5, tag: 'success' },
        { label: '可承受的投资资金', score: 3 },
        { label: '占比较大的个人资金', score: 1, tag: 'warning' },
        { label: '借的钱/生活费/加了杠杆', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq7', category: '情绪',
      question: '你当前的交易心态如何？',
      options: [
        { label: '冷静理性，经过充分分析', score: 5, tag: 'success' },
        { label: '基本理性', score: 3 },
        { label: '有些急躁/想抓住机会', score: 1, tag: 'warning' },
        { label: '刚亏了想翻本/兴奋冲动', score: 0, tag: 'danger' },
      ],
    },
    {
      id: 'ftq8', category: '交易计划',
      question: '你有完整的交易计划吗？',
      options: [
        { label: '入场/止损/止盈/仓位/时间全部明确', score: 5, tag: 'success' },
        { label: '有大致计划，部分细节未定', score: 3 },
        { label: '只有入场价，其他再说', score: 1, tag: 'warning' },
        { label: '没有计划，先做了再说', score: 0, tag: 'danger' },
      ],
    },
  ],
};

export const QUIZ_DATA: Record<AssetType, QuizConfig> = {
  stock: stockQuiz,
  fund: fundQuiz,
  bond: bondQuiz,
  futures: futuresQuiz,
};
