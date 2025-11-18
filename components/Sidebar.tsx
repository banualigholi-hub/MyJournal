import React, { useRef } from 'react';
import { PlusCircle, Download, Upload } from 'lucide-react';
import { exportTradesToCSV, parseCSV } from '../services/storage';
import { Trade } from '../types';

interface SidebarProps {
  onAddTrade: () => void;
  trades: Trade[];
  onImport: (trades: Trade[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddTrade, trades, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const importedTrades = await parseCSV(e.target.files[0]);
              if(importedTrades.length > 0) {
                if(window.confirm(`Found ${importedTrades.length} trades. This will REPLACE your current trade list. Continue?`)) {
                    onImport(importedTrades);
                }
              } else {
                  alert("No valid trades found in this file.");
              }
          } catch (err) {
              console.error(err);
              alert("Error parsing file.");
          } finally {
              // Reset the input so the same file can be selected again if needed
              e.target.value = '';
          }
      }
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 z-50 shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20">
          <span className="text-white font-bold text-xl">Z</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">TradeJournal</h1>
      </div>

      <div className="flex-1">
         {/* Navigation removed for Single Page View */}
      </div>

      <div className="px-4 py-2 border-t border-slate-100 space-y-2">
         <div className="flex gap-2">
            <button 
                onClick={() => exportTradesToCSV(trades)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
                <Download size={14} /> Export
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
                <Upload size={14} /> Import
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
            />
         </div>
      </div>

      <div className="p-4">
        <button
          onClick={onAddTrade}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-slate-900/20"
        >
          <PlusCircle size={20} />
          Add Trade
        </button>
      </div>
    </div>
  );
};