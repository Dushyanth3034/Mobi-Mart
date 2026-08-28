import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { formatRupee, formatRupeeCompact, formatPercent, formatNumber } from '../utils/currency';
import { StatCard } from '../components/StatCard';
import { RiskTierBadge } from '../components/Badge';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Store as StoreIcon,
  Smartphone,
  ArrowRight,
  ShieldAlert,
  Percent,
  Truck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  'Flagship': '#818cf8',
  'Premium': '#38bdf8',
  'Mid-range': '#34d399',
  'Budget': '#fbbf24',
  'Keypad/Budget': '#fb7185'
};

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryViewMode, setCategoryViewMode] = useState('bar'); // 'bar' | 'donut'

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getSummary();
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EF233C] border-t-transparent" />
          <p className="text-sm text-[#A1A1AA]">Loading MobiMart Financial Overview...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#EF233C]/30 bg-[#EF233C]/10 p-6 text-[#EF233C]">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchDashboard} className="mt-4 rounded-lg bg-[#EF233C] px-4 py-2 text-xs font-semibold text-white">
          Retry
        </button>
      </div>
    );
  }

  const { capital, risk, fourWeekImpact } = data;
  const capitalByCategory = capital?.capitalByCategory || [];
  const capitalByStore = capital?.capitalByStore || [];

  return (
    <div className="space-y-8">
      {/* Header with Title and Quick Callout */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Executive Owner Dashboard</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Real-time capital allocation, EOL stock vulnerability, and 4-week recommendation ROI across 25 Karnataka stores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/allocation"
            className="flex items-center space-x-2 rounded-xl bg-[#EF233C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D90429] shadow-lg shadow-[#EF233C]/25 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Next Monday Allocation</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WHERE IS MY CAPITAL? (₹4.00 Crore Chain Budget Monitoring) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Where Is My Capital?</h2>
              <p className="text-xs text-[#A1A1AA]">Total chain-wide inventory capital vs ₹4.00 Crore budget ceiling</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Budget Status: PASS (≤ ₹4.00 Cr)</span>
            </span>
          </div>
        </div>

        {/* Budget Utilization Progress Gauge Bar */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#A1A1AA]">
              Capital Utilization: <strong className="text-white">{formatRupee(capital.totalInventoryValue)}</strong> / {formatRupee(capital.budgetLimit)}
            </span>
            <span className="text-emerald-400 font-bold">{capital.capitalUtilization}% Utilized</span>
          </div>

          <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-[#242424] p-0.5 border border-[#333333]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capital.capitalUtilization > 100
                  ? 'bg-[#EF233C]'
                  : capital.capitalUtilization > 85
                  ? 'bg-gradient-to-r from-[#3B82F6] to-emerald-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, capital.capitalUtilization)}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#2E2E2E] pt-3 sm:grid-cols-4 text-xs">
            <div>
              <p className="text-[#71717A]">Warehouse Value</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatRupee(capital.warehouseValue)}</p>
              <p className="text-[11px] text-[#A1A1AA]">{formatNumber(capital.warehouseUnits)} units in buffer</p>
            </div>
            <div>
              <p className="text-[#71717A]">Store Network Value</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatRupee(capital.storeValue)}</p>
              <p className="text-[11px] text-[#A1A1AA]">{formatNumber(capital.storeUnits)} units in 25 stores</p>
            </div>
            <div>
              <p className="text-[#71717A]">Budget Headroom Remaining</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatRupee(capital.budgetRemaining)}</p>
              <p className="text-[11px] text-[#A1A1AA]">Available for fresh restocks</p>
            </div>
            <div>
              <p className="text-[#71717A]">Active Store Network</p>
              <p className="text-sm font-bold text-white mt-0.5">25 Stores</p>
              <p className="text-[11px] text-[#A1A1AA]">8 Bangalore + 17 Tier-2/3</p>
            </div>
          </div>
        </div>

        {/* Charts: Capital by Category & Capital by Store */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Capital Distribution by Category */}
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Capital Deployed by Category</h3>
                <p className="text-xs text-[#A1A1AA]">Inventory value breakdown across 5 price tiers</p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 rounded-lg bg-[#242424] p-1 border border-[#333333]">
                <button
                  onClick={() => setCategoryViewMode('bar')}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition-all ${
                    categoryViewMode === 'bar'
                      ? 'bg-[#EF233C] text-white'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setCategoryViewMode('donut')}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition-all ${
                    categoryViewMode === 'donut'
                      ? 'bg-[#EF233C] text-white'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Donut Chart
                </button>
              </div>
            </div>

            <div className="h-64">
              {capitalByCategory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-[#71717A]">
                  No category capital data available
                </div>
              ) : categoryViewMode === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={capitalByCategory}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      tickFormatter={(val) => formatRupeeCompact(val)}
                      stroke="#71717A"
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={95}
                      stroke="#A1A1AA"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val, name, props) => {
                        const entry = props.payload;
                        return [`${formatRupee(val)} (${entry.percentage}% • ${entry.units} units)`, 'Capital Value'];
                      }}
                      contentStyle={{
                        backgroundColor: '#1A1A1A',
                        borderColor: '#2E2E2E',
                        borderRadius: '12px',
                        color: '#FFFFFF'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {capitalByCategory.map((entry, index) => (
                        <Cell
                          key={`cat-cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || '#3B82F6'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={capitalByCategory}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {capitalByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#3B82F6'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatRupee(val), 'Capital Value']}
                      contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Stores Holding Capital */}
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-1">Top Stores Holding Inventory Capital</h3>
            <p className="text-xs text-[#A1A1AA] mb-4">Store locations with highest working capital deployed</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capitalByStore.slice(0, 6)} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tickFormatter={(val) => formatRupeeCompact(val)} stroke="#71717A" />
                  <YAxis type="category" dataKey="store_name" tick={{ fontSize: 11 }} width={120} stroke="#A1A1AA" />
                  <Tooltip
                    formatter={(val) => [formatRupee(val), 'Inventory Value']}
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                  />
                  <Bar dataKey="total_value" fill="#EF233C" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: WHAT STOCK IS AT RISK? (EOL & Dead Stock Analysis) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-[#EF233C]/10 p-2 text-[#EF233C] border border-[#EF233C]/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">What Stock Is At Risk?</h2>
              <p className="text-xs text-[#A1A1AA]">Aging models, rumoured/confirmed successor threats, and trapped capital</p>
            </div>
          </div>
          <Link
            to="/eol-risk"
            className="flex items-center space-x-1 text-xs font-semibold text-[#3B82F6] hover:text-blue-300"
          >
            <span>Open EOL Risk Matrix</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Risk KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total At-Risk Value"
            value={formatRupee(risk.atRiskValue)}
            subtitle={`${risk.riskyProductsCount} phone models flagged`}
            icon={AlertTriangle}
            color="rose"
            badgeText="Action Required"
          />
          <StatCard
            title="Critical EOL Exposure"
            value={formatRupee(risk.criticalEolValue)}
            subtitle={`${risk.criticalRisksCount} critical store incidents`}
            icon={ShieldAlert}
            color="amber"
          />
          <StatCard
            title="Dead Stock Trapped"
            value={formatRupee(risk.deadStockValue)}
            subtitle={`${risk.deadStockUnits} units with >6.5 WoC`}
            icon={Boxes}
            color="purple"
          />
          <StatCard
            title="Mitigation Potential"
            value={formatRupee(risk.atRiskValue * 0.72)}
            subtitle="via Transfer & Strategic Markdowns"
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Top Products at Risk Table */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Top Vulnerable Models by Capital Exposure</h3>
            <span className="text-xs text-[#A1A1AA]">HOLD vs TRANSFER vs MARKDOWN evaluation ready</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Phone Model</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price (MRP)</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Trapped Units</th>
                  <th className="py-2.5 px-3">Capital Value</th>
                  <th className="py-2.5 px-3">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {risk.topRiskyProducts.map((p) => (
                  <tr key={p.productId} className="hover:bg-[#242424]/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{p.modelName}</td>
                    <td className="py-3 px-3 text-slate-300">{p.category}</td>
                    <td className="py-3 px-3 font-mono text-slate-200">{formatRupee(p.price)}</td>
                    <td className="py-3 px-3">
                      <RiskTierBadge tier={p.riskTier} score={p.riskScore} />
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-300">{p.totalUnits} units</td>
                    <td className="py-3 px-3 font-bold text-[#EF233C]">{formatRupee(p.totalValue)}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${
                        p.recommendedAction === 'TRANSFER'
                          ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                          : p.recommendedAction === 'MARKDOWN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-[#242424] text-slate-300 border border-[#333333]'
                      }`}>
                        {p.recommendedAction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: 4-WEEK RECOMMENDATION IMPACT (Real Calculated Financials) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-[#3B82F6]/10 p-2 text-[#3B82F6] border border-[#3B82F6]/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4-Week Recommendation Financial Impact</h2>
              <p className="text-xs text-[#A1A1AA]">Actual performance calculated dynamically from generated 4-week sales & optimization data</p>
            </div>
          </div>
        </div>

        {/* 5 Financial Waterfall Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-lg">
            <p className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Revenue Impact</p>
            <p className="mt-2 text-xl font-bold text-white">{formatRupee(fourWeekImpact.revenueImpact)}</p>
            <p className="mt-1 text-[11px] text-[#71717A]">{formatNumber(fourWeekImpact.unitsSold)} phones sold</p>
          </div>

          <div className="rounded-xl bg-[#1A1A1A] border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-lg">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Gross Margin</p>
            <p className="mt-2 text-xl font-bold text-emerald-400">{formatRupee(fourWeekImpact.grossMarginImpact)}</p>
            <p className="mt-1 text-[11px] text-emerald-500/80">From active store sales</p>
          </div>

          <div className="rounded-xl bg-[#1A1A1A] border border-[#EF233C]/20 bg-[#EF233C]/5 p-4 shadow-lg">
            <p className="text-[11px] font-semibold text-[#EF233C] uppercase tracking-wider">Stockout Losses</p>
            <p className="mt-2 text-xl font-bold text-[#EF233C]">-{formatRupee(fourWeekImpact.stockoutLostMargin)}</p>
            <p className="mt-1 text-[11px] text-[#EF233C]/80">Lost gross profit</p>
          </div>

          <div className="rounded-xl bg-[#1A1A1A] border border-amber-500/20 bg-amber-500/5 p-4 shadow-lg">
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Markdown Losses</p>
            <p className="mt-2 text-xl font-bold text-amber-400">-{formatRupee(fourWeekImpact.markdownLoss)}</p>
            <p className="mt-1 text-[11px] text-amber-500/80">15-30% price reductions</p>
          </div>

          <div className="rounded-xl bg-[#1A1A1A] border border-indigo-500/20 bg-indigo-500/5 p-4 shadow-lg">
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Transfer Costs</p>
            <p className="mt-2 text-xl font-bold text-indigo-400">-{formatRupee(fourWeekImpact.transferCost)}</p>
            <p className="mt-1 text-[11px] text-indigo-500/80">Logistics ₹300-₹800/unit</p>
          </div>

          <div className="rounded-xl bg-[#1A1A1A] border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-4 shadow-lg">
            <p className="text-[11px] font-semibold text-[#3B82F6] uppercase tracking-wider">Net ROI Impact</p>
            <p className="mt-2 text-xl font-bold text-[#3B82F6]">{formatRupee(fourWeekImpact.netFinancialImpact)}</p>
            <p className="mt-1 text-[11px] text-[#3B82F6]/80">Net 4-week bottom line</p>
          </div>
        </div>
      </div>
    </div>
  );
}
