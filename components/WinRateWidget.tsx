import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Trade, TradeStatus } from '../types';

interface WinRateWidgetProps {
  trades: Trade[];
}

export const WinRateWidget: React.FC<WinRateWidgetProps> = ({ trades }) => {
  const wins = trades.filter(t => t.status === TradeStatus.WIN).length;
  const losses = trades.filter(t => t.status === TradeStatus.LOSS).length;
  const total = trades.length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  const data = [
    { name: 'Win', value: wins, color: '#34d399' }, // emerald-400
    { name: 'Loss', value: losses, color: '#f87171' }, // red-400
  ];

  // Empty state
  if (total === 0) {
      data[0].value = 0;
      data[1].value = 1;
      data[1].color = '#e2e8f0';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between min-h-[130px] h-full overflow-hidden relative gap-2">
      {/* Semi-Circle Gauge - Increased Size */}
      <div className="w-3/5 h-full relative flex items-center justify-center">
        <div className="w-full h-[160px] absolute top-1/2 -translate-y-1/2 transform translate-x-[-10px]">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={75} // Increased size
                outerRadius={105} // Increased size
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={0} />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>
            
             {/* Centered Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-6">
                <span className="text-3xl font-bold text-slate-900 leading-none">{Math.round(winRate)}<span className="text-sm align-top">%</span></span>
            </div>
        </div>
      </div>

      {/* Stats Legend */}
      <div className="flex flex-col gap-3 pr-4 justify-center flex-shrink-0">
        <div className="flex items-center justify-end gap-3">
           <span className="text-xs text-slate-500 font-medium">winners</span>
           <div className="w-9 h-9 rounded-lg bg-success-100 text-success-700 flex-shrink-0 flex items-center justify-center font-bold text-base shadow-sm">
               {wins}
           </div>
        </div>
        <div className="flex items-center justify-end gap-3">
           <span className="text-xs text-slate-500 font-medium">losers</span>
           <div className="w-9 h-9 rounded-lg bg-danger-100 text-danger-700 flex-shrink-0 flex items-center justify-center font-bold text-base shadow-sm">
               {losses}
           </div>
        </div>
      </div>
    </div>
  );
};