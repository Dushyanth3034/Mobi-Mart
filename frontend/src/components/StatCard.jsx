import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = 'blue',
  badgeText
}) {
  const colorMap = {
    blue: 'border-[#3B82F6]/30 text-[#3B82F6]',
    primary: 'border-[#EF233C]/30 text-[#EF233C]',
    rose: 'border-[#EF233C]/30 text-[#EF233C]',
    emerald: 'border-emerald-500/30 text-emerald-400',
    amber: 'border-amber-500/30 text-amber-400',
    purple: 'border-purple-500/30 text-purple-400'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#1A1A1A] p-5 border ${colorMap[color] || colorMap.blue} shadow-xl backdrop-blur-sm transition-all duration-200 hover:translate-y-[-2px]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        {Icon && (
          <div className="rounded-xl bg-[#242424] p-2.5 border border-[#333333] shadow-inner">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#A1A1AA]">
        <div>{subtitle}</div>
        {badgeText && (
          <span className="rounded-md bg-[#242424] px-2 py-0.5 font-medium text-slate-300 border border-[#2E2E2E]">
            {badgeText}
          </span>
        )}
        {trend && (
          <span className={`font-semibold ${trendPositive ? 'text-emerald-400' : 'text-[#EF233C]'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
