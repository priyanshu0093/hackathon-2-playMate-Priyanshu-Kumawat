import React from 'react';

export const Badge = ({ children, variant = 'primary', size = 'sm', className = '' }) => {
  const variantStyles = {
    primary: 'bg-[#D9EAFE] text-[#2F80ED] border border-[#2F80ED]/20',
    success: 'bg-[#E6F8F2] text-[#20B486] border border-[#20B486]/30',
    warning: 'bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/30',
    danger: 'bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]/30',
    neutral: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
    sport: 'bg-white text-[#172338] shadow-xs border border-[#E5EDF7]'
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 font-medium rounded-full',
    sm: 'text-xs px-2.5 py-1 font-semibold rounded-full',
    md: 'text-sm px-3.5 py-1.5 font-semibold rounded-full'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 tracking-tight ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const norm = String(status || '').toLowerCase();
  switch (norm) {
    case 'spots available':
      return <Badge variant="success">● Spots Available</Badge>;
    case 'almost full':
      return <Badge variant="warning">⚡ Almost Full</Badge>;
    case 'full':
      return <Badge variant="danger">✕ Full</Badge>;
    case 'confirmed':
      return <Badge variant="success">✓ Confirmed</Badge>;
    case 'pending':
      return <Badge variant="warning">⏳ Pending</Badge>;
    case 'completed':
      return <Badge variant="neutral">🏁 Completed</Badge>;
    case 'cancelled':
      return <Badge variant="danger">✕ Cancelled</Badge>;
    case 'refund_pending':
    case 'refund pending':
      return <Badge variant="warning">⏳ Refund Pending (Demo)</Badge>;
    default:
      return <Badge variant="primary">{status}</Badge>;
  }
};
