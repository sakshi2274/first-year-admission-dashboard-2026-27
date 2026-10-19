import React from 'react';
import { Users, BookOpen, MapPin, Building2, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  isFiltered?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  isFiltered,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all relative overflow-hidden flex flex-col justify-between group">
      {/* Top subtle accent bar in navy/light blue */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-sky-600 to-sky-400 opacity-90" />
      
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            {title}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-950 tabular-nums tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {badge && (
              <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900 group-hover:bg-blue-100 transition-colors shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {isFiltered && (
            <span className="text-sky-600 font-medium">Filtered</span>
          )}
        </div>
      )}
    </div>
  );
};
