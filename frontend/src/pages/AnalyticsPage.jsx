import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { formatRupee, formatRupeeCompact, formatNumber, formatPercent } from '../utils/currency';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  MapPin,
  AlertCircle,
  Smartphone,
  Calendar,
  Flame
} from 'lucide-react';

const BRAND_COLORS = {
  Samsung: '#3B82F6',
  Redmi: '#EF233C',
  Vivo: '#06b6d4',
  Realme: '#f59e0b',
  Apple: '#a855f7',
  OnePlus: '#f43f5e',
  Oppo: '#10b981',
  Motorola: '#6366f1',
  Nothing: '#ec4899',
  Nokia: '#84cc16',
  Xiaomi: '#ea580c'
};

const FESTIVAL_COLORS = {
  'Normal': '#71717A',
  'Ugadi': '#f59e0b',
  'Mysore Dussehra': '#8b5cf6',
  'Dussehra': '#8b5cf6',
  'Diwali': '#EF233C',
  'New Year': '#06b6d4'
};

const DEFAULT_COLORS = ['#EF233C', '#3B82F6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brandViewMode, setBrandViewMode] = useState('bar'); // 'bar' | 'donut'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getData();
      setData(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EF233C] border-t-transparent" />
          <p className="text-sm text-[#A1A1AA]">Loading Deep Analytical Charts...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#EF233C]/30 bg-[#EF233C]/10 p-6 text-[#EF233C]">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-[#EF233C]" />
          <h3 className="font-bold text-base">Error Loading Analytics</h3>
        </div>
        <p className="text-sm mt-1">{error || 'Unknown error occurred while fetching analytics.'}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-xl bg-[#EF233C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D90429] transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const {
    monthlySales = [],
    categoryPerformance = [],
    brandPerformance = [],
    festivalImpact = [],
    cityPerformance = []
  } = data;

  const totalBrandRevenue = brandPerformance.reduce((sum, b) => sum + (Number(b.revenue) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Chain-Wide Analytics & Visualizations</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          12-month sales trajectories, brand revenue distribution, festival surge dynamics, and regional store efficiencies.
        </p>
      </div>

      {/* Chart 1: 12-Month Sales & Gross Profit Trajectory */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">12-Month Revenue & Gross Profit Trajectory</h3>
            <p className="text-xs text-[#A1A1AA]">Notice the 3–4x festive surges during Dussehra (Month 9) and Diwali (Month 10)</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySales}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF233C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF233C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickFormatter={(m) => `Month ${m}`} stroke="#71717A" />
              <YAxis tickFormatter={(val) => formatRupeeCompact(val)} stroke="#71717A" />
              <Tooltip
                formatter={(val, name) => [formatRupee(val), name === 'revenue' ? 'Monthly Revenue' : 'Gross Margin']}
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#EF233C" fillOpacity={1} fill="url(#colorRev)" name="Monthly Revenue" />
              <Area type="monotone" dataKey="gross_profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Gross Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Performance & Brand Revenue Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Contribution */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Revenue Contribution by Product Category</h3>
          <p className="text-xs text-[#A1A1AA] mb-4">Total sales across Keypad, Budget, Mid-range, Premium, and Flagship</p>
          <div className="h-72">
            {categoryPerformance.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#71717A]">
                No category revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance}>
                  <XAxis dataKey="category" stroke="#71717A" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => formatRupeeCompact(val)} stroke="#71717A" />
                  <Tooltip
                    formatter={(val) => [formatRupee(val), 'Total Revenue']}
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Brand Revenue Distribution */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-base font-bold text-white">Brand Revenue Distribution</h3>
              <p className="text-xs text-[#A1A1AA]">
                Aggregated sales across {brandPerformance.length} brands (Total: {formatRupeeCompact(totalBrandRevenue)})
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 rounded-lg bg-[#242424] p-1 border border-[#333333]">
              <button
                onClick={() => setBrandViewMode('bar')}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-all ${
                  brandViewMode === 'bar'
                    ? 'bg-[#EF233C] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setBrandViewMode('donut')}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-all ${
                  brandViewMode === 'donut'
                    ? 'bg-[#EF233C] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Donut Chart
              </button>
            </div>
          </div>

          <div className="h-72 mt-3">
            {brandPerformance.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-xs text-[#71717A] space-y-2">
                <Smartphone className="h-6 w-6 text-slate-600" />
                <p>No brand revenue data available.</p>
              </div>
            ) : brandViewMode === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={brandPerformance}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(val) => formatRupeeCompact(val)}
                    stroke="#71717A"
                  />
                  <YAxis
                    type="category"
                    dataKey="brand"
                    width={75}
                    stroke="#A1A1AA"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val, name, props) => {
                      const pct = totalBrandRevenue > 0 ? ((val / totalBrandRevenue) * 100).toFixed(1) : 0;
                      return [`${formatRupee(val)} (${pct}%)`, 'Brand Revenue'];
                    }}
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      borderColor: '#2E2E2E',
                      borderRadius: '12px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[0, 6, 6, 0]}
                  >
                    {brandPerformance.map((entry, index) => (
                      <Cell
                        key={`brand-bar-${index}`}
                        fill={BRAND_COLORS[entry.brand] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandPerformance}
                    dataKey="revenue"
                    nameKey="brand"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ brand, percent }) => `${brand} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {brandPerformance.map((entry, index) => (
                      <Cell
                        key={`brand-pie-${index}`}
                        fill={BRAND_COLORS[entry.brand] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatRupee(val), 'Brand Revenue']}
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      borderColor: '#2E2E2E',
                      borderRadius: '12px',
                      color: '#FFFFFF'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Festive Demand Multipliers (3–4x Impact) & City Sales Ranking */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Festive Demand Multipliers Chart */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-[#EF233C]" />
                <h3 className="text-base font-bold text-white">Festive Demand Multipliers (3–4x Impact)</h3>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Weekly sales volume vs normal baseline calculated from 52-week sales history
              </p>
            </div>
            <span className="rounded-md bg-[#EF233C]/10 px-2 py-0.5 text-xs font-bold text-[#EF233C] border border-[#EF233C]/30">
              Seasonal Spikes
            </span>
          </div>

          {/* Bar Chart comparing Weekly Volume & Multipliers */}
          <div className="h-56">
            {festivalImpact.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#71717A]">
                No festival impact data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={festivalImpact}
                  margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#71717A"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#71717A"
                    tickFormatter={(val) => `${val} u/wk`}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(val, name, props) => {
                      const f = props.payload;
                      return [
                        `${formatNumber(f.weekly_units)} units/week (${f.multiplier}x Multiplier)`,
                        f.fullName
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      borderColor: '#2E2E2E',
                      borderRadius: '12px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Bar
                    dataKey="weekly_units"
                    radius={[6, 6, 0, 0]}
                  >
                    {festivalImpact.map((entry, index) => (
                      <Cell
                        key={`fest-bar-${index}`}
                        fill={FESTIVAL_COLORS[entry.name] || '#3B82F6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Festival Breakdown Cards */}
          <div className="space-y-2 pt-2 border-t border-[#2E2E2E]">
            {festivalImpact.map((f, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-3 border flex items-center justify-between text-xs transition-all ${
                  f.is_baseline
                    ? 'bg-[#242424] border-[#2E2E2E]'
                    : 'bg-[#1A1A1A] border-[#2E2E2E] hover:border-[#333333]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: FESTIVAL_COLORS[f.name] || '#3B82F6' }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-white">{f.name}</p>
                      <span className={`font-mono font-bold text-[11px] ${
                        f.multiplier >= 3.0
                          ? 'text-[#EF233C]'
                          : f.multiplier > 1.0
                          ? 'text-amber-400'
                          : 'text-[#A1A1AA]'
                      }`}>
                        {f.multiplier}x
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      {f.period} • {formatNumber(f.units_sold)} phones sold ({formatNumber(f.weekly_units)}/wk)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-400">{formatRupee(f.revenue)}</p>
                  <p className="text-[10px] text-[#71717A] font-mono">Gross Profit: {formatRupee(f.gross_profit)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City Sales Ranking */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Regional City Revenue Contributions</h3>
          <p className="text-xs text-[#A1A1AA] mb-4">Bangalore vs Tier-2 (Mysore, Hubli, Mangalore) vs Tier-3 Town Hubs</p>

          <div className="h-72">
            {cityPerformance.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#71717A]">
                No city performance data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityPerformance.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tickFormatter={(val) => formatRupeeCompact(val)} stroke="#71717A" />
                  <YAxis type="category" dataKey="city" width={90} stroke="#A1A1AA" />
                  <Tooltip
                    formatter={(val) => [formatRupee(val), 'City Revenue']}
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
