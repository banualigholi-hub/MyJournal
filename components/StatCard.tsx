import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';

interface StatItem {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: boolean;
}

interface StatCardProps {
  title: string;
  value?: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'danger' | 'primary';
  chartData?: { value: number }[];
  items?: StatItem[];
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend, 
  color = 'default',
  chartData,
  items
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'success': return 'text-success-600';
      case 'danger': return 'text-danger-600';
      case 'primary': return 'text-primary-600';
      default: return 'text-slate-800';
    }
  };

  const getStrokeColor = () => {
     switch (color) {
      case 'success': return '#10b981';
      case 'danger': return '#ef4444';
      default: return '#64748b';
    }
  };

  // Render List View if items are provided
  if (items && items.length > 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full flex flex-col">
            {title && (
                <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-500 text-sm font-medium">{title}</span>
                </div>
            )}
            <div className={`flex-1 flex flex-col justify-center ${!title ? 'pt-1' : ''}`}>
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 last:pb-0">
                        <span className="text-slate-400 text-xs font-medium">{item.label}</span>
                        <span className={`text-sm font-bold ${item.highlight ? 'text-slate-800' : 'text-slate-600'}`}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  // Render Layout with Chart (Total Net P/L specific optimization)
  if (chartData && chartData.length > 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full flex items-stretch">
            {/* Left Side Content */}
            <div className="flex flex-col justify-center z-10 flex-shrink-0 pl-6 py-4 pr-2">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-slate-500 text-sm font-medium">{title}</span>
                    {trend === 'up' && <ArrowUpRight size={14} className="text-success-500" />}
                    {trend === 'down' && <ArrowDownRight size={14} className="text-danger-500" />}
                </div>
                <div className={`text-3xl font-bold tracking-tight ${getColorClass()}`}>
                    {value}
                </div>
                 {subValue && (
                    <div className="text-slate-400 text-xs font-medium mt-0.5">
                    {subValue}
                    </div>
                )}
            </div>
            
            {/* Right Side Chart - Fills remaining space completely */}
            <div className="flex-1 min-w-[100px] relative">
                <div className="absolute inset-0 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getStrokeColor()} stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={getStrokeColor()} 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill={`url(#colorGradient-${color})`}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      );
  }

  // Fallback / Standard View (No Chart)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full flex flex-col justify-center">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        {trend === 'up' && <ArrowUpRight size={16} className="text-success-500" />}
        {trend === 'down' && <ArrowDownRight size={16} className="text-danger-500" />}
      </div>
      <div>
            <div className={`text-3xl font-bold tracking-tight ${getColorClass()}`}>
                {value}
            </div>
            {subValue && (
                <div className="text-slate-400 text-xs mt-1 font-medium">
                {subValue}
                </div>
            )}
      </div>
    </div>
  );
};