import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, Play, Info, Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';

const toDirectImageUrl = (url: string | null, width = 800): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  return url;
};
interface Event {
  id: string;
  name: string;
  type: string;
  description: string;
  partnerships: string;
  event_date: string;
  registration_link: string;
  poster_url: string;
  status: 'upcoming' | 'completed';
  is_registration_open?: boolean;
  gallery_urls?: string | null;
  end_date?: string | null;
  is_archived?: boolean;
  is_pinned?: boolean;
  venue?: string | null;
  why_participate?: string | null;
  eligibility?: string | null;
  rules_guidelines?: string | null;
  show_external_website?: boolean;
}

import { getCachedData, setCachedData } from '../lib/cache';

const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cachedEvents = getCachedData<{ hero: Event[]; upcoming: Event[]; past: Event[] }>('events_data');
  const [heroEvents, setHeroEvents] = useState<Event[]>(() => cachedEvents?.hero || []);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>(() => cachedEvents?.upcoming || []);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [carouselEvents, setCarouselEvents] = useState<Event[]>(() => cachedEvents?.past || []);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(() => !cachedEvents);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Reset description expansion when hero changes
  useEffect(() => {
    setIsDescExpanded(false);
  }, [heroIndex]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data) {
          // Filter out archived events
          const activeEvents = data.filter(e => !e.is_archived);

          // Find all upcoming events, sorted by pinned first, then closest date
          const allUpcoming = activeEvents
            .filter(e => e.status === 'upcoming')
            .sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
            });
          
          // Put all remaining events in the carousel, sorted by pinned first, then newest to oldest
          const upcomingIds = allUpcoming.map(e => e.id);
          let past = activeEvents
            .filter(e => !upcomingIds.includes(e.id))
            .sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
            });

          let hero = allUpcoming;
          if (allUpcoming.length === 0 && past.length > 0) {
            hero = [past[0]];
            past = past.slice(1);
          }
            
          setHeroEvents(hero);
          setUpcomingEvents(allUpcoming);
          setCarouselEvents(past);
          setCachedData('events_data', { hero, upcoming: allUpcoming, past });
          setIsLoading(false);

          // If there's an eventId in the URL, redirect to dedicated page
          const eventId = searchParams.get('eventId');
          if (eventId) {
            navigate(`/events/${eventId}`, { replace: true });
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateString: string, endDateString?: string | null) => {
    const start = new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric'
    });
    if (endDateString) {
      const end = new Date(endDateString).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric'
      });
      return `${start} - ${end}`;
    }
    return start;
  };

  const handleHeroChange = (newIndex: number) => {
    setIsFirstLoad(false);
    setHeroIndex(newIndex);
  };

  // Auto-rotate Hero banner
  useEffect(() => {
    if (heroEvents.length <= 1) return;
    const interval = setInterval(() => {
      setIsFirstLoad(false);
      setHeroIndex(prev => (prev + 1) % heroEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroEvents.length]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 800 : 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-14 h-14 rounded-full border-4 border-[#0ea5e9]/20 border-t-[#0ea5e9]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading Events</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden pb-32 font-sans selection:bg-[#0ea5e9]/20">
      
      {/* --- HERO BANNER (Multiple Upcoming Events or Recent Event) --- */}
      {heroEvents.length > 0 ? (
        <div className="relative w-full min-h-[90vh] md:min-h-[95vh] flex items-end overflow-hidden group pt-24 bg-slate-900">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={heroIndex}
              className="absolute inset-0 z-0"
              initial={{ opacity: isFirstLoad ? 1 : 0, scale: isFirstLoad ? 1 : 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isFirstLoad ? 0 : 1.2, ease: "easeOut" }}
            >
              <img 
                src={toDirectImageUrl(heroEvents[heroIndex].poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
                alt={heroEvents[heroIndex].name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover origin-center opacity-40"
              />
              {/* Soft Gradient Overlays for Light Theme text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent w-full md:w-[70%] z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent h-full z-10"></div>
            </motion.div>
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-20 w-full px-6 md:px-16 lg:px-24 pb-20 md:pb-32 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${heroIndex}`}
                initial={{ opacity: isFirstLoad ? 1 : 0, y: isFirstLoad ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: isFirstLoad ? 0 : 0.6, delay: isFirstLoad ? 0 : 0.2 }}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {heroEvents[heroIndex].status === 'upcoming' ? (
                    <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      UPCOMING PREMIERE
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-slate-600 text-white rounded font-bold text-xs uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
                      PAST HIGHLIGHT
                    </div>
                  )}
                  <span className="text-[#0ea5e9] font-mono text-xs md:text-sm uppercase tracking-widest font-bold">
                    {heroEvents[heroIndex].type}
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black text-slate-900 mb-4 md:mb-6 tracking-tighter leading-[0.95] drop-shadow-sm max-w-5xl uppercase">
                  {heroEvents[heroIndex].name}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 md:mb-6 text-slate-600 font-mono text-xs sm:text-sm uppercase tracking-widest">
                  <span className="text-emerald-600 font-bold">{new Date(heroEvents[heroIndex].event_date).getFullYear()}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Calendar size={16} className="text-[#0ea5e9]" />
                    <span className="font-semibold">{formatDate(heroEvents[heroIndex].event_date, heroEvents[heroIndex].end_date)}</span>
                  </div>
                  {heroEvents[heroIndex].partnerships && (
                    <span className="border border-slate-300 px-2 py-0.5 rounded text-xs font-semibold">
                      {heroEvents[heroIndex].partnerships}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="max-w-2xl mb-10">
                  <p className={`text-slate-600 font-sans text-lg md:text-xl leading-relaxed font-medium ${isDescExpanded ? '' : 'line-clamp-3'}`}>
                    {heroEvents[heroIndex].description}
                  </p>
                  {heroEvents[heroIndex].description.length > 150 && (
                    <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="text-[#0ea5e9] hover:text-[#0284c7] font-semibold text-sm mt-2 focus:outline-none"
                    >
                      {isDescExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
                  {heroEvents[heroIndex].status === 'upcoming' && heroEvents[heroIndex].is_registration_open !== false && heroEvents[heroIndex].registration_link ? (
                    <a 
                      href={heroEvents[heroIndex].registration_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 md:px-8 md:py-3.5 bg-[#0ea5e9] text-white font-bold text-base md:text-lg rounded-xl hover:bg-[#0284c7] transition-all flex items-center gap-2 md:gap-3 shadow-md w-full sm:w-auto justify-center"
                    >
                      <Play size={20} className="fill-white" /> Register Now
                    </a>
                  ) : (heroEvents[heroIndex].show_external_website && heroEvents[heroIndex].registration_link) ? (
                    <a 
                      href={heroEvents[heroIndex].registration_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 md:px-8 md:py-3.5 bg-slate-900 text-white font-bold text-base md:text-lg rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 md:gap-3 shadow-md w-full sm:w-auto justify-center"
                    >
                      Visit Event Website
                    </a>
                  ) : (
                    <button className="px-6 py-3 md:px-8 md:py-3.5 bg-slate-200 text-slate-500 font-bold text-base md:text-lg rounded-xl cursor-not-allowed flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center">
                      Event Concluded
                    </button>
                  )}
                  <Link 
                    to={`/events/${slugify(heroEvents[heroIndex].name)}`}
                    className="px-6 py-3 md:px-8 md:py-3.5 bg-white text-slate-700 font-bold text-base md:text-lg rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 md:gap-3 shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Info size={20} className="text-[#0ea5e9]" /> More Info
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Netflix-style Slide Controls — arrows + dots, shown on hover */}
            {heroEvents.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={() => handleHeroChange((heroIndex - 1 + heroEvents.length) % heroEvents.length)}
                  className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-[#0ea5e9] transition-all duration-200 opacity-100 md:opacity-0 group-hover:opacity-100 hover:scale-110"
                  aria-label="Previous event"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => handleHeroChange((heroIndex + 1) % heroEvents.length)}
                  className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-[#0ea5e9] transition-all duration-200 opacity-100 md:opacity-0 group-hover:opacity-100 hover:scale-110"
                  aria-label="Next event"
                >
                  <ChevronRight size={24} strokeWidth={2.5} />
                </button>

                {/* Dot Indicators — bottom center */}
                <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                  {heroEvents.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleHeroChange(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${idx === heroIndex ? 'w-10 bg-[#0ea5e9]' : 'w-2.5 bg-slate-400/50 hover:bg-slate-400'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-slate-50 border-b border-slate-200 pt-20">
          <Calendar size={48} className="text-slate-300 mb-4" />
          <h2 className="font-display text-3xl md:text-5xl text-slate-400 mb-2 font-bold tracking-tight">No Events</h2>
          <p className="font-sans text-slate-500">Stay tuned. The next big thing is loading.</p>
        </div>
      )}

      {/* ── 2. CURRENT & UPCOMING EVENTS SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 lg:px-16 pt-16 md:pt-24 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
              Live & Scheduled
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
              Current & Upcoming Events
            </h2>
          </div>
          <p className="text-slate-500 font-sans text-sm md:text-base max-w-md">
            Register for live hackathons, ongoing ideathons, and scheduled technical bootcamps.
          </p>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group h-full justify-between"
              >
                {/* Event Poster */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"}
                    alt={event.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live / Upcoming
                    </span>
                    <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-full text-[11px] font-semibold uppercase tracking-wider">
                      {event.type}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs uppercase tracking-wider mb-3">
                      <Calendar size={14} className="text-[#0ea5e9]" />
                      <span className="font-semibold">{formatDate(event.event_date, event.end_date)}</span>
                    </div>

                    <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 mb-3 leading-snug group-hover:text-[#0ea5e9] transition-colors min-h-[3.25rem] line-clamp-2">
                      {event.name}
                    </h3>

                    <p className="text-slate-600 font-sans text-sm leading-relaxed line-clamp-3 mb-6">
                      {event.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                    {event.is_registration_open !== false && event.registration_link ? (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-[#0ea5e9] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Play size={14} className="fill-white" /> Register Now
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        Registration Closed
                      </span>
                    )}

                    <Link
                      to={`/events/${slugify(event.name)}`}
                      className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center mx-auto mb-4">
              <Rocket size={28} />
            </div>
            <h3 className="font-display font-bold text-2xl text-slate-900 mb-2">
              Next Big Thing Loading...
            </h3>
            <p className="text-slate-600 font-sans text-sm md:text-base leading-relaxed mb-6">
              We are currently designing and curating our upcoming season of hackathons, ideathons, and technical bootcamps. Join our WhatsApp channel to be the first to know when registrations open!
            </p>
            <a
              href="https://whatsapp.com/channel/0029Vb8eGmx7YScy56dDu93n"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0ea5e9] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#0284c7] transition-all shadow-md"
            >
              Join WhatsApp Channel <ArrowRight size={14} />
            </a>
          </div>
        )}
      </section>

      {/* --- 3. EVENT ARCHIVES CAROUSEL & GRID --- */}
      {carouselEvents.length > 0 && (
        <section className="w-full mt-10 md:mt-16 pb-20 relative z-20 px-4 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200/80 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200/70 text-slate-700 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-3">
                <Sparkles size={14} className="text-[#0ea5e9]" />
                ADC Heritage & Milestones
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
                Event Archives & Highlights
              </h2>
            </div>
            <div className="flex items-center gap-4 self-start md:self-auto">
              {!showAllEvents && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => scrollCarousel('left')}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-[#0ea5e9] hover:border-[#0ea5e9] flex items-center justify-center transition-all hover:scale-105"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => scrollCarousel('right')}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-[#0ea5e9] hover:border-[#0ea5e9] flex items-center justify-center transition-all hover:scale-105"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>
                </div>
              )}
              <button 
                onClick={() => setShowAllEvents(!showAllEvents)} 
                className="text-[#0ea5e9] font-bold text-sm uppercase tracking-widest hover:underline whitespace-nowrap pl-2"
              >
                {showAllEvents ? 'View Carousel' : 'View All'}
              </button>
            </div>
          </div>
          
          {showAllEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {carouselEvents.map((event) => (
                <div 
                  key={event.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group h-full justify-between"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 shrink-0">
                    <img 
                      src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
                      alt={event.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-full text-[11px] font-semibold uppercase tracking-wider">
                        {event.type}
                      </span>
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 rounded-full text-[10px] font-bold font-mono">
                        {new Date(event.event_date).getFullYear()}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-xs uppercase tracking-wider mb-3">
                        <Calendar size={14} className="text-[#0ea5e9]" />
                        <span className="font-semibold">{formatDate(event.event_date, event.end_date)}</span>
                      </div>

                      <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 mb-3 leading-snug group-hover:text-[#0ea5e9] transition-colors min-h-[3.25rem] line-clamp-2">
                        {event.name}
                      </h3>

                      <p className="text-slate-600 font-sans text-sm leading-relaxed line-clamp-3 mb-6">
                        {event.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                      <span className="text-xs font-semibold text-slate-400">
                        Past Event
                      </span>

                      <Link 
                        to={`/events/${slugify(event.name)}`}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        Explore Highlights <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Scroll Area */}
              <div 
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto pb-10 pt-2 px-1 snap-x snap-mandatory hide-scrollbar style-scrollbar"
              >
                {carouselEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="w-[300px] sm:w-[350px] md:w-[380px] bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group snap-start shrink-0 justify-between"
                  >
                    {/* Poster Thumbnail */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 shrink-0">
                      <img 
                        src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
                        alt={event.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-full text-[11px] font-semibold uppercase tracking-wider">
                          {event.type}
                        </span>
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 rounded-full text-[10px] font-bold font-mono">
                          {new Date(event.event_date).getFullYear()}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs uppercase tracking-wider mb-3">
                          <Calendar size={14} className="text-[#0ea5e9]" />
                          <span className="font-semibold">{formatDate(event.event_date, event.end_date)}</span>
                        </div>

                        <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 mb-3 leading-snug group-hover:text-[#0ea5e9] transition-colors line-clamp-2 min-h-[3.25rem]">
                          {event.name}
                        </h3>

                        <p className="text-slate-600 font-sans text-sm leading-relaxed line-clamp-3 mb-6">
                          {event.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                        <span className="text-xs font-semibold text-slate-400">
                          Past Event
                        </span>

                        <Link 
                          to={`/events/${slugify(event.name)}`}
                          className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          Explore Highlights <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Hide scrollbar completely but allow scrolling */}
              <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </div>
          )}
        </section>
      )}

    </div>
  );
};

export default Events;
