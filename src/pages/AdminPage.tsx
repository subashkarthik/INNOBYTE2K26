import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, Shield, Download, Search, RefreshCw, Users, Trophy, Calendar, BarChart2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Registration } from '../types';

const ADMIN_TOKEN_KEY = 'innobyte_admin_token';

// ─── Login Screen ─────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        onLogin(data.token);
      } else {
        setError('Incorrect password. Access denied.');
      }
    } catch {
      setError('Server error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-4xl p-12 w-full max-w-md relative z-10 border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-primary to-brand-secondary rounded-t-4xl" />
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-primary/30">
            <Shield size={32} className="text-brand-primary" />
          </div>
          <img src="/Innobyte-Logo.png" alt="INNOBYTE 2K26" className="h-12 mx-auto mb-4 opacity-80" />
          <p className="text-slate-400 text-sm">Admin Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Admin Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-xl pl-11 pr-12 py-4 focus:outline-none focus:border-brand-primary/50 transition-all"
                placeholder="Enter admin password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Shield size={16} />
            )}
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-8">
          <a href="/" className="hover:text-slate-400 transition-colors">← Back to public site</a>
        </p>
      </motion.div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ token, onLogout }: { token: string; onLogout: () => void }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState({ search: '', year: '', dept: '' });
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, statsRes] = await Promise.all([
        fetch('/api/registrations', { headers }),
        fetch('/api/stats', { headers }),
      ]);
      if (regRes.status === 401) { onLogout(); return; }
      setRegistrations(await regRes.json());
      setStats(await statsRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = registrations.filter(r => {
    const search = filter.search.toLowerCase();
    return (
      (!search || r.full_name.toLowerCase().includes(search) || r.email?.toLowerCase().includes(search) || r.reg_id?.toLowerCase().includes(search)) &&
      (!filter.year || r.year === filter.year) &&
      (!filter.dept || r.department === filter.dept)
    );
  });

  const exportCSV = () => {
    const headers = ['Reg ID', 'Name', 'College', 'Dept', 'Year', 'Email', 'Phone', 'Events', 'Registered At'];
    const rows = filtered.map(r => {
      let evts = '';
      try { evts = JSON.parse(r.events_json || '[]').map((e: any) => e.name).join(' | '); } catch {}
      return [r.reg_id, r.full_name, r.college_name, r.department, r.year, r.email, r.phone, evts, r.created_at].join(',');
    });
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `innobyte2k26-registrations-${Date.now()}.csv`;
    a.click();
  };

  const handleDelete = async (regId?: string) => {
    if (!regId) return;
    if (!window.confirm(`Are you sure you want to delete registration ${regId}?`)) return;
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch {
      alert('Error connecting to server. Make sure it is running.');
    }
  };

  const statCards = [
    { label: 'Total Registered', value: stats?.total ?? '—', icon: <Users size={20} />, color: 'text-brand-primary' },
    { label: 'Events Running', value: stats?.byEvent?.length ?? '—', icon: <Trophy size={20} />, color: 'text-brand-secondary' },
    { label: 'Departments', value: stats?.byDept?.length ?? '—', icon: <BarChart2 size={20} />, color: 'text-brand-accent' },
    { label: 'Event Date', value: '27 Mar', icon: <Calendar size={20} />, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Top bar */}
      <div className="glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src="/Innobyte-Logo.png" alt="INNOBYTE 2K26" className="h-8" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchData} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-6 border border-white/5">
              <div className={`${s.color} mb-3`}>{s.icon}</div>
              <div className={`text-4xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Event Breakdown */}
        {stats?.byEvent?.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border border-white/5 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Registrations Per Event</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byEvent.map((e: any) => (
                <div key={e.event_name} className="bg-white/3 rounded-xl p-4">
                  <div className="text-2xl font-black text-gradient mb-1">{e.count}</div>
                  <div className="text-xs text-slate-400 font-medium truncate">{e.event_name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, email, reg ID..."
              value={filter.search}
              onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
              className="w-full bg-white/3 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
            />
          </div>
          <select value={filter.year} onChange={e => setFilter(p => ({ ...p, year: e.target.value }))}
            className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none">
            <option value="">All Years</option>
            {['1st','2nd','3rd','4th'].map(y => <option key={y} value={y} className="bg-[#020617]">{y} Year</option>)}
          </select>
          <select value={filter.dept} onChange={e => setFilter(p => ({ ...p, dept: e.target.value }))}
            className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none">
            <option value="">All Depts</option>
            {['CSE','ECE','EEE','MECH','CIVIL'].map(d => <option key={d} value={d} className="bg-[#020617]">{d}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-2 btn-primary whitespace-nowrap text-sm px-6">
            <Download size={14} /> Export CSV ({filtered.length})
          </button>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {['Reg ID','Name','College','Dept / Year','Email','Events','Payment','Date','Actions'].map(h => (
                    <th key={h} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${h === 'Actions' || h === 'Payment' ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    {loading ? 'Loading...' : 'No registrations found'}
                  </td></tr>
                ) : filtered.map((r, i) => {
                  let evts: any[] = [];
                  try { evts = JSON.parse(r.events_json || '[]'); } catch {}
                  return (
                    <tr key={r.id} className={`border-b border-white/5 hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                      <td className="px-6 py-4 font-mono text-brand-primary text-xs font-bold">{r.reg_id}</td>
                      <td className="px-6 py-4 font-semibold whitespace-nowrap">{r.full_name}</td>
                      <td className="px-6 py-4 text-slate-400 max-w-[160px] truncate">{r.college_name}</td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{r.department} / {r.year}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{r.email}</td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {evts.map((e: any) => (
                            <span key={e.name} className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded text-[10px] font-bold whitespace-nowrap">{e.name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.payment_screenshot ? (
                          <a 
                            href={r.payment_screenshot} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex p-2 text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-all border border-brand-secondary/20"
                            title="View Payment Proof"
                          >
                            <Eye size={16} />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[10px] uppercase font-bold">No Proof</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(r.reg_id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all border border-red-500/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]" title="Delete Registration">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Page (Router) ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  };

  return (
    <AnimatePresence mode="wait">
      {token ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dashboard token={token} onLogout={handleLogout} />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminLogin onLogin={setToken} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
