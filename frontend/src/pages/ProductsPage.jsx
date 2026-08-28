import React, { useState, useEffect, useMemo } from 'react';
import { productsApi } from '../services/api';
import { formatRupee, formatRupeeCompact, formatPercent, formatNumber } from '../utils/currency';
import { LifecycleBadge, RiskTierBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  Smartphone,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  Boxes
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getAll();
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProduct = async (productId) => {
    setSelectedProductId(productId);
    try {
      setLoadingDetail(true);
      const res = await productsApi.getById(productId);
      setProductDetail(res.data.data);
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.model_name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesStage = stageFilter === 'ALL' || p.lifecycle?.stage === stageFilter;
      const matchesBrand = brandFilter === 'ALL' || p.brand === brandFilter;
      return matchesSearch && matchesCategory && matchesStage && matchesBrand;
    });
  }, [products, searchQuery, categoryFilter, stageFilter, brandFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Mobile Models Catalog</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            70 mobile models with lifecycle stage monitoring, predecessor-successor cannibalisation, and inventory health.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search model, brand, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] py-2 pl-9 pr-4 text-xs text-white placeholder-[#71717A] focus:border-[#EF233C] focus:outline-none w-56"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Flagship">Flagship (₹80k–₹1.5L)</option>
            <option value="Premium">Premium (₹45k–₹80k)</option>
            <option value="Mid-range">Mid-range (₹20k–₹45k)</option>
            <option value="Budget">Budget (₹10k–₹20k)</option>
            <option value="Keypad/Budget">Keypad/Budget (₹6k–₹10k)</option>
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Lifecycle Stages</option>
            <option value="NEW">NEW</option>
            <option value="GROWING">GROWING</option>
            <option value="PEAK">PEAK</option>
            <option value="MATURE">MATURE</option>
            <option value="DECLINING">DECLINING</option>
            <option value="EOL_RISK">EOL RISK</option>
            <option value="EOL">EOL</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
          >
            <option value="ALL">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Brand & Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (MRP)</th>
                <th className="py-3 px-4">Margin %</th>
                <th className="py-3 px-4">Lifecycle Stage</th>
                <th className="py-3 px-4">12M Revenue</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Cover (WoC)</th>
                <th className="py-3 px-4">EOL Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleOpenProduct(p.id)}
                  className="hover:bg-[#242424]/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{p.model_name}</div>
                    <div className="text-[11px] font-mono text-[#71717A]">{p.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {p.category}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {formatRupee(p.price)}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    {p.margin_percentage}%
                  </td>
                  <td className="py-3 px-4">
                    <LifecycleBadge stage={p.lifecycle?.stage || 'MATURE'} />
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {formatRupee(p.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-white font-medium">{p.totalQuantity} units</span>
                    <div className="text-[10px] text-[#71717A]">{formatRupee(p.inventoryValue)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-semibold ${
                      p.avgWeeksOfCover > 5
                        ? 'text-[#EF233C]'
                        : p.avgWeeksOfCover < 1.5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {p.avgWeeksOfCover} wks
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.eolRisk ? (
                      <RiskTierBadge tier={p.eolRisk.riskTier} score={p.eolRisk.riskScore} />
                    ) : (
                      <span className="text-[#71717A] font-mono">Low</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(p.id);
                      }}
                      className="rounded-lg bg-[#242424] px-2.5 py-1 text-[11px] font-medium text-[#3B82F6] hover:bg-[#EF233C] hover:text-white border border-[#2E2E2E] transition-colors"
                    >
                      Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Deep Dive Modal with Cannibalisation Chart */}
      <Modal
        isOpen={Boolean(selectedProductId)}
        onClose={() => {
          setSelectedProductId(null);
          setProductDetail(null);
        }}
        title={productDetail?.product?.model_name || 'Phone Model Intelligence'}
        size="xl"
      >
        {loadingDetail || !productDetail ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EF233C] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Meta Card */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-[#242424] p-4 border border-[#2E2E2E] text-xs">
              <div>
                <p className="text-[#A1A1AA]">Brand & Category</p>
                <p className="font-semibold text-white mt-0.5">{productDetail.product.brand} • {productDetail.product.category}</p>
                <p className="text-[11px] text-[#71717A] font-mono">SKU: {productDetail.product.sku}</p>
              </div>
              <div>
                <p className="text-[#A1A1AA]">Pricing & Margins</p>
                <p className="font-semibold text-emerald-400 mt-0.5">MRP: {formatRupee(productDetail.product.price)}</p>
                <p className="text-[11px] text-[#A1A1AA]">Cost: {formatRupee(productDetail.product.cost_price)} ({productDetail.product.margin_percentage}% margin)</p>
              </div>
              <div>
                <p className="text-[#A1A1AA]">Lifecycle Stage</p>
                <div className="mt-1">
                  <LifecycleBadge stage={productDetail.product.lifecycle?.stage || 'MATURE'} />
                </div>
                <p className="text-[11px] text-[#71717A] mt-1">Launched: {productDetail.product.lifecycle?.launch_date}</p>
              </div>
              <div>
                <p className="text-[#A1A1AA]">Successor Status</p>
                <p className="font-semibold text-white mt-0.5">
                  {productDetail.product.lifecycle?.successor_name || 'None Confirmed'}
                </p>
                {productDetail.product.lifecycle?.confirmed_successor_date && (
                  <p className="text-[11px] text-[#EF233C] font-semibold">Confirmed: {productDetail.product.lifecycle.confirmed_successor_date}</p>
                )}
                {productDetail.product.lifecycle?.rumoured_successor_date && (
                  <p className="text-[11px] text-amber-400">Rumoured: {productDetail.product.lifecycle.rumoured_successor_date}</p>
                )}
              </div>
            </div>

            {/* Cannibalisation / Sales Trend Chart */}
            <div className="rounded-xl bg-[#242424] p-4 border border-[#2E2E2E]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  12-Month Sales History {productDetail.successorMonthlySales?.length > 0 ? '& Cannibalisation Curve' : ''}
                </h4>
                {productDetail.successorMonthlySales?.length > 0 && (
                  <span className="text-[11px] text-[#3B82F6] font-medium">
                    Showing predecessor decay vs successor ramp
                  </span>
                )}
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productDetail.monthlySales}>
                    <XAxis dataKey="month" tickFormatter={(m) => `Month ${m}`} stroke="#71717A" />
                    <YAxis stroke="#71717A" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2E2E2E', borderRadius: '12px', color: '#FFFFFF' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="units_sold"
                      name={`${productDetail.product.model_name} (Units)`}
                      stroke="#EF233C"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Store Distribution Breakdown */}
            <div className="rounded-xl bg-[#242424] p-4 border border-[#2E2E2E]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-3">
                Current Inventory Held in Stores ({productDetail.storeInventories.filter(i => i.current_quantity > 0).length} Locations)
              </h4>
              <div className="max-h-48 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A1A1A] text-[#A1A1AA] text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Store Location</th>
                      <th className="py-2 px-3">City / Tier</th>
                      <th className="py-2 px-3">Stock Units</th>
                      <th className="py-2 px-3">Inventory Value</th>
                      <th className="py-2 px-3">Weeks of Cover</th>
                      <th className="py-2 px-3">Dead Stock Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E2E2E]">
                    {productDetail.storeInventories.filter(i => i.current_quantity > 0).map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2 px-3 text-white font-medium">{inv.store ? inv.store.name : 'Central Warehouse'}</td>
                        <td className="py-2 px-3 text-[#A1A1AA]">{inv.store ? `${inv.store.city} (${inv.store.tier})` : 'Warehouse'}</td>
                        <td className="py-2 px-3 font-mono text-white font-bold">{inv.current_quantity} units</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{formatRupee(inv.inventory_value)}</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{inv.weeks_of_cover} wks</td>
                        <td className="py-2 px-3">
                          {inv.is_dead_stock ? (
                            <span className="rounded bg-[#EF233C]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#EF233C]">
                              DEAD STOCK ({inv.dead_stock_reason})
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[10px]">Healthy</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
