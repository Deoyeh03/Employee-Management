"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Plus, Loader2, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState('Jun 1 - Jun 7, 2026');
  const [shifts, setShifts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newShift, setNewShift] = useState({ employeeId: '', type: 'Morning Shift', day: 'Monday', time: '08:00 AM - 04:00 PM' });

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/shifts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.filter((e: any) => e.status === 'Active'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchEmployees();

    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001');
    socket.on('dashboard_update', (event) => {
      if (event.type === 'shifts_updated') fetchShifts();
      if (event.type === 'employee_created' || event.type === 'employee_status_changed') fetchEmployees();
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/shifts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newShift)
      });
      if (res.ok) {
        setShowModal(false);
      } else {
        alert('Failed to add shift');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6 relative h-full flex flex-col pb-10">
      
      {/* Background cyber glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 border-b border-cyan-500/20 pb-6">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 tracking-tighter uppercase drop-shadow-sm">Shift Schedule</h2>
          <p className="text-cyan-400/60 mt-1 text-sm font-medium tracking-widest uppercase">Grid Operations Management ///</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0f1115]/80 backdrop-blur-md rounded-lg p-1 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <button className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-md transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-mono font-bold text-white px-3 tracking-widest uppercase">{currentWeek}</span>
            <button className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-md transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 border-none shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Plus className="w-4 h-4" />
            <span className="font-bold tracking-widest uppercase text-xs">Assign Shift</span>
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.05)] flex flex-col min-h-[500px] relative z-10">
        <div className="grid grid-cols-5 border-b border-white/5 bg-white/5 backdrop-blur-sm">
          {days.map(day => (
            <div key={day} className="px-4 py-4 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 text-center border-r border-white/5 last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-5 relative">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
               <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
             </div>
          ) : null}

          {days.map(day => (
            <div key={day} className="p-3 border-r border-white/5 last:border-0 space-y-3 bg-[#0f1115]/30">
              {shifts.filter(s => s.day === day).map(shift => (
                <div key={shift.id} className="bg-black/60 border border-white/10 p-3 rounded-xl hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                      shift.type.includes('Morning') ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' : 
                      shift.type.includes('Evening') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {shift.type}
                    </span>
                  </div>
                  
                  <div className="font-bold text-white text-sm mb-1.5 flex items-center gap-2">
                    <User className="w-3 h-3 text-cyan-500" />
                    {shift.first_name} {shift.last_name}
                  </div>
                  
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <Clock className="w-3 h-3 text-fuchsia-500" />
                    {shift.time}
                  </div>
                </div>
              ))}
              
              {shifts.filter(s => s.day === day).length === 0 && (
                <div className="h-full min-h-[100px] flex items-center justify-center">
                  <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest border border-dashed border-slate-700/50 px-3 py-1.5 rounded bg-black/20">No Shifts</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in p-4">
          <div className="bg-[#0f1115] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Assign New Shift</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddShift} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">Operator</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={newShift.employeeId}
                  onChange={e => setNewShift({...newShift, employeeId: e.target.value})}
                  required
                >
                  <option value="">Select Operator</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">Shift Type</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={newShift.type}
                  onChange={e => setNewShift({...newShift, type: e.target.value})}
                >
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Mid Shift">Mid Shift</option>
                  <option value="Opening Shift">Opening Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">Day</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={newShift.day}
                  onChange={e => setNewShift({...newShift, day: e.target.value})}
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">Time Window</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={newShift.time}
                  onChange={e => setNewShift({...newShift, time: e.target.value})}
                  placeholder="08:00 AM - 04:00 PM"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-lg text-white font-bold text-xs uppercase tracking-widest hover:from-cyan-400 hover:to-indigo-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
