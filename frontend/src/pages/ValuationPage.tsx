import { useState } from 'react';

type Method = 'dcf' | 'peg' | 'graham' | 'ddm' | 'ytm';
const methods: { key: Method; name: string; desc: string; fields: { k: string; l: string; d?: number }[] }[] = [
  { key: 'dcf', name: 'DCF 自由现金流折现', desc: '适用于稳定盈利公司。巴菲特最常用的估值方法。',
    fields: [{ k: 'fcf', l: '当前自由现金流(亿)', d: 50 }, { k: 'g', l: '未来10年增长率(%)', d: 15 }, { k: 'tg', l: '永续增长率(%)', d: 3 }, { k: 'r', l: '折现率WACC(%)', d: 10 }, { k: 'shares', l: '总股本(亿股)', d: 12.56 }, { k: 'price', l: '当前股价', d: 1800 }] },
  { key: 'peg', name: 'PEG 估值法', desc: '彼得·林奇最爱。PEG<1表示可能被低估。',
    fields: [{ k: 'pe', l: 'PE', d: 30 }, { k: 'g', l: '盈利增速(%)', d: 25 }, { k: 'price', l: '当前股价', d: 100 }] },
  { key: 'graham', name: '格雷厄姆公式', desc: 'V = EPS × (8.5 + 2g) × 4.4 / Y',
    fields: [{ k: 'eps', l: 'EPS(元)', d: 5.2 }, { k: 'g', l: '增长率(%)', d: 12 }, { k: 'y', l: 'AAA债收益率(%)', d: 4.5 }, { k: 'price', l: '当前股价', d: 80 }] },
  { key: 'ddm', name: 'DDM 股利折现', desc: '适用于稳定分红公司。V = D1 / (r-g)',
    fields: [{ k: 'div', l: '预期每股股利(元)', d: 3.5 }, { k: 'r', l: '期望收益率(%)', d: 10 }, { k: 'g', l: '股利增长率(%)', d: 5 }, { k: 'price', l: '当前股价', d: 60 }] },
  { key: 'ytm', name: '债券YTM 估算', desc: '简化的到期收益率估算。',
    fields: [{ k: 'face', l: '面值', d: 100 }, { k: 'coupon', l: '票面利率(%)', d: 5 }, { k: 'price', l: '当前价格', d: 95 }, { k: 'years', l: '剩余年限', d: 5 }] },
];

function calc(m: Method, p: Record<string, number>) {
  if (m === 'dcf') {
    const { fcf, g, tg, r: dr, shares, price } = p;
    let total = 0, cf = fcf;
    for (let i = 1; i <= 10; i++) { cf *= (1 + g / 100); total += cf / Math.pow(1 + dr / 100, i); }
    const tv = (cf * (1 + tg / 100)) / (dr / 100 - tg / 100);
    total += tv / Math.pow(1 + dr / 100, 10);
    const iv = total / shares;
    const margin = ((iv - price) / iv * 100);
    return { value: iv, price, margin, detail: `内在价值: ¥${iv.toFixed(2)} | 安全边际: ${margin.toFixed(1)}%` };
  }
  if (m === 'peg') {
    const peg = p.pe / p.g;
    return { value: p.price / peg, price: p.price, margin: (1 - peg) * 100, detail: `PEG = ${peg.toFixed(2)} | ${peg < 1 ? '✅ 可能被低估' : peg < 2 ? '⚠️ 合理偏高' : '🔴 可能高估'}` };
  }
  if (m === 'graham') {
    const iv = p.eps * (8.5 + 2 * p.g) * 4.4 / p.y;
    const margin = ((iv - p.price) / iv * 100);
    return { value: iv, price: p.price, margin, detail: `内在价值: ¥${iv.toFixed(2)} | 安全边际: ${margin.toFixed(1)}%` };
  }
  if (m === 'ddm') {
    if (p.r / 100 <= p.g / 100) return { value: 0, price: p.price, margin: 0, detail: '⚠️ 折现率必须大于增长率' };
    const iv = p.div / (p.r / 100 - p.g / 100);
    const margin = ((iv - p.price) / iv * 100);
    return { value: iv, price: p.price, margin, detail: `内在价值: ¥${iv.toFixed(2)} | 安全边际: ${margin.toFixed(1)}%` };
  }
  // ytm simplified
  const { face, coupon, price, years } = p;
  const c = face * coupon / 100;
  const ytm = (c + (face - price) / years) / ((face + price) / 2) * 100;
  return { value: ytm, price, margin: 0, detail: `近似YTM: ${ytm.toFixed(2)}%` };
}

export default function ValuationPage() {
  const [method, setMethod] = useState<Method>('dcf');
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof calc> | null>(null);
  const info = methods.find(m => m.key === method)!;

  const handleCalc = () => {
    const np: Record<string, number> = {};
    info.fields.forEach(f => { np[f.k] = parseFloat(params[f.k]) || f.d || 0; });
    setResult(calc(method, np));
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold t-text">估值计算器</h2>
        <p className="text-sm t-text2 mt-1">"价格是你付出的，价值是你得到的。" —— 巴菲特</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {methods.map(m => (
          <button key={m.key} onClick={() => { setMethod(m.key); setResult(null); setParams({}); }}
            className={`px-3 py-2 rounded-lg text-sm ${method === m.key ? 't-accent-bg text-white' : 't-bg2 t-text2 border t-border'}`}>{m.name}</button>
        ))}
      </div>
      <div className="t-bg2 rounded-xl p-5 border t-border">
        <p className="text-sm t-text2 mb-4">{info.desc}</p>
        <div className="grid grid-cols-2 gap-3">
          {info.fields.map(f => (
            <div key={f.k}>
              <label className="text-xs font-medium t-text">{f.l}</label>
              <input type="number" value={params[f.k] ?? ''} onChange={e => setParams({ ...params, [f.k]: e.target.value })}
                placeholder={String(f.d || '')} className="w-full px-3 py-2 border t-border rounded-lg text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>
        <button onClick={handleCalc} className="mt-4 px-5 py-2 t-accent-bg text-white rounded-lg text-sm font-medium t-accent-bg-hover">计算</button>
      </div>
      {result && (
        <div className={`p-5 rounded-xl border ${result.margin > 30 ? 'bg-green-50 border-green-200' : result.margin > 10 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-sm font-medium t-text">{result.detail}</div>
          <p className="text-xs t-text2 mt-2">⚠️ 估值仅供参考，请结合定性分析综合判断。"模糊的正确好过精确的错误。" —— 巴菲特</p>
        </div>
      )}
    </div>
  );
}
