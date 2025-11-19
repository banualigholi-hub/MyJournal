import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import { Trade } from '../types';

interface ChartProps {
    trades: Trade[];
}

export const EquityCurveChart: React.FC<ChartProps> = ({ trades }) => {
    const data = React.useMemo(() => {
        let runningTotal = 0;
        const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
        
        if(sorted.length === 0) return [];
    
        const points = sorted.map(t => {
          runningTotal += t.pnl;
          return {
            date: t.date,
            balance: runningTotal,
            pnl: t.pnl
          };
        });
        
        return [{ date: 'Start', balance: 0, pnl: 0 }, ...points];
      }, [trades]);

    if (trades.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} tickMargin={10} minTickGap={30} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#475569' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                />
                <Line 
                    type="linear" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ fill: '#10b981', r: 2 }}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const DayOfWeekChart: React.FC<ChartProps> = ({ trades }) => {
    const data = React.useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const counts = new Array(7).fill(0);
        const percentSum = new Array(7).fill(0);
        
        trades.forEach(t => {
            const [y, m, d] = t.date.split('-').map(Number);
            const localDate = new Date(y, m - 1, d);
            const dayIdx = localDate.getDay();
            counts[dayIdx]++;
            percentSum[dayIdx] += t.pnlPercent;
        });
  
        const finalData = days.map((name, i) => ({
            name,
            avgPercent: counts[i] > 0 ? percentSum[i] / counts[i] : 0
        }));
  
        // Return Mon-Fri + others if data exists
        return finalData.filter(d => {
            if (d.name === 'Sun' || d.name === 'Sat') return d.avgPercent !== 0;
            return true;
        });
    }, [trades]);

    if (trades.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(val) => `${val.toFixed(1)}%`} />
                    <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{color: '#334155'}}
                    formatter={(val: number) => [`${val.toFixed(2)}%`, 'Avg Return']}
                />
                    <Bar dataKey="avgPercent" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avgPercent >= 0 ? '#34d399' : '#f87171'} />
                    ))}
                    </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};