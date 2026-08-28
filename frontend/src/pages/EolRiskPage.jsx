import React, { useState, useEffect } from 'react';
import { eolRiskApi } from '../services/api';
import { formatRupee, formatPercent, formatNumber } from '../utils/currency';
import { RiskTierBadge } from '../components/Badge';
import {
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  Tag,
  Shield,
  CheckCircle2,
  TrendingDown,
  Building,
  Info,
  AlertCircle
} from 'lucide-react';

export function EolRiskPage() {
  const [risks, setRisks] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [markdowns, setMarkdowns] = useState([]);
  const [activeTab, setActiveTab] = useState('RISKS'); // RISKS, TRANSFERS, MARKDOWNS
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);
  const [filterTier, setFilterTier] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [riskRes, transferRes, mdRes] = await Promise.all([
        eolRiskApi.getRisks(),
        eolRiskApi.getTransfers(),
        eolRiskApi.getMarkdowns()
      ]);
      setRisks(riskRes?.data?.data || []);
      setTransfers(transferRes?.data?.data || []);
      setMarkdowns(mdRes?.data?.data || []);
    } catch (err) {
      console.error('Error fetching EOL risk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await eolRiskApi.recalculate();
      setRisks(res?.data?.data || []);
      setActionSuccessMessage('EOL Risk matrix recalculated successfully.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      alert('Failed to recalculate risks: ' + (err.response?.data?.message || err.message));
    } finally {
      setRecalculating(false);
    }
  };

  const handleExecuteAction = async (riskId, actionType) => {
    try {
      setActionLoadingId(riskId);
      const res = await eolRiskApi.executeAction(riskId, actionType);
      const msg = res?.data?.message || `Action ${actionType} executed successfully.`;
      setActionSuccessMessage(msg);
      setTimeout(() => setActionSuccessMessage(null), 5000);
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Action execution failed';
      alert(`Action failed: ${errorMsg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRisks = risks.filter((r) => {
    const matchesTier = filterTier === 'ALL' || r.risk_tier === filterTier;
    const matchesAction = filterAction === 'ALL' || r.recommended_action === filterAction;
    return matchesTier && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">End-of-Life (EOL) Risk Engine</h1>
            <span className="rounded-md bg-[#EF233C]/10 px-2 py-0.5 text-xs font-bold text-[#EF233C] border border-[#EF233C]/30">
              ACTION OPTIMIZER
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Evaluates aging inventory against rumoured and confirmed successors, comparing financial outcomes of HOLD vs TRANSFER vs MARKDOWN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center space-x-2 rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-slate-200 border border-[#2E2E2E] hover:bg-[#242424] hover:text-white transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#3B82F6] ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalculating Options...' : 'Recalculate Risk Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-300 animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-400 hover:text-white font-bold text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#2E2E2E] pb-3">
        <button
          onClick={() => setActiveTab('RISKS')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'RISKS'
              ? 'bg-[#EF233C] text-white shadow-lg shadow-[#EF233C]/25'
              : 'text-[#A1A1AA] hover:bg-[#242424] hover:text-white'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Active EOL Risk Matrix ({risks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'TRANSFERS'
              ? 'bg-[#EF233C] text-white shadow-lg shadow-[#EF233C]/25'
              : 'text-[#A1A1AA] hover:bg-[#242424] hover:text-white'
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Executed Transfers ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MARKDOWNS')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'MARKDOWNS'
              ? 'bg-[#EF233C] text-white shadow-lg shadow-[#EF233C]/25'
              : 'text-[#A1A1AA] hover:bg-[#242424] hover:text-white'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Applied Markdowns ({markdowns.length})</span>
        </button>
      </div>

      {activeTab === 'RISKS' && (
        <div className="space-y-4">
          {/* Risk Filters Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] p-4 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="Critical">Critical (81–100)</option>
                <option value="High">High (61–80)</option>
                <option value="Medium">Medium (31–60)</option>
                <option value="Low">Low (0–30)</option>
              </select>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="rounded-xl bg-[#242424] border border-[#2E2E2E] py-2 px-3 text-xs text-slate-300 focus:border-[#EF233C] focus:outline-none"
              >
                <option value="ALL">All Recommended Actions</option>
                <option value="TRANSFER">Recommended: TRANSFER</option>
                <option value="MARKDOWN">Recommended: MARKDOWN</option>
                <option value="HOLD">Recommended: HOLD</option>
              </select>
            </div>

            <div className="text-xs text-[#A1A1AA]">
              Showing <span className="font-bold text-white">{filteredRisks.length}</span> vulnerable inventory batches
            </div>
          </div>

          {/* EOL Risk Comparison Table (HOLD vs TRANSFER vs MARKDOWN) */}
          <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Location & Product</th>
                    <th className="py-3 px-4">Trapped Capital</th>
                    <th className="py-3 px-4">Risk Severity</th>
                    <th className="py-3 px-4 text-center bg-[#242424]/40">OPTION 1: HOLD</th>
                    <th className="py-3 px-4 text-center bg-[#3B82F6]/10">OPTION 2: TRANSFER</th>
                    <th className="py-3 px-4 text-center bg-amber-500/10">OPTION 3: MARKDOWN</th>
                    <th className="py-3 px-4 text-center">Optimal Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2E]">
                  {filteredRisks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#71717A]">
                        No vulnerable inventory matches current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRisks.map((r) => (
                      <tr key={r.id} className="hover:bg-[#242424]/60 transition-colors">
                        {/* Product & Store */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{r.product?.model_name}</div>
                          <div className="text-[#A1A1AA] text-[11px]">
                            Store: <strong className="text-slate-200">{r.store?.name}</strong> ({r.store?.city})
                          </div>
                          <div className="mt-1 text-[11px] text-[#71717A] leading-tight">
                            {r.trigger_reason}
                          </div>
                        </td>

                        {/* Stock & Capital */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-white">{r.current_stock} units</div>
                          <div className="text-[11px] font-mono text-[#EF233C] font-semibold">{formatRupee(r.inventory_value)}</div>
                          <div className="text-[10px] text-[#71717A]">{r.weeks_of_cover} wks cover</div>
                        </td>

                        {/* Risk Tier */}
                        <td className="py-3.5 px-4">
                          <RiskTierBadge tier={r.risk_tier} score={r.risk_score} />
                        </td>

                        {/* Option 1: HOLD */}
                        <td className="py-3.5 px-4 bg-[#242424]/20 text-center">
                          <div className="font-mono font-bold text-[#EF233C]">-{formatRupee(r.hold_expected_loss)}</div>
                          <div className="text-[10px] text-[#71717A] mt-0.5">
                            Deprec. + Carrying ({formatRupee(r.hold_carrying_cost)})
                          </div>
                        </td>

                        {/* Option 2: TRANSFER */}
                        <td className="py-3.5 px-4 bg-[#3B82F6]/5 text-center">
                          <div className="font-mono font-bold text-[#3B82F6]">-{formatRupee(r.transfer_expected_loss)}</div>
                          <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                            Logistics: {formatRupee(r.transfer_cost)}
                          </div>
                          {r.suggestedStore && (
                            <div className="text-[10px] text-[#3B82F6] font-medium mt-0.5">
                              To: {r.suggestedStore.name}
                            </div>
                          )}
                        </td>

                        {/* Option 3: MARKDOWN */}
                        <td className="py-3.5 px-4 bg-amber-500/5 text-center">
                          <div className="font-mono font-bold text-amber-400">-{formatRupee(r.markdown_expected_loss)}</div>
                          <div className="text-[10px] text-amber-500 mt-0.5">
                            {r.markdown_suggested_percentage}% price cut
                          </div>
                        </td>

                        {/* Action Execution Trigger */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="space-y-1.5 flex flex-col items-center">
                            <button
                              onClick={() => handleExecuteAction(r.id, r.recommended_action)}
                              disabled={actionLoadingId === r.id || r.action_executed}
                              className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-md transition-all ${
                                r.action_executed
                                  ? 'bg-[#242424] text-[#71717A] cursor-not-allowed border border-[#2E2E2E]'
                                  : r.recommended_action === 'TRANSFER'
                                  ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-[#3B82F6]/30'
                                  : r.recommended_action === 'MARKDOWN'
                                  ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/30'
                                  : 'bg-[#EF233C] text-white hover:bg-[#D90429]'
                              }`}
                            >
                              {actionLoadingId === r.id
                                ? 'Executing...'
                                : r.action_executed
                                ? `Executed (${r.executed_action_type})`
                                : `Execute ${r.recommended_action}`}
                            </button>

                            <div className="text-[10px] text-[#A1A1AA] font-medium">
                              {r.recommended_action === 'TRANSFER'
                                ? 'Saves capital vs markdown'
                                : r.recommended_action === 'MARKDOWN'
                                ? 'Immediate liquidation'
                                : 'Retain current status'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFERS TAB */}
      {activeTab === 'TRANSFERS' && (
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transfer ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">From Store</th>
                  <th className="py-3 px-4">To Store</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Cost / Unit</th>
                  <th className="py-3 px-4">Total Logistics Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#71717A]">
                      No transfer orders generated yet. Click "Execute Transfer" on any high-risk recommendation.
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#242424]/60">
                      <td className="py-3 px-4 font-mono font-bold text-[#3B82F6]">TRF-#{t.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{t.product?.model_name}</td>
                      <td className="py-3 px-4 text-slate-300">{t.fromStore?.name}</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">{t.toStore?.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{t.quantity} units</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{formatRupee(t.cost_per_unit)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{formatRupee(t.total_transfer_cost)}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-[#3B82F6]/20 px-2 py-0.5 text-[10px] font-bold text-[#3B82F6] border border-[#3B82F6]/30">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#A1A1AA] text-[11px] max-w-xs">{t.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARKDOWNS TAB */}
      {activeTab === 'MARKDOWNS' && (
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#242424] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Markdown ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Store Location</th>
                  <th className="py-3 px-4">Original Price</th>
                  <th className="py-3 px-4">Discount %</th>
                  <th className="py-3 px-4">Discounted Price</th>
                  <th className="py-3 px-4">Affected Qty</th>
                  <th className="py-3 px-4">Total Loss Incurred</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {markdowns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#71717A]">
                      No markdown orders active. Click "Execute MARKDOWN" on obsolete EOL stock.
                    </td>
                  </tr>
                ) : (
                  markdowns.map((m) => (
                    <tr key={m.id} className="hover:bg-[#242424]/60">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">MD-#{m.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{m.product?.model_name}</td>
                      <td className="py-3 px-4 text-slate-300">{m.store ? m.store.name : 'Chain-wide'}</td>
                      <td className="py-3 px-4 font-mono text-[#71717A] line-through">{formatRupee(m.original_price)}</td>
                      <td className="py-3 px-4 font-bold text-[#EF233C]">-{m.discount_percentage}%</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{formatRupee(m.discounted_price)}</td>
                      <td className="py-3 px-4 font-mono text-white">{m.affected_quantity} units</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#EF233C]">-{formatRupee(m.total_markdown_loss)}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
