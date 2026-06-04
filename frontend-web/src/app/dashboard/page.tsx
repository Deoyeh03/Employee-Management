"use client";

import { useEffect, useState } from 'react';
import { Shirt, Users, Clock, Activity, Zap, Loader2, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalItems: 0,
    activeWorkers: 0,
    avgProcessingTime: '0m 0s',
    topPerformers: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Setup Socket.io connection
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001');

    socket.on('connect', () => {
      setIsLive(true);
    });

    socket.on('disconnect', () => {
      setIsLive(false);
    });

    // Listen for backend broadcast events
    socket.on('dashboard_update', () => {
      // Trigger a soft refresh of the stats
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-500/20 pb-6 relative">
        <div className="absolute -left-10 top-0 w-32 h-32 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 tracking-tighter drop-shadow-sm uppercase">
            Command Center
          </h2>
          <p className="text-cyan-400/60 mt-1 text-sm font-medium tracking-widest uppercase flex items-center gap-2">
            System Overview <span className="text-slate-600">///</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0f1115]/80 p-2 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/5">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isLive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-bold tracking-widest uppercase ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isLive ? 'Live Sync' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Processed"
          value={stats.totalItems.toLocaleString()}
          icon={Shirt}
          color="cyan"
          subtitle="Items Today"
        />
        <StatCard 
          title="Active Personnel"
          value={stats.activeWorkers.toString()}
          icon={Users}
          color="fuchsia"
          subtitle="Currently Clocked In"
        />
        <StatCard 
          title="Avg Cycle Time"
          value={stats.avgProcessingTime}
          icon={Clock}
          color="indigo"
          subtitle="Clock In to Log"
        />
      </div>

      <div className="relative rounded-2xl border border-fuchsia-500/20 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(217,70,239,0.05)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500" />
        
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-fuchsia-400" />
              <h3 className="text-xl font-bold text-white tracking-tight uppercase">Top Operators</h3>
            </div>
            <button onClick={fetchStats} className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-all group">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <div className="w-12 h-12 rounded-full border-2 border-fuchsia-500/20 border-b-fuchsia-400 animate-spin absolute inset-0 animation-delay-150" />
              </div>
            </div>
          ) : stats.topPerformers.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/30">
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No telemetry data recorded for today cycle.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.topPerformers.map((performer, i) => (
                <div key={i} className="group relative flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
                  
                  {/* Cyberpunk background hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-black border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                      0{i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-wide">{performer.name}</p>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{performer.role}</p>
                    </div>
                  </div>

                  <div className="relative z-10 text-right">
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-fuchsia-400 to-cyan-400">
                      {performer.items}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Units Processed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string, value: string, icon: any, color: 'cyan' | 'fuchsia' | 'indigo', subtitle: string }) {
  const colorStyles = {
    cyan: {
      bg: 'bg-cyan-950/30',
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      text: 'text-cyan-400',
      glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
      iconBg: 'bg-cyan-500/10'
    },
    fuchsia: {
      bg: 'bg-fuchsia-950/30',
      border: 'border-fuchsia-500/30 hover:border-fuchsia-400/60',
      text: 'text-fuchsia-400',
      glow: 'group-hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]',
      iconBg: 'bg-fuchsia-500/10'
    },
    indigo: {
      bg: 'bg-indigo-950/30',
      border: 'border-indigo-500/30 hover:border-indigo-400/60',
      text: 'text-indigo-400',
      glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
      iconBg: 'bg-indigo-500/10'
    }
  };

  const style = colorStyles[color];

  return (
    <div className={`relative flex flex-col p-6 rounded-2xl border ${style.bg} ${style.border} transition-all duration-300 group overflow-hidden ${style.glow}`}>
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-20 blur-3xl transition-transform group-hover:scale-150 ${style.iconBg.replace('/10', '')}`} />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-xl border border-white/5 ${style.iconBg} backdrop-blur-sm`}>
          <Icon className={`w-6 h-6 ${style.text}`} />
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/5">
          {subtitle}
        </div>
      </div>
      
      <div className="relative z-10 mt-auto">
        <h4 className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">{title}</h4>
        <p className="text-4xl font-black text-white tracking-tighter drop-shadow-md">{value}</p>
      </div>
    </div>
  );
}
