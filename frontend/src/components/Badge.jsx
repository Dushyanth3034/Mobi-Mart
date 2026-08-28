import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium'
  };

  const variantClasses = {
    default: 'bg-[#242424] text-[#A1A1AA] border border-[#2E2E2E]',
    primary: 'bg-[#EF233C]/15 text-[#EF233C] border border-[#EF233C]/30',
    accent: 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    danger: 'bg-[#EF233C]/15 text-[#EF233C] border border-[#EF233C]/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
  };

  return (
    <span className={`inline-flex items-center rounded-full tracking-wide uppercase ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
}

export function LifecycleBadge({ stage }) {
  const map = {
    NEW: { label: 'NEW', variant: 'accent' },
    GROWING: { label: 'GROWING', variant: 'success' },
    PEAK: { label: 'PEAK', variant: 'cyan' },
    MATURE: { label: 'MATURE', variant: 'purple' },
    DECLINING: { label: 'DECLINING', variant: 'warning' },
    EOL_RISK: { label: 'EOL RISK', variant: 'danger' },
    EOL: { label: 'EOL / OBSOLETE', variant: 'danger' }
  };

  const item = map[stage] || { label: stage, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function RiskTierBadge({ tier, score }) {
  const map = {
    Low: { label: 'Low Risk', variant: 'success' },
    Medium: { label: 'Medium Risk', variant: 'warning' },
    High: { label: 'High Risk', variant: 'warning' },
    Critical: { label: 'Critical Risk', variant: 'danger' }
  };

  const item = map[tier] || { label: tier || 'Low', variant: 'default' };
  return (
    <Badge variant={item.variant}>
      {item.label} {score !== undefined ? `(${Math.round(score)})` : ''}
    </Badge>
  );
}
