"use client";

import { useEffect, useState } from 'react';
import { Shirt, Users, Clock, ArrowUpRight, Loader2 } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/performance/summary?period=daily`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
        <p className="text-slate-400 mt-1 text-sm">Real-time performance metrics and workforce status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Items Processed (Today)"
          value={stats.reduce((acc, curr) => acc + Number(curr.total_items), 0).toLocaleString()}
          icon={Shirt}
          trend="+12%"
          color="indigo"
        />
        <StatCard 
          title="Active Workers"
          value={stats.length.toString()}
          icon={Users}
          trend="Stable"
          color="emerald"
        />
        <StatCard 
          title="Avg Processing Time"
          value="4m 12s"
          icon={Clock}
          trend="-8%"
          color="purple"
        />
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Performers (Today)</h3>
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
            View All Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No performance data recorded for today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-lg">Worker Name</th>
                  <th className="px-6 py-4 font-medium">Items Processed</th>
                  <th className="px-6 py-4 font-medium text-right rounded-tr-lg">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.map((stat, i) => (
                  <tr key={stat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                        {stat.first_name[0]}{stat.last_name[0]}
                      </div>
                      <span className="font-medium text-white">{stat.first_name} {stat.last_name}</span>
                    </td>
                    <td className="px-6 py-4 text-indigo-400 font-semibold text-lg">
                      {stat.total_items}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-full max-w-[100px] bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (Number(stat.total_items) / 500) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: { title: string, value: string, icon: any, trend: string, color: 'indigo' | 'emerald' | 'purple' }) {
  const colorClasses = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-2xl transition-transform group-hover:scale-150 ${colorClasses[color].split(' ')[1]}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-xs font-medium">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <h4 className="text-slate-400 text-sm font-medium mb-1">{title}</h4>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
