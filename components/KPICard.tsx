import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  status?: 'success' | 'warning' | 'danger';
  subtext?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, status = 'success', subtext }) => {
  const getColors = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-400',
          iconBg: 'bg-emerald-500/20'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          iconBg: 'bg-amber-500/20'
        };
      case 'danger':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          text: 'text-rose-400',
          iconBg: 'bg-rose-500/20'
        };
      default:
        return {
          bg: 'bg-slate-800',
          border: 'border-slate-700',
          text: 'text-slate-400',
          iconBg: 'bg-slate-800'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`bg-slate-900 border ${colors.border} rounded-xl p-5 hover:border-slate-600 transition-colors`}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon size={24} />
        </div>
        {trend && (
           <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
             {trend}
           </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        {subtext && (
          <p className="text-xs text-slate-500 mt-2">{subtext}</p>
        )}
      </div>
    </div>
  );
};