import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Who can participate in INNOBYTE2K26?",
    a: "All students from any college or university are welcome! Events are categorized by year (1st year / 2nd–4th year) and some are open to all. Just register and pick the events matching your year.",
  },
  {
    q: "What is the registration fee?",
    a: "The registration fee is ₹200 per participant regardless of the number of events you select. Pay once and participate in as many events as you want!",
  },
  {
    q: "How do I get my Registration ID?",
    a: "After submitting the registration form and uploading your payment screenshot, your unique Registration ID (e.g., INN26-XXXXXX) is displayed instantly on screen. Save it — you'll need it on event day.",
  },
  {
    q: "Can I participate in both Technical and Non-Technical events?",
    a: "Absolutely! You can select any combination of events from both categories. Just choose all the events you want when filling the form.",
  },
  {
    q: "Is food provided during the event?",
    a: "Yes! Lunch and refreshments will be provided to all registered participants as part of the event.",
  },
  {
    q: "What should I bring on event day?",
    a: "Bring your Registration ID (screenshot or printout), a valid college ID card, and any required materials mentioned in the event guidelines (e.g., PPT for Paper Presentation).",
  },
  {
    q: "What if I have trouble with payment?",
    a: "Use the UPI QR code on the registration page. If you face any issue, contact us at innobyte2k26@gmail.com (or) call +91 9789861659/8637660269.",
  },
];

const FAQItem = ({
  q,
  a,
  isOpen,
  onToggle,
}: {
  key?: number;
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="border border-white/10 rounded-2xl overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
    >
      <span className="font-bold text-slate-200 text-lg">{q}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="shrink-0"
      >
        <ChevronDown
          size={20}
          className={isOpen ? "text-brand-primary" : "text-slate-500"}
        />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p className="px-8 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
            {a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
          Got <span className="text-gradient">Questions?</span>
        </h2>
        <p className="text-slate-400 text-lg">
          Everything you need to know about INNOBYTE2K26.
        </p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            q={faq.q}
            a={faq.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-slate-500 mt-12 text-sm"
      >
        Still have questions?{" "}
        <a href="#contact" className="text-brand-primary hover:underline">
          Contact us directly →
        </a>
      </motion.p>
    </section>
  );
}
