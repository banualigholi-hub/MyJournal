import { Trade, AppStats } from '../types';

export const calculateStats = (trades: Trade[]): AppStats => {
  if (trades.length === 0) {
    return {
      totalPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      totalTrades: 0,
      bestDay: 0,
      bestDayPercent: 0,
      worstDay: 0,
      worstDayPercent: 0,
    };
  }

  let totalPnl = 0;
  let winningTrades = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let totalWins = 0;
  let totalLosses = 0;

  const dailyPnl: Record<string, number> = {};
  const dailyPercent: Record<string, number> = {};

  trades.forEach((trade) => {
    totalPnl += trade.pnl;
    
    // Track daily for best/worst
    if (!dailyPnl[trade.date]) {
        dailyPnl[trade.date] = 0;
        dailyPercent[trade.date] = 0;
    }
    dailyPnl[trade.date] += trade.pnl;
    dailyPercent[trade.date] += trade.pnlPercent;

    if (trade.pnl > 0) {
      winningTrades++;
      grossProfit += trade.pnl;
      totalWins++;
    } else if (trade.pnl < 0) {
      grossLoss += Math.abs(trade.pnl);
      totalLosses++;
    }
  });

  const winRate = (winningTrades / trades.length) * 100;
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  const avgWin = totalWins > 0 ? grossProfit / totalWins : 0;
  const avgLoss = totalLosses > 0 ? grossLoss / totalLosses : 0;

  // Calculate Best/Worst Days including Percentages
  const days = Object.keys(dailyPnl);
  let bestDay = 0;
  let bestDayPercent = 0;
  let worstDay = 0;
  let worstDayPercent = 0;

  if (days.length > 0) {
      const dailyData = days.map(d => ({
          pnl: dailyPnl[d],
          percent: dailyPercent[d]
      }));

      // Best Day (Max PnL)
      const best = dailyData.reduce((prev, curr) => (curr.pnl > prev.pnl ? curr : prev), dailyData[0]);
      bestDay = best.pnl;
      bestDayPercent = best.percent;

      // Worst Day (Min PnL)
      const worst = dailyData.reduce((prev, curr) => (curr.pnl < prev.pnl ? curr : prev), dailyData[0]);
      worstDay = worst.pnl;
      worstDayPercent = worst.percent;
  }

  return {
    totalPnl,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    totalTrades: trades.length,
    bestDay,
    bestDayPercent,
    worstDay,
    worstDayPercent,
  };
};