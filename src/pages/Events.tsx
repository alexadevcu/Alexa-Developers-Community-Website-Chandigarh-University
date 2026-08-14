import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, Play, Info, X, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const toDirectImageUrl = (url: string | null, width = 800): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  return url;
};
// â”€â”€ Countdown timer hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const [time, setTime] = React.useState(calc);
  React.useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);
  return time;
}

// â”€â”€ Event Detail Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EventDetailOverlay: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
  const countdown = useCountdown(event.status === 'upcoming' ? event.end_date || event.event_date : null);

  const defaultEligibility = "Open to all students. Individual based participation";
  const defaultWhyParticipate = "Expert mentorship and industry relevant themes\nCertificates and networking opportunities\nHosted on campus at Chandigarh University";
  const defaultVenue = "Chandigarh University, Mohali, Punjab";


  const formatDateRange = () => {
    const start = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (event.end_date) {
      const end = new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
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

            {/* Left column */}
            <div className="flex-1 min-w-0 order-2 md:order-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">{event.name}</h1>

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

              {event.type && (
                <div className="border-t border-slate-100 pt-6 mb-6">
                  <span className="px-3 py-1.5 bg-[#006783]/10 text-[#006783] rounded-full text-sm font-semibold">{event.type}</span>
                </div>
              )}
              
              <div className="border-t border-slate-100 pt-6 mb-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Hosted By</p>
                <p className="text-slate-700 font-semibold">Alexa Developers Community — Chandigarh University</p>
              </div>

              {event.partnerships && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">In Partnership With</p>
                  <p className="text-slate-700 font-semibold">{event.partnerships}</p>
                </div>
              )}

              {/* Gallery */}
              {event.gallery_urls && (() => {
                const urls = event.gallery_urls!.split(',').map(u => u.trim()).filter(Boolean);
                if (urls.length === 0) return null;
                const teamPicUrl = toDirectImageUrl(urls[0]);
                const otherPics = urls.slice(1);
                return (
                  <div className="border-t border-slate-100 pt-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ImageIcon size={18} className="text-[#0ea5e9]" /> Event Gallery
                    </h2>
                    <div className="flex flex-col gap-4">
                      {teamPicUrl && (
                        <div className="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                          <div className="absolute top-4 left-4 bg-white/90 text-slate-800 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">Team Picture</div>
                          <img src={teamPicUrl} alt="Team" className="w-full h-auto object-cover max-h-[400px]" referrerPolicy="no-referrer"
                            onError={(e) => {
                              const img = e.currentTarget;
                              const match = urls[0].match(/\/d\/([a-zA-Z0-9_-]+)/) || urls[0].match(/[?&]id=([a-zA-Z0-9_-]+)/);
                              const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                              if (fallback && img.src !== fallback) img.src = fallback; else img.style.display = 'none';
                            }} />
                        </div>
                      )}
                      {otherPics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {otherPics.map((originalUrl, idx) => {
                            const imgUrl = toDirectImageUrl(originalUrl);
                            if (!imgUrl) return null;
                            return (
                              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const img = e.currentTarget;
                                    const match = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || originalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                    const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                                    if (fallback && img.src !== fallback) img.src = fallback; else img.style.display = 'none';
                                  }} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Right sidebar */}
            <div className="w-full md:w-72 lg:w-80 shrink-0 order-1 md:order-2 mb-6 md:mb-0">
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200 shadow-sm">
                <img
                  src={toDirectImageUrl(event.poster_url) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="font-bold text-slate-900 text-sm leading-snug">{event.name}</p>
                </div>
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Runs From</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDateRange()}</p>
                </div>
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Happening</p>
                  <p className="text-sm font-semibold text-slate-700">{event.venue || defaultVenue}</p>
                </div>
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
}

const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [heroEvents, setHeroEvents] = useState<Event[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [carouselEvents, setCarouselEvents] = useState<Event[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Reset description expansion when hero changes
  useEffect(() => {
    setIsDescExpanded(false);
  }, [heroIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedEvent]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
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
          setCarouselEvents(past);

          // If there's an eventId in the URL, open its details
          const eventId = searchParams.get('eventId');
          if (eventId) {
            const ev = data.find((e) => e.id === eventId);
            if (ev) {
              setSelectedEvent(ev);
            }
          }

          // Preload the hero image before dismissing the loader
          if (hero.length > 0) {
            const imgUrl = toDirectImageUrl(hero[0].poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
            const img = new Image();
            img.onload = () => setIsLoading(false);
            img.onerror = () => setIsLoading(false);
            img.src = imgUrl;
          } else {
            setIsLoading(false);
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
                className="w-full h-full object-cover origin-center opacity-70"
              />
              {/* Soft Gradient Overlays for Light Theme text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent w-full md:w-[75%] z-10"></div>
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
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-display font-black text-slate-800 mb-4 md:mb-6 tracking-tighter leading-[0.9] drop-shadow-sm max-w-5xl uppercase">
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
                  ) : (
                    <button className="px-6 py-3 md:px-8 md:py-3.5 bg-slate-200 text-slate-500 font-bold text-base md:text-lg rounded-xl cursor-not-allowed flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center">
                      Registration Closed
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedEvent(heroEvents[heroIndex])}
                    className="px-6 py-3 md:px-8 md:py-3.5 bg-white text-slate-700 font-bold text-base md:text-lg rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 md:gap-3 shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Info size={20} className="text-[#0ea5e9]" /> More Info
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Netflix-style Slide Controls â€” arrows + dots, shown on hover */}
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

                {/* Dot Indicators â€” bottom center */}
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

      {/* --- EVENT ARCHIVES CAROUSEL & GRID --- */}
      {carouselEvents.length > 0 && (
        <div className="w-full mt-10 md:-mt-24 relative z-20 px-4 md:px-12 lg:px-16">
          <div className="flex justify-between items-end mb-4 ml-2 md:ml-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-800 tracking-tight drop-shadow-sm">
              Event Archives & Highlights
            </h2>
            <button 
              onClick={() => setShowAllEvents(!showAllEvents)} 
              className="text-[#0ea5e9] font-bold text-sm uppercase tracking-widest hover:underline whitespace-nowrap px-4"
            >
              {showAllEvents ? 'View Carousel' : 'View All'}
            </button>
          </div>
          
          {showAllEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4 pb-16 px-2 md:px-4">
              {carouselEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="h-[200px] md:h-[240px] relative rounded-xl overflow-hidden cursor-pointer border border-slate-200 bg-white group/card transition-all duration-500 hover:scale-105 hover:z-30 hover:shadow-xl shadow-sm"
                >
                  <img 
                    src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
                    alt={event.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                    <span className="text-[#0ea5e9] font-bold text-[10px] uppercase tracking-[0.2em] mb-1 drop-shadow-sm">
                      {event.type}
                    </span>
                    <h3 className="font-display text-base md:text-lg text-white font-bold leading-tight mb-2 drop-shadow-md">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold font-mono">
                      <span className="border border-white/50 text-white/90 px-1 rounded">ADC</span>
                      <span className="text-white/80">{new Date(event.event_date).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative group/slider">
              
              {/* Scroll Left Button */}
              <button 
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-0 bottom-0 z-40 w-12 md:w-16 bg-gradient-to-r from-slate-50 to-transparent flex items-center justify-start opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
              >
                <ChevronLeft size={48} className="text-slate-800 hover:scale-110 transition-transform drop-shadow-md ml-[-10px]" />
              </button>
  
              {/* Scroll Area */}
              <div 
                ref={carouselRef}
                className="flex gap-3 md:gap-4 overflow-x-auto pb-16 pt-6 px-2 md:px-4 snap-x snap-mandatory hide-scrollbar style-scrollbar"
              >
                {carouselEvents.map((event) => (
                  <div 
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="min-w-[260px] md:min-w-[320px] lg:min-w-[380px] h-[146px] md:h-[180px] lg:h-[214px] relative rounded-xl overflow-hidden snap-start cursor-pointer border border-slate-200 bg-white group/card transition-all duration-500 hover:scale-105 hover:z-30 hover:shadow-xl shadow-sm"
                  >
                    {/* Thumbnail Image */}
                    <img 
                      src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
                      alt={event.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Constant subtle vignette (Light variation) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                    
                    {/* Content - ALWAYS VISIBLE */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                      <span className="text-[#0ea5e9] font-bold text-[10px] uppercase tracking-[0.2em] mb-1 drop-shadow-sm">
                        {event.type}
                      </span>
                      <h3 className="font-display text-base md:text-lg text-white font-bold leading-tight mb-2 drop-shadow-md">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold font-mono">
                        <span className="border border-white/50 text-white/90 px-1 rounded">ADC</span>
                        <span className="text-white/80">{new Date(event.event_date).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Scroll Right Button */}
              <button 
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-0 bottom-0 z-40 w-12 md:w-16 bg-gradient-to-l from-slate-50 to-transparent flex items-center justify-end opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
              >
                <ChevronRight size={48} className="text-slate-800 hover:scale-110 transition-transform drop-shadow-md mr-[-10px]" />
              </button>
  
              {/* Hide scrollbar completely but allow scrolling */}
              <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </div>
          )}
        </div>
      )}

      {/* Rich Event Detail Overlay */}
      <AnimatePresence>
        {selectedEvent && <EventDetailOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </AnimatePresence>

    </div>
  );
};

export default Events;
