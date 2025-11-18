import React from 'react';
import { Trade, TradeStatus } from '../types';

interface ReportsProps {
  trades: Trade[];
}

export const Reports: React.FC<ReportsProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <p>No data available to generate reports.</p>
      </div>
    );
  }

  // --- Calculations ---

  // Sort trades by timestamp
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  // 1. Total Number of Trades
  const totalTrades = trades.length;

  // 2. Avg Daily Profit
  // Get unique days traded
  const uniqueDays = new Set(trades.map(t => t.date));
  const totalDays = uniqueDays.size;
  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const avgDailyProfit = totalDays > 0 ? totalPnl / totalDays : 0;

  // 3. Biggest Winner & Loser
  const biggestWinner = trades.reduce((max, t) => (t.pnl > max ? t.pnl : max), 0);
  const biggestLoser = trades.reduce((min, t) => (t.pnl < min ? t.pnl : min), 0);

  // 4. Max Drawdown
  let runningPnL = 0;
  let estimatedBalance = 0;
  
  // Try to estimate base balance
  if (sortedTrades.length > 0) {
      const t1 = sortedTrades[0];
      if (t1.pnlPercent !== 0) {
          estimatedBalance = (t1.pnl / t1.pnlPercent) * 100;
      } else {
          estimatedBalance = 10000; // Fallback
      }
  }

  let tempBal = estimatedBalance;
  let peakBal = estimatedBalance;
  let maxDDPercent = 0;

  sortedTrades.forEach(t => {
      tempBal += t.pnl;
      if (tempBal > peakBal) {
          peakBal = tempBal;
      }
      const dd = (peakBal - tempBal) / peakBal;
      if (dd > maxDDPercent) maxDDPercent = dd;
  });


  // 5. Winning / Losing Days
  const dailyPnLs: Record<string, number> = {};
  trades.forEach(t => {
      dailyPnLs[t.date] = (dailyPnLs[t.date] || 0) + t.pnl;
  });
  const winningDays = Object.values(dailyPnLs).filter(p => p > 0).length;
  const losingDays = Object.values(dailyPnLs).filter(p => p < 0).length;

  // 6. Last 10 Trades History
  const last10Trades = [...sortedTrades].reverse().slice(0, 10);

  // 7. Trades Per Day / Week
  let tradesPerDay = 0;
  let tradesPerWeek = 0;
  if (trades.length > 0) {
      const firstDate = new Date(sortedTrades[0].timestamp);
      const lastDate = new Date(sortedTrades[sortedTrades.length - 1].timestamp);
      const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const diffWeeks = Math.ceil(diffDays / 7) || 1;
      
      tradesPerDay = trades.length / diffDays;
      tradesPerWeek = trades.length / diffWeeks;
  }

  const MetricRow = ({ label, value, highlightClass = "" }: { label: string, value: React.ReactNode, highlightClass?: string }) => (
      <div className="flex justify-between items-center py-6 border-b border-slate-100 last:border-0">
          <span className="text-slate-500 font-medium text-sm md:text-base">{label}</span>
          <span className={`font-bold text-lg md:text-xl ${highlightClass}`}>{value}</span>
      </div>
  );

  // --- Weekly Performance Logic ---
  const getMonday = (d: Date) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
  };

  // Group trades by week
  const weeksMap = new Map<number, Trade[]>();
  trades.forEach(t => {
      const date = new Date(t.date.replace(/-/g, '/')); // Fix for potential Safari/browser date parsing issues
      const monday = getMonday(date);
      const time = monday.getTime();
      if (!weeksMap.has(time)) {
          weeksMap.set(time, []);
      }
      weeksMap.get(time)?.push(t);
  });

  // Convert to array and sort descending (newest weeks first)
  const weeks = Array.from(weeksMap.entries()).sort((a, b) => b[0] - a[0]).map(([timestamp, weekTrades]) => {
      const mondayDate = new Date(timestamp);
      
      // Calculate week stats
      const weekPnl = weekTrades.reduce((sum, t) => sum + t.pnl, 0);
      const weekPercent = weekTrades.reduce((sum, t) => sum + t.pnlPercent, 0);
      const weekCount = weekTrades.length;

      // Generate Mon-Fri structure
      const days = [];
      const current = new Date(mondayDate);
      for (let i = 0; i < 5; i++) {
          // Format YYYY-MM-DD manually to match trade.date
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          const d = String(current.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          
          const dayTrades = weekTrades.filter(t => t.date === dateStr);
          const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
          const dayPercent = dayTrades.reduce((sum, t) => sum + t.pnlPercent, 0);
          const dayCount = dayTrades.length;

          days.push({
              date: dateStr,
              dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
              dayNum: current.getDate(),
              pnl: dayPnl,
              percent: dayPercent,
              count: dayCount
          });

          current.setDate(current.getDate() + 1);
      }

      return {
          startDate: mondayDate,
          summary: { pnl: weekPnl, percent: weekPercent, count: weekCount },
          days
      };
  });

  return (
    <div className="w-full pb-12 space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm px-8 py-2">
            <MetricRow 
                label="Total Number of Trades" 
                value={totalTrades} 
            />
            <MetricRow 
                label="Avg. Daily Profit" 
                value={avgDailyProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                highlightClass={avgDailyProfit >= 0 ? 'text-slate-800' : 'text-danger-600'}
            />
            <MetricRow 
                label="Biggest Winner" 
                value={biggestWinner.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                highlightClass="text-slate-800"
            />
            <MetricRow 
                label="Biggest Loser" 
                value={biggestLoser.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                highlightClass="text-slate-800"
            />
            <MetricRow 
                label="Max Drawdown" 
                value={`${(maxDDPercent * 100).toFixed(2)}%`} 
                highlightClass="text-slate-800"
            />
            <MetricRow 
                label="Winning / Losing Days" 
                value={`${winningDays} / ${losingDays}`} 
            />
            <MetricRow 
                label="Recent History (Last 10)" 
                value={
                    <div className="flex gap-1">
                        {last10Trades.map((t) => (
                            <span 
                                key={t.id} 
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${t.pnl > 0 ? 'bg-success-100 text-success-700' : t.pnl < 0 ? 'bg-danger-100 text-danger-700' : 'bg-slate-100 text-slate-600'}`}
                                title={`${t.date} ${t.ticker}: $${t.pnl}`}
                            >
                                {t.pnl > 0 ? 'W' : t.pnl < 0 ? 'L' : 'B'}
                            </span>
                        ))}
                    </div>
                } 
            />
             <MetricRow 
                label="Trades Per Day / Week" 
                value={`${tradesPerDay.toFixed(2)} / ${tradesPerWeek.toFixed(2)}`} 
            />
        </div>

        {/* Weekly Performance Section */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
             <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Performance</h2>
             
             {/* Header */}
             <div className="grid grid-cols-6 gap-2 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Week Result'].map((d, i) => (
                    <div key={d} className={`text-xs font-bold text-slate-400 uppercase tracking-wider py-2 text-center ${i === 5 ? 'bg-slate-50 rounded-lg' : ''}`}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                {weeks.map((week, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2">
                        {week.days.map((day, dIndex) => {
                             let bgClass = "bg-slate-50/50 border-slate-100";
                             let pnlColor = "text-slate-400";
                             
                             if (day.count > 0) {
                                if (day.pnl > 0) {
                                    bgClass = "bg-success-50 border-success-100";
                                    pnlColor = "text-success-600";
                                } else if (day.pnl < 0) {
                                    bgClass = "bg-danger-50 border-danger-100";
                                    pnlColor = "text-danger-600";
                                } else {
                                    bgClass = "bg-white border-slate-200";
                                    pnlColor = "text-slate-600";
                                }
                             }

                             return (
                                <div key={dIndex} className={`min-h-[60px] border rounded-xl p-2 flex flex-col justify-between relative overflow-hidden ${bgClass}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {day.date.split('-')[2]} <span className="text-[8px] opacity-70">{day.dayName}</span>
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        {day.count > 0 ? (
                                            <>
                                                <div className={`text-sm font-bold leading-none ${pnlColor}`}>
                                                    {day.pnl > 0 ? '+' : ''}{Math.round(day.pnl)}
                                                </div>
                                                <div className={`text-[9px] font-medium leading-tight ${day.percent >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                                                    {day.percent > 0 ? '+' : ''}{day.percent.toFixed(1)}%
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-slate-300 text-sm">-</span>
                                        )}
                                    </div>
                                </div>
                             );
                        })}

                         {/* Week Summary */}
                        <div className="min-h-[60px] bg-slate-100 border border-slate-200 rounded-xl p-2 flex flex-col justify-center items-end">
                             <span className={`text-sm font-bold ${week.summary.pnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                {week.summary.pnl > 0 ? '+' : ''}{Math.round(week.summary.pnl)}
                            </span>
                            <span className={`text-[10px] font-medium ${week.summary.percent >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                                {week.summary.percent > 0 ? '+' : ''}{week.summary.percent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};