import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, Play, Info } from 'lucide-react';
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

const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [heroEvents, setHeroEvents] = useState<Event[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [carouselEvents, setCarouselEvents] = useState<Event[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Reset description expansion when hero changes
  useEffect(() => {
    setIsDescExpanded(false);
  }, [heroIndex]);

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

          // If there's an eventId in the URL, redirect to dedicated page
          const eventId = searchParams.get('eventId');
          if (eventId) {
            navigate(`/events/${eventId}`, { replace: true });
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
                  <span className="text-[#0ea5e9] font-mono text-xs md:text-sm font-bold">
                    {heroEvents[heroIndex].type}
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black text-slate-900 mb-4 md:mb-6 tracking-tight leading-[0.95] drop-shadow-sm max-w-5xl">
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

      {/* --- EVENT ARCHIVES CAROUSEL & GRID --- */}
      {carouselEvents.length > 0 && (
        <div className="w-full mt-10 md:-mt-24 relative z-20 px-4 md:px-12 lg:px-16">
          <div className="flex justify-between items-center max-w-7xl mx-auto mb-6 px-2 md:px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight drop-shadow-sm">
              Event Archives & Highlights
            </h2>
            <button 
              onClick={() => setShowAllEvents(!showAllEvents)} 
              className="text-[#0ea5e9] font-bold text-sm tracking-wide hover:underline whitespace-nowrap px-4"
            >
              {showAllEvents ? 'View Carousel' : 'View All'}
            </button>
          </div>
          
          {showAllEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4 pb-16 px-2 md:px-4">
              {carouselEvents.map((event) => (
                <Link 
                  key={event.id}
                  to={`/events/${slugify(event.name)}`}
                  className="h-[200px] md:h-[240px] relative rounded-xl overflow-hidden cursor-pointer border border-slate-200 bg-white group/card transition-all duration-500 hover:scale-105 hover:z-30 hover:shadow-xl shadow-sm block"
                >
                  <img 
                    src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
                    alt={event.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                    <span className="text-[#0ea5e9] font-bold text-xs uppercase tracking-wider mb-1 drop-shadow-sm">
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative group/slider">
              
              {/* Scroll Left Button */}
              <button 
                onClick={() => scrollCarousel('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 shadow-xl text-slate-800 hover:text-[#0ea5e9] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
  
              {/* Scroll Area */}
              <div 
                ref={carouselRef}
                className="flex gap-3 md:gap-4 overflow-x-auto pb-16 pt-6 px-2 md:px-4 snap-x snap-mandatory hide-scrollbar style-scrollbar"
              >
                {carouselEvents.map((event) => (
                  <Link 
                    key={event.id}
                    to={`/events/${slugify(event.name)}`}
                    className="min-w-[260px] md:min-w-[320px] lg:min-w-[380px] h-[146px] md:h-[180px] lg:h-[214px] relative rounded-xl overflow-hidden snap-start cursor-pointer border border-slate-200 bg-white group/card transition-all duration-500 hover:scale-105 hover:z-30 hover:shadow-xl shadow-sm shrink-0 block"
                  >
                    {/* Thumbnail Image */}
                    <img 
                      src={toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
                      alt={event.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Dark gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                      <span className="text-[#0ea5e9] font-bold text-xs uppercase tracking-wider mb-1 drop-shadow-sm">
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
                  </Link>
                ))}
              </div>
  
              {/* Scroll Right Button */}
              <button 
                onClick={() => scrollCarousel('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 shadow-xl text-slate-800 hover:text-[#0ea5e9] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} strokeWidth={2.5} />
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

    </div>
  );
};

export default Events;
