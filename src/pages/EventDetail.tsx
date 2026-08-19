import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  name: string;
  type: string;
  description: string;
  partnerships?: string | null;
  event_date: string;
  end_date?: string | null;
  registration_link: string;
  poster_url: string;
  status: 'upcoming' | 'completed';
  is_registration_open?: boolean;
  gallery_urls?: string | null;
  is_archived?: boolean;
  venue?: string | null;
  why_participate?: string | null;
  eligibility?: string | null;
  rules_guidelines?: string | null;
  show_external_website?: boolean;
}

const toDirectImageUrl = (url: string | null, width = 1200): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  return url;
};

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
  }, [targetDate]);
  return time;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const countdown = useCountdown(event?.status === 'upcoming' ? event.end_date || event.event_date : null);

  const defaultEligibility = "Open to all students across all branches and universities. Individual & team entries permitted.";
  const defaultWhyParticipate = "• Expert mentorship and industry-relevant domain tracks\n• Exclusive certificates, swags, and networking opportunities\n• Live hosted sessions on campus at Chandigarh University";
  const defaultVenue = "Chandigarh University, Mohali, Punjab";

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch events list and match by slug or exact UUID
        const { data, error } = await supabase
          .from('events')
          .select('*');

        if (error || !data || data.length === 0) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        const targetParam = decodeURIComponent(id).toLowerCase();
        const matched = data.find(
          (e: Event) => e.id.toLowerCase() === targetParam || slugify(e.name) === targetParam
        );

        if (!matched) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setEvent(matched);

        // Preload poster image before dismissing loader
        const poster = toDirectImageUrl(matched.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop";
        const img = new Image();
        img.onload = () => setIsLoading(false);
        img.onerror = () => setIsLoading(false);
        img.src = poster;

      } catch (err) {
        console.error("Error fetching event details:", err);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDateRange = () => {
    if (!event) return '';
    const start = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (event.end_date) {
      const end = new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    }
    return start;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name || 'ADC CU Event',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  // Parse gallery images safely
  const getGalleryImages = (): string[] => {
    if (!event?.gallery_urls) return [];
    try {
      if (event.gallery_urls.startsWith('[')) {
        return JSON.parse(event.gallery_urls);
      }
      return event.gallery_urls.split(',').map(s => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  };

  const galleryImages = getGalleryImages();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 pt-16">
        <motion.div
          className="w-14 h-14 rounded-full border-4 border-[#0ea5e9]/20 border-t-[#0ea5e9]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading Event Details</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center pt-24">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
          <Calendar size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Event Not Found</h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          The event you are looking for may have been removed, archived, or the link is invalid.
        </p>
        <Link
          to="/events"
          className="px-6 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-md"
        >
          <ArrowLeft size={18} /> Explore All Events
        </Link>
      </div>
    );
  }

  const posterSrc = toDirectImageUrl(event.poster_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#0ea5e9]/20 pb-32 pt-16">
      
      {/* ── Sub Navigation Bar (Positioned cleanly below 64px fixed Navbar) ── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-12 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-slate-600 hover:text-[#0ea5e9] font-bold text-sm transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Clean Light Theme Header ────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80 pt-8 pb-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Status & Category Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {event.status === 'upcoming' ? (
                <span className="px-3.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  UPCOMING PREMIERE
                </span>
              ) : (
                <span className="px-3.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-bold text-xs uppercase tracking-[0.2em]">
                  PAST HIGHLIGHT
                </span>
              )}
              {event.type && (
                <span className="px-3.5 py-1 bg-sky-50 text-[#0ea5e9] border border-sky-200 rounded-full font-semibold text-xs uppercase tracking-wider">
                  {event.type}
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4 max-w-4xl tracking-tight">
              {event.name}
            </h1>

            {/* Date & Location Brief */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600 font-mono text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#0ea5e9]" />
                <span className="font-semibold">{formatDateRange()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#0ea5e9]" />
                <span className="font-semibold">{event.venue || defaultVenue}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content & Sidebar Grid ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ── Left Main Content Column ────────────────────────── */}
          <div className="flex-1 min-w-0">
            
            {/* About the Event */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-[#0ea5e9]" size={22} />
                <h2 className="text-2xl font-bold text-slate-900">About the Event</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                {event.description || 'Full event details coming soon.'}
              </p>
            </div>

            {/* Why Participate */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Award className="text-[#0ea5e9]" size={22} />
                <h2 className="text-2xl font-bold text-slate-900">Why Participate?</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                {event.why_participate || defaultWhyParticipate}
              </p>
            </div>

            {/* Eligibility */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-[#0ea5e9]" size={22} />
                <h2 className="text-2xl font-bold text-slate-900">Eligibility</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                {event.eligibility || defaultEligibility}
              </p>
            </div>

            {/* Rules & Guidelines */}
            {event.rules_guidelines && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-[#0ea5e9]" size={22} />
                  <h2 className="text-2xl font-bold text-slate-900">Rules & Guidelines</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                  {event.rules_guidelines}
                </p>
              </div>
            )}

            {/* Partnerships */}
            {event.partnerships && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
                <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-2">In Partnership With</p>
                <p className="text-xl font-bold text-slate-800">{event.partnerships}</p>
              </div>
            )}

            {/* Event Gallery */}
            {galleryImages.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="text-[#0ea5e9]" size={22} />
                  <h2 className="text-2xl font-bold text-slate-900">Event Gallery & Moments</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                      <img 
                        src={toDirectImageUrl(imgUrl, 600)!} 
                        alt={`${event.name} Gallery ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Right Sidebar Column ────────────────────────── */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="space-y-6">
              
              {/* Event Poster Card */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative group">
                  <img 
                    src={posterSrc} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Action Box: Countdown & Registration */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                
                {/* Dates */}
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-1">Runs From</p>
                  <p className="text-base font-bold text-slate-800">{formatDateRange()}</p>
                </div>

                {/* Venue */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-1">Happening At</p>
                  <p className="text-base font-bold text-slate-800">{event.venue || defaultVenue}</p>
                </div>

                {/* Countdown Timer */}
                {event.status === 'upcoming' && !countdown.over && (
                  <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-2 flex items-center justify-center gap-1.5">
                      <Clock size={14} className="text-[#0ea5e9]" /> Applications Close In
                    </p>
                    <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {countdown.d}d:{String(countdown.h).padStart(2,'0')}h:{String(countdown.m).padStart(2,'0')}m
                    </div>
                  </div>
                )}

                {/* Registration / External Website CTA Button */}
                {event.status === 'upcoming' && event.is_registration_open !== false && event.registration_link ? (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-[#0ea5e9] text-white font-bold text-lg rounded-2xl hover:bg-[#0284c7] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    Register Now <ExternalLink size={18} />
                  </a>
                ) : event.registration_link && event.show_external_website ? (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-slate-900 text-white font-bold text-base rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    Visit Event Website <ExternalLink size={18} />
                  </a>
                ) : (
                  <button 
                    disabled 
                    className="w-full py-4 bg-slate-100 text-slate-400 font-bold text-base rounded-2xl cursor-not-allowed text-center"
                  >
                    {event.status === 'upcoming' ? 'Registration Closed' : 'Event Concluded'}
                  </button>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    Hosted by <span className="font-semibold text-slate-600">Alexa Developers Community — CU</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default EventDetail;
