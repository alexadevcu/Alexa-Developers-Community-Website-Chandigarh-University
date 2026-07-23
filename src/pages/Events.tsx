import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, Play, Info, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

const toDirectImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
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
}

const Events: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [heroEvents, setHeroEvents] = useState<Event[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
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
          .order('event_date', { ascending: false });

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
            // Optionally clear the query param so refreshing doesn't keep opening it, or leave it for shareable links.
            // Leaving it allows direct linking.
          }
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
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

  // Auto-rotate Hero banner
  useEffect(() => {
    if (heroEvents.length <= 1) return;
    const interval = setInterval(() => {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-[4px] border-[#0ea5e9]/20 border-t-[#0ea5e9] rounded-full animate-spin"></div>
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
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <img 
                src={heroEvents[heroIndex].poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
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

            {/* Netflix-style Slide Controls — arrows + dots, shown on hover */}
            {heroEvents.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={() => setHeroIndex(prev => (prev - 1 + heroEvents.length) % heroEvents.length)}
                  className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-[#0ea5e9] transition-all duration-200 opacity-100 md:opacity-0 group-hover:opacity-100 hover:scale-110"
                  aria-label="Previous event"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => setHeroIndex(prev => (prev + 1) % heroEvents.length)}
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
                      onClick={() => setHeroIndex(idx)}
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
                    src={event.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
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
                      src={event.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"} 
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

      {/* --- EXPANDED INFO MODAL (Clean Light Theme) --- */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
              >
                {/* Modal Header / Hero Image */}
                <div className="relative w-full h-[40vh] md:h-[50vh] shrink-0 bg-slate-100">
                  <img 
                    src={selectedEvent.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
                    alt={selectedEvent.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                  
                  {/* Close Button */}
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center transition-colors shadow-sm z-10"
                  >
                    <X size={24} />
                  </button>

                  {/* Modal Title inside Image */}
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black text-slate-800 mb-3 md:mb-4 uppercase drop-shadow-sm">
                      {selectedEvent.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                      {selectedEvent.status === 'upcoming' && selectedEvent.is_registration_open !== false && selectedEvent.registration_link ? (
                        <a 
                          href={selectedEvent.registration_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-2.5 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Play size={20} className="fill-white" /> Register
                        </a>
                      ) : (
                        <button className="px-6 py-2.5 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed">
                          Registration Closed
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Content Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 text-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* Left Column: Description */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-4 font-mono text-sm uppercase font-bold">
                        <span className="border border-slate-300 text-slate-500 px-2 py-0.5 rounded">{new Date(selectedEvent.event_date).getFullYear()}</span>
                        <span className="text-[#0ea5e9]">{selectedEvent.type}</span>
                      </div>
                      <p className="font-sans text-lg leading-relaxed text-slate-600 mb-6">
                        {selectedEvent.description}
                      </p>
                      
                      {/* Event Gallery */}
                      {selectedEvent.gallery_urls && (
                        <div className="mt-8 pt-8 border-t border-slate-200">
                          <h3 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <ImageIcon size={20} className="text-[#0ea5e9]" /> Event Gallery
                          </h3>
                          {(() => {
                            const urls = selectedEvent.gallery_urls.split(',').map(u => u.trim()).filter(Boolean);
                            if (urls.length === 0) return null;
                            
                            const teamPicUrl = toDirectImageUrl(urls[0]);
                            const otherPics = urls.slice(1);
                            
                            return (
                              <div className="flex flex-col gap-6">
                                {/* Team Pic (First Image) */}
                                {teamPicUrl && (
                                  <div className="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group">
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm z-10 flex items-center gap-2">
                                      Team Picture
                                    </div>
                                    <img 
                                      src={teamPicUrl} 
                                      alt="Team" 
                                      className="w-full h-auto object-cover max-h-[450px]" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const img = e.currentTarget;
                                        const match = urls[0].match(/\/d\/([a-zA-Z0-9_-]+)/) || urls[0].match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                        const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                                        if (fallback && img.src !== fallback) img.src = fallback;
                                        else img.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {/* Rest of the Event Pics */}
                                {otherPics.length > 0 && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {otherPics.map((originalUrl, idx) => {
                                      const imgUrl = toDirectImageUrl(originalUrl);
                                      if (!imgUrl) return null;
                                      return (
                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:shadow-md transition-shadow">
                                          <img 
                                            src={imgUrl} 
                                            alt={`Gallery ${idx + 1}`} 
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              const img = e.currentTarget;
                                              const match = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || originalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                              const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                                              if (fallback && img.src !== fallback) img.src = fallback;
                                              else img.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="flex flex-col gap-4 font-sans text-sm">
                      <div>
                        <span className="text-slate-400">Status: </span>
                        <span className={`capitalize font-semibold ${selectedEvent.status === 'upcoming' ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {selectedEvent.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Date: </span>
                        <span className="font-semibold text-slate-700">{formatDate(selectedEvent.event_date, selectedEvent.end_date)}</span>
                      </div>
                      {selectedEvent.partnerships && (
                        <div>
                          <span className="text-slate-400">Partnerships: </span>
                          <span className="font-semibold text-[#0ea5e9]">{selectedEvent.partnerships}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Community: </span>
                        <span className="font-semibold text-slate-700">ADC CU</span>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Events;
