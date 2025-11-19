import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Trade } from '../types';

interface CalendarProps {
  trades: Trade[];
  onDayClick: (date: string) => void;
}

interface DayStats {
    pnl: number;
    percent: number;
    count: number;
}

export const Calendar: React.FC<CalendarProps> = ({ trades, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper to get stats for a specific date
  const getDayStats = (dateStr: string): DayStats => {
      const dayTrades = trades.filter(t => t.date === dateStr);
      return {
          pnl: dayTrades.reduce((sum, t) => sum + t.pnl, 0),
          percent: dayTrades.reduce((sum, t) => sum + t.pnlPercent, 0),
          count: dayTrades.length
      };
  };

  // Safe local date string generator (YYYY-MM-DD)
  const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // Generate calendar grid data (Mon-Fri + Week Summary)
  const renderWeeks = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Create Date object for 1st of month, but set to Noon (12:00)
    // This prevents midnight/DST shifts from skipping days when iterating
    const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0, 0);
    
    const startDay = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...
    const daysFromMonday = startDay === 0 ? 6 : startDay - 1;
    
    // Clone to start date
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - daysFromMonday);

    const weeks = [];
    let current = new Date(startDate);
    
    // Loop 6 weeks max
    for (let w = 0; w < 6; w++) {
        const weekDays = [];
        let weekPnl = 0;
        let weekPercent = 0;
        let weekTradesCount = 0;
        let hasDaysInMonth = false;

        for (let d = 0; d < 7; d++) {
            const dateStr = getLocalDateString(current);
            const stats = getDayStats(dateStr);
            
            const isCurrentMonth = current.getMonth() === month;
            if (isCurrentMonth) hasDaysInMonth = true;

            weekPnl += stats.pnl;
            weekPercent += stats.percent;
            weekTradesCount += stats.count;

            // Only render Mon-Fri
            if (d < 5) {
                weekDays.push({
                    date: dateStr,
                    dayNum: current.getDate(),
                    isCurrentMonth,
                    stats
                });
            }
            
            // Safe increment by adding 24 hours roughly, but setDate(getDate() + 1) is safe at Noon
            current.setDate(current.getDate() + 1);
        }

        if (hasDaysInMonth || weeks.length === 0) {
            weeks.push({
                days: weekDays,
                summary: { pnl: weekPnl, percent: weekPercent, count: weekTradesCount }
            });
        } else {
            break;
        }
    }
    return weeks;
  };

  const weeks = renderWeeks();
  const todayStr = getLocalDateString(new Date());

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Calendar Performance
        </h2>
        <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-200 w-full md:w-1/2 justify-between">
          <button onClick={previousMonth} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all shadow-sm flex-shrink-0">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-slate-700 text-center uppercase tracking-wide flex-grow truncate px-2">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all shadow-sm flex-shrink-0">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', ''].map((d, i) => (
          <div key={i} className={`text-xs font-bold text-slate-400 uppercase tracking-wider py-3 text-center ${i === 5 ? 'bg-slate-50 rounded-lg text-slate-500' : ''}`}>
              {d}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="space-y-2">
        {weeks.map((week, wIndex) => (
            <div key={wIndex} className="grid grid-cols-6 gap-2">
                {/* Mon-Fri Days */}
                {week.days.map((day, dIndex) => {
                    let bgClass = "bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200";
                    let pnlColor = "text-slate-400";
                    let percentColor = "text-slate-400";

                    if (day.stats.count > 0) {
                        if (day.stats.pnl > 0) {
                            bgClass = "bg-success-50 border-success-100 hover:bg-success-100/50 hover:border-success-200";
                            pnlColor = "text-success-600";
                            percentColor = "text-success-500";
                        } else if (day.stats.pnl < 0) {
                            bgClass = "bg-danger-50 border-danger-100 hover:bg-danger-100/50 hover:border-danger-200";
                            pnlColor = "text-danger-600";
                            percentColor = "text-danger-500";
                        } else {
                            bgClass = "bg-white border-slate-200";
                            pnlColor = "text-slate-600";
                            percentColor = "text-slate-500";
                        }
                    }

                    const isToday = todayStr === day.date;
                    
                    // Dynamic font sizing
                    const formattedPnl = day.stats.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
                    const pnlLength = formattedPnl.length;
                    
                    let pnlFontSize = "text-base md:text-lg";
                    if (pnlLength > 10) pnlFontSize = "text-[9px] md:text-[10px]";
                    else if (pnlLength > 8) pnlFontSize = "text-[10px] md:text-xs";
                    else if (pnlLength > 6) pnlFontSize = "text-xs md:text-sm";

                    return (
                        <div 
                            key={dIndex}
                            onClick={() => onDayClick(day.date)}
                            className={`
                                min-h-[80px] md:min-h-[90px] border rounded-xl p-2 flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden
                                ${bgClass} ${isToday ? 'ring-2 ring-primary-500 shadow-lg' : ''}
                                ${!day.isCurrentMonth ? 'opacity-40' : 'opacity-100'}
                            `}
                        >
                            <div className="flex justify-between items-start z-10">
                                <span className={`text-sm font-semibold ${isToday ? 'text-primary-600' : 'text-slate-500'}`}>
                                    {day.dayNum}
                                </span>
                            </div>
                            
                            <div className="flex flex-col items-end gap-0 z-10 w-full">
                                {day.stats.count > 0 ? (
                                    <>
                                        <span className={`${pnlFontSize} font-bold tracking-tight ${pnlColor} leading-tight whitespace-nowrap overflow-hidden w-full text-right`}>
                                            {day.stats.pnl > 0 ? '+' : ''}{formattedPnl}
                                        </span>
                                        <span className={`text-[10px] font-medium ${percentColor} leading-tight whitespace-nowrap`}>
                                            {day.stats.percent > 0 ? '+' : ''}{day.stats.percent.toFixed(2)}%
                                        </span>
                                        <span className="text-[9px] font-medium text-slate-500 mt-0.5">
                                            {day.stats.count} Trade{day.stats.count > 1 ? 's' : ''}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-300 text-xl">-</span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Week Summary Column */}
                <div className="min-h-[80px] md:min-h-[90px] bg-slate-100 border border-slate-200 rounded-xl p-2 flex flex-col justify-center items-end gap-1">
                    <span className={`text-sm md:text-lg font-bold ${week.summary.pnl >= 0 ? 'text-success-600' : 'text-danger-600'} leading-tight whitespace-nowrap`}>
                        {week.summary.pnl > 0 ? '+' : ''}{week.summary.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                    </span>
                    <span className={`text-[10px] font-medium ${week.summary.percent >= 0 ? 'text-success-500' : 'text-danger-500'} leading-tight whitespace-nowrap`}>
                        {week.summary.percent > 0 ? '+' : ''}{week.summary.percent.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-slate-500 mt-0">
                        {week.summary.count} Total Trades
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};