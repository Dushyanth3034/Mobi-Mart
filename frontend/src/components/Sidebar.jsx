import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Smartphone,
  Boxes,
  CalendarCheck,
  AlertTriangle,
  LineChart,
  Scale,
  Zap
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
  { name: 'Stores', path: '/stores', icon: Store },
  { name: 'Products', path: '/products', icon: Smartphone },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
  { name: 'Weekly Allocation', path: '/allocation', icon: CalendarCheck, badge: 'CORE' },
  { name: 'EOL Risk', path: '/eol-risk', icon: AlertTriangle },
  { name: 'Baseline Comparison', path: '/baseline', icon: Scale },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'Live Defense', path: '/scenario', icon: Zap, badge: 'DEMO' },
];

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#2E2E2E] bg-[#1A1A1A] p-4 flex flex-col justify-between backdrop-blur-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EF233C]/15 text-[#EF233C] font-semibold border border-[#EF233C]/30 shadow-sm'
                    : 'text-[#A1A1AA] hover:bg-[#242424] hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  item.badge === 'CORE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#EF233C]/20 text-[#EF233C] border border-[#EF233C]/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl bg-[#242424] p-3.5 border border-[#2E2E2E] text-xs text-[#A1A1AA] space-y-1">
        <p className="font-semibold text-white">Karnataka Retail Network</p>
        <p>25 Stores • 70 Phone Models</p>
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#71717A] border-t border-[#2E2E2E]">
          <span>MySQL (Mobi_Mart)</span>
          <span className="text-emerald-400 font-mono font-semibold">ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
