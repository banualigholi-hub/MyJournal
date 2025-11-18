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
      avgDailyProfit: 0,
      maxDrawdown: 0,
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

  // Sort trades by timestamp for accurate drawdown calc
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  sortedTrades.forEach((trade) => {
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

  // Calculate Best/Worst Days
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

      const best = dailyData.reduce((prev, curr) => (curr.pnl > prev.pnl ? curr : prev), dailyData[0]);
      bestDay = best.pnl;
      bestDayPercent = best.percent;

      const worst = dailyData.reduce((prev, curr) => (curr.pnl < prev.pnl ? curr : prev), dailyData[0]);
      worstDay = worst.pnl;
      worstDayPercent = worst.percent;
  }

  // Avg Daily Profit
  const avgDailyProfit = days.length > 0 ? totalPnl / days.length : 0;

  // Max Drawdown Calculation
  let peakBal = 0; 
  // Try to infer starting balance from first trade percentage if available, else default to reasonable base or 0 relative
  // For relative drawdown, we usually track peak equity.
  // Let's assume a relative drawdown based on PnL accumulation.
  let currentEquity = 0;
  // Initialize peak with 0 (or first equity point if positive)
  let maxDDPercent = 0;
  
  // We need a base balance to calculate percentage drawdown accurately. 
  // Without user input, we estimate or use a standard base. 
  // Strategy: Use the implied balance from the first trade if possible.
  let baseBalance = 10000;
  if(sortedTrades[0] && sortedTrades[0].pnlPercent !== 0) {
      baseBalance = Math.abs((sortedTrades[0].pnl / sortedTrades[0].pnlPercent) * 100);
  }
  
  currentEquity = baseBalance;
  peakBal = baseBalance;

  sortedTrades.forEach(t => {
      currentEquity += t.pnl;
      if (currentEquity > peakBal) {
          peakBal = currentEquity;
      }
      const dd = (peakBal - currentEquity) / peakBal;
      if (dd > maxDDPercent) maxDDPercent = dd;
  });


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
    avgDailyProfit,
    maxDrawdown: maxDDPercent * 100 // Return as whole number percentage
  };
};