import React, { useState } from 'react';
import { ShoppingBag, RefreshCw, Zap, AlertCircle, Database, CheckCircle2 } from 'lucide-react';
import { seedApi } from '../services/api';
import { Link } from 'react-router-dom';

export function Navbar({ onReseedSuccess }) {
  const [isReseeding, setIsReseeding] = useState(false);
  const [reseedMessage, setReseedMessage] = useState(null);

  const handleReseed = async () => {
    if (isReseeding) return;
    if (!window.confirm('Re-run deterministic seed script to reset all 25 stores, 70 products, and 12-month sales?')) {
      return;
    }
    try {
      setIsReseeding(true);
      setReseedMessage('Seeding MySQL Database (Mobi_Mart)...');
      await seedApi.reseed();
      setReseedMessage('Database reset successfully!');
      if (onReseedSuccess) onReseedSuccess();
      setTimeout(() => setReseedMessage(null), 4000);
    } catch (err) {
      setReseedMessage('Seed failed: ' + err.message);
      setTimeout(() => setReseedMessage(null), 5000);
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#2E2E2E] bg-[#1A1A1A] px-6 backdrop-blur-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF233C] text-white shadow-lg shadow-[#EF233C]/25">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-white">MobiMart</span>
            <span className="rounded bg-[#EF233C]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#EF233C] border border-[#EF233C]/30">
              OPTIMIZATION SUITE
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]">The Mobile Retail Chain • Mirai Labs Intern Assessment</p>
        </div>
      </div>

      {/* Global Status & Quick Controls */}
      <div className="flex items-center space-x-4">
        {/* Chain Budget Indicator */}
        <div className="hidden items-center space-x-2 rounded-xl bg-[#242424] px-3.5 py-1.5 border border-[#333333] md:flex">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-[#A1A1AA]">Chain Budget Limit:</span>
          <span className="text-xs font-bold text-emerald-400">₹4.00 Cr (₹4,00,00,000)</span>
        </div>

        {/* Live Defense Direct Shortcut */}
        <Link
          to="/scenario"
          className="flex items-center space-x-1.5 rounded-xl bg-[#EF233C]/15 px-3 py-1.5 text-xs font-semibold text-[#EF233C] border border-[#EF233C]/30 hover:bg-[#EF233C]/25 transition-all shadow-sm"
        >
          <Zap className="h-4 w-4" />
          <span>Live Defense Simulator</span>
        </Link>

        {/* Re-seed Deterministic Data Trigger */}
        <button
          onClick={handleReseed}
          disabled={isReseeding}
          className="flex items-center space-x-1.5 rounded-xl bg-[#242424] px-3 py-1.5 text-xs font-medium text-slate-300 border border-[#333333] hover:bg-[#2E2E2E] hover:text-white transition-all disabled:opacity-50"
          title="Re-populate MySQL database with deterministic dataset"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isReseeding ? 'animate-spin text-[#3B82F6]' : ''}`} />
          <span>{isReseeding ? 'Seeding...' : 'Reset Data'}</span>
        </button>

        {/* Status Toast */}
        {reseedMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-[#242424] px-4 py-2.5 text-xs font-medium text-white border border-[#333333] shadow-2xl animate-fade-in">
            {reseedMessage.includes('successfully') ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-400" />
            )}
            <span>{reseedMessage}</span>
          </div>
        )}
      </div>
    </header>
  );
}
