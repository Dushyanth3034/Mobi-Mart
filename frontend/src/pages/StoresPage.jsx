import React, { useState, useEffect, useMemo } from 'react';
import { storesApi } from '../services/api';
import { formatRupee, formatRupeeCompact, formatPercent, formatNumber } from '../utils/currency';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  Store as StoreIcon,
  Search,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Users,
  Building,
  DollarSign,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeDetail, setStoreDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await storesApi.getAll();
      setStores(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStore = async (storeId) => {
    setSelectedStoreId(storeId);
    try {
      setLoadingDetail(true);
      const res = await storesApi.getById(storeId);
      setStoreDetail(res.data.data);
    } catch (err) {
      console.error('Error fetching store details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredStores = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return stores.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.demand_profile.toLowerCase().includes(q);
      const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [stores, searchQuery, tierFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Karnataka Store Network</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            25 retail stores with tailored catchment profiling, local demand affinity, and live inventory health.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search store, city, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] py-2 pl-9 pr-4 text-xs text-white placeholder-[#71717A] focus:border-[#EF233C] focus:outline-none w-64"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Tiers (25 Stores)</option>
            <option value="Tier-1">Tier-1 (8 Bangalore Stores)</option>
            <option value="Tier-2">Tier-2 (8 Regional Cities)</option>
            <option value="Tier-3">Tier-3 (9 Town Centers)</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Store</th>
                <th className="py-3 px-4">City / Area</th>
                <th className="py-3 px-4">Store Profile</th>
                <th className="py-3 px-4">Inventory Value</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Cover (WoC)</th>
                <th className="py-3 px-4">12M Revenue</th>
                <th className="py-3 px-4">Stockout Rate</th>
                <th className="py-3 px-4">At-Risk Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {filteredStores.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => handleOpenStore(store.id)}
                  className="hover:bg-[#242424]/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{store.name}</div>
                    <div className="text-[11px] font-mono text-[#71717A]">{store.code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-200">
                      <MapPin className="h-3 w-3 text-[#3B82F6]" />
                      <span>{store.city}</span>
                    </div>
                    <div className="text-[11px] text-[#A1A1AA]">{store.area}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">{store.demand_profile}</div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#A1A1AA] mt-0.5">
                      <span>Income: {Math.round(store.income_score)}</span>
                      <span>•</span>
                      <span>Footfall: {Math.round(store.footfall_score)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {formatRupee(store.inventoryValue)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {formatNumber(store.totalStockUnits)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-semibold ${
                      store.avgWeeksOfCover > 5
                        ? 'text-[#EF233C]'
                        : store.avgWeeksOfCover < 1.5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {store.avgWeeksOfCover} wks
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {formatRupee(store.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={store.stockoutRate > 6 ? 'text-[#EF233C] font-semibold' : 'text-slate-300'}>
                      {formatPercent(store.stockoutRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {store.atRiskValue > 0 ? (
                      <span className="font-bold text-[#EF233C]">{formatRupee(store.atRiskValue)}</span>
                    ) : (
                      <span className="text-[#71717A]">₹0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStore(store.id);
                      }}
                      className="rounded-lg bg-[#242424] px-2.5 py-1 text-[11px] font-medium text-[#3B82F6] hover:bg-[#EF233C] hover:text-white border border-[#2E2E2E] transition-colors"
                    >
                      Deep Dive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Deep Dive Modal */}
      <Modal
        isOpen={Boolean(selectedStoreId)}
        onClose={() => {
          setSelectedStoreId(null);
          setStoreDetail(null);
        }}
        title={storeDetail?.store?.name || 'Store Analytics & Assortment Profile'}
        size="xl"
      >
        {loadingDetail || !storeDetail ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EF233C] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Store Meta & Catchment Overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-[#242424] p-4 border border-[#2E2E2E] text-xs">
              <div>
                <p className="text-[#A1A1AA]">Location</p>
                <p className="font-semibold text-white mt-0.5">{storeDetail.store.city}, {storeDetail.store.area}</p>
                <p className="text-[11px] text-[#71717A]">{storeDetail.store.tier} • {storeDetail.store.store_size_sqft} sqft</p>
              </div>
              <div>
                <p className="text-[#A1A1AA]">Store Type</p>
                <p className="font-semibold text-white mt-0.5">{storeDetail.store.store_type}</p>
                <p className="text-[11px] text-[#71717A]">{storeDetail.store.catchment_income} Catchment</p>
              </div>
              <div>
                <p className="text-[#A1A1AA]">Footfall & Income</p>
                <p className="font-semibold text-emerald-400 mt-0.5">
                  Income: {Math.round(storeDetail.store.income_score)}/100
                </p>
                <p className="text-[11px] text-[#71717A]">Footfall: {Math.round(storeDetail.store.footfall_score)}/100 ({storeDetail.store.footfall_level})</p>
              </div>
              <div>
                <p className="text-[#A1A1AA]">Demand Profile</p>
                <p className="font-semibold text-[#3B82F6] mt-0.5">{storeDetail.store.demand_profile}</p>
              </div>
            </div>

            {/* Category Affinity Scores Radar / Bars */}
            <div className="rounded-xl bg-[#242424] p-4 border border-[#2E2E2E]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-3">
                Category Demand Affinity Profile (0–100)
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                {Object.entries(storeDetail.compositeScores).map(([cat, score]) => (
                  <div key={cat} className="rounded-lg bg-[#1A1A1A] p-3 border border-[#2E2E2E]">
                    <p className="text-[11px] capitalize text-[#A1A1AA]">{cat} Demand</p>
                    <p className="text-lg font-bold text-white mt-1">{score}/100</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#333333]">
                      <div
                        className="h-full bg-[#EF233C] rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 12-Month Sales History Chart */}
            <div className="rounded-xl bg-[#242424] p-4 border border-[#2E2E2E]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-3">
                12-Month Store Sales Revenue & Margin Trend
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeDetail.monthlySales}>
                    <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} stroke="#71717A" />
                    <YAxis tickFormatter={(val) => formatRupeeCompact(val)} stroke="#71717A" />
                    <Tooltip
                      formatter={(val, name) => [formatRupee(val), name === 'revenue' ? 'Revenue' : 'Gross Profit']}
                      contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" name="revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gross_profit" fill="#10b981" name="gross_profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 5 Phones in this store */}
            <div className="rounded-xl bg-[#242424] p-4 border border-[#2E2E2E]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-3">
                Top Revenue Drivers in this Store
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {storeDetail.topProducts.map((tp, idx) => (
                  <div key={idx} className="rounded-lg bg-[#1A1A1A] p-3 border border-[#2E2E2E] flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{tp.model_name}</p>
                      <p className="text-[11px] text-[#A1A1AA]">{tp.brand} • {tp.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{formatRupee(tp.revenue)}</p>
                      <p className="text-[10px] text-[#71717A]">{tp.units_sold} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
