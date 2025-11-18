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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between min-h-[130px] h-full overflow-hidden relative gap-8">
      {/* Semi-Circle Gauge */}
      <div className="w-48 h-32 relative -mt-6 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={70}
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
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-700 leading-none">{Math.round(winRate)}<span className="text-sm align-top">%</span></span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">WINRATE</span>
        </div>
      </div>

      {/* Stats Legend */}
      <div className="flex flex-col gap-3 flex-grow min-w-0 pr-4 justify-center">
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