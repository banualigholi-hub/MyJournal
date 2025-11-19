import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Trade, TradeDirection } from '../types';

interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete, onAdd }) => {
  // Sort trades by timestamp descending (newest first)
  const sortedTrades = [...trades].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="text-xl font-bold text-slate-800">Trades Journal</h2>
        <button 
          onClick={onAdd} 
          className="flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={16} />
          Add Trade
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Date / Time</th>
              <th className="px-6 py-4 whitespace-nowrap">Ticker</th>
              <th className="px-6 py-4 whitespace-nowrap">Direction</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Net P/L</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Account %</th>
              <th className="px-6 py-4 whitespace-nowrap">Strategy</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedTrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No trades found. Click "Add Trade" to start journaling.
                </td>
              </tr>
            ) : (
              sortedTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Smaller font, single line */}
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                         <span className="text-slate-600">{trade.date}</span>
                         <span className="text-slate-300 mx-1">|</span>
                         <span className="font-mono text-slate-400">{trade.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 tracking-tight">
                    {trade.ticker}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                      trade.direction === TradeDirection.LONG 
                        ? 'bg-success-50 text-success-700 border-success-100' 
                        : 'bg-danger-50 text-danger-700 border-danger-100'
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-base">
                    <span className={trade.pnl > 0 ? 'text-success-600' : trade.pnl < 0 ? 'text-danger-600' : 'text-slate-600'}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </td>
                   <td className="px-6 py-4 text-right font-medium">
                    <span className={trade.pnlPercent > 0 ? 'text-success-500' : trade.pnlPercent < 0 ? 'text-danger-500' : 'text-slate-500'}>
                      {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-slate-500" title={trade.setup}>
                    {trade.setup || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={() => onEdit(trade)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Edit Trade"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(trade.id)}
                        className="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                        title="Delete Trade"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};