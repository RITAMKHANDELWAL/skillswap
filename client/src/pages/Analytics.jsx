import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Calendar,
  Hourglass
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/analytics/dashboard');
        setData(res.data.analytics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Auditing ledger...</span>
      </div>
    );
  }

  // Format Recharts data based on transactions
  let currentCreditRunningTotal = data?.credits || 20;
  const creditData = data?.recentTransactions?.map(tx => {
    return {
      date: new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      amount: tx.amount,
      type: tx.type,
      description: tx.description
    };
  }) || [];

  // Weekly hours structure
  const hoursSummaryData = [
    { name: 'Learned (Hrs)', hours: data?.hoursLearned || 0, fill: '#6366F1' },
    { name: 'Taught (Hrs)', hours: data?.hoursTaught || 0, fill: '#A855F7' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-white flex items-center gap-2">
          <TrendingUp className="text-indigo-400" />
          <span>Progress & Analytics</span>
        </h1>
        <p className="text-sm text-slate-400">Track credit audits, transaction ledgers, and learning/teaching volumes.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Coins size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Available Credits</span>
            <h3 className="font-display font-bold text-xl text-white mt-1">{data?.credits || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Hours Learned</span>
            <h3 className="font-display font-bold text-xl text-white mt-1">{data?.hoursLearned?.toFixed(1) || 0.0} hrs</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
            <Hourglass size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Hours Taught</span>
            <h3 className="font-display font-bold text-xl text-white mt-1">{data?.hoursTaught?.toFixed(1) || 0.0} hrs</h3>
          </div>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit History Area Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4 shadow-glass">
          <h3 className="font-display font-bold text-sm text-slate-200">Recent Credit Transactions</h3>
          {creditData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={creditData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)' }} 
                    labelStyle={{ color: '#94a3b8', fontSize: '10px' }} 
                    itemStyle={{ fontSize: '11px', color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366F1" fillOpacity={0.15} fill="url(#colorCredits)" />
                  <defs>
                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Volume hours chart */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl space-y-4 shadow-glass">
          <h3 className="font-display font-bold text-sm text-slate-200">Activity Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)' }} 
                  itemStyle={{ fontSize: '11px', color: '#e2e8f0' }}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider">Transaction Ledger</h3>
        <div className="glass-panel rounded-2xl overflow-hidden shadow-glass border border-brand-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-400">
              <thead className="bg-slate-900/60 text-slate-200 uppercase tracking-wider text-[10px] border-b border-brand-border">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {data?.recentTransactions?.map((tx, idx) => (
                  <tr key={tx._id || idx} className="hover:bg-slate-800/10 transition">
                    <td className="px-5 py-3.5 text-slate-500 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-300">
                      {tx.description}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.type === 'earn' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        tx.type === 'spend' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-bold text-sm ${
                      tx.type === 'spend' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {tx.type === 'spend' ? '-' : '+'}{tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
