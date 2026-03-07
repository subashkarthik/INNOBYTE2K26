import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ChevronRight, 
  Menu, 
  X, 
  Mail, 
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  Download,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Send,
  Trash2,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { EVENTS, PPT_THEMES, DEPARTMENTS, YEARS } from './constants';
import { Event, Registration, SelectedEvent, LiveActivity, Year, Department } from './types';
import FAQSection from './components/FAQSection';
import SuccessScreen from './components/SuccessScreen';
import AdminPage from './pages/AdminPage';
import ParticleBackground from './components/ParticleBackground';

// --- Components ---

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200); // Slightly longer for better feel
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[140px] animate-pulse-slow" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <img src="/college-logo.png" alt="ES College" className="h-6 w-auto" />
            <span className="text-sm font-black text-white uppercase tracking-[0.4em]">ES College</span>
          </motion.div>
          <img src="/Innobyte-Logo.png" alt="Logo" className="h-16 md:h-24 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
        </div>
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-brand-primary to-transparent"
          />
        </div>
        <p className="mt-6 text-slate-500 font-display text-[10px] uppercase tracking-[0.4em] font-bold">Initializing Innovation</p>
      </motion.div>
    </motion.div>
  );
};

const LiveFeed = () => {
  const [count, setCount] = useState(0);
  const [feed, setFeed] = useState<LiveActivity[]>([]);

  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: any = null;

    const startPolling = () => {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/stats/total');
          const data = await res.json();
          if (data.success) setCount(data.total);
        } catch (_) {}
      }, 30000); // 30s
    };

    try {
      es = new EventSource('/api/events/stream');
      es.onmessage = (ev) => {
        const d = JSON.parse(ev.data) as any;
        if (d.type === 'init') setCount(d.total);
        else if (d.type === 'new_registration') {
          setCount(d.total);
          setFeed(prev => [d as LiveActivity, ...prev].slice(0, 6));
        }
      };
      es.onerror = () => {
        es?.close();
        if (!pollInterval) startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      es?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="glass-panel rounded-2xl px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live</span>
          </div>
          <span className="text-sm text-slate-400">
            <span className="text-gradient text-xl font-black">{count}</span> <span className="font-bold text-white">students registered</span>
          </span>
        </div>
        {feed.length > 0 && (
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <AnimatePresence>
              {feed.map((a, i) => (
                <motion.div
                  key={a.regId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs flex items-center gap-1.5 flex-wrap ${i === 0 ? 'text-slate-200' : 'text-slate-500'}`}
                >
                  <span className="text-brand-primary">●</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[100px]">{a.fullName}</span>
                  <span>just registered for</span>
                  <span className="text-brand-secondary font-semibold">{a.events.map(e => e.name).join(', ')}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar: React.FC<{ onAdminClick: () => void }> = ({ onAdminClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Events', href: '#events' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'Register', href: '#register' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl group-hover:border-brand-primary/50 transition-all">
            <img src="/college-logo.png" alt="ESCT" className="h-5 w-auto" />
            <div className="flex flex-col border-l border-white/10 pl-2">
              <span className="text-[10px] font-black text-white leading-tight uppercase tracking-tighter">ESCT</span>
              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest -mt-0.5">ESTD 2007</span>
            </div>
          </div>
          <img src="/Innobyte-Logo.png" alt="INNOBYTE 2K26" className="h-6 md:h-8 object-contain group-hover:drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all" />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-brand-primary transition-all hover:tracking-[0.3em]">
              {link.name}
            </a>
          ))}
          <button onClick={onAdminClick} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary/50 transition-all">
            <Users size={16} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white w-10 h-10 flex items-center justify-center glass-panel rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 glass-panel border-t border-white/10 p-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-03-27T09:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 md:gap-10">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="w-16 h-18 md:w-24 md:h-28 glass-panel rounded-2xl md:rounded-4xl flex items-center justify-center text-3xl md:text-5xl font-black text-gradient shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {String(item.value).padStart(2, '0')}
          </div>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] mt-4 text-slate-500 font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card rounded-[2.5rem] p-8 flex flex-col h-full group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all duration-700" />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${event.category === 'Technical' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-brand-accent/10 text-brand-accent border-brand-accent/20'}`}>
          {event.category}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">
          <Users size={12} />
          <span>TEAM {event.maxParticipants}</span>
        </div>
      </div>
      
      <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-brand-primary transition-colors relative z-10 leading-tight">
        {event.name}
      </h3>
      <p className="text-sm text-slate-400 mb-10 flex-grow leading-relaxed relative z-10 font-medium">
        {event.description}
      </p>
      
      <div className="space-y-8 relative z-10 mt-auto">
        <div>
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Guidelines</h4>
          <ul className="text-[11px] space-y-3 text-slate-400">
            {event.rules.slice(0, 3).map((rule, i) => (
              <li key={i} className="flex gap-3 leading-tight">
                <span className="text-brand-primary animate-pulse w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1" />
                {rule}
              </li>
            ))}
            {event.rules.length > 3 && <li className="text-[10px] text-slate-600 italic">+ more rules inside...</li>}
          </ul>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex justify-between items-center">
          <div className="space-y-1">
          </div>
          <a href="#register" className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group/link hover:bg-brand-primary hover:text-white transition-all duration-300">
            <ChevronRight size={20} className="group-hover/link:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const EventPickerCard = ({ ev, sel, onToggle, onUpdateEvt, pptTheme, setPptTheme, year, accent }: {
  key?: string;
  ev: Event; 
  sel?: SelectedEvent; 
  onToggle: () => void;
  onUpdateEvt: (k: 'teamName' | 'count', v: any) => void;
  pptTheme: string; 
  setPptTheme: (v: string) => void;
  year: string; 
  accent: string;
}) => (
  <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${sel ? (accent === 'primary' ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-brand-accent/50 bg-brand-accent/5') : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
    <button type="button" onClick={onToggle} className="w-full p-4 text-left">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-sm text-slate-200">{ev.name}</div>
        </div>
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${sel ? (accent === 'primary' ? 'bg-brand-primary border-brand-primary' : 'bg-brand-accent border-brand-accent') : 'border-white/20'}`}>
          {sel && <CheckCircle2 size={12} className="text-white" />}
        </div>
      </div>
    </button>
    {sel && (
      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden">
        {ev.maxParticipants > 1 && (
          <div className="px-4 pb-4 border-t border-white/10 pt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Team Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-primary/50 transition-all" placeholder="Optional" value={sel.teamName || ''} onChange={e => onUpdateEvt('teamName', e.target.value)} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">
                Team Size <span className="text-brand-primary lowercase tracking-normal">(Max: {ev.maxParticipants})</span>
              </label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-primary/50 transition-all" 
                value={sel.count} 
                onChange={e => {
                  const valStr = e.target.value.replace(/[^0-9]/g, '');
                  if (valStr === '') {
                    onUpdateEvt('count', '');
                  } else {
                    const num = parseInt(valStr);
                    onUpdateEvt('count', isNaN(num) ? '' : Math.min(num, ev.maxParticipants));
                  }
                }} 
              />
            </div>
          </div>
        )}
        {(ev.id === 'paper-pres-cat2' || ev.name.includes('Paper Presentation (1st Year)')) && year === '1st' && (
          <div className="px-4 pb-4">
            <label className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">PPT Theme</label>
            <select required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-primary/50 appearance-none transition-all" value={pptTheme} onChange={e => setPptTheme(e.target.value)}>
              <option value="" className="bg-[#020617]">Select theme</option>
              {PPT_THEMES.map(t => <option key={t} value={t} className="bg-[#020617]">{t}</option>)}
            </select>
          </div>
        )}
      </motion.div>
    )}
  </div>
);

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1200;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE;
            width = MAX_SIZE;
          } else {
            width = (width / height) * MAX_SIZE;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Using lower quality (0.6) for Base64 to stay within JSON limits
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
    };
  });
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    collegeName: '',
    department: 'CSE' as Department,
    year: '1st' as Year,
    email: '',
    phone: '',
    transactionId: '',
  });
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
  const [pptTheme, setPptTheme] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [regId, setRegId] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (formData.fullName.length > 0 && formData.fullName.length < 3) e.fullName = 'Name too short';
    if (formData.collegeName.length > 0 && formData.collegeName.length < 3) e.collegeName = 'College name too short';
    if (formData.email.length > 0 && !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email address';
    if (formData.phone.length > 0 && !/^\d{10}$/.test(formData.phone)) e.phone = '10-digit number required';
    if (formData.transactionId.length > 0 && !/^\d{12}$/.test(formData.transactionId)) e.transactionId = '12-digit Transaction ID required';
    if (selectedEvents.length === 0) e.events = 'Select at least one event';
    if (!formData.transactionId) e.transactionId = 'Transaction ID is required';
    if (!paymentScreenshot) e.payment = 'Upload proof of payment';
    return e;
  }, [formData, selectedEvents, paymentScreenshot]);

  const upd = (k: string, v: any) => {
    setFormData(p => ({ ...p, [k]: v }));
    setTouched(p => ({ ...p, [k]: true }));
  };

  const availableEvents = useMemo(() => EVENTS.filter(e => {
    if (!e.years.includes(formData.year)) return false;
    if (formData.department === 'ECE' && e.id === 'code-cracking') return false;
    if (formData.department !== 'ECE' && e.id === 'circuit-cracking') return false;
    return true;
  }), [formData.year, formData.department]);

  const toggleEvent = (ev: Event) => {
    setSelectedEvents(prev => {
      if (prev.find(e => e.name === ev.name)) return prev.filter(e => e.name !== ev.name);
      return [...prev, { name: ev.name, teamName: '', count: '' }];
    });
  };

  const updEvt = (name: string, k: 'teamName' | 'count', v: any) =>
    setSelectedEvents(prev => prev.map(e => e.name === name ? { ...e, [k]: v } : e));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvents.length === 0) { alert('Please select at least one event.'); return; }
    setStatus('loading');
    setErrMsg('');
    try {
      const eventsToSend = selectedEvents.map(ev =>
        ev.name.includes('Paper Presentation') && formData.year === '1st' 
          ? { ...ev, name: `Paper Presentation (1st Year) (${pptTheme})`, pptTheme } 
          : ev
      );
      
      let paymentScreenshotBase64 = '';
      if (paymentScreenshot) {
        paymentScreenshotBase64 = await compressImage(paymentScreenshot);
      }

      const res = await fetch('/api/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          events: JSON.stringify(eventsToSend),
          paymentScreenshot: paymentScreenshotBase64
        }) 
      });
      
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response:", text);
        const snippet = text.length > 100 ? text.substring(0, 100) + "..." : text;
        throw new Error(`Server returned non-JSON response: ${snippet}`);
      }

      if (result.success) { 
        setRegId(result.regId); 
        setStatus('success'); 
      } else { 
        setStatus('error'); 
        setErrMsg(result.message || 'Server returned an error.'); 
        alert("Registration failed: " + (result.message || "Unknown error")); 
      }
    } catch (error: any) { 
      setStatus('error'); 
      setErrMsg(error.message || 'Network error.'); 
      alert("Registration crashed: " + (error.message || "Network error")); 
    }
  };

  if (status === 'success') {
    // We need to pass the enriched eventsToSend to the SuccessScreen, not the original selectedEvents
    const enrichedEvents = selectedEvents.map(ev =>
      ev.name.includes('Paper Presentation') && formData.year === '1st'
        ? { ...ev, name: `Paper Presentation (1st Year) (${pptTheme})`, pptTheme }
        : ev
    );

    return (
      <SuccessScreen
        regId={regId}
        fullName={formData.fullName}
        collegeName={formData.collegeName}
        department={formData.department}
        year={formData.year}
        email={formData.email}
        transactionId={formData.transactionId}
        selectedEvents={enrichedEvents}
        onReset={() => { setStatus('idle'); setSelectedEvents([]); window.scrollTo({top: 0, behavior: 'smooth'}); }}
      />
    );
  }

  const inputCls = (key: string) => `w-full bg-white/3 border ${touched[key] && errors[key] ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-brand-primary/50'} rounded-2xl px-6 py-4.5 text-sm focus:outline-none focus:bg-white/5 transition-all placeholder:text-slate-600 font-medium`;

  const ValidationError = ({ name }: { name: string }) => touched[name] && errors[name] ? (
    <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2 block ml-2">
      {errors[name]}
    </motion.span>
  ) : null;

  return (
    <motion.div 
      id="register"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="glass-panel rounded-4xl p-8 md:p-20 max-w-6xl mx-auto relative overflow-hidden my-32"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
      <form onSubmit={handleSubmit} className="space-y-12 relative z-10">

        {/* 01 Personal Info */}
        <div>
          <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
            <span className="w-8 h-8 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center text-sm font-black">01</span>
            Personal Information
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Full Name</label>
              <input required type="text" className={inputCls('fullName')} placeholder="Enter your full name" value={formData.fullName} onChange={e => upd('fullName', e.target.value)} />
              <ValidationError name="fullName" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">College Name</label>
              <input required type="text" className={inputCls('collegeName')} placeholder="Your institution name" value={formData.collegeName} onChange={e => upd('collegeName', e.target.value)} />
              <ValidationError name="collegeName" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Department</label>
              <select className={`${inputCls('department')} appearance-none`} value={formData.department} onChange={e => { upd('department', e.target.value); setSelectedEvents([]); }}>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#020617]">{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Current Year</label>
              <select className={`${inputCls('year')} appearance-none`} value={formData.year} onChange={e => { upd('year', e.target.value); setSelectedEvents([]); }}>
                {YEARS.map(y => <option key={y} value={y} className="bg-[#020617]">{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Email Address</label>
              <input required type="email" className={inputCls('email')} placeholder="name@example.com" value={formData.email} onChange={e => upd('email', e.target.value)} />
              <ValidationError name="email" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Phone Number</label>
              <input required type="tel" className={inputCls('phone')} placeholder="10-digit number" value={formData.phone} onChange={e => upd('phone', e.target.value)} />
              <ValidationError name="phone" />
            </div>
          </div>
        </div>

        {/* 02 Event Selection */}
        <div>
          <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center text-sm font-black">02</span>
            Choose Your Events
            {selectedEvents.length > 0 && (
              <span className="ml-auto text-xs bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full font-bold">
                {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
              </span>
            )}
          </h3>
          <p className="text-slate-500 text-xs mb-8 ml-11">Pick any number of events filtered for your year &amp; department.</p>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary whitespace-nowrap">Technical</span>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableEvents.filter(e => e.category === 'Technical').map(ev => (
                <EventPickerCard key={ev.id} ev={ev} sel={selectedEvents.find(s => s.name === ev.name)}
                  onToggle={() => toggleEvent(ev)} onUpdateEvt={(k, v) => updEvt(ev.name, k, v)}
                  pptTheme={pptTheme} setPptTheme={setPptTheme} year={formData.year} accent="primary" />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent whitespace-nowrap">Non-Technical</span>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableEvents.filter(e => e.category === 'Non-Technical').map(ev => (
                <EventPickerCard key={ev.id} ev={ev} sel={selectedEvents.find(s => s.name === ev.name)}
                  onToggle={() => toggleEvent(ev)} onUpdateEvt={(k, v) => updEvt(ev.name, k, v)}
                  pptTheme={pptTheme} setPptTheme={setPptTheme} year={formData.year} accent="accent" />
              ))}
            </div>
          </div>
        </div>

        {/* 03 Payment */}
        <div className="pt-12 border-t border-white/10">
          <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
            <span className="w-8 h-8 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center text-sm font-black">03</span>
            Payment Confirmation
          </h3>
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/10">
            <div className="text-center lg:text-left">
              <p className="text-sm font-bold mb-6 text-slate-300">Scan to Pay (Registration Fee: ₹200 PER MEMBER)</p>
              <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-2xl">
                <img src="/qr.jpeg" alt="Payment QR Code" className="w-48 h-48" />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Transaction ID (12 Digits)</label>
                <input 
                  required 
                  type="text" 
                  maxLength={12}
                  className={inputCls('transactionId')} 
                  placeholder="Enter 12-digit ID" 
                  value={formData.transactionId} 
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    upd('transactionId', val);
                  }} 
                />
                <ValidationError name="transactionId" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Upload Transaction Proof</label>
              <div className="relative group">
                <input required type="file" accept="image/*" onChange={e => { setPaymentScreenshot(e.target.files?.[0] || null); setTouched(p => ({ ...p, payment: true })); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 ${paymentScreenshot ? 'border-green-500/50 bg-green-500/5' : touched.payment && errors.payment ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/[0.03] group-hover:border-brand-primary/50 group-hover:bg-brand-primary/5'}`}>
                  {paymentScreenshot ? (
                    <>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="text-green-500" /></div>
                      <span className="text-sm font-bold text-green-500">{paymentScreenshot.name}</span>
                      <span className="text-[10px] text-green-500/50 mt-1 uppercase tracking-widest">Ready to submit</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Download className="text-slate-500 group-hover:text-brand-primary transition-colors" /></div>
                      <span className="text-sm font-medium text-slate-400">Click or drag screenshot here</span>
                      <span className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">Supports JPG, PNG</span>
                    </>
                  )}
                </div>
                <ValidationError name="payment" />
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-7xl mx-auto glass-panel p-6 md:p-10 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-10 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 text-slate-500 text-sm bg-white/[0.03] px-6 py-3 rounded-full border border-white/5">
            <AlertCircle size={16} className="text-brand-accent" />
            <span>Registration closes on <span className="text-slate-300 font-bold">25 March 2026</span></span>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            {status === 'error' && <span className="text-red-400 text-sm font-bold">{errMsg}</span>}
            <button type="submit" disabled={status === 'loading' || selectedEvents.length === 0}
              className="btn-primary w-full md:w-auto min-w-[240px] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'loading' ? 'Processing...' : `Submit Registration${selectedEvents.length > 0 ? ` (${selectedEvents.length})` : ''}`}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
// --- Main App ---

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      <ParticleBackground />
      <div className="relative z-10">
        <AnimatePresence>
          {isLoading && <SplashScreen onComplete={() => setIsLoading(false)} />}
        </AnimatePresence>

      <Navbar onAdminClick={() => window.location.href = '/admin'} />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-brand-primary/10 rounded-full blur-[160px] animate-pulse-slow pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-6xl mx-auto"
        >
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex items-center gap-4 mb-4 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md"
            >
              <img src="/college-logo.png" alt="ES Logo" className="h-6 w-auto" />
              <span className="text-xs md:text-sm font-black text-white uppercase tracking-[0.3em]">ES College of Engineering and Technology</span>
            </motion.div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary animate-float">
              A National Level Technical Symposium
            </div>
          </div>
          
          <img
            src="/Innobyte-Logo.png"
            alt="INNOBYTE 2K26"
            className="w-full max-w-[1000px] mx-auto mb-10 drop-shadow-[0_0_80px_rgba(139,92,246,0.5)] hover:drop-shadow-[0_0_100px_rgba(139,92,246,0.8)] transition-all duration-700 select-none"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-3xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight"
          >
            "Innovate <span className="text-white">💡</span> • Implement <span className="text-white">🖥️</span> • Inspire <span className="text-white">✨</span>"
          </motion.p>
          
          <div className="flex flex-col items-center gap-20">
            <Countdown />
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <a href="#register" className="btn-primary group">
                <span className="flex items-center gap-2 uppercase tracking-[0.2em] font-black">
                  Secure Your Spot <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              <div className="flex items-center gap-5 px-10 py-5 glass-panel rounded-2xl border border-white/10 group hover:border-brand-primary/50 transition-all">
                <Calendar className="text-brand-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 block">Event Date</span>
                  <span className="font-black text-white text-lg tracking-tight">27 March 2026</span>
                </div>
              </div>
            </div>
            
            <LiveFeed />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-48 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-32 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-brand-primary/50" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-brand-primary font-black">About The Event</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-10 text-white leading-[1.1] tracking-tight">
              Igniting the <span className="text-gradient">Future</span> of Technology
            </h2>
            <div className="space-y-10 text-slate-400 text-lg leading-relaxed font-medium">
              <p>
                INNOBYTE2K26 is the premier flagship technical symposium organized by ES College of Engineering and Technology. 
              </p>
              <p>
                We bridge the gap between imagination and reality. From lightning-fast coding challenges to groundbreaking paper presentations, INNOBYTE is designed to push your limits.
              </p>

            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="aspect-4/5 glass-panel rounded-4xl overflow-hidden relative z-10 p-5 group">
              <div className="absolute inset-0 bg-brand-primary/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
              <img 
                src="/Penquin.jpeg" 
                alt="Tech Symposium" 
                className="w-full h-full object-cover rounded-[3rem] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Artistic Decorations */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/30 rounded-full blur-[80px] animate-pulse-slow" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-700" />
            <div className="absolute inset-0 border-2 border-brand-primary/20 rounded-[4rem] translate-x-8 translate-y-8 -z-0" />
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-48 px-6 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[120px] -ml-32 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tight">
              Explore <span className="text-gradient">Events</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
              A curated selection of technical and creative challenges tailored specifically for your academic year.
            </p>
          </motion.div>

          {/* Category 1: 2nd, 3rd, 4th Year */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-40"
          >
            <div className="flex items-center gap-8 mb-16">
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand-primary whitespace-nowrap bg-brand-primary/10 px-4 py-2 rounded-lg border border-brand-primary/20">
                Senior Category (2nd - 4th Year)
              </h3>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {EVENTS.filter(e => e.years.includes('2nd') && e.category === 'Technical').map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Category 2: 1st Year */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-40"
          >
            <div className="flex items-center gap-8 mb-16">
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand-accent whitespace-nowrap bg-brand-accent/10 px-4 py-2 rounded-lg border border-brand-accent/20">
                Junior Category (1st Year)
              </h3>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {EVENTS.filter(e => e.years.length === 1 && e.years[0] === '1st' && e.category === 'Technical').map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Non-Technical Events */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-8 mb-16">
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 whitespace-nowrap bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                Open Showcase (Non-Technical)
              </h3>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {EVENTS.filter(e => e.category === 'Non-Technical').map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-48 px-6 max-w-5xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[120px] -mr-32 pointer-events-none" />
        
        <div className="text-center mb-32">
          <h2 className="text-5xl md:text-7xl font-black mb-10 text-white tracking-tight">
            Event <span className="text-gradient">Timeline</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Precisely orchestrated sequences for a day of absolute innovation.
          </p>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto relative">
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px bg-white/5 md:-translate-x-1/2" />
          
          {[
            { time: '08:30 AM', title: 'Registration & Kit Distribution', icon: <Users size={18} />, color: 'primary' },
            { time: '09:30 AM', title: 'Grand Inauguration Ceremony', icon: <ChevronRight size={18} />, color: 'secondary' },
            { time: '10:30 AM', title: 'Technical Battles - Phase I', icon: <ChevronRight size={18} />, color: 'primary' },
            { time: '12:30 PM', title: 'Strategic Network (Lunch)', icon: <Clock size={18} />, color: 'accent' },
            { time: '01:30 PM', title: 'Creative Challenges & Phase II', icon: <ChevronRight size={18} />, color: 'primary' },
            { time: '03:45 PM', title: 'Grand Valedictory Ceremony', icon: <ChevronRight size={18} />, color: 'secondary' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`flex items-center gap-8 md:gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 hidden md:block" />
              <div className={`z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-4 border-[#020617] shadow-2xl ${item.color === 'primary' ? 'bg-brand-primary text-white' : item.color === 'secondary' ? 'bg-brand-secondary text-white' : 'bg-brand-accent text-white'}`}>
                {item.icon}
              </div>
              <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${item.color === 'primary' ? 'text-brand-primary' : item.color === 'secondary' ? 'text-brand-secondary' : 'text-brand-accent'}`}>
                  {item.time}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors leading-tight">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">Secure Your <span className="text-gradient">Spot</span></h2>
            <p className="text-slate-400 text-lg">Join 1000+ students in the ultimate technical showdown.</p>
          </div>
          <RegistrationForm />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24">
          <div>
            <h2 className="text-5xl md:text-6xl font-black mb-12 text-white leading-tight">Get in <span className="text-gradient">Touch</span></h2>
            <div className="space-y-10">
            <div className="space-y-12">
              {/* Institutional Leadership */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-brand-primary border border-white/10 shrink-0"><Users size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Principal</h4>
                    <p className="text-slate-400 text-sm">Dr. K. Indira</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-brand-primary border border-white/10 shrink-0"><Users size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">HOD / CSE</h4>
                    <p className="text-slate-400 text-sm">Mrs. J. Chandraleka</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-brand-primary border border-white/10 shrink-0"><Users size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">HOD / ECE</h4>
                    <p className="text-slate-400 text-sm">Mr. A. Arunagiri</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-brand-primary border border-white/10 shrink-0"><Users size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">HOD / S&H</h4>
                    <p className="text-slate-400 text-sm">Mr. A. Selvam</p>
                  </div>
                </div>
              </div>

              {/* Staff Coordinators */}
              <div>
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                  Staff Coordinators <div className="h-px grow bg-brand-primary/20" />
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { name: 'Mr. A. Anand Babu', dept: 'CSE', phone: '7418753739' },
                    { name: 'Mrs. M. Pradeepa', dept: 'ECE', phone: '9894694677' },
                    { name: 'Mr. G. Sabapathi', dept: 'S&H', phone: '9047941802' }
                  ].map(staff => (
                    <div key={staff.phone} className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all group">
                      <div>
                        <p className="text-sm font-bold text-slate-200">{staff.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{staff.dept}</p>
                      </div>
                      <a href={`tel:${staff.phone}`} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-all">
                        <Phone size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Coordinators */}
              <div>
                <h3 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                  Student Coordinators <div className="h-px grow bg-brand-secondary/20" />
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'D. Santhagiri', phone: '9597846484' },
                    { name: 'K. Subash', phone: '8680065944' },
                    { name: 'K. Kishore', phone: '6379807387' },
                    { name: 'S. Rajesh', phone: '9342768855' },
                    { name: 'S. Fakrudeen', phone: '8608382856' }
                  ].map(student => (
                    <div key={student.name} className="flex items-center justify-between p-3 glass-panel rounded-xl border border-white/5 hover:border-brand-secondary/30 transition-all group">
                      <p className="text-xs font-bold text-slate-300">{student.name}</p>
                      <a href={`tel:${student.phone}`} className="text-[10px] font-mono text-slate-500 group-hover:text-brand-secondary transition-colors">
                        {student.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="glass-panel rounded-[3rem] overflow-hidden h-[500px] border border-white/10 p-4">
            <iframe
              src="https://maps.google.com/maps?q=ES%20College%20of%20Engineering%20and%20Technology,%20NH%2045,%20Villupuram&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" height="100%" style={{ border: 0 }} className="rounded-[2rem]"
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-12 py-10 rounded-full backdrop-blur-md">
              <img src="/college-logo.png" alt="ES Logo" className="h-5 w-auto" />
              <span className="text-xs font-black text-white uppercase tracking-[0.4em]">ES College of Engineering and Technology</span>
            </div>
            <img src="/Innobyte-Logo.png" alt="INNOBYTE2K26" className="h-14 opacity-80" />
          </div>
          <p className="text-slate-500 text-sm mb-6">© 2026 ES College of Engineering and Technology. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-slate-500 mb-10">
            {['about','events','schedule','register','faq','contact'].map(id => (
              <a key={id} href={`#${id}`} className="hover:text-brand-primary transition-colors text-xs uppercase tracking-widest font-bold capitalize">{id}</a>
            ))}
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mx-auto flex items-center gap-2 text-xs text-slate-500 hover:text-brand-primary transition-colors group"
          >
            <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" /> Back to top
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}

// ─── Main App (Router) ────────────────────────────────────────────────────────
export default function App() {
  const path = window.location.pathname.toLowerCase();
  const isAdmin = path === '/admin' || path === '/admin/';
  
  if (isAdmin) return <AdminPage />;
  return <HomePage />;
}
