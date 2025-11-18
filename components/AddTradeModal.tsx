import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { TradeDirection, TradeStatus, Trade } from '../types';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  onDelete?: (id: string) => void;
  initialDate?: string;
  tradeToEdit?: Trade | null;
}

const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper to get local date string YYYY-MM-DD
const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AddTradeModal: React.FC<AddTradeModalProps> = ({ isOpen, onClose, onSave, onDelete, initialDate, tradeToEdit }) => {
  // Allow pnl to be string (empty) or number in state
  const [formData, setFormData] = useState<Omit<Trade, 'pnl' | 'pnlPercent'> & { pnl: number | string, pnlPercent: number, accountBalance: number }>({
    id: '',
    timestamp: 0,
    date: initialDate || getLocalDate(),
    time: new Date().toTimeString().slice(0, 5),
    direction: TradeDirection.LONG,
    status: TradeStatus.WIN,
    pnl: '', // Default empty
    pnlPercent: 0,
    accountBalance: 10000, // Default capital
    notes: '',
    setup: '',
    ticker: 'XAUUSD'
  });

  const pnlInputRef = useRef<HTMLInputElement>(null);

  // Effect to populate form when editing or when initialDate changes
  useEffect(() => {
    if (isOpen) {
        if (tradeToEdit) {
            // Reverse calculate approximate balance if needed
            let estimatedBalance = 10000;
            if (tradeToEdit.pnl !== 0 && tradeToEdit.pnlPercent !== 0) {
                estimatedBalance = (tradeToEdit.pnl / tradeToEdit.pnlPercent) * 100;
            }

            setFormData({
                ...tradeToEdit,
                accountBalance: Math.abs(estimatedBalance)
            });
        } else {
            setFormData({
                id: '',
                timestamp: 0,
                date: initialDate || getLocalDate(),
                time: new Date().toTimeString().slice(0, 5),
                direction: TradeDirection.LONG,
                status: TradeStatus.WIN,
                pnl: '', // Start empty for new trades
                pnlPercent: 0,
                accountBalance: 10000,
                notes: '',
                setup: '',
                ticker: 'XAUUSD'
            });
            
            // Auto-focus the PnL input for new trades
            setTimeout(() => {
                pnlInputRef.current?.focus();
            }, 100);
        }
    }
  }, [isOpen, initialDate, tradeToEdit]);

  // Auto-calculate Percentage when PnL or Balance changes
  useEffect(() => {
      const pnlVal = formData.pnl === '' ? 0 : Number(formData.pnl);
      const balance = Number(formData.accountBalance);
      if (balance !== 0) {
          const percent = (pnlVal / balance) * 100;
          setFormData(prev => ({ ...prev, pnlPercent: percent }));
      }
  }, [formData.pnl, formData.accountBalance]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pnlValue = formData.pnl === '' ? 0 : Number(formData.pnl);

    const newTrade: Trade = {
      id: tradeToEdit ? tradeToEdit.id : generateId(), // Keep ID if editing
      timestamp: new Date(`${formData.date}T${formData.time}`).getTime(),
      date: formData.date!,
      time: formData.time!,
      ticker: formData.ticker!.toUpperCase(),
      direction: formData.direction!,
      pnl: pnlValue,
      pnlPercent: Number(formData.pnlPercent),
      status: pnlValue > 0 ? TradeStatus.WIN : pnlValue < 0 ? TradeStatus.LOSS : TradeStatus.BREAK_EVEN,
      setup: formData.setup || '',
      notes: formData.notes || ''
    };

    onSave(newTrade);
    onClose();
  };

  const handleDelete = () => {
      if (tradeToEdit && onDelete) {
          if (window.confirm("Are you sure you want to delete this trade?")) {
            onDelete(tradeToEdit.id);
            onClose();
          }
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pnlValueForDisplay = formData.pnl === '' ? 0 : Number(formData.pnl);

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{tradeToEdit ? 'Edit Trade' : 'Log New Trade'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Date (YYYY/MM/DD)</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Time</label>
              <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Ticker / Pair</label>
              <input required type="text" name="ticker" placeholder="e.g. XAUUSD" value={formData.ticker} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Direction</label>
              <select name="direction" value={formData.direction} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none">
                <option value={TradeDirection.LONG}>Long (Buy)</option>
                <option value={TradeDirection.SHORT}>Short (Sell)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Account Balance ($)</label>
              <input required type="number" step="any" name="accountBalance" value={formData.accountBalance} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              <p className="text-xs text-slate-400">Used to calculate percentage automatically.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Net P/L ($)</label>
              <div className="relative">
                <input 
                    required 
                    ref={pnlInputRef}
                    type="number" 
                    step="any" 
                    name="pnl" 
                    value={formData.pnl} 
                    onChange={handleChange} 
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${pnlValueForDisplay > 0 ? 'text-success-600' : pnlValueForDisplay < 0 ? 'text-danger-600' : 'text-slate-800'}`} 
                />
                {formData.pnlPercent !== 0 && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${Number(formData.pnlPercent) > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                        {Number(formData.pnlPercent) > 0 ? '+' : ''}{Number(formData.pnlPercent).toFixed(2)}%
                    </span>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-500">Strategy / Setup</label>
              <input type="text" name="setup" placeholder="e.g. Morning Breakout" value={formData.setup} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-500">Notes</label>
              <textarea name="notes" rows={3} placeholder="What happened?" value={formData.notes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            {tradeToEdit && (
                 <button 
                    type="button" 
                    onClick={handleDelete} 
                    className="px-6 py-3 rounded-xl bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors font-medium flex items-center gap-2 mr-auto"
                >
                    <Trash2 size={18} /> Delete
                </button>
            )}
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2">
              <Save size={20} />
              {tradeToEdit ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};