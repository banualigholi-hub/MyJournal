import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'danger' | 'primary';
  chartData?: { value: number }[];
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend, 
  color = 'default',
  chartData
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