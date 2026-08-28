import React, { useState, useEffect, useMemo } from 'react';
import { inventoryApi, storesApi } from '../services/api';
import { formatRupee, formatNumber } from '../utils/currency';
import { LifecycleBadge } from '../components/Badge';
import {
  Boxes,
  Warehouse,
  Store as StoreIcon,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 50;

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deadStockOnly, setDeadStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, storeRes] = await Promise.all([
        inventoryApi.getInventory(),
        storesApi.getAll()
      ]);
      setInventory(invRes.data.data || []);
      setStores(storeRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return inventory.filter((item) => {
      if (!item.product) return false;
      const matchesSearch =
        !q ||
        item.product.model_name.toLowerCase().includes(q) ||
        item.product.brand.toLowerCase().includes(q) ||
        item.product.sku.toLowerCase().includes(q) ||
        (item.store && item.store.name.toLowerCase().includes(q));

      let matchesStore = true;
      if (storeFilter === 'WAREHOUSE') {
        matchesStore = item.is_warehouse === true;
      } else if (storeFilter !== 'ALL') {
        matchesStore = item.store_id === parseInt(storeFilter, 10);
      }

      const matchesCategory = categoryFilter === 'ALL' || item.product.category === categoryFilter;
      const matchesDeadStock = !deadStockOnly || item.is_dead_stock === true;

      return matchesSearch && matchesStore && matchesCategory && matchesDeadStock;
    });
  }, [inventory, searchQuery, storeFilter, categoryFilter, deadStockOnly]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, storeFilter, categoryFilter, deadStockOnly]);

  const totalFilteredValue = useMemo(() => {
    return filteredInventory.reduce((sum, i) => sum + parseFloat(i.inventory_value || 0), 0);
  }, [filteredInventory]);

  const totalFilteredUnits = useMemo(() => {
    return filteredInventory.reduce((sum, i) => sum + (i.current_quantity || 0), 0);
  }, [filteredInventory]);

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInventory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInventory, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Inventory Management</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Central warehouse stock and 25-store distributed inventory with Weeks of Cover (WoC) monitoring.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#1A1A1A] px-4 py-2 border border-[#2E2E2E] text-xs">
            <span className="text-[#A1A1AA]">Filtered Value: </span>
            <span className="font-mono font-bold text-white">{formatRupee(totalFilteredValue)}</span>
            <span className="text-[#71717A] ml-1.5">({formatNumber(totalFilteredUnits)} units)</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search model, store, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 pl-9 pr-4 text-xs text-white placeholder-[#71717A] focus:border-[#EF233C] focus:outline-none"
            />
          </div>

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Locations (Warehouse + 25 Stores)</option>
            <option value="WAREHOUSE">Central Warehouse Only</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
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
        </div>

        {/* Dead Stock Checkbox Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer rounded-xl bg-[#242424] px-3.5 py-2 border border-[#2E2E2E] hover:border-[#333333] text-xs text-slate-300">
          <input
            type="checkbox"
            checked={deadStockOnly}
            onChange={(e) => setDeadStockOnly(e.target.checked)}
            className="rounded border-[#333333] bg-[#1A1A1A] text-[#EF233C] focus:ring-0"
          />
          <span className={deadStockOnly ? 'font-bold text-[#EF233C]' : ''}>
            Dead Stock Only (&gt;6.5 WoC)
          </span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Phone Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Current Qty</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Weeks of Cover</th>
                <th className="py-3 px-4">Status / Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {paginatedInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#71717A]">
                    No inventory records match current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#242424]/60 transition-colors">
                    <td className="py-3 px-4">
                      {item.is_warehouse ? (
                        <div className="flex items-center space-x-1.5 text-[#3B82F6] font-semibold">
                          <Warehouse className="h-4 w-4 flex-shrink-0" />
                          <span>Central Warehouse</span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-white">{item.store?.name}</div>
                          <div className="text-[11px] text-[#A1A1AA]">{item.store?.city} ({item.store?.tier})</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.product?.model_name}</div>
                      <div className="text-[11px] font-mono text-[#71717A]">{item.product?.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.product?.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatRupee(item.unit_cost)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {item.current_quantity} units
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {item.available_quantity} units
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatRupee(item.inventory_value)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-semibold ${
                        item.weeks_of_cover > 6
                          ? 'text-[#EF233C]'
                          : item.weeks_of_cover < 1.5 && item.current_quantity > 0
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {item.weeks_of_cover} wks
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.is_dead_stock ? (
                        <span className="inline-flex items-center space-x-1 rounded bg-[#EF233C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#EF233C] border border-[#EF233C]/30">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Dead Stock</span>
                        </span>
                      ) : item.weeks_of_cover < 1.5 && item.current_quantity > 0 ? (
                        <span className="inline-flex items-center space-x-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                          <AlertCircle className="h-3 w-3" />
                          <span>Lean Stock</span>
                        </span>
                      ) : item.current_quantity === 0 ? (
                        <span className="text-[#71717A] text-[11px]">Unstocked</span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Balanced</span>
                        </span>
                      )}
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length)}
              </span>{' '}
              of <span className="font-semibold text-white">{filteredInventory.length}</span> items
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
    </div>
  );
}
