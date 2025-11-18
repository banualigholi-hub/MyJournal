import React, { useState, useEffect } from 'react';
import { StatCard } from './components/StatCard';
import { WinRateWidget } from './components/WinRateWidget';
import { Calendar } from './components/Calendar';
import { AddTradeModal } from './components/AddTradeModal';
import { DayDetailsModal } from './components/DayDetailsModal';
import { WeeklyPerformance } from './components/Reports';
import { EquityCurveChart } from './components/Charts';
import { TradeList } from './components/TradeList';
import { Trade } from './types';
import { loadTrades, saveTrades } from './services/storage';
import { calculateStats } from './services/analytics';
import { Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loaded = loadTrades();
    setTrades(loaded);
  }, []);

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  const stats = calculateStats(trades);

  // Prepare Mini Chart Data (Accumulated PnL over time)
  const miniChartData = React.useMemo(() => {
      const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
      let total = 0;
      return sorted.map(t => {
          total += t.pnl;
          return { value: total };
      });
  }, [trades]);

  // Calculations for Stat Card Integration
  const sortedTrades = React.useMemo(() => [...trades].sort((a, b) => a.timestamp - b.timestamp), [trades]);
  
  // Win/Loss Days
  const { winningDays, losingDays } = React.useMemo(() => {
      const dailyPnLs: Record<string, number> = {};
      trades.forEach(t => dailyPnLs[t.date] = (dailyPnLs[t.date] || 0) + t.pnl);
      const winning = Object.values(dailyPnLs).filter(p => p > 0).length;
      const losing = Object.values(dailyPnLs).filter(p => p < 0).length;
      return { winningDays: winning, losingDays: losing };
  }, [trades]);

  // Last 5 Trades
  const last5Trades = React.useMemo(() => {
      return [...sortedTrades].reverse().slice(0, 5);
  }, [sortedTrades]);

  const handleSaveTrade = (trade: Trade) => {
    setTrades(prev => {
        const exists = prev.findIndex(t => t.id === trade.id);
        if (exists !== -1) {
            const updated = [...prev];
            updated[exists] = trade;
            return updated;
        }
        return [...prev, trade];
    });
    setTradeToEdit(null);
  };

  const handleEditTrade = (trade: Trade) => {
      setTradeToEdit(trade);
      setIsAddModalOpen(true);
  };

  const handleDeleteTrade = (id: string) => {
      setTrades(prev => prev.filter(t => t.id !== id));
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const openAddModalWithDate = (date: string) => {
      setSelectedDate(null);
      setModalInitialDate(date);
      setTradeToEdit(null);
      setIsAddModalOpen(true);
  }

  const getTradesForDate = (date: string | null) => {
    if (!date) return [];
    return trades.filter(t => t.date === date);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-500/30">
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth relative z-10 w-full">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
          
          {/* Header Title since Sidebar is gone */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20 mr-3">
                <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">TradeJournal Pro</h1>
          </div>

          {/* 1. Top KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[30fr_40fr_30fr] gap-4 items-stretch">
            <div className="h-full">
                <StatCard 
                title="Total Net P/L" 
                value={`$${stats.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                color={stats.totalPnl >= 0 ? 'success' : 'danger'}
                trend={stats.totalPnl >= 0 ? 'up' : 'down'}
                chartData={miniChartData}
                />
            </div>
            <div className="h-full">
                <WinRateWidget trades={trades} />
            </div>
            <div className="h-full">
                <StatCard 
                    title="" 
                    items={[
                        { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), highlight: true },
                        { label: 'Avg Daily', value: `$${Math.round(stats.avgDailyProfit)}` },
                        { label: 'Max Drawdown', value: `${stats.maxDrawdown.toFixed(1)}%` },
                        { label: 'Win / Loss Days', value: `${winningDays} / ${losingDays}` },
                        { label: 'Last 5', value: (
                            <div className="flex gap-1">
                                {last5Trades.map((t) => (
                                    <span 
                                        key={t.id} 
                                        className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${t.pnl > 0 ? 'bg-success-100 text-success-700' : t.pnl < 0 ? 'bg-danger-100 text-danger-700' : 'bg-slate-100 text-slate-600'}`}
                                        title={`${t.date} ${t.ticker}: $${t.pnl}`}
                                    >
                                        {t.pnl > 0 ? 'W' : t.pnl < 0 ? 'L' : 'B'}
                                    </span>
                                ))}
                                {last5Trades.length === 0 && <span className="text-xs text-slate-400">-</span>}
                            </div>
                        )}
                    ]}
                />
            </div>
          </div>

          {/* 2. Calendar */}
          <Calendar trades={trades} onDayClick={handleDayClick} />

          {/* 3. Trades Journal */}
          <div className="animate-fade-in-up delay-100">
            <TradeList 
                trades={trades} 
                onEdit={handleEditTrade} 
                onDelete={(id) => {
                    if(window.confirm('Are you sure you want to delete this trade?')) {
                        handleDeleteTrade(id);
                    }
                }}
                onAdd={() => {
                    setTradeToEdit(null);
                    setModalInitialDate(undefined);
                    setIsAddModalOpen(true);
                }}
            />
          </div>
                
          {/* 4. Equity Curve */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
             <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6">Cumulative Growth (Equity Curve)</h3>
             <div className="h-[300px] w-full">
                 <EquityCurveChart trades={trades} />
             </div>
          </div>

          {/* 5. Weekly Performance */}
          <WeeklyPerformance trades={trades} />
        </div>
      </main>

      {/* Modals */}
      <AddTradeModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setTradeToEdit(null); setModalInitialDate(undefined); }} 
        onSave={handleSaveTrade}
        onDelete={(id) => handleDeleteTrade(id)}
        initialDate={modalInitialDate}
        tradeToEdit={tradeToEdit}
      />

      <DayDetailsModal 
        isOpen={!!selectedDate}
        date={selectedDate || ''}
        trades={getTradesForDate(selectedDate)}
        onClose={() => setSelectedDate(null)}
        onDelete={(id) => {
             if(window.confirm('Delete this trade?')) {
                 handleDeleteTrade(id);
             }
        }}
        onEdit={(trade) => {
             setSelectedDate(null);
             handleEditTrade(trade);
        }}
        onAddTrade={openAddModalWithDate}
      />
    </div>
  );
};

export default App;