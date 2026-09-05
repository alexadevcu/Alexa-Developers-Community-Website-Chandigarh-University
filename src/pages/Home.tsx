import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Lightbulb, Rocket, GraduationCap, Users, User, Calendar, Award, Quote } from 'lucide-react';
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

interface SponsorItem {
  id?: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
  order_index?: number;
}

const defaultSponsorsList: SponsorItem[] = [
  { name: 'Sponsor 1', logo_url: sponsor1 },
  { name: 'Sponsor 2', logo_url: sponsor2 },
  { name: 'Sponsor 3', logo_url: sponsor3 },
  { name: 'GeeksforGeeks', logo_url: sponsor4 },
  { name: 'Sponsor 5', logo_url: sponsor6 },
  { name: 'Event Eye', logo_url: sponsor7 },
  { name: 'Growbinar', logo_url: sponsor8 },
  { name: 'Zomato', logo_url: sponsor9 }
];

import { supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';

import { getCachedData, setCachedData } from '../lib/cache';

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
  gallery_urls?: string | null;
  is_archived?: boolean;
  venue?: string | null;
  why_participate?: string | null;
  eligibility?: string | null;
  rules_guidelines?: string | null;
  partnerships?: string | null;
}

const toDirectImageUrl = (url: string | null, width = 800): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  return url;
};

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

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>(() => getCachedData<Event[]>('home_events') || []);
  const [totalEvents, setTotalEvents] = useState<number>(() => getCachedData<number>('home_total_events') || 0);
  const [sponsors, setSponsors] = useState<SponsorItem[]>(() => getCachedData<SponsorItem[]>('home_sponsors') || defaultSponsorsList);
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    // Only track mouse cursor glow on devices with fine pointer (desktop mouse/trackpad)
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      const updateMousePosition = (e: MouseEvent) => {
        mouseX.set(e.clientX - 128);
        mouseY.set(e.clientY - 128);
      };
      window.addEventListener('mousemove', updateMousePosition, { passive: true });
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }
  }, [mouseX, mouseY]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [countRes, upcomingRes, sponsorsRes] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase
            .from('events')
            .select('*')
            .eq('is_archived', false)
            .eq('status', 'upcoming')
            .order('event_date', { ascending: true })
            .limit(3),
          supabase
            .from('sponsors')
            .select('*')
            .order('order_index', { ascending: true })
        ]);

        const totalCount = countRes.count || 0;
        setTotalEvents(totalCount);
        setCachedData('home_total_events', totalCount);

        let displayEvents = upcomingRes.data || [];

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
        setCachedData('home_events', displayEvents);

        if (sponsorsRes.data && sponsorsRes.data.length > 0) {
          setSponsors(sponsorsRes.data);
          setCachedData('home_sponsors', sponsorsRes.data);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <div className="w-full bg-surface relative overflow-hidden">

        {/* Mouse Follower Glow (Only on desktop fine pointer devices, zero blur shader) */}
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-50 w-64 h-64 rounded-full hidden lg:block transform-gpu"
          style={{
            x: cursorX,
            y: cursorY,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0) 70%)',
          }}
        />

        <div className="relative z-10">
          {/* 2. Hero Section */}
          <section className="min-h-[80vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 relative overflow-hidden pt-14 md:pt-0">

            {/* Full-width Video Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-surface" style={{ isolation: 'isolate', contain: 'paint' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover object-[80%_center] md:object-center opacity-100 scale-[1.02]"
              >
                <source src="/Landing.webm" type="video/webm" />
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
              className="max-w-3xl z-10 relative pt-12 pb-12"
            >
              <motion.h1 variants={fadeUpVariant} className="font-headline-xl text-on-surface leading-[1.05] tracking-tighter mb-4 md:mb-6 text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-left drop-shadow-sm">
                Building the Next Generation of <span className="text-[#006783] drop-shadow-md">Innovators</span>
              </motion.h1>
              <motion.p variants={fadeUpVariant} className="font-body-lg text-on-surface-variant max-w-xl text-base sm:text-xl md:text-2xl font-medium text-left drop-shadow-sm leading-relaxed">
                Through workshops, hackathons, research initiatives, and a thriving community of technology enthusiasts.
              </motion.p>
              <motion.div variants={fadeUpVariant} className="mt-8 flex flex-wrap gap-4 items-center">
                <Link to="/join" className="px-8 py-3.5 bg-[#006783] text-white font-bold text-base rounded-full hover:bg-[#004d63] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Join the Community
                </Link>
                <Link to="/events" className="px-8 py-3.5 border border-[#006783] text-[#006783] font-bold text-base rounded-full hover:bg-[#006783]/10 transition-all">
                  Explore Events
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* 3. Sponsors Marquee */}
          <section className="py-20 md:py-24 bg-white overflow-hidden relative z-10">
            <h2 className="text-center font-headline-md text-xl md:text-2xl text-on-surface-variant mb-12 md:mb-16 tracking-widest uppercase">Past Sponsors</h2>
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
                {[...sponsors, ...sponsors].map((sponsor, i) => {
                  const imgSrc = toDirectImageUrl(sponsor.logo_url) || sponsor.logo_url;
                  const imgElement = (
                    <img 
                      src={imgSrc} 
                      alt={sponsor.name || `Sponsor ${i + 1}`} 
                      referrerPolicy="no-referrer"
                      className="h-14 sm:h-16 md:h-20 w-auto object-contain max-w-[180px] sm:max-w-[220px] md:max-w-[280px] drop-shadow-sm" 
                    />
                  );

                  return (
                    <div key={i} className="mx-8 md:mx-16 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300">
                      {sponsor.website_url ? (
                        <a 
                          href={sponsor.website_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          title={sponsor.name}
                          className="flex items-center justify-center"
                        >
                          {imgElement}
                        </a>
                      ) : (
                        imgElement
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. Empowering Innovation */}
          <section id="empowering" className="py-20 px-4 max-w-container-max mx-auto content-auto">
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
                    <div className="h-14 w-14 rounded-xl bg-white/50 border border-white/40 shadow-sm flex items-center justify-center text-[#006783] mb-6 group-hover:scale-110 transition-transform">
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
          <section id="about-us" className="py-20 px-4 max-w-container-max mx-auto content-auto">
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
                  <img src={teamGroupPic} alt="ADC CU Team" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-6 left-6 right-6 bottom-6 border border-white/20 rounded-[1.5rem] z-10 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* 6. Community Events */}
          <section id="events" className="py-20 px-4 bg-transparent relative z-10 content-auto">
            <div className="max-w-container-max mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <h2 className="font-headline-xl text-on-surface text-4xl md:text-5xl tracking-tight">
                  Community Events
                </h2>
                <Link to="/events" className="flex items-center gap-2 text-[#006783] font-label-md hover:gap-3 transition-all uppercase tracking-wider">
                  View All Events <ArrowRight size={18} />
                </Link>
              </div>

              {/* Mobile: Smooth horizontal swipeable card slider with next card peek */}
              <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-6 scroll-smooth hide-scrollbar">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
                  const date = new Date(event.event_date);
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  const year = date.getFullYear();
                  const imgUrl = toDirectImageUrl(event.poster_url);

                  return (
                    <Link 
                      key={event.id} 
                      to={`/events/${slugify(event.name)}`} 
                      className="w-[82vw] sm:w-[320px] max-w-[340px] snap-start glass-card rounded-3xl overflow-hidden group cursor-pointer flex flex-col shrink-0 bg-white/80 border border-outline-variant/30 shadow-md hover:shadow-xl transition-all duration-300 justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-20 shadow-sm ${
                          event.status === 'upcoming' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-slate-900/80 text-white'
                        }`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </div>
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={event.name} 
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <Calendar size={40} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-[#006783] font-label-sm uppercase tracking-widest mb-1.5 text-xs font-semibold">
                            {month} {day}, {year}
                          </p>
                          <h3 className="font-headline-md text-on-surface mb-3 text-lg font-bold leading-tight group-hover:text-[#006783] transition-colors line-clamp-2 min-h-[2.75rem]">
                            {event.name}
                          </h3>
                        </div>
                        <div className="mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#006783]/10 text-[#006783] font-bold text-xs group-hover:bg-[#006783] group-hover:text-white transition-all w-fit">
                          View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                }) : (
                  <p className="text-on-surface-variant text-base py-8 px-2">No upcoming events at the moment. Stay tuned!</p>
                )}
              </div>

              {/* Desktop: 3-column grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-8">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
                  const date = new Date(event.event_date);
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  const year = date.getFullYear();
                  const imgUrl = toDirectImageUrl(event.poster_url);

                  return (
                    <Link 
                      key={event.id} 
                      to={`/events/${slugify(event.name)}`} 
                      className="glass-card rounded-3xl overflow-hidden group cursor-pointer flex flex-col h-full bg-white/70 border border-outline-variant/30 shadow-md hover:shadow-xl transition-all duration-300 justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-20 shadow-sm ${
                          event.status === 'upcoming' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-slate-900/80 text-white'
                        }`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </div>
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={event.name} 
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <Calendar size={40} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-[#006783] font-label-sm uppercase tracking-widest mb-2 text-xs md:text-sm font-semibold">
                            {month} {day}, {year}
                          </p>
                          <h3 className="font-headline-md text-on-surface mb-4 text-xl md:text-2xl font-bold leading-tight group-hover:text-[#006783] transition-colors line-clamp-2 min-h-[3rem]">
                            {event.name}
                          </h3>
                        </div>
                        <div className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#006783]/10 text-[#006783] font-bold text-xs md:text-sm group-hover:bg-[#006783] group-hover:text-white transition-all w-fit">
                          View Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
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
          <section className="py-20 px-4 bg-transparent relative z-10 content-auto">
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
                  <div key={i} className="glass-card p-4 md:p-10 flex flex-col items-center justify-center text-center rounded-3xl">
                    {stat.icon}
                    <Counter value={stat.val} suffix={stat.suffix} />
                    <span className="font-label-md tracking-widest uppercase text-on-surface-variant mt-2 md:mt-4 text-xs md:text-sm leading-tight">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* 8. Innovation Gallery */}
          <section id="gallery" className="py-20 px-4 max-w-container-max mx-auto content-auto">
            <div className="mb-12">
              <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">Innovation Gallery</h2>
              <p className="font-body-lg text-on-surface-variant text-lg max-w-2xl">Glimpses of collaboration, creativity, and the power of voice technology.</p>
            </div>

            {/* Bento Box Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-md">
                <img src={gal1} alt="ADC Community Event" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-[4/3] rounded-3xl overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-md">
                <img src={gal2} alt="ADC Students Collaborating" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-[4/3] rounded-3xl overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-md">
                <img src={gal3} alt="ADC Team Project" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="sm:col-span-2 md:col-span-3 aspect-[21/9] rounded-3xl overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-md">
                <img src={gal4} alt="ADC Team Gathering" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </section>

          {/* 8.5 Member Spotlight */}
          <section className="py-20 px-4 max-w-container-max mx-auto bg-transparent content-auto">
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
                  role: "Former Vice President",
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
                    <img src={testimonial.avatar} alt={testimonial.name} loading="lazy" decoding="async" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <h3 className="font-headline-md text-on-surface text-lg font-bold">{testimonial.name}</h3>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9. Faculty Coordinators */}
          <section id="team" className="py-20 px-4 bg-[#001f2a] text-white relative overflow-hidden content-auto">
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
                          <img src={faculty.image} alt={faculty.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-variant/30 text-[#00caff]/40">
                            <User size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00caff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-headline-md text-2xl mb-2">{faculty.name}</h3>
                      <p className="font-label-sm text-[#00caff] uppercase tracking-widest mt-1 opacity-90 leading-relaxed font-semibold">{faculty.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* 9. Join Us Finale */}
          <section id="join" className="w-full py-32 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-surface-container-lowest border-t border-outline-variant/30 content-auto">
            {/* Ambient background overlay */}
            <div className="absolute inset-0 bg-surface/80 z-0 pointer-events-none"></div>

            {/* Rotating 360-degree border ring adapted for light theme */}
            <div className="absolute inset-0 border-[2px] border-[#00caff]/20 m-8 rounded-[100px] z-0 shadow-[0_0_50px_rgba(0,103,131,0.05)_inset]" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center py-16">
              <h2 className="text-3xl md:text-6xl font-headline-xl text-on-surface tracking-tight mb-4 md:mb-6">
                Ready to Build Your Network?
              </h2>
              <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-12">
                Join a community of hundreds of student developers. Get exclusive access to workshops, hackathons, and mentorship.
              </p>
              <Link to="/join" className="bg-[#006783] text-white px-10 py-5 font-headline-md font-bold text-lg rounded-full uppercase tracking-widest hover:bg-[#004d63] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                Join the Community
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
