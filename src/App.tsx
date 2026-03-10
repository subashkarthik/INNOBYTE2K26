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
            className="w-full max-w-sm px-4"
          >
            <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden">
              <img src="/ES%20Eng%20Clg.png" alt="ES College" className="w-full h-auto" />
            </div>
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
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-white/95 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:bg-white overflow-hidden">
            <img src="/ES%20Eng%20Clg.png" alt="ESCT" className="h-6 md:h-8 lg:h-10 w-auto" />
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
    <div className="flex items-center justify-between gap-1 sm:gap-3 md:gap-4 lg:gap-5 w-full bg-slate-900/60 backdrop-blur-2xl px-3 py-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative group">
      <div className="absolute inset-0 bg-linear-to-r from-brand-primary/10 via-transparent to-brand-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem] md:rounded-[3rem]" />
      {[
        { label: 'Days', value: timeLeft.days, color: 'text-brand-primary' },
        { label: 'Hours', value: timeLeft.hours, color: 'text-brand-secondary' },
        { label: 'Mins', value: timeLeft.minutes, color: 'text-brand-accent' },
        { label: 'Secs', value: timeLeft.seconds, color: 'text-emerald-400' },
      ].map((item, idx) => (
        <React.Fragment key={item.label}>
          <div className="flex flex-col items-center flex-1 max-w-[4.5rem] sm:max-w-[5rem] lg:max-w-[6rem] relative z-10 shrink-0">
            <div className="h-16 sm:h-20 lg:h-24 w-full flex items-center justify-center relative overflow-hidden mb-2 bg-white/[0.04] rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={item.value}
                  initial={{ y: 50, opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
                  animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ y: -50, opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-linear-to-b from-white to-white/40 tracking-tighter"
                >
                  {String(item.value).padStart(2, '0')}
                </motion.div>
              </AnimatePresence>
            </div>
            <span className={`text-[8px] sm:text-[9px] lg:text-[11px] uppercase tracking-[0.2em] lg:tracking-[0.3em] mt-1 font-black ${item.color} drop-shadow-[0_0_10px_currentColor] opacity-90`}>{item.label}</span>
          </div>
          {idx < 3 && (
            <div className="flex flex-col justify-center pb-6 sm:pb-8 relative z-10 shrink-0 mx-[-0.25rem] sm:mx-0">
              <span className="text-xl sm:text-2xl lg:text-3xl text-white/20 font-black relative top-0.5 sm:top-1">:</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const EventsCarousel: React.FC<{ events: Event[], side: 'left' | 'right' }> = ({ events, side }) => {
  const [activeId, setActiveId] = useState<string>(events[0]?.id);

  return (
    <div className="flex h-[450px] md:h-[550px] gap-2 md:gap-4 w-full px-2 md:px-0 mt-8">
      {events.map((event) => {
        const isActive = activeId === event.id;
        
        return (
          <motion.div
            key={event.id}
            layout
            onClick={() => setActiveId(event.id)}
            onMouseEnter={() => setActiveId(event.id)}
            className={`relative rounded-3xl md:rounded-[2.5rem] overflow-hidden cursor-pointer shrink-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? 'grow min-w-[280px] md:min-w-[500px]' : 'w-16 md:w-24 bg-slate-900/40 border border-white/5 hover:bg-slate-800/60'}`}
          >
            {/* Background Image / Overlay */}
            {isActive && event.image ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover scale-105"
                />
                <div className={`absolute inset-0 bg-linear-to-t ${event.category === 'Technical' ? 'from-slate-950 via-slate-950/80 to-brand-primary/20' : 'from-slate-950 via-slate-950/80 to-brand-accent/20'}`} />
              </motion.div>
            ) : null}

            {/* Collapsed State Content */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center h-full w-full opacity-50 hover:opacity-100 transition-opacity">
                  <span 
                    className="whitespace-nowrap font-bold text-white tracking-[0.2em] uppercase text-xs sm:text-sm origin-center" 
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {event.name}
                  </span>
                </div>
              </div>
            )}

            {/* Expanded State Content */}
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end z-10"
              >
                <div className={`self-start mb-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border backdrop-blur-md ${event.category === 'Technical' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/30' : 'bg-brand-accent/20 text-brand-accent border-brand-accent/30'}`}>
                  {event.category}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight drop-shadow-lg">
                  {event.name}
                </h3>
                
                <p className="text-slate-200 text-sm md:text-base mb-6 max-w-lg leading-relaxed drop-shadow-md">
                  {event.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <Users size={16} className="text-brand-primary" />
                    <span className="text-xs font-bold text-white">Max <span className="text-brand-primary">{event.maxParticipants}</span></span>
                  </div>
                  <div className="flex gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    {event.years.map(year => (
                      <span key={year} className="text-[10px] uppercase font-black tracking-wider text-slate-300">{year} Year</span>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 mb-3">
                    <span className="w-4 h-4 rounded bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                      <CheckCircle2 size={10} />
                    </span>
                    Guidelines
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {event.rules.map((rule, idx) => (
                      <div key={idx} className="flex gap-3 text-xs text-slate-300">
                        <span className="text-brand-primary font-bold shrink-0 mt-0.5">•</span>
                        <span className="leading-tight">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
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
  <motion.div 
    layout 
    className={`rounded-[2rem] border transition-all duration-300 overflow-hidden relative group ${sel ? (accent === 'primary' ? 'border-brand-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-brand-primary/10' : 'border-brand-accent/50 shadow-[0_0_30px_rgba(244,63,94,0.15)] bg-brand-accent/10') : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'}`}
  >
    {sel && <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${(accent === 'primary' ? 'from-brand-primary' : 'from-brand-accent')} to-transparent pointer-events-none`} />}
    
    <button type="button" onClick={onToggle} className="w-full p-5 text-left relative z-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{ev.name}</div>
        </div>
        <motion.div 
          animate={sel ? { scale: [0.8, 1.2, 1] } : { scale: 1 }}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${sel ? (accent === 'primary' ? 'bg-brand-primary border-brand-primary' : 'bg-brand-accent border-brand-accent') : 'border-white/20 bg-black/20 group-hover:border-white/40'}`}
        >
          {sel && <CheckCircle2 size={14} className="text-white" />}
        </motion.div>
      </div>
    </button>
    <AnimatePresence>
      {sel && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: 'auto', opacity: 1 }} 
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden relative z-10"
        >
          {ev.maxParticipants > 1 && (
            <div className="px-5 pb-5 border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Team Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-primary/50 focus:bg-white/5 transition-all" placeholder="Optional" value={sel.teamName || ''} onChange={e => onUpdateEvt('teamName', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Size <span className={`lowercase tracking-normal px-1.5 py-0.5 rounded text-[8px] bg-white/10 ml-1`}>Max: {ev.maxParticipants}</span>
                </label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-primary/50 focus:bg-white/5 transition-all text-center" 
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
            <div className="px-5 pb-5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">PPT Theme</label>
              <select required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-primary/50 focus:bg-white/5 appearance-none transition-all cursor-pointer" value={pptTheme} onChange={e => setPptTheme(e.target.value)}>
                <option value="" className="bg-[#020617] text-slate-500">Select presentation theme...</option>
                {PPT_THEMES.map(t => <option key={t} value={t} className="bg-[#020617] text-white">{t}</option>)}
              </select>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
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
    customDepartment: '',
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
    if (formData.department === 'Other' && !formData.customDepartment) e.customDepartment = 'Please specify your department';
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
          department: formData.department === 'Other' ? formData.customDepartment : formData.department,
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
        department={formData.department === 'Other' ? formData.customDepartment : formData.department}
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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="glass-panel rounded-[3rem] p-8 md:p-16 max-w-6xl mx-auto relative overflow-hidden my-32 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-16 relative z-10">

        {/* 01 Personal Info */}
        <div className="relative">
          <div className="absolute -left-8 md:-left-16 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary/50 to-transparent rounded-r" />
          <h3 className="text-2xl font-black flex items-center gap-4 mb-10 text-white tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-brand-primary/30">01</span>
            Intake Protocol
          </h3>
          <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Full Name</label>
              <input required type="text" className={inputCls('fullName')} placeholder="Enter your full name" value={formData.fullName} onChange={e => upd('fullName', e.target.value)} />
              <ValidationError name="fullName" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">College Name</label>
              <input required type="text" className={inputCls('collegeName')} placeholder="Your institution name" value={formData.collegeName} onChange={e => upd('collegeName', e.target.value)} />
              <ValidationError name="collegeName" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Department</label>
              <select className={`${inputCls('department')} appearance-none cursor-pointer`} value={formData.department} onChange={e => { upd('department', e.target.value); setSelectedEvents([]); }}>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#020617]">{d}</option>)}
              </select>
            </div>
            {formData.department === 'Other' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Specify Department</label>
                <input required type="text" className={inputCls('customDepartment')} placeholder="Enter your department name" value={formData.customDepartment} onChange={e => upd('customDepartment', e.target.value)} />
                <ValidationError name="customDepartment" />
              </motion.div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Current Year</label>
              <select className={`${inputCls('year')} appearance-none cursor-pointer`} value={formData.year} onChange={e => { upd('year', e.target.value); setSelectedEvents([]); }}>
                {YEARS.map(y => <option key={y} value={y} className="bg-[#020617]">{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Email Address</label>
              <input required type="email" className={inputCls('email')} placeholder="name@example.com" value={formData.email} onChange={e => upd('email', e.target.value)} />
              <ValidationError name="email" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Phone Number</label>
              <input required type="tel" className={inputCls('phone')} placeholder="10-digit number" value={formData.phone} onChange={e => upd('phone', e.target.value)} />
              <ValidationError name="phone" />
            </div>
          </div>
        </div>

        {/* 02 Event Selection */}
        <div className="pt-12 border-t border-white/5 relative">
          <div className="absolute -left-8 md:-left-16 top-12 bottom-0 w-1 bg-gradient-to-b from-brand-secondary/50 to-transparent rounded-r" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <h3 className="text-2xl font-black flex items-center gap-4 text-white tracking-tight">
              <span className="w-10 h-10 rounded-xl bg-brand-secondary/20 text-brand-secondary flex items-center justify-center text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-brand-secondary/30">02</span>
              Event Assignment
            </h3>
            {selectedEvents.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-xs bg-brand-primary text-white px-4 py-2 rounded-xl font-bold border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                {selectedEvents.length} Event{selectedEvents.length > 1 ? 's' : ''} Selected
              </motion.div>
            )}
          </div>
          <p className="text-slate-500 text-xs mb-8 md:ml-14 max-w-lg leading-relaxed">System has automatically filtered events based on your academic year and department specifications.</p>

          <div className="mb-8 md:ml-14">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary whitespace-nowrap bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20">Technical Series</span>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableEvents.filter(e => e.category === 'Technical').map(ev => (
                <EventPickerCard key={ev.id} ev={ev} sel={selectedEvents.find(s => s.name === ev.name)}
                  onToggle={() => toggleEvent(ev)} onUpdateEvt={(k, v) => updEvt(ev.name, k, v)}
                  pptTheme={pptTheme} setPptTheme={setPptTheme} year={formData.year} accent="primary" />
              ))}
            </div>
          </div>

          <div className="md:ml-14">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent whitespace-nowrap bg-brand-accent/10 px-3 py-1.5 rounded-lg border border-brand-accent/20">Non-Technical Series</span>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableEvents.filter(e => e.category === 'Non-Technical').map(ev => (
                <EventPickerCard key={ev.id} ev={ev} sel={selectedEvents.find(s => s.name === ev.name)}
                  onToggle={() => toggleEvent(ev)} onUpdateEvt={(k, v) => updEvt(ev.name, k, v)}
                  pptTheme={pptTheme} setPptTheme={setPptTheme} year={formData.year} accent="accent" />
              ))}
            </div>
          </div>
        </div>

        {/* 03 Payment */}
        <div className="pt-12 border-t border-white/5 relative">
          <div className="absolute -left-8 md:-left-16 top-12 bottom-0 w-1 bg-gradient-to-b from-green-500/50 to-transparent rounded-r" />
          <h3 className="text-2xl font-black flex items-center gap-4 mb-10 text-white tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-green-500/30">03</span>
            Access Verification
          </h3>
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-white/[0.01] p-8 md:p-12 rounded-[2.5rem] border border-white/5 md:ml-14 shadow-inner">
            <div className="text-center lg:text-left">
              <p className="text-sm font-black mb-6 text-slate-300 uppercase tracking-widest">Entry Fee: ₹200 / Member</p>
              <div className="bg-white p-6 rounded-3xl inline-block mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500">
                <img src="/qr.jpeg" alt="Payment QR Code" className="w-48 h-48 rounded-xl mix-blend-multiply" />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Transaction ID (12 Digits)</label>
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
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Upload Transaction Proof</label>
              <div className="relative group">
                <input required type="file" accept="image/*" onChange={e => { setPaymentScreenshot(e.target.files?.[0] || null); setTouched(p => ({ ...p, payment: true })); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`w-full border-2 border-dashed rounded-[1.5rem] p-12 flex flex-col items-center justify-center transition-all duration-300 ${paymentScreenshot ? 'border-green-500/50 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : touched.payment && errors.payment ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/[0.02] group-hover:border-brand-primary/50 group-hover:bg-brand-primary/5'}`}>
                  {paymentScreenshot ? (
                    <>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4"><CheckCircle2 className="text-green-500" /></motion.div>
                      <span className="text-sm font-bold text-green-500">{paymentScreenshot.name}</span>
                      <span className="text-[10px] text-green-500/50 mt-1.5 uppercase tracking-widest font-bold">Verification ready</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all duration-300"><Download className="text-slate-400 group-hover:text-brand-primary transition-colors" /></div>
                      <span className="text-sm font-medium text-slate-300">Click or drag receipt here</span>
                      <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">JPG/PNG Support</span>
                    </>
                  )}
                </div>
                <ValidationError name="payment" />
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="glass-panel p-6 md:p-8 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-8 border border-brand-primary/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent opacity-50 pointer-events-none" />
          <div className="flex items-center gap-4 text-slate-400 text-sm bg-black/40 px-6 py-4 rounded-xl border border-white/5 relative z-10 w-full lg:w-auto">
            <AlertCircle size={18} className="text-brand-accent shrink-0" />
            <span className="font-medium">System lock initiates on <span className="text-white font-bold">25 March 2026</span></span>
          </div>
          
          <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto relative z-10">
            <AnimatePresence>
              {status === 'error' && (
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-bold uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                  {errMsg}
                </motion.span>
              )}
            </AnimatePresence>
            <button type="submit" disabled={status === 'loading' || selectedEvents.length === 0}
              className="btn-primary w-full lg:w-auto min-w-[300px] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
              {status === 'loading' ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initializing...
                </span>
              ) : (
                <span className="flex items-center gap-3 uppercase tracking-widest text-sm">
                  Initialize Registration{selectedEvents.length > 0 ? ` [${selectedEvents.length}]` : ''}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-brand-primary/10 rounded-full blur-[160px] animate-pulse-slow pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center"
        >
          <div className="flex flex-col items-center mb-12 w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 w-full max-w-2xl px-4"
            >
              <div className="bg-white/95 backdrop-blur-xl px-6 py-5 md:px-10 md:py-6 rounded-[2rem] shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all duration-500 overflow-hidden border border-white/20">
                <img src="/ES%20Eng%20Clg.png" alt="ES College" className="w-full h-auto" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-5 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary shadow-[0_0_30px_rgba(139,92,246,0.2)] mb-8"
            >
              A National Level Technical Symposium
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="w-full max-w-[1000px] mx-auto mb-10 relative group"
          >
            <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] group-hover:bg-brand-primary/30 transition-all duration-700" />
            <img
              src="/Innobyte-Logo.png"
              alt="INNOBYTE 2K26"
              className="w-full relative z-10 drop-shadow-[0_0_40px_rgba(139,92,246,0.4)] group-hover:drop-shadow-[0_0_80px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-all duration-700 select-none"
            />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight"
          >
            "Innovate <span className="text-white">💡</span> • Implement <span className="text-white">🖥️</span> • Inspire <span className="text-white">✨</span>"
          </motion.p>
          
          <div className="grid lg:grid-cols-2 gap-8 w-full max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-panel rounded-[2.5rem] p-8 flex flex-col justify-center items-center gap-8 border-brand-primary/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Countdown />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-panel flex flex-col justify-center gap-6 rounded-[2.5rem] p-8 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tl from-brand-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-5 px-8 py-5 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:border-brand-primary/30 transition-all relative z-10">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0"><Calendar size={24} /></div>
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 block mb-1">Symposium Date</span>
                  <span className="font-black text-white text-xl tracking-tight">27 March 2026</span>
                </div>
              </div>
              
              <a href="#register" className="btn-primary group/btn relative z-10 overflow-hidden">
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center justify-center gap-3 uppercase tracking-[0.2em] font-black">
                  Secure Your Spot <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </a>
            </motion.div>
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
            <EventsCarousel events={EVENTS.filter(e => e.years.includes('2nd') && e.category === 'Technical')} side="left" />
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
            <EventsCarousel events={EVENTS.filter(e => e.years.length === 1 && e.years[0] === '1st' && e.category === 'Technical')} side="right" />
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
            <EventsCarousel events={EVENTS.filter(e => e.category === 'Non-Technical')} side="left" />
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
                    { name: 'Ravichandran', phone: '9025110028' },
                    { name: 'K. Subash', phone: '8680065944' },
                    { name: 'K. Kishore', phone: '6379807387' },
                    { name: 'D. Santhagiri', phone: '9597846484' },
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
      <footer className="py-24 px-6 border-t border-white/5 text-center relative overflow-hidden bg-[#010413]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-8 mb-16">
            <div className="w-full max-w-xl px-4">
              <div className="bg-white/95 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 rounded-[1.5rem] shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden">
                <img src="/ES%20Eng%20Clg.png" alt="ES College" className="w-full h-auto" />
              </div>
            </div>
            <img src="/Innobyte-Logo.png" alt="INNOBYTE2K26" className="h-16 opacity-90 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
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
