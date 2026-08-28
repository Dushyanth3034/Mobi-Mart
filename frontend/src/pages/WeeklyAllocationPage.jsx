import React, { useState, useEffect, useMemo } from 'react';
import { allocationApi, storesApi } from '../services/api';
import { formatRupee, formatPercent, formatNumber } from '../utils/currency';
import { Badge } from '../components/Badge';
import {
  CalendarCheck,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Download,
  Info,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 35;

export function WeeklyAllocationPage() {
  const [allocation, setAllocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, histRes, storeRes] = await Promise.all([
        allocationApi.getLatest(),
        allocationApi.getHistory(),
        storesApi.getAll()
      ]);
      setAllocation(allocRes.data.data);
      setHistory(histRes.data.data || []);
      setStores(storeRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load allocation data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNextMonday = async () => {
    try {
      setGenerating(true);
      const res = await allocationApi.generate();
      setAllocation(res.data.data);
      const histRes = await allocationApi.getHistory();
      setHistory(histRes.data.data || []);
    } catch (err) {
      alert('Failed to generate allocation: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectHistorical = async (id) => {
    try {
      setLoading(true);
      const res = await allocationApi.getById(id);
      setAllocation(res.data.data);
      setShowHistoryModal(false);
    } catch (err) {
      alert('Failed to load historical allocation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    return Array.from(new Set(stores.map((s) => s.city))).sort();
  }, [stores]);

  const items = allocation?.items || [];
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      if (!item.product || !item.store) return false;
      const matchesSearch =
        !q ||
        item.product.model_name.toLowerCase().includes(q) ||
        item.store.name.toLowerCase().includes(q) ||
        item.store.city.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q);

      const matchesStore = storeFilter === 'ALL' || item.store_id === parseInt(storeFilter, 10);
      const matchesCity = cityFilter === 'ALL' || item.store.city === cityFilter;
      const matchesCategory = categoryFilter === 'ALL' || item.product.category === categoryFilter;
      const matchesPriority = priorityFilter === 'ALL' || item.priority_tier === priorityFilter;

      return matchesSearch && matchesStore && matchesCity && matchesCategory && matchesPriority;
    });
  }, [items, searchQuery, storeFilter, cityFilter, categoryFilter, priorityFilter]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, storeFilter, cityFilter, categoryFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Weekly Inventory Allocation Engine</h1>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              CORE OPTIMIZER
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Recommends optimal warehouse-to-store stock transfers every Monday, enforcing the ₹4.00 Cr budget with Rupee-based reasoning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Historical Week Switcher */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-[#1A1A1A] px-3.5 py-2 text-xs font-medium text-slate-300 border border-[#2E2E2E] hover:bg-[#242424] hover:text-white transition-all shadow-sm"
          >
            <Clock className="h-4 w-4 text-[#3B82F6]" />
            <span>Allocation History ({history.length})</span>
          </button>

          {/* Core Generate Button */}
          <button
            onClick={handleGenerateNextMonday}
            disabled={generating}
            className="flex items-center space-x-2 rounded-xl bg-[#EF233C] px-4 py-2 text-xs font-bold text-white hover:bg-[#D90429] shadow-lg shadow-[#EF233C]/25 transition-all disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Optimizing Allocation...' : "Generate Next Monday's Allocation"}</span>
          </button>
        </div>
      </div>

      {/* Allocation Summary Metrics Header */}
      {allocation && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-xl">
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Plan Identifier</p>
            <p className="mt-2 text-xl font-bold text-white">{allocation.week_identifier}</p>
            <p className="mt-1 text-[11px] text-[#71717A]">Date: {allocation.allocation_date}</p>
          </div>

          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-xl">
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Total Units Dispatched</p>
            <p className="mt-2 text-xl font-bold text-white">{formatNumber(allocation.total_units_allocated)} units</p>
            <p className="mt-1 text-[11px] text-[#71717A]">Across 25 stores</p>
          </div>

          <div className="rounded-2xl bg-[#1A1A1A] border border-[#3B82F6]/30 p-4 shadow-xl">
            <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">Total Investment</p>
            <p className="mt-2 text-xl font-bold text-[#3B82F6]">{formatRupee(allocation.total_investment)}</p>
            <p className="mt-1 text-[11px] text-[#3B82F6]/80">Capital deployed this cycle</p>
          </div>

          <div className="rounded-2xl bg-[#1A1A1A] border border-emerald-500/30 p-4 shadow-xl">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Expected Gross Margin</p>
            <p className="mt-2 text-xl font-bold text-emerald-400">{formatRupee(allocation.expected_gross_margin)}</p>
            <p className="mt-1 text-[11px] text-emerald-500/80">From recommended replenishment</p>
          </div>

          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-xl">
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Expected Revenue</p>
            <p className="mt-2 text-xl font-bold text-white">{formatRupee(allocation.expected_revenue)}</p>
            <p className="mt-1 text-[11px] text-[#71717A]">4-week demand fulfillment</p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search product, store, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 pl-9 pr-4 text-xs text-white placeholder-[#71717A] focus:border-[#EF233C] focus:outline-none"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Cities ({cities.length})</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Stores (25)</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Flagship">Flagship</option>
            <option value="Premium">Premium</option>
            <option value="Mid-range">Mid-range</option>
            <option value="Budget">Budget</option>
            <option value="Keypad/Budget">Keypad/Budget</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL Priority</option>
            <option value="HIGH">HIGH Priority</option>
            <option value="MEDIUM">MEDIUM Priority</option>
            <option value="LOW">LOW Priority</option>
          </select>
        </div>

        <div className="text-xs text-[#A1A1AA]">
          Showing <span className="font-bold text-white">{filteredItems.length}</span> recommendations
        </div>
      </div>

      {/* Allocation Items Table with Rupee-Based Reasoning */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Store & Location</th>
                <th className="py-3 px-4">Phone Model</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">4W Forecast</th>
                <th className="py-3 px-4 font-bold text-[#3B82F6]">Recommended Qty</th>
                <th className="py-3 px-4">Investment (₹)</th>
                <th className="py-3 px-4">Expected Margin (₹)</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 w-96">Rupee-Based Reasoning & Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#71717A]">
                    No allocation recommendations match current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#242424]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.store?.name}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{item.store?.city} ({item.store?.tier})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.product?.model_name}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{item.product?.brand} • {item.product?.category}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {item.current_store_stock} units
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {item.forecast_demand_units} units
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#3B82F6] text-sm">
                      +{item.recommended_quantity} units
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatRupee(item.total_investment)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {formatRupee(item.expected_margin)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.priority_tier === 'CRITICAL'
                          ? 'bg-[#EF233C]/20 text-[#EF233C] border border-[#EF233C]/30'
                          : item.priority_tier === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.priority_tier === 'MEDIUM'
                          ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                          : 'bg-[#242424] text-slate-400 border border-[#2E2E2E]'
                      }`}>
                        {item.priority_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                      {item.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#2E2E2E] bg-[#1A1A1A] px-4 py-3 text-xs">
            <div className="text-[#A1A1AA]">
              Showing <span className="font-semibold text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}
              </span>{' '}
              of <span className="font-semibold text-white">{filteredItems.length}</span> recommendations
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 rounded-lg bg-[#242424] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#EF233C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-[#2E2E2E]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <span className="px-2 font-mono text-[#A1A1AA]">
                Page <strong className="text-white">{currentPage}</strong> / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 rounded-lg bg-[#242424] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#EF233C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-[#2E2E2E]"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Selection Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
              <h3 className="text-lg font-bold text-white">Allocation Plan Archives</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-[#A1A1AA] hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => handleSelectHistorical(h.id)}
                  className={`flex items-center justify-between rounded-xl p-3 border cursor-pointer transition-all ${
                    h.id === allocation?.id
                      ? 'bg-[#EF233C]/10 border-[#EF233C]/40 text-white'
                      : 'bg-[#242424] border-[#2E2E2E] hover:bg-[#2A2A2A] text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">{h.week_identifier} Plan</p>
                    <p className="text-xs text-[#A1A1AA]">Generated: {h.allocation_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-400">{formatRupee(h.total_investment)}</p>
                    <p className="text-xs text-[#71717A]">{h.total_units_allocated} units dispatched</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
