import type { AssetType, VetoItem, QualDimension, QuantMetric } from '../types';

// ===== 各资产类型的板块步骤名 =====
export const STEPS: Record<AssetType, string[]> = {
  stock: ['基础信息', '一票否决', '定性分析', '定量分析', '估值判断', '风险清单', '投资逻辑', '买入计划', '评分决策', '投后跟踪', '纪律提醒', '极简版'],
  fund: ['基础信息', '一票否决', '定性分析', '定量分析', '估值与时机', '风险清单', '投资逻辑', '买入计划', '评分决策', '投后跟踪', '纪律提醒', '极简版'],
  bond: ['基础信息', '一票否决', '定性分析', '定量分析', '收益率判断', '风险清单', '投资逻辑', '买入计划', '评分决策', '投后跟踪', '纪律提醒', '极简版'],
  futures: ['风险确认', '基础信息', '一票否决', '定性分析', '定量分析', '风险收益比', '风险清单', '交易逻辑', '交易计划', '评分决策', '投后跟踪', '纪律提醒'],
};

// ===== 基础信息字段 =====
export const BASIC_FIELDS: Record<AssetType, { key: string; label: string; type: 'text' | 'date' | 'number' | 'textarea' | 'select'; required: boolean; options?: string[]; placeholder?: string }[]> = {
  stock: [
    { key: 'companyName', label: '公司名称', type: 'text', required: true, placeholder: '例：贵州茅台' },
    { key: 'stockCode', label: '股票代码', type: 'text', required: true, placeholder: '例：600519' },
    { key: 'industry', label: '所属行业', type: 'text', required: true, placeholder: '例：白酒' },
    { key: 'trackDate', label: '跟踪日期', type: 'date', required: true },
    { key: 'currentPrice', label: '当前股价', type: 'number', required: true },
    { key: 'marketCap', label: '市值（亿元）', type: 'number', required: false },
    { key: 'reason', label: '关注原因', type: 'textarea', required: true },
    { key: 'source', label: '信息来源', type: 'text', required: true, placeholder: '年报/季报/券商研报/财报会/行业数据/自己整理' },
  ],
  fund: [
    { key: 'fundName', label: '基金名称', type: 'text', required: true },
    { key: 'fundCode', label: '基金代码', type: 'text', required: true },
    { key: 'fundType', label: '基金类型', type: 'select', required: true, options: ['主动管理', '被动指数', 'ETF', 'LOF', 'FOF', 'QDII', '债券型', '混合型'] },
    { key: 'trackIndex', label: '跟踪指数（如有）', type: 'text', required: false },
    { key: 'fundManager', label: '基金经理', type: 'text', required: true },
    { key: 'fundCompany', label: '基金公司', type: 'text', required: true },
    { key: 'establishDate', label: '成立日期', type: 'date', required: true },
    { key: 'fundScale', label: '最新规模（亿元）', type: 'number', required: true },
    { key: 'currentNav', label: '当前净值', type: 'number', required: true },
    { key: 'trackDate', label: '跟踪日期', type: 'date', required: true },
    { key: 'reason', label: '关注原因', type: 'textarea', required: true },
    { key: 'source', label: '信息来源', type: 'text', required: true, placeholder: '基金季报/年报/经理访谈/持仓明细/第三方评级' },
  ],
  bond: [
    { key: 'bondName', label: '债券名称', type: 'text', required: true },
    { key: 'bondCode', label: '债券代码', type: 'text', required: true },
    { key: 'bondType', label: '债券类型', type: 'select', required: true, options: ['国债', '地方政府债', '政策性金融债', '企业债', '公司债', '可转债', '中期票据', '短期融资券', 'ABS'] },
    { key: 'issuer', label: '发行人', type: 'text', required: true },
    { key: 'issuerIndustry', label: '发行人所属行业', type: 'text', required: true },
    { key: 'creditRating', label: '信用评级（主体/债项）', type: 'select', required: true, options: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-以下'] },
    { key: 'couponRate', label: '票面利率（%）', type: 'number', required: true },
    { key: 'paymentType', label: '付息方式', type: 'select', required: true, options: ['年付', '半年付', '到期一次付'] },
    { key: 'maturityDate', label: '到期日', type: 'date', required: true },
    { key: 'currentPrice', label: '当前价格（净价）', type: 'number', required: true },
    { key: 'ytm', label: '到期收益率YTM（%）', type: 'number', required: true },
    { key: 'specialTerms', label: '特殊条款', type: 'text', required: false, placeholder: '回售/赎回/调整票面/转股' },
    { key: 'reason', label: '关注原因', type: 'textarea', required: true },
    { key: 'source', label: '信息来源', type: 'text', required: true, placeholder: '募集说明书/评级报告/发行人财报' },
  ],
  futures: [
    { key: 'productName', label: '品种名称', type: 'text', required: true, placeholder: '例：螺纹钢' },
    { key: 'contractCode', label: '合约代码', type: 'text', required: true },
    { key: 'exchange', label: '交易所', type: 'select', required: true, options: ['上期所', '大商所', '郑商所', '中金所', '上期能源', '广期所'] },
    { key: 'contractMonth', label: '合约月份', type: 'text', required: true },
    { key: 'multiplier', label: '合约乘数', type: 'number', required: true },
    { key: 'tickSize', label: '最小变动价位', type: 'number', required: true },
    { key: 'marginRate', label: '保证金比例（%）', type: 'number', required: true },
    { key: 'currentPrice', label: '当前价格', type: 'number', required: true },
    { key: 'lastTradeDate', label: '最后交易日', type: 'date', required: true },
    { key: 'deliveryType', label: '交割方式', type: 'select', required: true, options: ['实物交割', '现金交割'] },
    { key: 'direction', label: '交易方向', type: 'select', required: true, options: ['做多', '做空'] },
    { key: 'reason', label: '关注原因', type: 'textarea', required: true },
    { key: 'source', label: '信息来源', type: 'text', required: true, placeholder: '供需报告/库存数据/行业调研/期货公司研报' },
  ],
};

// ===== 一票否决项 =====
export const VETO_ITEMS: Record<AssetType, Omit<VetoItem, 'passed' | 'note' | 'rebuttal'>[]> = {
  stock: [
    { id: 'sv1', text: '我能用一句人话讲清这家公司怎么赚钱' },
    { id: 'sv2', text: '主营业务我看得懂，且在我的能力圈内' },
    { id: 'sv3', text: '最近3年没有明显财务造假、重大违规、商誉暴雷等红旗' },
    { id: 'sv4', text: '公司负债水平没有明显失控' },
    { id: 'sv5', text: '核心逻辑不是靠纯题材、纯故事、纯情绪支撑' },
    { id: 'sv6', text: '管理层没有反复损害中小股东利益的记录' },
    { id: 'sv7', text: '我买它不是因为"已经涨很多"或"别人都在买"' },
  ],
  fund: [
    { id: 'fv1', text: '我理解这只基金投的是什么（底层资产、行业方向、投资策略）' },
    { id: 'fv2', text: '基金经理从业≥5年，且经历过至少一轮完整牛熊周期' },
    { id: 'fv3', text: '基金规模适中（主动型不超500亿、不低于2亿；指数型不低于1亿）' },
    { id: 'fv4', text: '基金没有频繁更换基金经理（近3年内≤1次）' },
    { id: 'fv5', text: '我不是因为最近排名靠前/收益暴涨才关注它' },
    { id: 'fv6', text: '综合费率（管理费+托管费+申赎费）我了解且可接受' },
    { id: 'fv7', text: '基金没有严重的合规问题或被监管处罚记录' },
  ],
  bond: [
    { id: 'bv1', text: '我理解这只债券的基本条款（票面利率、付息方式、到期日、回售/赎回条款）' },
    { id: 'bv2', text: '发行人主体信用评级≥AA（低于AA需有充分信用分析能力）' },
    { id: 'bv3', text: '发行人近3年没有发生过债务违约、技术性违约或重大信用事件' },
    { id: 'bv4', text: '发行人利息保障倍数>2（有能力覆盖利息支出）' },
    { id: 'bv5', text: '我不是只因为收益率高就想买（高收益=高风险没有例外）' },
    { id: 'bv6', text: '我了解这只债券的流动性状况，不会面临"想卖卖不掉"的困境' },
    { id: 'bv7', text: '我的投资期限与债券剩余期限匹配' },
  ],
  futures: [
    { id: 'ftv1', text: '我真正理解这个品种的供需基本面和定价逻辑（不是只看K线）' },
    { id: 'ftv2', text: '我了解该品种的合约规则、交割规则、涨跌停板和保证金调整机制' },
    { id: 'ftv3', text: '我使用的是闲置资金，没有借钱做期货' },
    { id: 'ftv4', text: '本次交易有明确的止损位，且我承诺严格执行' },
    { id: 'ftv5', text: '单笔最大亏损≤总资金的2%（绝对上限）' },
    { id: 'ftv6', text: '总持仓保证金占比<30%（不会因行情波动被强制平仓）' },
    { id: 'ftv7', text: '不在临近交割月进行投机' },
    { id: 'ftv8', text: '我不是因为刚亏了钱想要"翻本"' },
    { id: 'ftv9', text: '我不是在盘中冲动下决定交易的（经过至少数小时冷静分析）' },
    { id: 'ftv10', text: '今天已有的亏损没有触达日内止损上限' },
  ],
};

// ===== 定性分析维度 =====
export const QUAL_DIMENSIONS: Record<AssetType, Omit<QualDimension, 'score' | 'note'>[]> = {
  stock: [
    { id: 'sq1', name: '业务可理解性', question: '我是否真正理解产品、客户、盈利模式' },
    { id: 'sq2', name: '行业空间', question: '行业还有没有增长空间，是否长期有需求' },
    { id: 'sq3', name: '护城河', question: '品牌、渠道、成本、网络效应、牌照、转换成本等是否存在' },
    { id: 'sq4', name: '竞争格局', question: '是否处于优势地位，价格战风险高不高' },
    { id: 'sq5', name: '管理层质量', question: '是否诚实、理性、重视股东回报' },
    { id: 'sq6', name: '资本配置能力', question: '赚到的钱能否高效再投资或合理分红回购' },
    { id: 'sq7', name: '商业模式质量', question: '现金流、毛利率、复购、议价能力如何' },
    { id: 'sq8', name: '抗风险能力', question: '遇到周期、政策、原材料波动时是否脆弱' },
  ],
  fund: [
    { id: 'fq1', name: '基金经理能力', question: '长期业绩是否优秀且稳定，靠能力还是靠运气/风格押注' },
    { id: 'fq2', name: '投资理念一致性', question: '基金经理是否有清晰且一贯的投资框架' },
    { id: 'fq3', name: '利益绑定程度', question: '基金经理是否有显著自购（百万以上）' },
    { id: 'fq4', name: '风格稳定性', question: '持仓风格是否漂移，晨星九宫格位置是否跳跃' },
    { id: 'fq5', name: '下行保护能力', question: '在熊市中最大回撤多少，相对同类排名如何' },
    { id: 'fq6', name: '持仓质量', question: '重仓股是否有护城河，集中度是否合理' },
    { id: 'fq7', name: '费率与成本', question: '综合持有成本在同类中是否有竞争力' },
    { id: 'fq8', name: '基金公司平台', question: '基金公司整体投研实力如何，风控体系是否健全' },
  ],
  bond: [
    { id: 'bq1', name: '发行人主业质量', question: '主营业务是否稳定、可预期，现金流是否充裕' },
    { id: 'bq2', name: '行业前景与周期', question: '所在行业是否稳定或上行，是否面临结构性衰退' },
    { id: 'bq3', name: '偿债意愿', question: '发行人是否有良好的信用记录和偿债文化' },
    { id: 'bq4', name: '股东背景与支持', question: '是否有强大股东或政府隐性担保' },
    { id: 'bq5', name: '担保与增信', question: '是否有第三方担保、抵质押物或其他有效增信' },
    { id: 'bq6', name: '条款友好度', question: '回售/赎回/调整票面等条款是否对投资者友好' },
    { id: 'bq7', name: '同类比较优势', question: '相比同评级同期限可比债券，综合条件是否更优' },
    { id: 'bq8', name: '信息透明度', question: '发行人信息披露是否充分、及时，财务数据是否可信' },
  ],
  futures: [
    { id: 'ftq1', name: '品种理解深度', question: '是否理解产业链上下游、成本结构、供需弹性' },
    { id: 'ftq2', name: '供需格局判断', question: '当前供需是否有明确的方向性矛盾' },
    { id: 'ftq3', name: '库存与基差信号', question: '库存高低、期现基差结构是否支持交易方向' },
    { id: 'ftq4', name: '季节性规律', question: '当前时间点是否处于有利的季节性窗口' },
    { id: 'ftq5', name: '政策与外部因素', question: '是否有关税、环保、进出口政策等重大变量' },
    { id: 'ftq6', name: '资金面与持仓分析', question: '主力资金方向是否明确，持仓量变化是否印证观点' },
    { id: 'ftq7', name: '宏观环境', question: '宏观经济周期、通胀/通缩预期、汇率因素是否有利' },
    { id: 'ftq8', name: '技术面确认', question: '技术形态是否支持交易方向' },
  ],
};

// ===== 定量分析指标 =====
export const QUANT_METRICS: Record<AssetType, Omit<QuantMetric, 'historical' | 'current' | 'rating' | 'note'>[]> = {
  stock: [
    { id: 'sm1', name: '营收增长' }, { id: 'sm2', name: '归母净利润增长' }, { id: 'sm3', name: 'ROE / ROIC' },
    { id: 'sm4', name: '毛利率' }, { id: 'sm5', name: '净利率' }, { id: 'sm6', name: '经营现金流' },
    { id: 'sm7', name: '自由现金流' }, { id: 'sm8', name: '资产负债率' }, { id: 'sm9', name: '有息负债/利息覆盖' },
    { id: 'sm10', name: '应收账款/存货变化' }, { id: 'sm11', name: '分红/回购记录' },
  ],
  fund: [
    { id: 'fm1', name: '总收益率(近1/3/5年)' }, { id: 'fm2', name: '年化收益率' }, { id: 'fm3', name: '超额收益(对比基准)' },
    { id: 'fm4', name: '同类排名分位' }, { id: 'fm5', name: '最大回撤' }, { id: 'fm6', name: '年化波动率' },
    { id: 'fm7', name: '夏普比率' }, { id: 'fm8', name: '卡玛比率(收益/最大回撤)' },
    { id: 'fm9', name: '持仓集中度(前十占比)' }, { id: 'fm10', name: '换手率' }, { id: 'fm11', name: '规模变化趋势' },
  ],
  bond: [
    { id: 'bm1', name: '营收规模与稳定性' }, { id: 'bm2', name: '净利润趋势' }, { id: 'bm3', name: '经营性现金流' },
    { id: 'bm4', name: '资产负债率' }, { id: 'bm5', name: '有息负债规模' }, { id: 'bm6', name: '利息保障倍数' },
    { id: 'bm7', name: '现金短债比' }, { id: 'bm8', name: '到期收益率YTM' },
    { id: 'bm9', name: '修正久期' }, { id: 'bm10', name: '信用利差(对比历史)' }, { id: 'bm11', name: '日均成交量' },
  ],
  futures: [
    { id: 'ftm1', name: '现货价格' }, { id: 'ftm2', name: '期现基差(升贴水)' }, { id: 'ftm3', name: '库存水平' },
    { id: 'ftm4', name: '库存变化趋势(去库/累库)' }, { id: 'ftm5', name: '开工率/产能利用率' },
    { id: 'ftm6', name: '产业链利润' }, { id: 'ftm7', name: '持仓量变化' }, { id: 'ftm8', name: '成交量趋势' },
    { id: 'ftm9', name: '主力合约月间价差' }, { id: 'ftm10', name: '相关品种联动' },
  ],
};

// ===== 风险类型 =====
export const RISK_TYPES: Record<AssetType, string[]> = {
  stock: ['行业风险', '公司经营风险', '政策/监管风险', '估值回落风险', '管理层风险', '黑天鹅风险'],
  fund: ['基金经理离职/更换', '规模暴增致策略失效', '风格漂移', '底层资产估值过高', '行业集中度过高', '赎回踩踏', '市场系统性下跌', '流动性风险'],
  bond: ['信用违约风险', '利率上行风险', '流动性风险', '评级下调风险', '发行人经营恶化', '政策/监管风险', '提前赎回风险', '再投资风险', '通胀侵蚀风险'],
  futures: ['方向判断错误', '突发事件(政策/天灾/地缘)', '流动性风险(涨跌停/临近交割)', '保证金上调被迫减仓', '逼仓风险', '跳空缺口(隔夜风险)', '关联品种联动风险', '自身情绪失控风险'],
};

// ===== 纪律提醒 =====
export const DISCIPLINE: Record<AssetType, string[]> = {
  stock: [
    '不懂不买。',
    '没有安全边际，不重仓。',
    '不因为涨了眼红，也不因为跌了赌气。',
    '先写理由，再下单。',
    '如果逻辑无法写清楚，说明还没想清楚。',
    '投资决策的敌人通常不是信息不够，而是情绪太满。',
  ],
  fund: [
    '不追热门基金。排行榜冠军第二年通常表现平庸。',
    '不频繁申赎。基金投资是中长期行为，不是短线交易工具。',
    '不因为短期排名波动而焦虑。3年以下的排名没有统计意义。',
    '关注基金经理的持仓逻辑和框架，而非净值的日常波动。',
    '定投纪律：市场越跌越要坚持，而非恐慌停止。',
    '不在牛市末期大额追入，不在熊市底部恐慌赎回。',
    '费率是确定的损耗，收益是不确定的。便宜的永远比贵的好。',
    '如果你无法描述这只基金为什么好，说明你还不够了解它。',
  ],
  bond: [
    '收益率不是越高越好。高收益率是市场对高风险的定价。',
    '不懂信用分析，就买国债或高等级信用债。不丢人，这是理性。',
    '不要用短期资金买长久期债券。',
    '分散单一发行人风险，任何一家公司都可能出问题。',
    '关注现金流，不关注利润。还债靠的是现金，不是账面利润。',
    '债券违约前通常有迹可循：评级下调、利差走扩、借新还旧困难。',
    '持有到期策略可以忽略价格波动，但不能忽略信用风险。',
    '为了多赚1%的利息，承担100%的本金损失风险——这是最大的悲剧。',
  ],
  futures: [
    '每笔交易必须有止损。没有例外。',
    '亏损时绝对不加仓。绝对。',
    '不做隔夜重仓。你睡觉的时候，市场在全球交易。',
    '不与市场争论。止损到了就走，别问"为什么"。',
    '一天亏损达到限额，关掉软件，离开屏幕。',
    '不要因为"手痒"就交易。没有信号就没有交易。',
    '赚钱不代表你对了，可能只是运气好。保持敬畏。',
    '连续盈利后最危险——过度自信是期货交易者最大的敌人。',
    '连续亏损后最需要做的不是"翻本"，而是停下来复盘。',
    '永远记住：市场会在你最有信心的时候教你做人。',
    '段永平说得对：不做空、不借钱、不做不懂的东西。',
  ],
};

// ===== 极简版问题 =====
export const QUICK_QUESTIONS: Record<AssetType, string[]> = {
  stock: ['我看得懂它吗？', '它有护城河吗？', '财务是否健康？', '现在价格贵不贵？', '最大风险是什么？', '为什么现在而不是以后买？', '如果跌20%，我会因为什么继续持有？'],
  fund: ['我理解这只基金投的是什么吗？', '基金经理靠谱吗（经验、理念、自购）？', '历史业绩好看，但回撤我受得了吗？', '费率合理吗？', '现在底层资产贵不贵？', '最大的风险是什么？', '如果跌20%，我会因为什么继续持有？'],
  bond: ['发行人能还钱吗？', '信用评级是否够安全？', '收益率是否足够补偿风险？', '现在利率周期有利吗？', '流动性够不够（能不能卖掉）？', '最大风险是什么？', '如果债券价格跌5%，我会因为什么继续持有？'],
  futures: ['我真正理解这个品种的供需逻辑吗？', '数据（库存、基差、持仓）支持我的方向吗？', '我的止损位在哪？止损金额我能承受吗？', '风险收益比≥2:1吗？', '最大风险是什么？', '我是在冷静状态下做的决策吗？', '如果亏了，我会遵守纪律止损吗？'],
};

// ===== 期货风险确认项 =====
export const FUTURES_RISK_CONFIRMS = [
  '我使用的是闲置资金，全部亏完不影响我的正常生活',
  '我没有借钱、加杠杆外部融资来做期货',
  '我理解期货可能亏损超过本金（追保、穿仓）',
  '我有明确的单笔最大亏损上限，且会严格执行止损',
  '我做期货不是为了"翻本""赌一把"或"找刺激"',
];

// ===== 决策阈值 =====
export const SCORE_THRESHOLDS: Record<AssetType, { high: number; mid: number; low: number; labels: string[] }> = {
  stock: { high: 85, mid: 70, low: 60, labels: ['可重点跟踪，若价格合适可分批建仓', '值得观察，等待更好价格或更多证据', '谨慎，仅限小仓位研究单', '放弃，别浪费注意力'] },
  fund: { high: 85, mid: 70, low: 60, labels: ['优质选择，若时机合适可建仓或定投', '值得放入观察池，等待更好买入时机', '谨慎，仅限小仓位试水', '放弃，市场上有更好的选择'] },
  bond: { high: 85, mid: 70, low: 60, labels: ['信用安全、收益合理，可买入', '基本面可接受，等待更好的收益率', '谨慎，仅限小仓位，密切关注信用变化', '放弃，信用风险或收益率不足以补偿'] },
  futures: { high: 90, mid: 80, low: 80, labels: ['逻辑清晰、数据支撑、风险可控，可执行', '基本面支撑但条件不够完美，减仓或等待', '放弃。期货市场不需要"凑合"的交易', '放弃。期货市场不需要"凑合"的交易'] },
};
