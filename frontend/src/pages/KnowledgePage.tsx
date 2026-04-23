import { useState } from 'react';

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
  { name: '锚定效应', desc: '过度依赖第一个获得的信息（如买入价格）来做后续判断。', remedy: '评估时忘掉买入价格。问自己：如果今天没有持仓，我会以当前价格买入吗？' },
  { name: '确认偏差', desc: '倾向于寻找支持自己已有观点的信息，忽略反面证据。', remedy: '主动寻找反对意见。芒格的方法：列出不该买的理由。' },
  { name: '损失厌恶', desc: '亏损带来的痛苦是同等收益带来快乐的2倍以上。', remedy: '在买入前就设定止损条件。关注决策质量而非单次结果。' },
  { name: '从众心理', desc: '跟随大多数人的行为，认为"大家都在买一定没错"。', remedy: '回到检查清单。巴菲特："别人贪婪时恐惧，别人恐惧时贪婪。"' },
  { name: '过度自信', desc: '高估自己的判断能力和信息优势。', remedy: '记录预测并事后复盘准确率。承认"我不知道"比错误的确信更有价值。' },
  { name: '近因偏差', desc: '过度重视最近发生的事件，忽略长期趋势。', remedy: '拉长时间维度看数据，研究完整的市场周期。' },
  { name: '沉没成本谬误', desc: '因为已经投入了成本而继续错误的决策。', remedy: '忽略已投入的成本，只关注未来的预期收益与风险。' },
  { name: '幸存者偏差', desc: '只看到成功案例，忽略了大量失败案例。', remedy: '同时关注成功与失败案例。失败模式更有学习价值。' },
];

export default function KnowledgePage() {
  const [tab, setTab] = useState<'quotes' | 'biases'>('quotes');
  const [filter, setFilter] = useState('all');
  const authors = [...new Set(quotes.map(q => q.author))];
  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.author === filter);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold t-text">投资知识库</h2>
        <p className="text-sm t-text2 mt-1">"我们读了很多东西……发现了更好的思维方式。" —— 芒格</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('quotes')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'quotes' ? 't-accent-bg text-white' : 't-bg2 t-text2 border t-border'}`}>大师语录</button>
        <button onClick={() => setTab('biases')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'biases' ? 't-accent-bg text-white' : 't-bg2 t-text2 border t-border'}`}>认知偏差</button>
      </div>
      {tab === 'quotes' && (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilter('all')} className={`px-2.5 py-1 rounded-full text-xs ${filter === 'all' ? 'bg-slate-800 text-white' : 't-bg2 t-text2 border t-border'}`}>全部</button>
            {authors.map(a => <button key={a} onClick={() => setFilter(a)} className={`px-2.5 py-1 rounded-full text-xs ${filter === a ? 'bg-slate-800 text-white' : 't-bg2 t-text2 border t-border'}`}>{a}</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((q, i) => (
              <div key={i} className="t-bg2 rounded-xl p-4 border t-border">
                <p className="text-sm t-text italic leading-relaxed">"{q.text}"</p>
                <div className="flex justify-between mt-2"><span className="text-xs t-accent">{q.author}</span><span className="text-xs t-muted">{q.cat}</span></div>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === 'biases' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm t-warning">
            💡 了解这些认知偏差是第一步。真正困难的是在实际投资中识别并克服它们——这正是决策表的价值。
          </div>
          {biases.map((b, i) => (
            <div key={i} className="t-bg2 rounded-xl p-4 border t-border">
              <h3 className="font-semibold t-text">{b.name}</h3>
              <p className="text-sm t-text2 mt-1">{b.desc}</p>
              <div className="mt-2 p-2.5 bg-green-50 rounded-lg text-sm t-success"><strong>应对：</strong>{b.remedy}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
