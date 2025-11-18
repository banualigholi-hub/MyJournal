import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { WinRateWidget } from './components/WinRateWidget';
import { Calendar } from './components/Calendar';
import { AddTradeModal } from './components/AddTradeModal';
import { DayDetailsModal } from './components/DayDetailsModal';
import { Reports } from './components/Reports';
import { EquityCurveChart, DayOfWeekChart } from './components/Charts';
import { Trade, TradeStatus } from './types';
import { loadTrades, saveTrades } from './services/storage';
import { calculateStats } from './services/analytics';
import { Menu, X, Pencil, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      // Use window.confirm as requested
      if(window.confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
          setTrades(prev => prev.filter(t => t.id !== id));
      }
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

  const handleImport = (importedTrades: Trade[]) => {
      // Explicitly replace all trades
      setTrades(importedTrades);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-500/30">
      
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-white border border-slate-200 p-2 rounded-lg text-slate-700 shadow-lg">
              {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-64 h-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <Sidebar 
                    activeTab={activeTab} 
                    setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }} 
                    onAddTrade={() => { setTradeToEdit(null); setModalInitialDate(undefined); setIsAddModalOpen(true); setIsMobileMenuOpen(false); }}
                    trades={trades}
                    onImport={handleImport}
                  />
              </div>
          </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block z-30 relative">
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onAddTrade={() => { setTradeToEdit(null); setModalInitialDate(undefined); setIsAddModalOpen(true); }} 
            trades={trades}
            onImport={handleImport}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[25fr_35fr_20fr_20fr] gap-4 items-stretch">
            
            {/* Total Net P/L (25%) */}
            <div className="h-full">
                <StatCard 
                title="Total Net P/L" 
                value={`$${stats.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                color={stats.totalPnl >= 0 ? 'success' : 'danger'}
                trend={stats.totalPnl >= 0 ? 'up' : 'down'}
                chartData={miniChartData}
                />
            </div>
            
            {/* Win Rate Widget (35%) */}
            <div className="h-full">
                <WinRateWidget trades={trades} />
            </div>

            {/* Avg Return (20%) */}
            <div className="h-full">
                <StatCard 
                title="Avg Return" 
                value={`$${stats.avgWin.toFixed(0)} / $${stats.avgLoss.toFixed(0)}`}
                subValue="Win / Loss"
                />
            </div>

            {/* Profit Factor (20%) */}
            <div className="h-full">
                <StatCard 
                title="Profit Factor" 
                value={stats.profitFactor.toFixed(2)}
                // Default color (black)
                />
            </div>

          </div>

          {/* Content */}
          <div className="animate-fade-in pb-10">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <Calendar trades={trades} onDayClick={handleDayClick} />
                
                {/* Mid Section: Charts & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Day of Week Chart */}
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Avg % Return by Day of Week</h3>
                        <div className="flex-1 min-h-[250px]">
                            <DayOfWeekChart trades={trades} />
                        </div>
                    </div>

                    {/* Key Records */}
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Key Records</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                                <span className="text-slate-500 font-medium">Best Day</span>
                                <div className="text-right">
                                    <div className="text-success-600 font-bold text-lg">+${stats.bestDay.toLocaleString()}</div>
                                    <div className="text-success-500 text-xs">+{stats.bestDayPercent.toFixed(2)}%</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                                <span className="text-slate-500 font-medium">Worst Day</span>
                                <div className="text-right">
                                    <div className="text-danger-600 font-bold text-lg">
                                        {stats.worstDay > 0 ? '+' : ''}{stats.worstDay.toLocaleString()}
                                    </div>
                                    <div className="text-danger-500 text-xs">
                                        {stats.worstDayPercent > 0 ? '+' : ''}{stats.worstDayPercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-slate-500 font-medium">Total Trades</span>
                                <span className="text-slate-800 font-bold text-xl">{stats.totalTrades}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Equity Curve */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6">Cumulative Growth (Equity Curve)</h3>
                    <div className="h-[300px] w-full">
                        <EquityCurveChart trades={trades} />
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
               <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-slate-100">
                       <h2 className="text-xl font-bold text-slate-800">Trade Journal</h2>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                   <th className="p-4 font-semibold">Date</th>
                                   <th className="p-4 font-semibold">Symbol</th>
                                   <th className="p-4 font-semibold">Side</th>
                                   <th className="p-4 font-semibold">Setup</th>
                                   <th className="p-4 text-right font-semibold">P&L ($)</th>
                                   <th className="p-4 text-right font-semibold">P&L (%)</th>
                                   <th className="p-4 text-center font-semibold">Actions</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                               {trades.slice().reverse().map(trade => (
                                   <tr key={trade.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleEditTrade(trade)}>
                                       <td className="p-4 whitespace-nowrap">{trade.date} <span className="text-slate-400 text-xs ml-1">{trade.time}</span></td>
                                       <td className="p-4 font-bold text-slate-800">{trade.ticker}</td>
                                       <td className="p-4">
                                           <span className={`px-2 py-1 rounded-md text-xs font-medium ${trade.direction === 'Long' ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-danger-50 text-danger-600 border border-danger-100'}`}>
                                               {trade.direction}
                                           </span>
                                       </td>
                                       <td className="p-4">{trade.setup || '-'}</td>
                                       <td className={`p-4 text-right font-bold ${trade.pnl > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                           {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                       </td>
                                       <td className={`p-4 text-right font-bold ${trade.pnlPercent > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                                           {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                                       </td>
                                       <td className="p-4 text-center flex items-center justify-center gap-2">
                                           <button 
                                                onClick={(e) => { e.stopPropagation(); handleEditTrade(trade); }} 
                                                className="text-slate-400 hover:text-primary-600 p-1 rounded transition-colors relative z-10"
                                           >
                                               <Pencil size={16} />
                                           </button>
                                           <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTrade(trade.id); }} 
                                                className="text-slate-400 hover:text-danger-600 p-1 rounded transition-colors relative z-10"
                                           >
                                               <Trash2 size={16} />
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                               {trades.length === 0 && (
                                   <tr>
                                       <td colSpan={7} className="p-8 text-center text-slate-400">No trades recorded yet.</td>
                                   </tr>
                               )}
                           </tbody>
                       </table>
                   </div>
               </div>
            )}

            {activeTab === 'reports' && <Reports trades={trades} />}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddTradeModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setTradeToEdit(null); setModalInitialDate(undefined); }} 
        onSave={handleSaveTrade}
        initialDate={modalInitialDate}
        tradeToEdit={tradeToEdit}
      />

      <DayDetailsModal 
        isOpen={!!selectedDate}
        date={selectedDate || ''}
        trades={getTradesForDate(selectedDate)}
        onClose={() => setSelectedDate(null)}
        onDelete={(id) => handleDeleteTrade(id)}
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