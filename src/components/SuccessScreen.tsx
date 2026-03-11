import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Copy, Check, DownloadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SelectedEvent } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SuccessScreenProps {
  regId: string;
  fullName?: string;
  collegeName?: string;
  department?: string;
  year?: string;
  email: string;
  transactionId?: string;
  selectedEvents: SelectedEvent[];
  onReset: () => void;
}

export default function SuccessScreen({ 
  regId, fullName, collegeName, department, year, 
  email, transactionId, selectedEvents, onReset 
}: SuccessScreenProps) {
  const [copied, setCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fire confetti burst on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const shoot = () => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { x: Math.random() * 0.4 + 0.3, y: 0.6 },
        colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'],
        ticks: 200,
      });
    };

    shoot();
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return; }
      shoot();
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const copyId = () => {
    navigator.clipboard.writeText(regId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadReceipt = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
      // Ensure images are loaded
      const images = printRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        const image = img as HTMLImageElement;
        if (image.complete) return Promise.resolve();
        return new Promise(resolve => { image.onload = resolve; image.onerror = resolve; });
      }));

      // Set visibility for capture
      printRef.current.style.display = 'block';
      printRef.current.style.position = 'fixed';
      printRef.current.style.left = '-9999px';
      printRef.current.style.top = '0';

      const canvas = await html2canvas(printRef.current, {
        scale: 3, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      printRef.current.style.display = 'none'; // Hide after capture
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`INNOBYTE2K26_Receipt_${regId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to download receipt. Please try again or take a screenshot.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      ref={receiptRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="glass-panel rounded-[2rem] p-12 text-center max-w-2xl mx-auto relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      <h2 className="text-4xl font-black mb-3 text-white">You're In! 🎉</h2>
      <p className="text-slate-400 mb-8">
        Registration confirmed for <span className="text-white font-semibold">{email}</span>
      </p>

      {/* Events badges */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {selectedEvents.map((e) => (
          <motion.span
            key={e.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 bg-brand-primary/20 text-brand-primary rounded-full text-xs font-bold border border-brand-primary/20"
          >
            {e.name}
          </motion.span>
        ))}
      </div>

      {/* Reg ID */}
      <div className="bg-white/[0.03] rounded-2xl p-8 mb-8 border border-white/10 relative group">
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 block mb-3">
          Your Registration ID
        </span>
        <span className="text-5xl font-mono font-black text-gradient block mb-4">{regId}</span>
        <button
          onClick={copyId}
          className="flex items-center gap-2 mx-auto text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors"
        >
          {copied ? <><Check size={14} className="text-green-400" /> Copied!</> : <><Copy size={14} /> Copy ID</>}
        </button>
      </div>

      {transactionId && (
        <div className="bg-white/2 rounded-xl p-4 mb-8 border border-white/5 flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-1">Transaction ID</span>
          <span className="text-xl font-mono font-bold text-slate-300">{transactionId}</span>
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 mb-8 text-amber-400 text-sm">
        📌 Save your Registration ID — you'll need it on <strong>27 March 2026</strong>
      </div>
      
      <div className="flex flex-col gap-4">
        <a 
          href="https://chat.whatsapp.com/F7a3b7IXYl4AWUaiuYDQ0t?mode=gi_t" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-4 rounded-xl font-bold transition-all w-full shadow-lg shadow-[#25D366]/20"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          Join our Official WhatsApp Group
        </a>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={downloadReceipt} 
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex-1"
          >
            <DownloadCloud size={18} />
            {isDownloading ? 'Generating PDF...' : 'Download Receipt'}
          </button>
          <button onClick={onReset} className="btn-primary flex-1">
            Register Another Student
          </button>
        </div>
      </div>

      {/* --- HIDDEN PROFESSIONAL PRINTABLE RECEIPT --- */}
      <div ref={printRef} style={{ display: 'none', width: '800px', padding: '60px', backgroundColor: 'white', color: '#1e293b', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #8b5cf6', paddingBottom: '30px', marginBottom: '40px' }}>
          <div>
            <img src="/college-logo.png" alt="ES Logo" style={{ height: '60px' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#8b5cf6' }}>INNOBYTE<span style={{ color: '#06b6d4' }}>2K26</span></h2>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>OFFICIAL REGISTRATION RECEIPT</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Student Name</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{fullName || 'N/A'}</p>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Registration ID</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#8b5cf6', fontFamily: 'monospace' }}>{regId}</p>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Registration Details</th>
                <th style={{ textAlign: 'right', padding: '15px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#475569' }}>Institution</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>{collegeName || 'ES College'}</td>
              </tr>
              <tr>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#475569' }}>Department / Year</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>{department} / {year}</td>
              </tr>
              <tr>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#475569' }}>Email</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>{email}</td>
              </tr>
              <tr>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#475569' }}>Transaction ID (G-Pay)</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', color: '#059669' }}>{transactionId || 'Verified'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '15px' }}>Registered Events</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {selectedEvents.map(e => (
              <span key={e.name} style={{ padding: '8px 15px', backgroundColor: '#8b5cf610', color: '#8b5cf6', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #8b5cf630' }}>
                {e.name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', paddingTop: '40px', borderTop: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 10px', color: '#1e293b', fontWeight: 'bold' }}>Instructions:</p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>Please carry a physical copy of this receipt on <b>27th March 2026</b>.</li>
              <li>Report to the registration desk by <b>08:30 AM</b>.</li>
              <li>College ID card is mandatory for all participants.</li>
              <li>For any queries, contact: +91 86800 65944</li>
            </ul>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '20px' }}>
              <img src="/Innobyte-Logo.png" alt="Stamp" style={{ height: '60px', opacity: 0.1, marginBottom: '-40px' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>Authorized Committee</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>INNOBYTE2K26 Secretariat</p>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Generated by INNOBYTE 2K26 Digital Portal • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </motion.div>
  );
}
