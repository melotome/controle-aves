
import React, { useState, useMemo } from 'react';
import { EggRecord } from '../types';
import { StatCard } from './StatCard';
import { Bird, Egg, TrendingDown, Scale, BarChart3, PieChart, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  records: EggRecord[];
}

type ChartMetric = 'postureRate' | 'lossRate' | 'totalFeed';

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const [metric, setMetric] = useState<ChartMetric>('postureRate');

  const stats = useMemo(() => {
    if (records.length === 0) return { birds: 0, production: 0, loss: 0, feed: 0 };
    
    const latest = records[0];
    const avgPosture = records.reduce((acc, r) => acc + r.postureRate, 0) / records.length;
    const avgLoss = records.reduce((acc, r) => acc + r.lossRate, 0) / records.length;
    const totalFeed = records.reduce((acc, r) => acc + r.totalFeed, 0);

    return {
      birds: latest.birdCount,
      production: avgPosture,
      loss: avgLoss,
      feed: totalFeed
    };
  }, [records]);

  const chartData = useMemo(() => {
    return [...records].reverse().map(r => ({
      date: r.date,
      postureRate: parseFloat(r.postureRate.toFixed(2)),
      lossRate: parseFloat(r.lossRate.toFixed(2)),
      totalFeed: parseFloat(r.totalFeed.toFixed(2))
    }));
  }, [records]);

  const metricConfig = {
    postureRate: { label: 'Produção (%)', color: '#16a34a', icon: <Activity className="w-5 h-5" /> },
    lossRate: { label: 'Perdas (%)', color: '#ef4444', icon: <TrendingDown className="w-5 h-5" /> },
    totalFeed: { label: 'Ração (kg)', color: '#2563eb', icon: <Scale className="w-5 h-5" /> }
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Plantel Atual" 
          value={`${stats.birds} aves`} 
          icon={<Bird />} 
          color="bg-green-600" 
        />
        <StatCard 
          label="Média de Produção" 
          value={`${stats.production.toFixed(1)}%`} 
          icon={<Egg />} 
          color="bg-blue-600" 
        />
        <StatCard 
          label="Média de Perdas" 
          value={`${stats.loss.toFixed(2)}%`} 
          icon={<TrendingDown />} 
          color="bg-red-600" 
        />
        <StatCard 
          label="Total Ração" 
          value={`${stats.feed.toFixed(1)} kg`} 
          icon={<Scale />} 
          color="bg-amber-600" 
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tendências do Plantel</h2>
            <p className="text-sm text-slate-500">Visualização de performance histórica</p>
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
            {(Object.keys(metricConfig) as ChartMetric[]).map((key) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`
                  flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                  ${metric === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                {metricConfig[key].icon}
                {metricConfig[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] sm:h-[400px] w-full">
          {records.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig[metric].color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricConfig[metric].color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={metric} 
                  stroke={metricConfig[metric].color} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
              <p>Nenhum dado para exibir no gráfico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
