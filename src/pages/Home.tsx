import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Lightbulb, Rocket, GraduationCap, Users, User, Calendar, Award, Quote, X } from 'lucide-react';
import landingWebm from '../assets/Homepage/Review/Landing.webm';
import teamGroupPic from '../assets/Homepage/Landinggrouppic.jpg';
// drAbhishekPic import removed temporarily (Abhishek Sir hidden)
import jasneetMamPic from '../assets/Homepage/Faculty/Jasneet mam.jpg';
import prabhneetSirPic from '../assets/Homepage/Faculty/Prabhneet sir.jpg';
import shivamSirPic from '../assets/Homepage/Faculty/Shivam Sir.jpg';
import anamikaMamPic from '../assets/Homepage/Faculty/Anamika_Mam.jpg';
import gal1 from '../assets/Homepage/Gallery/IMG20260226153332.jpg.jpeg';
import gal2 from '../assets/Homepage/Gallery/IMG_0855 (1).JPG.jpeg';
import gal3 from '../assets/Homepage/Gallery/IMG_2312.jpg.jpeg';
import gal4 from '../assets/Homepage/Gallery/IMG_0928.jpg';
import sponsor1 from '../assets/Sponsors/2.png';
import sponsor2 from '../assets/Sponsors/Asset 10 horizontal logo.png';
import sponsor3 from '../assets/Sponsors/Copy of TAMBOOBABA-LOGOS.png';
import sponsor4 from '../assets/Sponsors/GfG Horizontal Combination Mark (Light Mode)@2x.png';
import sponsor6 from '../assets/Sponsors/WhatsApp Image 2025-09-02 at 19.47.04_1d5320e8.jpg';
import sponsor7 from '../assets/Sponsors/event eye.jpg';
import sponsor8 from '../assets/Sponsors/growbinar.jpg';
import sponsor9 from '../assets/Sponsors/Zomato.png';
import devanshImg from '../assets/Homepage/Review/Devansh Chopra.jpeg';
import gurmeetImg from '../assets/Homepage/Review/Gurmeet Kaur.jpeg';
import samarthImg from '../assets/Homepage/Review/Samarth.png';

const sponsorsList = [sponsor1, sponsor2, sponsor3, sponsor4, sponsor6, sponsor7, sponsor8, sponsor9];
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  name: string;
  type: string;
  description: string;
  event_date: string;
  end_date?: string | null;
  poster_url: string;
  registration_link: string;
  status: 'upcoming' | 'completed';
  is_registration_open?: boolean;
  partnerships?: string;
  gallery_urls?: string | null;
  venue?: string | null;
  why_participate?: string | null;
  eligibility?: string | null;
  rules_guidelines?: string | null;
}



// Removed Spline AudioContext hack as Spline is no longer used

const Counter: React.FC<{ value: number, suffix?: string }> = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className="font-headline-xl font-bold text-5xl md:text-6xl text-[#006783]">
      {isInView ? (
        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>
          {value}{suffix}
        </motion.span>
      ) : '0'}
    </span>
  );
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

// ── Countdown timer hook ────────────────────────────────────────────
function useCountdown(targetDate: string | null) {
  const calc = () => {
    if (!targetDate) return { d: 0, h: 0, m: 0, s: 0, over: true };
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, over: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);
  return time;
}

// ── Event Detail Overlay ─────────────────────────────────────────────
const EventDetailOverlay: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
  const countdown = useCountdown(event.status === 'upcoming' ? event.end_date || event.event_date : null);

  const defaultEligibility = "Open to all students. Individual based participation";
  const defaultWhyParticipate = "Expert mentorship and industry relevant themes\nCertificates and networking opportunities\nHosted on campus at Chandigarh University";
  const defaultVenue = "Chandigarh University, Mohali, Punjab";

  const formatDateRange = () => {
    const start = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (event.end_date) {
      const end = new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    }
    return start;
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Slide-up panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[95vh] bg-white rounded-t-3xl overflow-hidden flex flex-col shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-5xl md:bottom-4 md:rounded-3xl"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Event Details</span>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-0 md:gap-8 p-6 md:p-8">

            {/* Left column: text content */}
            <div className="flex-1 min-w-0 order-2 md:order-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">{event.name}</h1>

              {/* About the Event */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-3">About the Event</h2>
                <p className="text-slate-600 leading-relaxed text-[15px]">{event.description || 'Details coming soon.'}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Why Participate?</h2>
                <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {event.why_participate || defaultWhyParticipate}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Eligibility</h2>
                <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {event.eligibility || defaultEligibility}
                </p>
              </div>

              {event.rules_guidelines && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-3">Rules & Guidelines</h2>
                  <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                    {event.rules_guidelines}
                  </p>
                </div>
              )}

              {/* Event Type */}
              {event.type && (
                <div className="border-t border-slate-100 pt-6 mb-6">
                  <span className="px-3 py-1.5 bg-[#006783]/10 text-[#006783] rounded-full text-sm font-semibold">
                    {event.type}
                  </span>
                </div>
              )}

              {/* Hosted By */}
              <div className="border-t border-slate-100 pt-6 mb-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Hosted By</p>
                <p className="text-slate-700 font-semibold">Alexa Developers Community — Chandigarh University</p>
              </div>

              {/* Partnerships */}
              {event.partnerships && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">In Partnership With</p>
                  <p className="text-slate-700 font-semibold">{event.partnerships}</p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-full md:w-72 lg:w-80 shrink-0 order-1 md:order-2 mb-6 md:mb-0">
              {/* Poster */}
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200 shadow-sm">
                <img
                  src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Meta box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                {/* Event name */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="font-bold text-slate-900 text-sm leading-snug">{event.name}</p>
                </div>

                {/* Dates */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Runs From</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDateRange()}</p>
                </div>

                {/* Venue */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Happening</p>
                  <p className="text-sm font-semibold text-slate-700">{event.venue || defaultVenue}</p>
                </div>

                {/* Countdown */}
                {event.status === 'upcoming' && !countdown.over && (
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Applications Close In</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {countdown.d}d:{String(countdown.h).padStart(2,'0')}h:{String(countdown.m).padStart(2,'0')}m
                    </p>
                  </div>
                )}
                {event.status !== 'upcoming' && (
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Status</p>
                    <p className="text-sm font-semibold text-slate-500">Event Completed</p>
                  </div>
                )}

                {/* CTA */}
                <div className="px-4 py-4">
                  {event.status === 'upcoming' && event.is_registration_open !== false && event.registration_link ? (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      Register on External Site <ArrowRight size={15} />
                    </a>
                  ) : (
                    <button disabled className="w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed">
                      Registrations Closed
                    </button>
                  )}
                  <p className="text-center text-[10px] text-slate-400 mt-2">Registrations for this event are managed externally.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedEvent]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX - 128);
      mouseY.set(e.clientY - 128);
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  useEffect(() => {
    const fetchHomeEvents = async () => {
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });
      
      setTotalEvents(count || 0);

      const { data: upcomingData } = await supabase
        .from('events')
        .select('*')
        .eq('is_archived', false)
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true })
        .limit(3);
      
      let displayEvents = upcomingData || [];
      
      if (displayEvents.length < 3) {
        const { data: pastData } = await supabase
          .from('events')
          .select('*')
          .eq('is_archived', false)
          .neq('status', 'upcoming')
          .order('event_date', { ascending: false })
          .limit(3 - displayEvents.length);
          
        if (pastData) displayEvents = [...displayEvents, ...pastData];
      }
      
      setUpcomingEvents(displayEvents);
    };

    fetchHomeEvents();
  }, []);



  // Dismiss both the HTML loader (hard refresh) and the React overlay (client-side nav)
  const dismissLoader = () => {
    setIsLoading(false);
    // Also clear HTML loader if it still exists (hard refresh case)
    const htmlLoader = document.getElementById('initial-loader');
    if (htmlLoader) {
      htmlLoader.classList.add('hidden');
      setTimeout(() => htmlLoader.remove(), 500);
    }
  };

  // Mount logic - wait for video or timeout
  useEffect(() => {
    // 3-second fallback: dismiss loader if video takes too long
    const fallbackTimer = setTimeout(() => dismissLoader(), 3000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <>
      {/* React Loading Overlay — shows on client-side navigation to home (HTML loader already removed) */}
      {isLoading && (
        <div
          className="fixed inset-0 z-[100] bg-[#f7f9fb] flex flex-col items-center justify-center"
          style={{ transition: 'opacity 0.5s ease' }}
        >
          <div className="relative w-48 h-48 flex items-center justify-center" style={{ transform: 'translateZ(0)' }}>
            {/* Outer ring */}
            <div className="animate-smooth-spin absolute w-48 h-48 rounded-full border-[3px] border-transparent border-t-[#00caff] border-r-[#006783] shadow-[0_0_30px_rgba(0,202,255,0.2)]" />
            {/* Inner ring */}
            <div className="animate-smooth-spin-reverse absolute w-40 h-40 rounded-full border-[2px] border-transparent border-b-[#00caff] border-l-[#006783] opacity-70" />
            {/* Logo */}
            <div className="relative w-28 h-28 z-10 bg-[#f7f9fb] rounded-full p-4 flex items-center justify-center">
              <img src="/logo.png" alt="ADC" className="w-full h-full object-contain" />
            </div>
          </div>
          <p className="mt-10 text-[11px] tracking-[0.3em] uppercase text-[#006783] font-sans animate-pulse">
            Loading Ecosystem
          </p>
        </div>
      )}

      <div className={`w-full bg-surface relative ${isLoading ? 'h-screen overflow-hidden' : 'overflow-hidden'}`}>

        {/* Mouse Follower Glow */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 w-64 h-64 rounded-full bg-[#0ea5e9]/20 blur-[100px]"
          style={{
            x: cursorX,
            y: cursorY,
          }}
        />

        <div className="relative z-10">
          {/* 2. Hero Section */}
          <section className="min-h-[80vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 relative overflow-hidden pt-14 md:pt-0">



            {/* Full-width Video Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-surface">
              <video
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => dismissLoader()}
                className="w-full h-full object-cover object-[80%_center] md:object-center opacity-100 scale-[1.02]"
              >
                <source src={landingWebm} type="video/webm" />
              </video>
            </div>

            {/* Left text readability gradient — to ensure text stands out against the video */}
            <div
              className="absolute inset-0 w-full md:w-[65%] z-0 pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(247, 249, 251, 1) 0%, rgba(247, 249, 251, 0.85) 65%, rgba(247, 249, 251, 0) 100%)' }}
            />

            {/* Bottom transition gradient to cover video edge and blend seamlessly into sponsors section */}
            <div
              className="absolute bottom-0 inset-x-0 h-40 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 1) 100%)' }}
            />

            <motion.div
              initial="hidden" animate="visible" variants={staggerContainer}
              className="max-w-3xl z-10 relative pt-12 pb-12 pointer-events-none"
            >
              <motion.h1 variants={fadeUpVariant} className="font-headline-xl text-on-surface leading-[1.05] tracking-tighter mb-4 md:mb-6 text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-left drop-shadow-sm">
                Building the Next Generation of <span className="text-[#006783] drop-shadow-md">Innovators</span>
              </motion.h1>
              <motion.p variants={fadeUpVariant} className="font-body-lg text-on-surface-variant max-w-xl text-base sm:text-xl md:text-2xl font-medium text-left drop-shadow-sm leading-relaxed">
                Through workshops, hackathons, research initiatives, and a thriving community of technology enthusiasts.
              </motion.p>
            </motion.div>
          </section>

          {/* 3. Sponsors Marquee */}
          <section className="py-12 bg-white overflow-hidden relative z-10">
            <h3 className="text-center font-headline-md text-xl md:text-2xl text-on-surface-variant mb-10 tracking-widest uppercase">Past Sponsors</h3>
            <div className="relative w-full overflow-hidden">
              {/* Pure white fade overlays for left and right edges */}
              <div
                className="absolute top-0 bottom-0 left-0 w-16 md:w-32 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)' }}
              />
              <div
                className="absolute top-0 bottom-0 right-0 w-16 md:w-32 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)' }}
              />

              <div className="flex w-max animate-[marquee_20s_linear_infinite] transform-gpu items-center" style={{ willChange: 'transform' }}>
                {/* We duplicate the array to ensure continuous scrolling without gaps */}
                {[...sponsorsList, ...sponsorsList].map((imgSrc, i) => (
                  <div key={i} className="mx-8 md:mx-16 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300">
                    <img src={imgSrc} alt={`Sponsor ${i + 1}`} className="h-10 md:h-14 w-auto object-contain max-w-[150px] md:max-w-[200px]" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Empowering Innovation */}
          <section id="empowering" className="py-20 px-4 max-w-container-max mx-auto">
            <div>
              <h2 className="font-headline-xl text-on-surface mb-8 md:mb-12 text-center md:text-left text-3xl md:text-5xl tracking-tight">
                Empowering Innovation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Lightbulb, title: "Workshops", desc: "Deep dives into VUI design and AWS architecture." },
                  { icon: Rocket, title: "Hackathons and Ideathons", desc: "48-hour sprints to build production-ready skills." },
                  { icon: GraduationCap, title: "Skill Labs", desc: "Experimental sandbox for generative AI integration." },
                  { icon: Users, title: "Mentorship", desc: "Direct feedback loops with Alexa Champions." }
                ].map((item, idx) => (
                  <div key={idx} className="glass-card p-8 rounded-2xl group">
                    <div className="h-14 w-14 rounded-xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center text-[#006783] mb-6 group-hover:scale-110 transition-transform">
                      <item.icon size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-headline-md text-on-surface mb-3 text-2xl">{item.title}</h3>
                    <p className="font-body-md text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. About Us */}
          <section id="about-us" className="py-20 px-4 max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-headline-xl text-on-surface text-4xl md:text-5xl tracking-tight mb-8">Bridging the Gap Between Academia and Industry.</h2>
                <p className="font-body-lg text-on-surface-variant text-xl leading-relaxed mb-6">
                  The ADC is engineered to provide unparalleled exposure to modern tech stacks. We synthesize theoretical knowledge with rigorous practical application through hackathons, bootcamps, and specialized mentor sessions.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Global networking with Alexa Champions",
                    "Hands-on building with AWS & VUI",
                    "Exclusive access to beta developer tools"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 font-label-md text-on-surface">
                      <div className="h-6 w-6 rounded-full bg-[#bce9ff] flex items-center justify-center text-[#001f2a]">✓</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#00caff]/20 to-transparent rounded-[3rem] blur-2xl opacity-50" />
                <div className="relative aspect-square md:aspect-[4/5] bg-surface-variant rounded-[2.5rem] border border-outline-variant/30 overflow-hidden shadow-2xl group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute inset-0 bg-surface-dim transition-transform duration-700 group-hover:scale-105" />
                  <img src={teamGroupPic} alt="ADC CU Team" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-6 left-6 right-6 bottom-6 border border-white/20 rounded-[1.5rem] z-10 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* 6. Community Events */}
          <section id="events" className="py-20 px-4 bg-transparent relative z-10">
            <div className="max-w-container-max mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <h2 className="font-headline-xl text-on-surface text-4xl md:text-5xl tracking-tight">
                  Community Events
                </h2>
                <Link to="/events" className="flex items-center gap-2 text-[#006783] font-label-md hover:gap-3 transition-all uppercase tracking-wider">
                  View All Events <ArrowRight size={18} />
                </Link>
              </div>

              {/* Mobile: horizontal scroll */}
              <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
                  const date = new Date(event.event_date);
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  const year = date.getFullYear();
                  return (
                    <div key={event.id} className="min-w-[75vw] snap-start glass-card rounded-3xl overflow-hidden group cursor-pointer flex flex-col shrink-0" onClick={() => setSelectedEvent(event)}>
                      <div className="h-44 bg-surface-variant relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-20 shadow-sm ${event.status === 'upcoming' ? 'bg-surface' : 'bg-surface-dim text-on-surface-variant'}`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </div>
                        {event.poster_url ? (
                          <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-surface-dim flex items-center justify-center">
                            <Calendar size={36} className="text-outline/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-grow flex flex-col">
                        <p className="text-[#006783] font-label-sm uppercase tracking-widest mb-2 text-xs">{month} {day}, {year}</p>
                        <h3 className="font-headline-md text-on-surface mb-3 text-lg leading-tight">{event.name}</h3>
                        <div className="mt-auto flex items-center gap-2 text-on-surface-variant font-label-sm uppercase tracking-widest text-xs">
                          View Details <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-on-surface-variant text-base py-8 px-2">No upcoming events at the moment. Stay tuned!</p>
                )}
              </div>

              {/* Desktop: 3-column grid */}
              <div className="hidden md:grid grid-cols-3 gap-8">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
                  const date = new Date(event.event_date);
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  const year = date.getFullYear();
                  return (
                    <div key={event.id} className="glass-card rounded-3xl overflow-hidden group cursor-pointer flex flex-col h-full" onClick={() => setSelectedEvent(event)}>
                      <div className="h-56 bg-surface-variant relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider z-20 shadow-sm ${event.status === 'upcoming' ? 'bg-surface' : 'bg-surface-dim text-on-surface-variant'}`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </div>
                        {event.poster_url ? (
                          <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-surface-dim transition-transform duration-700 group-hover:scale-105 flex items-center justify-center">
                            <Calendar size={48} className="text-outline/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex-grow flex flex-col">
                        <p className="text-[#006783] font-label-sm uppercase tracking-widest mb-3">{month} {day}, {year}</p>
                        <h3 className="font-headline-md text-on-surface mb-4 text-2xl leading-tight group-hover:text-[#006783] transition-colors">{event.name}</h3>
                        <div className="mt-auto flex items-center gap-2 text-on-surface-variant font-label-sm uppercase tracking-widest group-hover:text-[#006783] transition-colors">
                          View Details <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-on-surface-variant text-lg">No upcoming events at the moment. Stay tuned!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 7. Community Statistics */}
          <section className="py-20 px-4 bg-transparent relative z-10">
            <div className="max-w-7xl mx-auto px-6 relative">
              <div className="text-center mb-12">
                <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">By the Numbers</h2>
                <p className="font-body-lg text-on-surface-variant text-lg">Measurable impact across the university ecosystem.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                {[
                  { icon: <Users className="w-7 h-7 md:w-10 md:h-10 text-[#006783] mb-3 md:mb-6" />, val: 1500, suffix: '+', label: 'Active Members' },
                  { icon: <Calendar className="w-7 h-7 md:w-10 md:h-10 text-[#006783] mb-3 md:mb-6" />, val: totalEvents + 48, suffix: '+', label: 'Events Hosted' },
                  { icon: <Award className="w-7 h-7 md:w-10 md:h-10 text-[#006783] mb-3 md:mb-6" />, val: 12, suffix: '+', label: 'Hackathons and Ideathons won by team' }
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-4 md:p-10 flex flex-col items-center justify-center text-center rounded-[1.5rem] md:rounded-[2rem]">
                    {stat.icon}
                    <Counter value={stat.val} suffix={stat.suffix} />
                    <span className="font-label-md tracking-widest uppercase text-on-surface-variant mt-2 md:mt-4 text-[10px] md:text-sm leading-tight">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* 8. Innovation Gallery */}
          <section id="gallery" className="py-20 px-4 max-w-container-max mx-auto">
            <div className="mb-12">
              <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">Innovation Gallery</h2>
              <p className="font-body-lg text-on-surface-variant text-lg max-w-2xl">Glimpses of collaboration, creativity, and the power of voice technology.</p>
            </div>

            {/* Bento Box Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[250px]">
              {/* Left Large Vertical Image */}
              <div className="col-span-2 md:col-span-1 row-span-1 md:row-span-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-lg">
                <img src={gal1} alt="ADC Community Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              {/* Right Top Left */}
              <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-lg">
                <img src={gal2} alt="ADC Students Collaborating" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              {/* Right Top Right */}
              <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-lg">
                <img src={gal3} alt="ADC Team Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              {/* Right Bottom Wide */}
              <div className="col-span-2 md:col-span-2 md:row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-lg">
                <img src={gal4} alt="ADC Team Gathering" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </section>

          {/* 8.5 Member Spotlight */}
          <section className="py-20 px-4 max-w-container-max mx-auto bg-transparent">
            <div className="text-center mb-16">
              <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">Member Spotlight</h2>
              <p className="font-body-lg text-on-surface-variant text-lg">Hear from the makers shaping the voice ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "\"When I first joined, I was just another student curious about technology. A few years later, I had the privilege of leading this incredible community. Watching our workshops fill with eager learners, seeing first-time attendees become organizers, and celebrating every successful event together are memories I'll always cherish. This community shaped me as much as I hope I helped shape it.\"",
                  name: "Devansh Chopra",
                  role: "Former President",
                  avatar: devanshImg
                },
                {
                  quote: "\"Behind every successful workshop was a team that genuinely cared about creating value for others. We weren't just organizing events—we were creating opportunities for students to discover their passion for technology. Being part of that journey is something I'll always be grateful for.\"",
                  name: "Gurmeet Kaur",
                  role: "Vice President",
                  avatar: gurmeetImg
                },
                {
                  quote: "\"Even after graduating, I still look back at this community with pride. It wasn't just a club—it was a family that challenged me to grow, supported me when things got difficult, and celebrated every milestone together. The skills I gained here opened doors, but the people I met made the experience unforgettable.\"",
                  name: "Samarth Maheshwari",
                  role: "Alumni",
                  avatar: samarthImg
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-surface-container-low border border-outline-variant/30 rounded-[2.5rem] p-10 flex flex-col h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
                  <Quote className="w-8 h-8 text-[#006783] mb-6 fill-[#006783]/20" />
                  <p className="font-body-lg text-on-surface-variant text-lg italic leading-relaxed mb-10 flex-grow">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <h4 className="font-headline-md text-on-surface text-lg font-bold">{testimonial.name}</h4>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9. Faculty Coordinators */}
          <section id="team" className="py-20 px-4 bg-[#001f2a] text-white relative overflow-hidden">
            {/* Tech grid overlay background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-container-max mx-auto relative z-10">
              <div className="mb-8">
                <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight mb-4 text-center">Faculty Coordinators</h2>
                <p className="text-[#bce9ff] text-center max-w-2xl mx-auto mb-12 opacity-80 font-body-lg">Guiding the next generation of innovators.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                  {[
                    { name: "Er. Shivam sir", title: "Faculty Advisor", image: shivamSirPic },
                    { name: "Er. Prabhneet Singh Sir", title: "Co-Faculty Adviser", image: prabhneetSirPic },
                    { name: "Dr. Jasneet Kaur Ma'am", title: "Faculty mentor ADC, HOD cse final year CU", image: jasneetMamPic },
                    { name: "Er. Anamika Ma'am", title: "Event coordinator C2 Takshashaila Block", image: anamikaMamPic }
                  ].map((faculty, i) => (
                    <div key={i} className="flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-transform bg-white/5 p-8 rounded-3xl border border-white/10">
                      <div className="w-32 h-32 rounded-full bg-surface-variant/20 mb-6 border-2 border-[#00caff] relative overflow-hidden shadow-[0_0_20px_rgba(0,202,255,0.2)]">
                        {faculty.image ? (
                          <img src={faculty.image} alt={faculty.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-variant/30 text-[#00caff]/40">
                            <User size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00caff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="font-headline-md text-2xl mb-2">{faculty.name}</h4>
                      <p className="font-label-sm text-[#00caff] uppercase tracking-widest mt-1 opacity-90 leading-relaxed">{faculty.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* 9. Join Us Finale */}
          <section id="join" className="w-full py-32 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-surface-container-lowest border-t border-outline-variant/30">
            {/* Deep ambient blur background */}
            <div className="absolute inset-0 bg-surface/50 opacity-80 backdrop-blur-xl z-0 pointer-events-none"></div>

            {/* Rotating 360-degree border ring adapted for light theme */}
            <div className="absolute inset-0 border-[2px] border-[#00caff]/20 m-8 rounded-[100px] z-0 shadow-[0_0_50px_rgba(0,103,131,0.05)_inset]" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center py-16">
              <h2 className="text-3xl md:text-6xl font-headline-xl text-on-surface tracking-tight mb-4 md:mb-6">
                Ready to Build Your Network?
              </h2>
              <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-12">
                Join a community of hundreds of student developers. Get exclusive access to workshops, hackathons, and mentorship.
              </p>
              <Link to="/join" className="bg-transparent border border-[#006783] text-[#006783] px-10 py-5 font-headline-md font-bold text-lg rounded-full uppercase tracking-widest hover:bg-[#006783] hover:text-white transition-colors duration-300">
                Join the Community
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Rich Event Detail Overlay */}
      <AnimatePresence>
        {selectedEvent && <EventDetailOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </AnimatePresence>
    </>
  );
};

export default Home;
