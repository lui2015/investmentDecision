import { useState } from 'react';
import { useThemeStore } from '../store/theme';

const quotes = [
  { author: '巴菲特', text: '第一条规则：永远不要亏钱。第二条规则：永远不要忘记第一条。', cat: '风险管理' },
  { author: '巴菲特', text: '以合理的价格买入优秀的公司，远好过以便宜的价格买入平庸的公司。', cat: '选股' },
  { author: '巴菲特', text: '当别人贪婪时恐惧，当别人恐惧时贪婪。', cat: '逆向投资' },
  { author: '巴菲特', text: '如果你不愿意持有一只股票十年，那就连十分钟也不要持有。', cat: '长期持有' },
  { author: '巴菲特', text: '价格是你付出的，价值是你得到的。', cat: '估值' },
  { author: '巴菲特', text: '风险来自于你不知道自己在做什么。', cat: '能力圈' },
  { author: '芒格', text: '反过来想，总是反过来想。', cat: '逆向思维' },
  { author: '芒格', text: '如果我知道会死在哪里，我就永远不去那个地方。', cat: '风险管理' },
  { author: '芒格', text: '我们只是比大多数人更少愚蠢，而不是比大多数人更聪明。', cat: '谦逊' },
  { author: '段永平', text: '买股票就是买公司，买公司就是买其未来现金流的折现值。', cat: '估值' },
  { author: '段永平', text: '不懂不做、不做空、不借钱炒股。', cat: '投资纪律' },
  { author: '段永平', text: '做对的事情，把事情做对。', cat: '原则' },
  { author: '段永平', text: '投资最重要的是商业模式，好的商业模式是"印钞机"。', cat: '商业模式' },
  { author: '格雷厄姆', text: '市场短期是投票机，长期是称重机。', cat: '市场' },
  { author: '格雷厄姆', text: '安全边际的目的是让精确的预测变得不必要。', cat: '安全边际' },
  { author: '格雷厄姆', text: '投资者最大的敌人不是股票市场，而是他自己。', cat: '心理' },
  { author: '霍华德·马克斯', text: '我们不知道要去哪里，但应该知道自己在哪里。', cat: '周期' },
  { author: '霍华德·马克斯', text: '投资中最重要的事情是意识到风险、理解风险、控制风险。', cat: '风险管理' },
  { author: '约翰·博格', text: '不要在草堆里找针，直接买下整个草堆。', cat: '指数投资' },
  { author: '约翰·博格', text: '费率是确定的损耗，收益是不确定的。便宜的永远比贵的好。', cat: '成本' },
  { author: '利弗莫尔', text: '华尔街不会变，因为人性不会变。', cat: '人性' },
  { author: '利弗莫尔', text: '计划你的交易，交易你的计划。', cat: '纪律' },
  { author: '达里奥', text: '分散化是唯一的免费午餐。', cat: '配置' },
  { author: '彼得·林奇', text: '投资你了解的东西。在你自己的生活中寻找投资机会。', cat: '能力圈' },
];

const biases = [
  { name: '锚定效应', icon: '⚓', desc: '过度依赖第一个获得的信息（如买入价格）来做后续判断。', example: '你以100元买入一只股票，当跌到60元时，你总觉得它"应该"回到100元，而忽略了基本面可能已变化。', remedy: '评估时忘掉买入价格。问自己：如果今天没有持仓，我会以当前价格买入吗？' },
  { name: '确认偏差', icon: '🔍', desc: '倾向于寻找支持自己已有观点的信息，忽略反面证据。', example: '买入某股票后，你只看利好新闻，自动忽略或否认利空消息。', remedy: '主动寻找反对意见。芒格的方法：列出不该买的理由。' },
  { name: '损失厌恶', icon: '💔', desc: '亏损带来的痛苦是同等收益带来快乐的2倍以上。', example: '不愿止损离场，因为"卖了就真的亏了"，导致小亏变大亏。', remedy: '在买入前就设定止损条件。关注决策质量而非单次结果。' },
  { name: '从众心理', icon: '🐑', desc: '跟随大多数人的行为，认为"大家都在买一定没错"。', example: '牛市末期跟风追涨，熊市恐慌性抛售。', remedy: '回到检查清单。巴菲特："别人贪婪时恐惧，别人恐惧时贪婪。"' },
  { name: '过度自信', icon: '🦚', desc: '高估自己的判断能力和信息优势。', example: '认为自己能够准确预测短期市场走势或个股涨跌。', remedy: '记录预测并事后复盘准确率。承认"我不知道"比错误的确信更有价值。' },
  { name: '近因偏差', icon: '📅', desc: '过度重视最近发生的事件，忽略长期趋势。', example: '因为最近三个月市场上涨，就认为市场会一直涨下去。', remedy: '拉长时间维度看数据，研究完整的市场周期。' },
  { name: '沉没成本谬误', icon: '🕳️', desc: '因为已经投入了成本（时间/金钱/精力）而继续错误的决策。', example: '一只股票已经亏损30%，因为"已经亏了这么多"而不愿卖出，甚至加仓。', remedy: '忽略已投入的成本，只关注未来的预期收益与风险。' },
  { name: '幸存者偏差', icon: '🏆', desc: '只看到成功案例，忽略了大量失败案例。', example: '看到某人重仓某股票赚了10倍就想模仿，却没看到更多人重仓亏光。', remedy: '同时关注成功与失败案例。失败模式更有学习价值。' },
];

export default function KnowledgePage() {
  const [tab, setTab] = useState<'quotes' | 'biases'>('quotes');
  const [filter, setFilter] = useState('all');
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const authors = [...new Set(quotes.map(q => q.author))];
  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.author === filter);

  return (
    <div className={`max-w-4xl mx-auto space-y-6 animate-fade-in ${isCyber ? 'cyber-grid' : ''}`}>
      <div>
        <h2 className={`text-xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>投资知识库</h2>
        <p className="text-sm t-text2 mt-1">"我们读了很多东西……发现了更好的思维方式。" —— 芒格</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('quotes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'quotes' ? 't-accent-bg' : 't-card t-text2'}`}>
          💬 大师语录
        </button>
        <button onClick={() => setTab('biases')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'biases' ? 't-accent-bg' : 't-card t-text2'}`}>
          🧠 认知偏差
        </button>
      </div>

      {/* Quotes Tab */}
      {tab === 'quotes' && (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${filter === 'all' ? 't-accent-bg' : 't-card t-text2'}`}>
              全部
            </button>
            {authors.map(a => (
              <button key={a} onClick={() => setFilter(a)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${filter === a ? 't-accent-bg' : 't-card t-text2'}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((q, i) => (
              <div key={i} className="t-card t-card-hover p-5">
                <p className="text-sm t-text italic leading-relaxed">"{q.text}"</p>
                <div className="flex justify-between mt-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
                  <span className="text-xs t-accent font-medium">{q.author}</span>
                  <span className="text-xs t-muted">{q.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Biases Tab */}
      {tab === 'biases' && (
        <div className="space-y-4">
          {/* Tip banner */}
          <div className="t-card p-4" style={{ borderLeft: '3px solid var(--t-warning)' }}>
            <p className="text-sm t-text">
              💡 了解这些认知偏差是第一步。真正困难的是在实际投资中识别并克服它们——这正是决策表的价值。
            </p>
          </div>

          {/* Bias cards */}
          {biases.map((b, i) => (
            <div key={i} className={`t-card overflow-hidden ${isCyber ? 'glow-border' : ''}`}>
              {/* Header */}
              <div className="px-5 py-3 t-bg3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--t-border)' }}>
                <span className="text-xl">{b.icon}</span>
                <h3 className="font-bold t-text text-base">{b.name}</h3>
              </div>

              <div className="p-5 space-y-4">
                {/* Description */}
                <p className="text-sm t-text leading-relaxed">{b.desc}</p>

                {/* Example - danger zone */}
                <div className="rounded-lg p-3.5" style={{ background: 'color-mix(in srgb, var(--t-danger) 10%, var(--t-bg-secondary))', border: '1px solid color-mix(in srgb, var(--t-danger) 25%, transparent)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs">⚠️</span>
                    <span className="text-xs font-semibold t-danger">典型表现</span>
                  </div>
                  <p className="text-sm t-text leading-relaxed">{b.example}</p>
                </div>

                {/* Remedy - success zone */}
                <div className="rounded-lg p-3.5" style={{ background: 'color-mix(in srgb, var(--t-success) 10%, var(--t-bg-secondary))', border: '1px solid color-mix(in srgb, var(--t-success) 25%, transparent)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs">✅</span>
                    <span className="text-xs font-semibold t-success">应对方法</span>
                  </div>
                  <p className="text-sm t-text leading-relaxed">{b.remedy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
