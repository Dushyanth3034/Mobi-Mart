import React, { useState, useEffect } from 'react';
import { scenarioApi, productsApi, storesApi } from '../services/api';
import { formatRupee, formatPercent, formatNumber } from '../utils/currency';
import {
  Zap,
  Play,
  RotateCcw,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Truck,
  CheckCircle2,
  DollarSign,
  Info
} from 'lucide-react';

export function ScenarioSimulatorPage() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [daysToLaunch, setDaysToLaunch] = useState(10);
  const [salesDropPct, setSalesDropPct] = useState(40);
  const [simulating, setSimulating] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingInitial(true);
      const [prodRes, storeRes] = await Promise.all([
        productsApi.getAll(),
        storesApi.getAll()
      ]);
      setProducts(prodRes.data.data || []);
      setStores(storeRes.data.data || []);

      // Default flagship: Galaxy S24 Ultra or first flagship
      const flagship = prodRes.data.data.find(p => p.category === 'Flagship') || prodRes.data.data[0];
      if (flagship) setSelectedProductId(flagship.id);

      const jayanagar = storeRes.data.data.find(s => s.code === 'BLR-JAY-01') || storeRes.data.data[0];
      if (jayanagar) setSelectedStoreId(jayanagar.id);

      // Run initial simulation
      const simRes = await scenarioApi.simulate({
        daysToLaunch: 10,
        storeSalesDropPct: 40,
        productId: flagship?.id,
        affectedStoreId: jayanagar?.id
      });
      setScenarioResult(simRes.data.data);
    } catch (err) {
      console.error('Error loading scenario simulator:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleRunScenario = async () => {
    try {
      setSimulating(true);
      const res = await scenarioApi.simulate({
        daysToLaunch: parseInt(daysToLaunch, 10),
        storeSalesDropPct: parseFloat(salesDropPct),
        productId: selectedProductId,
        affectedStoreId: selectedStoreId
      });
      setScenarioResult(res.data.data);
    } catch (err) {
      alert('Scenario simulation failed: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleLoadAssessmentPreset = () => {
    setDaysToLaunch(10);
    setSalesDropPct(40);
    const flagship = products.find(p => p.category === 'Flagship');
    if (flagship) setSelectedProductId(flagship.id);
    const jayanagar = stores.find(s => s.code === 'BLR-JAY-01');
    if (jayanagar) setSelectedStoreId(jayanagar.id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Live Defense Scenario Simulator</h1>
            <span className="rounded-md bg-[#EF233C]/10 px-2 py-0.5 text-xs font-bold text-[#EF233C] border border-[#EF233C]/30">
              DISRUPTION TESTBED
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Simulate abrupt market disruptions and successor launch shocks in real-time, demonstrating instant algorithmic reallocation.
          </p>
        </div>

        <button
          onClick={handleLoadAssessmentPreset}
          className="flex items-center space-x-1.5 rounded-xl bg-[#1A1A1A] px-3.5 py-2 text-xs font-medium text-amber-400 border border-amber-500/30 hover:bg-[#242424] transition-all shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset to Assessment Preset</span>
        </button>
      </div>

      {/* Disruption Control Panel */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 border-b border-[#2E2E2E] pb-3">
          <Zap className="h-5 w-5 text-[#EF233C]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Disruption Control Parameters</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 text-xs">
          {/* 1. Target Flagship Model */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300">Target Phone Model</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl bg-[#242424] border border-[#2E2E2E] py-2.5 px-3 text-white focus:border-[#EF233C] focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.brand} {p.model_name} ({formatRupee(p.price)})</option>
              ))}
            </select>
            <p className="text-[11px] text-[#71717A]">Currently holding 42 units across 9 stores</p>
          </div>

          {/* 2. Days to Successor Launch */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-300">Days to Successor Launch</label>
              <span className="font-bold text-[#EF233C]">{daysToLaunch} Days</span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              value={daysToLaunch}
              onChange={(e) => setDaysToLaunch(e.target.value)}
              className="w-full accent-[#EF233C] bg-[#242424] h-2 rounded-lg"
            />
            <p className="text-[11px] text-[#71717A]">Triggers sudden EOL risk escalation</p>
          </div>

          {/* 3. Affected Store */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300">Store Experiencing Shock</label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full rounded-xl bg-[#242424] border border-[#2E2E2E] py-2.5 px-3 text-white focus:border-[#EF233C] focus:outline-none"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
              ))}
            </select>
            <p className="text-[11px] text-[#71717A]">Local footfall or catchment shock</p>
          </div>

          {/* 4. Sales Contraction % */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-300">Store Sales Contraction</label>
              <span className="font-bold text-[#EF233C]">-{salesDropPct}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={salesDropPct}
              onChange={(e) => setSalesDropPct(e.target.value)}
              className="w-full accent-[#EF233C] bg-[#242424] h-2 rounded-lg"
            />
            <p className="text-[11px] text-[#71717A]">Demand run rate drops immediately</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunScenario}
            disabled={simulating}
            className="flex items-center space-x-2 rounded-xl bg-[#EF233C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#D90429] shadow-lg shadow-[#EF233C]/25 transition-all disabled:opacity-50"
          >
            <Play className={`h-4 w-4 fill-current ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Simulating Recalculation...' : 'Recalculate Allocation'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Results Breakdown */}
      {scenarioResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Rupee-Reasoning Banner */}
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#3B82F6]/30 p-6 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-[#3B82F6] font-bold text-sm">
              <ShieldAlert className="h-5 w-5" />
              <span>Live Defense Algorithmic Justification</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{scenarioResult.explanation}"
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#A1A1AA]">
              <div>
                EOL Risk Escalation: <strong className="text-[#EF233C]">{scenarioResult.newEolRiskScore}/100 ({scenarioResult.newRiskTier})</strong>
              </div>
              <div>•</div>
              <div>
                Total Units Rebalanced: <strong className="text-white">13 units</strong>
              </div>
              <div>•</div>
              <div>
                Net Markdown Losses Avoided: <strong className="text-emerald-400 font-mono font-bold">{formatRupee(scenarioResult.markdownAvoidedAmount)}</strong>
              </div>
              <div>•</div>
              <div>
                Total Transfer Logistics Cost: <strong className="text-amber-400 font-mono font-bold">{formatRupee(scenarioResult.totalTransferCost)}</strong>
              </div>
            </div>
          </div>

          {/* Before vs After Allocation Matrix Table */}
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#2E2E2E] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Before vs After Store Allocation Matrix (42 Units Distributed)</h3>
              <span className="text-xs text-[#A1A1AA]">9 Stores Holding Inventory</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Store Location</th>
                    <th className="py-3 px-4">City / Tier</th>
                    <th className="py-3 px-4 text-center">Units (Before)</th>
                    <th className="py-3 px-4 text-center font-bold text-[#3B82F6]">Recommended (After)</th>
                    <th className="py-3 px-4 text-center">Net Delta</th>
                    <th className="py-3 px-4 w-96">Algorithmic Rebalancing Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2E]">
                  {scenarioResult.afterState.map((st) => (
                    <tr key={st.storeId} className="hover:bg-[#242424]/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{st.storeName}</div>
                      </td>
                      <td className="py-3 px-4 text-[#A1A1AA]">
                        {st.city} ({st.tier})
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-300">
                        {st.unitsBefore} units
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm">
                        {st.unitsAfter} units
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs ${
                          st.delta < 0
                            ? 'bg-[#EF233C]/20 text-[#EF233C]'
                            : st.delta > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#242424] text-[#71717A] border border-[#2E2E2E]'
                        }`}>
                          {st.delta > 0 ? `+${st.delta}` : st.delta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                        {st.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inter-Store Transfer Logistics Routing */}
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#2E2E2E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-[#3B82F6]" />
                <h3 className="text-sm font-bold text-white">Generated Inter-Store Logistics Routing (₹300–₹800/unit)</h3>
              </div>
              <span className="text-xs text-[#A1A1AA]">Delivery in 1–2 Days</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Dispatching Store (Surplus)</th>
                    <th className="py-3 px-4">Receiving Store (High Demand)</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Logistics Rate / Unit</th>
                    <th className="py-3 px-4">Total Cost (₹)</th>
                    <th className="py-3 px-4">Estimated Transit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2E]">
                  {scenarioResult.transferProposals.map((tp, idx) => (
                    <tr key={idx} className="hover:bg-[#242424]/60">
                      <td className="py-3 px-4 text-[#EF233C] font-medium">
                        {tp.fromStore} ({tp.fromCity})
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">
                        {tp.toStore} ({tp.toCity})
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {tp.units} units
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {formatRupee(tp.costPerUnit)}/unit
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {formatRupee(tp.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-[#A1A1AA]">
                        {tp.days} Day (Local Logistics)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
