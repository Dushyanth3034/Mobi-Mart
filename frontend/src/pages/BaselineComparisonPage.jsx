import React, { useState, useEffect } from 'react';
import { baselineApi } from '../services/api';
import { formatRupee, formatPercent, formatNumber } from '../utils/currency';
import {
  Scale,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  Boxes
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export function BaselineComparisonPage() {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const res = await baselineApi.getComparison();
      setComparison(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load baseline comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setRecalculating(true);
      const res = await baselineApi.runSimulation();
      setComparison((prev) => ({ ...prev, metrics: res.data.data }));
    } catch (err) {
      alert('Failed to run baseline simulation: ' + err.message);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EF233C] border-t-transparent" />
          <p className="text-sm text-[#A1A1AA]">Evaluating Optimization vs Naive Baseline...</p>
        </div>
      </div>
    );
  }

  const metrics = comparison?.metrics || {};
  const sampleResults = comparison?.sampleResults || [];

  const chartData = [
    {
      name: 'Stockout Rate (%)',
      ourSystem: metrics.our_stockout_rate,
      baseline: metrics.baseline_stockout_rate,
      unit: '%'
    },
    {
      name: 'Weeks of Cover',
      ourSystem: metrics.our_weeks_of_cover,
      baseline: metrics.baseline_weeks_of_cover,
      unit: ' wks'
    },
    {
      name: 'Dead Stock (%)',
      ourSystem: metrics.our_dead_stock_percentage,
      baseline: metrics.baseline_dead_stock_percentage,
      unit: '%'
    },
    {
      name: 'Capital Turns',
      ourSystem: metrics.our_capital_turns,
      baseline: metrics.baseline_capital_turns,
      unit: 'x'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Our Algorithm vs Naive Baseline</h1>
            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/30">
              BENCHMARK EVALUATION
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Required Assessment Benchmark: Comparing MobiMart Multi-Factor Engine against the standard Naive Proportional Baseline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSimulation}
            disabled={recalculating}
            className="flex items-center space-x-2 rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-slate-200 border border-[#2E2E2E] hover:bg-[#242424] hover:text-white transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#3B82F6] ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Running Simulation...' : 'Re-run Benchmark Simulation'}</span>
          </button>
        </div>
      </div>

      {/* 5 Core Assessment Benchmark KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* 1. Stockout Rate */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">1. Stockout Rate</p>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-emerald-400">{metrics.our_stockout_rate}%</span>
              <p className="text-[10px] text-[#71717A]">MobiMart Engine</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#EF233C]">{metrics.baseline_stockout_rate}%</span>
              <p className="text-[10px] text-[#71717A]">Naive Baseline</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
            ✓ -{formatPercent(metrics.baseline_stockout_rate - metrics.our_stockout_rate)} fewer stockouts
          </div>
        </div>

        {/* 2. Weeks of Cover */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">2. Weeks of Cover</p>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-[#3B82F6]">{metrics.our_weeks_of_cover}</span>
              <p className="text-[10px] text-[#71717A]">Lean & Agile</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-amber-400">{metrics.baseline_weeks_of_cover}</span>
              <p className="text-[10px] text-[#71717A]">Bloated Cover</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-medium text-[#3B82F6] bg-[#3B82F6]/10 rounded-lg p-2 border border-[#3B82F6]/20">
            ✓ Optimal 2.5–3.2 week target range
          </div>
        </div>

        {/* 3. Dead Stock % */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">3. Dead Stock %</p>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-emerald-400">{metrics.our_dead_stock_percentage}%</span>
              <p className="text-[10px] text-[#71717A]">Controlled EOL</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#EF233C]">{metrics.baseline_dead_stock_percentage}%</span>
              <p className="text-[10px] text-[#71717A]">Trapped Capital</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
            ✓ Avoids rural flagship traps
          </div>
        </div>

        {/* 4. Markdown Loss */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">4. Markdown Losses</p>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-emerald-400">{formatRupee(metrics.our_markdown_loss)}</span>
              <p className="text-[10px] text-[#71717A]">MobiMart Losses</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#EF233C]">{formatRupee(metrics.baseline_markdown_loss)}</span>
              <p className="text-[10px] text-[#71717A]">Baseline Losses</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
            ✓ Protected via smart transfers
          </div>
        </div>

        {/* 5. Capital Turns */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">5. Capital Turns</p>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-indigo-400">{metrics.our_capital_turns}x</span>
              <p className="text-[10px] text-[#71717A]">Annual Turns</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-400">{metrics.baseline_capital_turns}x</span>
              <p className="text-[10px] text-[#71717A]">Baseline Turns</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 rounded-lg p-2 border border-indigo-500/20">
            ✓ Faster inventory circulation
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Side-by-Side KPI Comparison</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#71717A" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717A" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                />
                <Legend />
                <Bar dataKey="ourSystem" name="MobiMart Multi-Factor Engine" fill="#EF233C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="baseline" name="Naive Proportional Baseline" fill="#71717A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Honest Algorithm Evaluation & Trade-offs */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Honest Algorithmic Evaluation & Trade-Offs</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Why our algorithm outperforms the naive baseline, and where each approach has trade-offs:
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-slate-200">
                <strong className="text-emerald-400 flex items-center space-x-1 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Where MobiMart Optimization Wins:</span>
                </strong>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li><strong>Protects Gross Margins:</strong> Factors store catchment affluence, preventing ₹1.5L flagships from sitting unsold in Tier-3 towns.</li>
                  <li><strong>Dynamic Cannibalisation:</strong> Reduces orders on predecessor phones as soon as successors launch.</li>
                  <li><strong>EOL Risk Liquidations:</strong> Triggers inter-store transfers before forced 30% markdowns occur.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-[#EF233C]/10 p-3 border border-[#EF233C]/20 text-slate-200">
                <strong className="text-[#EF233C] flex items-center space-x-1 mb-1">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Where Naive Baseline Fails:</span>
                </strong>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>Allocates blindly based on past volume: Stores selling high keypad units receive high flagship stock.</li>
                  <li>Ignores product lifecycles, leading to heavy dead-stock accumulation on aging phones.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2E2E2E] text-[11px] text-[#71717A] font-mono">
            {metrics.notes}
          </div>
        </div>
      </div>

      {/* Sample Store-Level Baseline Allocations vs Trapped Dead Stock */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#2E2E2E] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Sample Baseline Allocation Trap Records</h3>
            <p className="text-xs text-[#A1A1AA]">Stores holding dead stock under the naive proportional allocation rule</p>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Store Location</th>
                <th className="py-2.5 px-4">Phone Model</th>
                <th className="py-2.5 px-4">Volume Share</th>
                <th className="py-2.5 px-4">Naive Qty</th>
                <th className="py-2.5 px-4">Dead Stock Created</th>
                <th className="py-2.5 px-4">Trapped Value</th>
                <th className="py-2.5 px-4">Markdown Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {sampleResults.slice(0, 10).map((res) => (
                <tr key={res.id} className="hover:bg-[#242424]/60">
                  <td className="py-2.5 px-4 text-white font-medium">{res.store?.name} ({res.store?.city})</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-200">{res.product?.model_name}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-300">{res.store_past_sales_proportion}%</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">{res.allocated_units} units</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#EF233C]">{res.dead_stock_units} units</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#EF233C]">{formatRupee(res.dead_stock_value)}</td>
                  <td className="py-2.5 px-4 font-mono text-amber-400">-{formatRupee(res.markdown_loss)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
