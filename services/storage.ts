import { Trade, TradeDirection, TradeStatus } from '../types';

const STORAGE_KEY = 'trade_journal_data_v1';

export const saveTrades = (trades: Trade[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (error) {
    console.error('Failed to save trades to local storage', error);
  }
};

export const loadTrades = (): Trade[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load trades from local storage', error);
    return [];
  }
};

export const exportTradesToCSV = (trades: Trade[]) => {
    const headers = ['Date', 'Time', 'Ticker', 'Direction', 'Status', 'PnL', 'PnLPercent', 'Setup', 'Notes'];
    const rows = trades.map(t => [
        t.date,
        t.time,
        t.ticker,
        t.direction,
        t.status,
        t.pnl.toFixed(2),
        t.pnlPercent.toFixed(2),
        `"${(t.setup || '').replace(/"/g, '""')}"`, // Escape quotes
        `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trade_journal_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseCSV = async (file: File): Promise<Trade[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return resolve([]);

            // Normalize line endings and split
            const lines = text.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 2) return resolve([]);

            // Get headers and normalize to lowercase
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const trades: Trade[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                // Regex to split by comma, respecting quotes
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                
                // Handle cases where split might fail or line is empty
                if (!values || values.length === 0) continue;
                
                // Clean values: remove surrounding quotes and unescape double quotes
                const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
                
                // Helper to get value by header name (case insensitive)
                const getVal = (key: string) => {
                    const idx = headers.indexOf(key.toLowerCase());
                    // If exact index not found, try finding a partial match or match known variations
                    if (idx === -1) {
                        // Fallback mappings
                        if (key === 'pnl' && headers.includes('pnl ($)')) return cleanValues[headers.indexOf('pnl ($)')];
                        if (key === 'pnlpercent' && headers.includes('pnl (%)')) return cleanValues[headers.indexOf('pnl (%)')];
                        
                        // Partial search
                        const partialIdx = headers.findIndex(h => h.includes(key.toLowerCase()));
                        if (partialIdx !== -1 && cleanValues[partialIdx]) return cleanValues[partialIdx];
                        return '';
                    }
                    return idx !== -1 && cleanValues[idx] ? cleanValues[idx] : '';
                };

                const date = getVal('date') || new Date().toISOString().split('T')[0];
                const time = getVal('time') || '12:00';
                const pnl = parseFloat(getVal('pnl')) || 0;
                const pnlPercent = parseFloat(getVal('pnlpercent')) || 0;
                const directionStr = getVal('direction');
                const direction = directionStr?.toLowerCase().includes('short') ? TradeDirection.SHORT : TradeDirection.LONG;

                // Determine status based on PnL if not explicitly provided or if simplistic
                let status = TradeStatus.BREAK_EVEN;
                if (pnl > 0) status = TradeStatus.WIN;
                else if (pnl < 0) status = TradeStatus.LOSS;

                trades.push({
                    id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
                    date,
                    time,
                    ticker: (getVal('ticker') || 'UNKNOWN').toUpperCase(),
                    direction,
                    status,
                    pnl,
                    pnlPercent,
                    setup: getVal('setup'),
                    notes: getVal('notes'),
                    timestamp: new Date(`${date}T${time}`).getTime()
                });
            }
            resolve(trades);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};