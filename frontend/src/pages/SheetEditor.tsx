import { useParams, Link } from 'react-router-dom';
import { useSheetStore } from '../store';
import { useState, useEffect, useCallback } from 'react';
import { AssetTypeIcon, StatusLabel, StatusColor, type DecisionStatus } from '../types';
import { STEPS, BASIC_FIELDS, DISCIPLINE, QUICK_QUESTIONS, FUTURES_RISK_CONFIRMS, SCORE_THRESHOLDS } from '../data/templates';

export default function SheetEditor() {
  const { id } = useParams<{ id: string }>();
  const { getSheet, updateSheet, recalcScore } = useSheetStore();
  const sheet = getSheet(id || '');
  const [step, setStep] = useState(0);

  useEffect(() => { if (sheet) setStep(sheet.currentStep); }, [sheet?.id]);

  const save = useCallback((updates: Parameters<typeof updateSheet>[1]) => {
    if (!sheet) return;
    updateSheet(sheet.id, updates);
    recalcScore(sheet.id);
  }, [sheet?.id, updateSheet, recalcScore]);

  if (!sheet) return <div className="p-8 text-center text-slate-500">决策表不存在 <Link to="/sheets" className="text-blue-600 underline ml-2">返回列表</Link></div>;

  const steps = STEPS[sheet.assetType];
  const isFutures = sheet.assetType === 'futures';
  const thresholds = SCORE_THRESHOLDS[sheet.assetType];

  const goStep = (s: number) => { setStep(s); save({ currentStep: s }); };

  // ====== Renderers for each step ======
  const renderFuturesRiskConfirm = () => (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        <strong>⚠️ 风险确认门槛</strong>
        <p className="mt-1">期货具有杠杆属性，风险远高于股票和债券。亏损可能超过全部本金。<br/>全部确认后方可继续，任一未勾选则不允许填写后续内容。</p>
      </div>
      {FUTURES_RISK_CONFIRMS.map((text, i) => (
        <label key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
          <input type="checkbox" checked={sheet.futuresRiskConfirm[i]}
            onChange={() => { const arr = [...sheet.futuresRiskConfirm]; arr[i] = !arr[i]; save({ futuresRiskConfirm: arr }); }}
            className="mt-0.5 w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500" />
          <span className="text-sm text-slate-700">{text}</span>
        </label>
      ))}
      {!sheet.futuresRiskConfirm.every(Boolean) && <div className="p-3 bg-red-100 rounded-lg text-sm text-red-700 font-medium">请全部勾选才能继续填写决策表。</div>}
    </div>
  );

  const renderBasicInfo = () => {
    const fields = BASIC_FIELDS[sheet.assetType];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
            {f.type === 'textarea' ? (
              <textarea value={sheet.basicInfo[f.key] || ''} onChange={e => save({ basicInfo: { ...sheet.basicInfo, [f.key]: e.target.value } })}
                placeholder={f.placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
            ) : f.type === 'select' ? (
              <select value={sheet.basicInfo[f.key] || ''} onChange={e => save({ basicInfo: { ...sheet.basicInfo, [f.key]: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">请选择</option>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type} value={sheet.basicInfo[f.key] || ''} onChange={e => save({ basicInfo: { ...sheet.basicInfo, [f.key]: e.target.value } })}
                placeholder={f.placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderVeto = () => (
    <div className="space-y-3">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        任一项为"否"，默认不进入下一步{isFutures ? '（期货否决不可反驳，直接终止）' : '，除非你能写出充分的反驳理由'}。
      </div>
      {sheet.vetoItems.map((item, i) => (
        <div key={item.id} className={`p-4 rounded-lg border ${item.passed === false ? 'border-red-200 bg-red-50' : item.passed === true ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-700 flex-1">{item.text}</p>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => { const items = [...sheet.vetoItems]; items[i] = { ...items[i], passed: true }; save({ vetoItems: items }); }}
                className={`px-3 py-1 rounded text-xs font-medium ${item.passed === true ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-green-100'}`}>是</button>
              <button onClick={() => { const items = [...sheet.vetoItems]; items[i] = { ...items[i], passed: false }; save({ vetoItems: items }); }}
                className={`px-3 py-1 rounded text-xs font-medium ${item.passed === false ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-100'}`}>否</button>
            </div>
          </div>
          <input value={item.note} onChange={e => { const items = [...sheet.vetoItems]; items[i] = { ...items[i], note: e.target.value }; save({ vetoItems: items }); }}
            placeholder="备注..." className="mt-2 w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          {item.passed === false && !isFutures && (
            <textarea value={item.rebuttal} onChange={e => { const items = [...sheet.vetoItems]; items[i] = { ...items[i], rebuttal: e.target.value }; save({ vetoItems: items }); }}
              placeholder="反驳理由（如果你坚持继续）..." className="mt-2 w-full px-2 py-1 border border-red-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500 bg-red-50" rows={2} />
          )}
        </div>
      ))}
      <div className={`p-3 rounded-lg text-sm font-medium ${sheet.vetoConclusion === 'passed' ? 'bg-green-100 text-green-700' : sheet.vetoConclusion === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
        结论：{sheet.vetoConclusion === 'passed' ? '✅ 全部通过' : sheet.vetoConclusion === 'failed' ? '⛔ 未通过一票否决' : '⏳ 待完成'}
      </div>
    </div>
  );

  const renderQualitative = () => (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">评分规则：1分很差，3分一般，5分优秀。满分40分。</p>
      {sheet.qualDimensions.map((dim, i) => (
        <div key={dim.id} className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div><span className="text-sm font-medium text-slate-800">{dim.name}</span><p className="text-xs text-slate-500 mt-0.5">{dim.question}</p></div>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => { const dims = [...sheet.qualDimensions]; dims[i] = { ...dims[i], score: s }; save({ qualDimensions: dims }); }}
                className={`w-8 h-8 rounded-lg text-sm font-bold ${dim.score === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-100'}`}>{s}</button>
            ))}</div>
          </div>
          <input value={dim.note} onChange={e => { const dims = [...sheet.qualDimensions]; dims[i] = { ...dims[i], note: e.target.value }; save({ qualDimensions: dims }); }}
            placeholder="备注..." className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      ))}
      <div className="p-3 bg-blue-50 rounded-lg text-sm font-semibold text-blue-700">定性小计：{sheet.qualTotal}/40</div>
    </div>
  );

  const renderQuantitative = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">填写硬指标数据，然后综合打分（满分30分）。</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-slate-50">
            <th className="text-left px-3 py-2 font-medium text-slate-600 border-b">指标</th>
            <th className="text-left px-3 py-2 font-medium text-slate-600 border-b w-36">近3年/历史</th>
            <th className="text-left px-3 py-2 font-medium text-slate-600 border-b w-36">当前情况</th>
            <th className="text-center px-3 py-2 font-medium text-slate-600 border-b w-20">评价</th>
            <th className="text-left px-3 py-2 font-medium text-slate-600 border-b w-32">备注</th>
          </tr></thead>
          <tbody>{sheet.quantMetrics.map((m, i) => (
            <tr key={m.id} className="border-b border-slate-100">
              <td className="px-3 py-2 text-slate-700 font-medium">{m.name}</td>
              <td className="px-3 py-2"><input value={m.historical} onChange={e => { const ms = [...sheet.quantMetrics]; ms[i] = { ...ms[i], historical: e.target.value }; save({ quantMetrics: ms }); }}
                className="w-full px-2 py-1 border border-slate-200 rounded text-xs" /></td>
              <td className="px-3 py-2"><input value={m.current} onChange={e => { const ms = [...sheet.quantMetrics]; ms[i] = { ...ms[i], current: e.target.value }; save({ quantMetrics: ms }); }}
                className="w-full px-2 py-1 border border-slate-200 rounded text-xs" /></td>
              <td className="px-3 py-2 text-center">
                <select value={m.rating} onChange={e => { const ms = [...sheet.quantMetrics]; ms[i] = { ...ms[i], rating: e.target.value as typeof m.rating }; save({ quantMetrics: ms }); }}
                  className={`px-2 py-1 border rounded text-xs ${m.rating === 'good' ? 'text-green-700 bg-green-50' : m.rating === 'poor' ? 'text-red-700 bg-red-50' : 'text-slate-600'}`}>
                  <option value="">—</option><option value="good">好</option><option value="medium">中</option><option value="poor">差</option>
                </select>
              </td>
              <td className="px-3 py-2"><input value={m.note} onChange={e => { const ms = [...sheet.quantMetrics]; ms[i] = { ...ms[i], note: e.target.value }; save({ quantMetrics: ms }); }}
                className="w-full px-2 py-1 border border-slate-200 rounded text-xs" /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">定量分析综合打分（满分30分）</label>
        <input type="number" min="0" max="30" value={sheet.quantScore || ''} onChange={e => save({ quantScore: Math.min(30, Math.max(0, parseInt(e.target.value) || 0)) })}
          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="text-sm text-slate-400 ml-2">/30</span>
      </div>
    </div>
  );

  const renderValuation = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{isFutures ? '计算风险收益比。风险收益比≥2:1才值得做。' : '判断当前价格是否合理，安全边际是否充足。满分20分。'}</p>
      {isFutures ? (
        <div className="space-y-3">
          {[{ k: 'entryPrice', l: '计划入场价' }, { k: 'stopLoss', l: '止损价 (必填)' }, { k: 'target', l: '第一目标位' }, { k: 'lots', l: '计划手数' }, { k: 'totalCapital', l: '总资金' }].map(f => (
            <div key={f.k} className="flex items-center gap-3">
              <label className="text-sm text-slate-700 w-32 flex-shrink-0">{f.l}</label>
              <input type="number" value={(sheet.riskReward as unknown as Record<string, number>)[f.k] || ''} onChange={e => save({ riskReward: { ...sheet.riskReward, [f.k]: parseFloat(e.target.value) || 0 } })}
                className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          {(() => {
            const rr = sheet.riskReward;
            const stopDist = Math.abs(rr.entryPrice - rr.stopLoss);
            const targetDist = Math.abs(rr.target - rr.entryPrice);
            const ratio = stopDist > 0 ? targetDist / stopDist : 0;
            const multi = parseFloat(sheet.basicInfo.multiplier) || rr.multiplier || 1;
            const lossPerLot = stopDist * multi;
            const maxLoss = lossPerLot * (rr.lots || 1);
            const maxLossPct = rr.totalCapital > 0 ? (maxLoss / rr.totalCapital * 100) : 0;
            return (
              <div className={`p-4 rounded-xl border ${ratio >= 2 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-xs text-slate-500">风险收益比</div><div className={`text-2xl font-bold ${ratio >= 2 ? 'text-green-600' : 'text-red-600'}`}>{ratio.toFixed(2)}:1</div></div>
                  <div><div className="text-xs text-slate-500">单笔最大亏损</div><div className="text-lg font-bold text-slate-800">¥{maxLoss.toFixed(0)}</div></div>
                  <div><div className="text-xs text-slate-500">占总资金</div><div className={`text-lg font-bold ${maxLossPct <= 2 ? 'text-green-600' : 'text-red-600'}`}>{maxLossPct.toFixed(1)}%</div></div>
                </div>
                {ratio < 2 && <p className="text-sm text-red-700 mt-3 font-medium">⚠️ 风险收益比 &lt; 2:1，建议放弃本次交易。</p>}
                {maxLossPct > 2 && <p className="text-sm text-red-700 mt-1 font-medium">⚠️ 单笔亏损超过总资金2%上限！</p>}
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="space-y-3">
          {[
            { k: 'method', l: '估值方式', p: 'PE / PB / PS / DCF / 股息率 / YTM ...' },
            { k: 'level', l: '当前估值水平', p: '' },
            { k: 'percentile', l: '历史估值分位', p: '低 / 中 / 高' },
            { k: 'comparable', l: '对标/可比估值', p: '' },
            { k: 'fairRange', l: '合理价值区间', p: '' },
            { k: 'relative', l: '当前价格相对合理价值', p: '低估 / 合理 / 高估' },
            { k: 'margin', l: '安全边际是否足够', p: '是 / 否' },
          ].map(f => (
            <div key={f.k} className="flex items-center gap-3">
              <label className="text-sm text-slate-700 w-40 flex-shrink-0">{f.l}</label>
              <input value={sheet.valuationFields[f.k] || ''} onChange={e => save({ valuationFields: { ...sheet.valuationFields, [f.k]: e.target.value } })}
                placeholder={f.p} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">估值判断一句话</label>
            <textarea value={sheet.valuationSummary} onChange={e => save({ valuationSummary: e.target.value })}
              placeholder="这是一家______的公司/基金/债券，目前价格______，安全边际______。"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{isFutures ? '风险收益比打分' : '估值与安全边际打分'}（满分20分）</label>
        <input type="number" min="0" max="20" value={sheet.valuationScore || ''} onChange={e => save({ valuationScore: Math.min(20, Math.max(0, parseInt(e.target.value) || 0)) })}
          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="text-sm text-slate-400 ml-2">/20</span>
      </div>
    </div>
  );

  const renderRisks = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">先写风险，防止只看利好。——芒格"反过来想"</p>
      {sheet.risks.map((risk, i) => (
        <div key={risk.id} className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-2">{risk.type}</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input value={risk.detail} onChange={e => { const rs = [...sheet.risks]; rs[i] = { ...rs[i], detail: e.target.value }; save({ risks: rs }); }}
              placeholder="具体风险" className="px-2 py-1 border border-slate-200 rounded text-xs md:col-span-1" />
            <select value={risk.probability} onChange={e => { const rs = [...sheet.risks]; rs[i] = { ...rs[i], probability: e.target.value as typeof risk.probability }; save({ risks: rs }); }}
              className="px-2 py-1 border border-slate-200 rounded text-xs"><option value="">概率</option><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select>
            <select value={risk.impact} onChange={e => { const rs = [...sheet.risks]; rs[i] = { ...rs[i], impact: e.target.value as typeof risk.impact }; save({ risks: rs }); }}
              className="px-2 py-1 border border-slate-200 rounded text-xs"><option value="">影响</option><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select>
            <input value={risk.response} onChange={e => { const rs = [...sheet.risks]; rs[i] = { ...rs[i], response: e.target.value }; save({ risks: rs }); }}
              placeholder="应对方式" className="px-2 py-1 border border-slate-200 rounded text-xs" />
          </div>
        </div>
      ))}
      <div className="p-4 bg-slate-50 rounded-lg space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">最坏情况推演</h4>
        {['如果我错了，最可能错在哪', '最坏情况下可能亏损多少', '我能不能承受'].map(q => (
          <div key={q}><label className="text-xs text-slate-500">{q}</label>
            <input value={sheet.worstCase[q] || ''} onChange={e => save({ worstCase: { ...sheet.worstCase, [q]: e.target.value } })}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs mt-0.5" /></div>
        ))}
      </div>
    </div>
  );

  const renderLogic = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">只允许写3-5条核心逻辑，越短越好。避免把愿望当逻辑。</p>
      {sheet.logicPoints.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400 w-6">{i + 1}.</span>
          <input value={p} onChange={e => { const pts = [...sheet.logicPoints]; pts[i] = e.target.value; save({ logicPoints: pts }); }}
            placeholder={`核心逻辑 ${i + 1}`} maxLength={150} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">反方观点：如果我是反对者，我会怎么反驳？</label>
        <textarea value={sheet.counterArgument} onChange={e => save({ counterArgument: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={3} />
      </div>
      {isFutures && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">我的判断最脆弱的假设是哪一个？</label>
          <input value={sheet.weakestAssumption} onChange={e => save({ weakestAssumption: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      )}
    </div>
  );

  const renderTradePlan = () => {
    const fields: { k: string; l: string; p?: string }[] =
      isFutures ? [
        { k: 'entry', l: '入场价位' }, { k: 'entrySignal', l: '入场条件（触发信号）', p: '不是"感觉差不多了"' },
        { k: 'lots', l: '开仓手数' }, { k: 'marginUsed', l: '占用保证金' }, { k: 'marginPct', l: '保证金占总资金(%)' },
        { k: 'stopLoss', l: '止损价位' }, { k: 'stopAction', l: '止损触发后动作', p: '无条件执行，不移动、不犹豫' },
        { k: 'target1', l: '第一止盈目标' }, { k: 'target2', l: '第二止盈目标' },
        { k: 'trailingStop', l: '是否移动止损（规则）' },
        { k: 'addRule', l: '加仓条件', p: '只在盈利方向，绝不在亏损方向' },
        { k: 'maxHoldTime', l: '最大持仓时间' }, { k: 'dailyStopLimit', l: '日内止损上限' },
      ] : sheet.assetType === 'bond' ? [
        { k: 'buyPrice', l: '计划买入价格/收益率区间' }, { k: 'amount', l: '买入数量/金额' },
        { k: 'positionPct', l: '在总组合中的仓位占比' }, { k: 'issuerLimit', l: '单一发行人持仓上限' },
        { k: 'holdStrategy', l: '持有策略', p: '持有到期 / 交易型 / 阶梯配置' },
        { k: 'addCond', l: '加仓条件' }, { k: 'reduceCond', l: '减仓条件' }, { k: 'stopCond', l: '止损条件' },
        { k: 'holdPeriod', l: '预计持有期限' }, { k: 'reviewFreq', l: '触发复盘频率' },
      ] : sheet.assetType === 'fund' ? [
        { k: 'buyMethod', l: '买入方式', p: '一次性 / 分批 / 定投' }, { k: 'firstAmount', l: '首笔投入金额/比例' },
        { k: 'dipPlan', l: '定投计划（频率/金额/时长）' }, { k: 'positionMax', l: '仓位上限' },
        { k: 'addCond', l: '加仓条件', p: '底层估值更低/市场恐慌错杀' },
        { k: 'reduceCond', l: '减仓条件', p: '经理更换/风格漂移/估值过高' },
        { k: 'redeemCond', l: '赎回条件' }, { k: 'holdPeriod', l: '预计持有周期' }, { k: 'reviewFreq', l: '触发复盘频率' },
      ] : [
        { k: 'buyRange', l: '计划买入区间' }, { k: 'positionMax', l: '理想仓位上限' }, { k: 'firstPosition', l: '首笔仓位' },
        { k: 'addCond', l: '加仓条件', p: '基本面更强/估值更便宜/市场错杀，不是"跌了所以补"' },
        { k: 'reduceCond', l: '减仓条件', p: '逻辑破坏/明显高估/仓位过高/更优机会' },
        { k: 'stopCond', l: '止错条件', p: '逻辑证伪，不是单纯股价波动' },
        { k: 'holdPeriod', l: '预计持有周期' }, { k: 'reviewFreq', l: '触发复盘频率', p: '季报/年报/大事件后' },
      ];
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500 font-medium">没有计划，不许下单。</p>
        {fields.map(f => (
          <div key={f.k} className="flex items-center gap-3">
            <label className="text-sm text-slate-700 w-44 flex-shrink-0">{f.l}</label>
            <input value={sheet.tradePlan[f.k] || ''} onChange={e => save({ tradePlan: { ...sheet.tradePlan, [f.k]: e.target.value } })}
              placeholder={f.p} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>
    );
  };

  const renderScoring = () => {
    const total = sheet.qualTotal + sheet.quantScore + sheet.valuationScore + sheet.riskPlanScore;
    const scoreColor = total >= thresholds.high ? 'text-green-600' : total >= thresholds.mid ? 'text-blue-600' : 'text-red-500';
    const level = total >= thresholds.high ? 0 : total >= thresholds.mid ? 1 : total >= thresholds.low ? 2 : 3;
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="text-left px-4 py-2">模块</th><th className="text-right px-4 py-2">得分</th><th className="text-left px-4 py-2">满分</th></tr></thead>
            <tbody>
              <tr className="border-t border-slate-100"><td className="px-4 py-2">定性分析</td><td className="px-4 py-2 text-right font-bold">{sheet.qualTotal}</td><td className="px-4 py-2 text-slate-400">/40</td></tr>
              <tr className="border-t border-slate-100"><td className="px-4 py-2">定量分析</td><td className="px-4 py-2 text-right font-bold">{sheet.quantScore}</td><td className="px-4 py-2 text-slate-400">/30</td></tr>
              <tr className="border-t border-slate-100"><td className="px-4 py-2">{isFutures ? '风险收益比' : '估值与安全边际'}</td><td className="px-4 py-2 text-right font-bold">{sheet.valuationScore}</td><td className="px-4 py-2 text-slate-400">/20</td></tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">风险控制与计划</td>
                <td className="px-4 py-2 text-right"><input type="number" min="0" max="10" value={sheet.riskPlanScore || ''} onChange={e => save({ riskPlanScore: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-sm text-right font-bold" /></td>
                <td className="px-4 py-2 text-slate-400">/10</td>
              </tr>
              <tr className="border-t-2 border-slate-300 bg-slate-50"><td className="px-4 py-3 font-bold">总分</td><td className={`px-4 py-3 text-right text-2xl font-bold ${scoreColor}`}>{total}</td><td className="px-4 py-3 text-slate-400 font-bold">/100</td></tr>
            </tbody>
          </table>
        </div>
        {sheet.vetoConclusion === 'failed' && <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700 font-medium">⛔ 注意：一票否决项未全部通过！</div>}
        <div className={`p-4 rounded-xl ${total >= thresholds.high ? 'bg-green-50 border border-green-200' : total >= thresholds.mid ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-sm font-semibold">{thresholds.labels[level]}</div>
        </div>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-slate-700">是否投资</label>
            <div className="flex gap-2 mt-1">{['invest', 'watch', 'abandon'].map(d => (
              <button key={d} onClick={() => save({ decision: d as typeof sheet.decision })}
                className={`px-4 py-2 rounded-lg text-sm ${sheet.decision === d ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {d === 'invest' ? '✅ 投资' : d === 'watch' ? '👀 继续观察' : '❌ 放弃'}
              </button>
            ))}</div></div>
          <div><label className="text-sm font-medium text-slate-700">当前动作</label>
            <input value={sheet.decisionAction} onChange={e => save({ decisionAction: e.target.value })} placeholder="买入 / 定投 / 等待 / 放弃" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mt-1" /></div>
          <div><label className="text-sm font-medium text-slate-700">核心原因（一句话）</label>
            <input value={sheet.decisionReason} onChange={e => save({ decisionReason: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mt-1" /></div>
          <div className="flex gap-2">
            {(['completed', 'holding', 'abandoned'] as DecisionStatus[]).map(s => (
              <button key={s} onClick={() => save({ status: s })}
                className={`px-3 py-1.5 rounded-lg text-xs ${sheet.status === s ? StatusColor[s] + ' font-bold ring-2 ring-offset-1 ring-blue-400' : 'bg-slate-100 text-slate-600'}`}>
                标记为: {StatusLabel[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTracking = () => (
    <div className="space-y-4">
      <button onClick={() => save({ trackingRecords: [...sheet.trackingRecords, { id: `tr_${Date.now()}`, date: new Date().toISOString().split('T')[0], event: '', affectsLogic: null, action: '', note: '' }] })}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">+ 添加跟踪记录</button>
      {sheet.trackingRecords.length === 0 && <p className="text-sm text-slate-400">暂无跟踪记录</p>}
      {sheet.trackingRecords.map((rec, i) => (
        <div key={rec.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
          <div className="flex gap-2">
            <input type="date" value={rec.date} onChange={e => { const rs = [...sheet.trackingRecords]; rs[i] = { ...rs[i], date: e.target.value }; save({ trackingRecords: rs }); }}
              className="px-2 py-1 border border-slate-200 rounded text-xs" />
            <input value={rec.event} onChange={e => { const rs = [...sheet.trackingRecords]; rs[i] = { ...rs[i], event: e.target.value }; save({ trackingRecords: rs }); }}
              placeholder="发生了什么" className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs" />
            <select value={rec.affectsLogic === null ? '' : rec.affectsLogic ? 'yes' : 'no'}
              onChange={e => { const rs = [...sheet.trackingRecords]; rs[i] = { ...rs[i], affectsLogic: e.target.value === 'yes' }; save({ trackingRecords: rs }); }}
              className="px-2 py-1 border border-slate-200 rounded text-xs"><option value="">影响逻辑?</option><option value="yes">是</option><option value="no">否</option></select>
            <input value={rec.action} onChange={e => { const rs = [...sheet.trackingRecords]; rs[i] = { ...rs[i], action: e.target.value }; save({ trackingRecords: rs }); }}
              placeholder="我的动作" className="w-28 px-2 py-1 border border-slate-200 rounded text-xs" />
            <button onClick={() => save({ trackingRecords: sheet.trackingRecords.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 text-xs">✕</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDiscipline = () => (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white">
        <h3 className="font-bold mb-3">给自己的纪律提醒</h3>
        <ul className="space-y-2">{DISCIPLINE[sheet.assetType].map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-200"><span className="text-amber-400 flex-shrink-0">•</span>{d}</li>
        ))}</ul>
      </div>
    </div>
  );

  const renderQuick = () => {
    const questions = QUICK_QUESTIONS[sheet.assetType];
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">极简版快速初筛——用最少的问题做最核心的判断。</p>
        {questions.map((q, i) => (
          <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
            <label className="text-sm font-medium text-slate-700">{q}</label>
            <input value={sheet.valuationFields[`quick_${i}`] || ''} onChange={e => save({ valuationFields: { ...sheet.valuationFields, [`quick_${i}`]: e.target.value } })}
              className="w-full px-2 py-1 border border-slate-200 rounded text-sm mt-1" />
          </div>
        ))}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <label className="text-sm font-medium text-slate-700">最终动作</label>
          <div className="flex gap-2 mt-1">{(isFutures ? ['开仓', '等', '放弃'] : sheet.assetType === 'fund' ? ['买', '定投', '等', '放弃'] : ['买', '等', '放弃']).map(a => (
            <button key={a} onClick={() => save({ valuationFields: { ...sheet.valuationFields, quick_action: a } })}
              className={`px-4 py-2 rounded-lg text-sm ${sheet.valuationFields.quick_action === a ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{a}</button>
          ))}</div>
        </div>
      </div>
    );
  };

  // Map step index to renderer
  const getRenderer = (stepIdx: number) => {
    if (isFutures) {
      const map = [renderFuturesRiskConfirm, renderBasicInfo, renderVeto, renderQualitative, renderQuantitative, renderValuation, renderRisks, renderLogic, renderTradePlan, renderScoring, renderTracking, renderDiscipline];
      return map[stepIdx] || renderDiscipline;
    }
    const map = [renderBasicInfo, renderVeto, renderQualitative, renderQuantitative, renderValuation, renderRisks, renderLogic, renderTradePlan, renderScoring, renderTracking, renderDiscipline, renderQuick];
    return map[stepIdx] || renderBasicInfo;
  };

  const name = sheet.basicInfo.companyName || sheet.basicInfo.fundName || sheet.basicInfo.bondName || sheet.basicInfo.productName || '未命名';

  return (
    <div className="min-h-screen t-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-20 t-nav-bg shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <Link to="/sheets" className="text-xs t-nav-text opacity-70 hover:opacity-100">← 返回</Link>
              <div className="w-px h-5 bg-white/20" />
              <span className="text-base">{AssetTypeIcon[sheet.assetType]}</span>
              <span className="text-sm font-semibold t-nav-text truncate max-w-48">{name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${StatusColor[sheet.status]}`}>{StatusLabel[sheet.status]}</span>
            </div>
            {sheet.totalScore > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs t-nav-text opacity-60">总分</span>
                <span className={`text-lg font-bold ${sheet.totalScore >= thresholds.high ? 'text-green-400' : sheet.totalScore >= thresholds.mid ? 'text-blue-400' : 'text-red-400'}`}>
                  {sheet.totalScore}<span className="text-xs opacity-60">/100</span>
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Step tabs - horizontally scrollable */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto no-scrollbar">
              {steps.map((s, i) => {
                const isActive = i === step;
                const isFuturesLocked = isFutures && i > 0 && !sheet.futuresRiskConfirm.every(Boolean);
                return (
                  <button key={i} onClick={() => !isFuturesLocked && goStep(i)} disabled={isFuturesLocked}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-all ${
                      isActive ? 'border-current t-nav-text font-semibold opacity-100' :
                      isFuturesLocked ? 'border-transparent t-nav-text opacity-20 cursor-not-allowed' :
                      'border-transparent t-nav-text opacity-50 hover:opacity-80'
                    }`}
                    style={isActive ? { borderColor: 'var(--t-nav-active)' } : {}}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                      isActive ? 't-nav-active text-white' : 'bg-white/10'
                    }`}>
                      {isFutures && i === 0 ? '⚠' : isFutures ? i : i + 1}
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold t-text">
            {isFutures && step === 0 ? '⚠️ ' : ''}{steps[step]}
          </h2>
          <span className="text-xs t-muted">板块 {step + 1}/{steps.length}</span>
        </div>
        {getRenderer(step)()}
        <div className="flex justify-between mt-8 pt-4" style={{ borderTop: '1px solid var(--t-border)' }}>
          <button onClick={() => goStep(Math.max(0, step - 1))} disabled={step === 0}
            className="px-4 py-2 text-sm t-text2 rounded-lg disabled:opacity-30 hover:t-bg3">← 上一步</button>
          {step < steps.length - 1 ? (
            <button onClick={() => goStep(step + 1)}
              disabled={isFutures && step === 0 && !sheet.futuresRiskConfirm.every(Boolean)}
              className="px-4 py-2 t-accent-bg text-white rounded-lg text-sm font-medium t-accent-bg-hover disabled:opacity-30">
              下一步 →
            </button>
          ) : (
            <Link to="/sheets" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">完成 ✓</Link>
          )}
        </div>
      </div>
    </div>
  );
}
