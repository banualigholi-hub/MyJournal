import React from 'react';
import { X, Trash2, Plus, Pencil } from 'lucide-react';
import { Trade } from '../types';

interface DayDetailsModalProps {
  date: string;
  trades: Trade[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
  onAddTrade: (date: string) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ date, trades, isOpen, onClose, onDelete, onEdit, onAddTrade }) => {
  if (!isOpen) return null;

  const dailyPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const dailyPercent = trades.reduce((acc, t) => acc + t.pnlPercent, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Trades for {date}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className={`text-sm font-bold ${dailyPnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                Net: {dailyPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
              <span className={`text-sm font-medium ${dailyPercent >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                 ({dailyPercent > 0 ? '+' : ''}{dailyPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => onAddTrade(date)}
                className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors font-medium text-sm"
              >
                <Plus size={16} /> Add Trade
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors">
                <X size={24} />
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
          {trades.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No trades recorded for this day.
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map(trade => (
                <div key={trade.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  {/* Gradient Glow */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${trade.pnl > 0 ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                  
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-800">{trade.ticker}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${trade.direction === 'Long' ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-danger-50 text-danger-600 border border-danger-100'}`}>
                        {trade.direction}
                      </span>
                      <span className="text-slate-400 text-xs">{trade.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className={`text-lg font-bold ${trade.pnl > 0 ? 'text-success-600' : trade.pnl < 0 ? 'text-danger-600' : 'text-slate-400'}`}>
                                {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                            <div className={`text-xs font-medium ${trade.pnlPercent > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                                {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => onEdit(trade)}
                                className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                                title="Edit Trade"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={() => onDelete(trade.id)}
                                className="text-slate-400 hover:text-danger-600 hover:bg-danger-50 p-2 rounded-lg transition-colors"
                                title="Delete Trade"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-2 pl-2">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Strategy</span>
                        <span className="text-sm text-slate-600">{trade.setup || '-'}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Notes</span>
                        <span className="text-sm text-slate-600 italic truncate">{trade.notes || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};