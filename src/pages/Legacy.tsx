import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import shantamPic from '../assets/Legacy/SHANTAM SULTANIA.jpg';
import {
  ChevronRight,
  X,
  History,
  Building,
  User,
  ArrowUpRight,
  CheckCircle2,
  Trophy,
  Globe,
  Quote,
  Zap,
  Target
} from 'lucide-react';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const toDirectImageUrl = (url: string | null, width = 800): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  return url;
};

interface Leader {
  id: string;
  name: string;
  role: 'Founder' | 'President' | 'Vice President';
  tenure: string;
  photoUrl: string | null;
  placedAt: {
    company: string;
    role: string;
    location: string;
    brandColor: string;
  };
  quote: string;
  bio: string;
  keyContributions: string[];
  linkedinUrl: string;
}

const FEATURED_LEADER: Leader = {
  id: 'featured-1',
  name: 'Shantam Sultania',
  role: 'Founder',
  tenure: '2019 - 2021',
  photoUrl: shantamPic,
  placedAt: {
    company: 'Morgan Stanley',
    role: 'Director',
    location: 'Bengaluru, India',
    brandColor: '#0033a0'
  },
  quote: 'When we laid the first bricks of ADC at CU, our goal was simple: empower every student to build tech that matters.',
  bio: 'Founding President who established the vision, organizational structure, and inaugural team for Alexa Developers Community at Chandigarh University. Spearheaded advanced edge computing, scalable cloud architectures, and fostered a rigorous engineering culture.',
  keyContributions: [
    'Conceived the founding roadmap and tech vision for ADC CU in September 2019',
    'Architected core engineering infrastructure & mentored the founding leadership team',
    'Secured official university chapter accreditation & established industry partnerships'
  ],
  linkedinUrl: 'https://www.linkedin.com/in/shantam-sultania-737084175/'
};

const TIMELINE_STEPS = [
  {
    step: '01',
    period: '2019',
    heading: 'Chapter Inception',
    detail: 'A dedicated group of student pioneers established the Alexa Developers Community at Chandigarh University to provide hands-on exposure to voice tech and cloud backend engineering.'
  },
  {
    step: '02',
    period: '2020',
    heading: 'Institutional Growth',
    detail: 'Achieved formal recognition as a premier university technical chapter. Hosted initial voice summits/Workshops and launched structured developer bootcamps.'
  },
  {
    step: '03',
    period: '2021',
    heading: 'National Scale & Hackathons',
    detail: 'Scaled active membership to 5,500+ students. Organized national Ideathons, integrated Generative AI tracks, and achieved top podium placements across competitive events.'
  },
  {
    step: '04',
    period: '2022 & Beyond',
    heading: 'Tier-1 Placements & Open Source',
    detail: 'Sustaining a legacy of alumni placed at tier-1 tech enterprises while driving community-led open-source software development at CU.'
  }
];

import { getCachedData, setCachedData } from '../lib/cache';

const Legacy: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>(() => getCachedData<Leader[]>('legacy_leaders') || []);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  useEffect(() => {
    const fetchLegacy = async () => {
      try {
        const { data, error } = await supabase
          .from('legacy_members')
          .select('*')
          .order('order_index', { ascending: true })
          .limit(50);

        if (!error && data && data.length > 0) {
          const formatted: Leader[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            role: item.role,
            tenure: item.tenure || '',
            photoUrl: toDirectImageUrl(item.photo_url || null),
            placedAt: {
              company: item.company || 'Tech Enterprise',
              role: item.company_role || 'Software Engineer',
              location: item.location || 'India',
              brandColor: '#0ea5e9'
            },
            quote: item.quote || 'Leading community growth and empowering future engineering leaders.',
            bio: item.bio || '',
            keyContributions: Array.isArray(item.key_contributions)
              ? item.key_contributions
              : (item.key_contributions ? item.key_contributions.split('\n').filter(Boolean) : []),
            linkedinUrl: item.linkedin_url || ''
          }));
          setLeaders(formatted);
          setCachedData('legacy_leaders', formatted);
        }
      } catch (err) {
        console.error('Error fetching legacy members:', err);
      }
    };
    fetchLegacy();
  }, []);

  const spotlightLeader = FEATURED_LEADER;
  const filteredLeaders = leaders;

  return (
    <div className="relative w-full min-h-screen font-sans pb-32 selection:bg-[#0ea5e9]/20 overflow-hidden bg-[#f8fafc]">

      {/* ── Dynamic Ambient Background Glows ── */}
      <div className="fixed inset-0 z-0 bg-[#f8fafc] pointer-events-none transform-gpu">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#0ea5e9]/12 blur-[130px]" />
        <div className="absolute top-[35%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#38bdf8]/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[25%] w-[45%] h-[45%] rounded-full bg-[#818cf8]/10 blur-[120px]" />
      </div>

      <div className="relative z-10">

        {/* ── 1. Hero Section ── */}
        <section className="w-full pt-32 pb-16 px-4 md:px-16 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-[#0ea5e9]/20 text-[#0ea5e9] text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
              <History size={14} className="text-[#0ea5e9]" /> The ADC Heritage & Trailblazers
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-sans font-light text-slate-900 tracking-tight leading-[1.05] mb-6 max-w-5xl">
              Engineering <span className="font-bold text-[#0ea5e9]">Excellence</span> & Community History
            </h1>

            <p className="text-slate-500 text-lg md:text-2xl max-w-3xl font-light leading-relaxed mb-12">
              Explore the story of how Alexa Developers Community was built at Chandigarh University, and discover the alumni leaders who shaped our chapter before taking on engineering roles at world-class technology companies.
            </p>

            {/* Impact Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(31,38,135,0.04)]">
              {[
                { label: 'Founded At CU', val: 'Sept 2019', icon: Building },
                { label: 'Active Community', val: '1,500+', icon: Globe },
                { label: 'Alumni Network', val: '100%', icon: Trophy },
                { label: 'Events & Bootcamps', val: '30+', icon: Zap },
              ].map((metric, idx) => (
                <div key={idx} className="p-4 md:p-6 text-center md:text-left flex flex-col justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center mb-3 mx-auto md:mx-0">
                    <metric.icon size={18} />
                  </div>
                  <span className="font-sans font-bold text-2xl md:text-3xl text-slate-900 tracking-tight">
                    {metric.val}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px] md:text-xs uppercase tracking-widest mt-1">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Inception & History Timeline ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-10 lg:px-16 mb-24">
          <div className="bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(31,38,135,0.05)] rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#0ea5e9] text-white flex items-center justify-center shadow-md">
                <Target size={20} />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#0ea5e9] uppercase tracking-widest">Chapter Journey</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-slate-900 tracking-tight">
                  How ADC Was Established at CU
                </h2>
              </div>
            </div>

            <p className="text-slate-600 font-sans text-base md:text-lg font-light leading-relaxed max-w-3xl mb-12">
              Founded in September 2019, the Alexa Developers Community at Chandigarh University was launched to bridge classroom instruction with hands-on software engineering, voice interaction design, and cloud architecture. Over the years, it has matured into a benchmark university chapter for student innovation.
            </p>

            {/* Timeline Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIMELINE_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-[#0ea5e9] tracking-wider block mb-2">
                      {step.period}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">
                      {step.heading}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm font-light leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Presidents & Vice Presidents Section ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-10 lg:px-16 mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-4 border-b border-slate-200/50 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#0ea5e9] uppercase tracking-widest block mb-1">
                Chapter Alumni
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-light text-slate-900">
                Presidents & Vice Presidents
              </h2>
            </div>
          </div>

          {/* Featured Spotlight Card */}
          {spotlightLeader && (
            <div className="w-full flex flex-col-reverse lg:flex-row bg-white/50 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(31,38,135,0.06)] rounded-[2.5rem] overflow-hidden mb-16 hover:shadow-xl transition-all duration-500">
              <div className="w-full lg:w-3/5 p-6 md:p-12 lg:p-14 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3.5 py-1 bg-[#0ea5e9] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {spotlightLeader.role} ({spotlightLeader.tenure})
                    </span>
                    <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">
                      Featured Leader
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-slate-900 text-3xl md:text-4xl lg:text-5xl mb-4">
                    {spotlightLeader.name}
                  </h3>

                  <p className="font-sans font-light text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                    {spotlightLeader.bio}
                  </p>

                  {/* Quote Block */}
                  <div className="p-4 md:p-5 rounded-2xl bg-white/70 border border-white/90 mb-8 relative">
                    <Quote className="w-6 h-6 text-[#0ea5e9]/30 mb-2" />
                    <p className="text-slate-700 italic text-sm md:text-base font-light">
                      "{spotlightLeader.quote}"
                    </p>
                  </div>
                </div>

                {/* Placement & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/50">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      Current Placement
                    </span>
                    <p className="text-slate-900 font-bold text-base">
                      {spotlightLeader.placedAt.company} — <span className="text-[#0ea5e9] font-semibold text-sm">{spotlightLeader.placedAt.role}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={spotlightLeader.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all shadow-sm"
                    >
                      <LinkedinIcon className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => setSelectedLeader(spotlightLeader)}
                      className="h-11 px-6 flex items-center gap-2 rounded-full bg-slate-900 text-white font-sans text-xs font-bold hover:bg-[#0ea5e9] transition-all shadow-sm"
                    >
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-2/5 relative min-h-[300px] lg:min-h-full bg-slate-100">
                {spotlightLeader.photoUrl ? (
                  <img
                    src={spotlightLeader.photoUrl}
                    alt={spotlightLeader.name}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                    <User size={90} className="text-[#0ea5e9]/20" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredLeaders.map(leader => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex flex-col group bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] rounded-[2.5rem] overflow-hidden hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Photo Header */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/30 border-b border-white/40">
                  {leader.photoUrl ? (
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={64} className="text-[#0ea5e9]/20" />
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 backdrop-blur-md text-white shadow-sm">
                      {leader.role}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/90 backdrop-blur-md text-slate-800 font-bold shadow-sm">
                      {leader.tenure}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="flex flex-col flex-grow p-6">
                  <h3 className="font-sans font-bold text-slate-900 text-2xl leading-tight mb-1">
                    {leader.name}
                  </h3>
                  <p className="text-[#0ea5e9] font-semibold text-xs tracking-wide uppercase mb-4">
                    Former {leader.role} ({leader.tenure})
                  </p>

                  {/* Placement Box */}
                  <div className="bg-white/70 border border-white/90 rounded-2xl p-4 mb-6 shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Current Placement
                    </span>
                    <p className="text-slate-900 font-bold text-base leading-snug">{leader.placedAt.company}</p>
                    <p className="text-slate-600 text-xs font-medium mt-0.5">{leader.placedAt.role}</p>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    {leader.linkedinUrl && (
                      <a
                        href={leader.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-white/90 text-[#0077b5] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedLeader(leader)}
                      className="h-10 px-5 flex items-center gap-1.5 rounded-full bg-[#0ea5e9] border border-[#0ea5e9] text-white font-sans text-xs font-bold hover:bg-[#0284c7] hover:shadow-md hover:-translate-y-0.5 transition-all ml-auto"
                    >
                      Details <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Modal Details ── */}
      <AnimatePresence>
        {selectedLeader && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeader(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[12%] max-w-2xl mx-auto z-50 bg-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[82vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold text-xs uppercase tracking-wider">
                  Former {selectedLeader.role} • {selectedLeader.tenure}
                </span>
                <button
                  onClick={() => setSelectedLeader(null)}
                  className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto pt-6 space-y-6 flex-1 pr-1">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {selectedLeader.photoUrl ? (
                    <img
                      src={selectedLeader.photoUrl}
                      alt={selectedLeader.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={40} />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-slate-900">{selectedLeader.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">
                      {selectedLeader.role} ({selectedLeader.tenure})
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0ea5e9]/5 border border-[#0ea5e9]/15 rounded-xl text-xs text-slate-800 font-semibold">
                      <Building size={14} className="text-[#0ea5e9]" />
                      {selectedLeader.placedAt.role} @ {selectedLeader.placedAt.company}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-light">{selectedLeader.bio}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Contributions & Impact</h4>
                  <div className="space-y-2.5">
                    {selectedLeader.keyContributions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircle2 size={16} className="text-[#0ea5e9] mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-700 font-medium leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {selectedLeader.linkedinUrl && (
                  <a
                    href={selectedLeader.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b5] hover:underline"
                  >
                    LinkedIn Profile <ArrowUpRight size={14} />
                  </a>
                )}
                <button
                  onClick={() => setSelectedLeader(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-colors ml-auto shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Legacy;
