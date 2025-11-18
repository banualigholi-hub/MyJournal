export enum TradeDirection {
  LONG = 'Long',
  SHORT = 'Short'
}

export enum TradeStatus {
  WIN = 'Win',
  LOSS = 'Loss',
  BREAK_EVEN = 'Break Even',
  OPEN = 'Open'
}

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  ticker: string;
  direction: TradeDirection;
  pnl: number;
  pnlPercent: number;
  setup: string;
  notes: string;
  status: TradeStatus;
  timestamp: number; // For sorting
}

export interface DailyStats {
  date: string;
  netPnl: number;
  netPercent: number;
  tradeCount: number;
  trades: Trade[];
}

export interface AppStats {
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
  bestDay: number;
  bestDayPercent: number;
  worstDay: number;
  worstDayPercent: number;
}