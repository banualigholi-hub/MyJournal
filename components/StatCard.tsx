import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

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

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight size={16} className="text-success-500" />;
    if (trend === 'down') return <ArrowDownRight size={16} className="text-danger-500" />;
    return <Minus size={16} className="text-slate-400" />;
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

  // Render Standard View
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        {trend && getTrendIcon()}
      </div>
      <div className="flex justify-between items-end relative z-10">
        <div>
            <div className={`text-2xl font-bold tracking-tight ${getColorClass()}`}>
                {value}
            </div>
            {subValue && (
                <div className="text-slate-400 text-xs mt-1 font-medium">
                {subValue}
                </div>
            )}
        </div>
        
        {/* Mini Chart */}
        {chartData && chartData.length > 1 && (
            <div className="h-12 w-24 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Line 
                            type="linear" 
                            dataKey="value" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            dot={false} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>
    </div>
  );
};