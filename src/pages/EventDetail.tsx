import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';
import { fetchDriveFolderImages } from '../lib/driveExtractor';
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
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  }
  if (url.includes('googleusercontent.com')) {
    if (url.includes('=s') || url.includes('=w')) {
      return url.replace(/=[sw]\d+.*$/, `=w${width}`);
    }
    return `${url}=w${width}`;
  }
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
  const [dynamicGalleryImages, setDynamicGalleryImages] = useState<string[]>([]);
  const [isExtractingGallery, setIsExtractingGallery] = useState(false);

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

  // Parse gallery data safely (supports Drive folder URLs, JSON arrays, and comma/newline separated URLs)
  const parseGalleryData = () => {
    if (!event?.gallery_urls) return { folderUrl: null, images: [] };
    let rawItems: string[] = [];
    try {
      const trimmed = event.gallery_urls.trim();
      if (trimmed.startsWith('[')) {
        rawItems = JSON.parse(trimmed);
      } else {
        rawItems = trimmed.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      }
    } catch {
      rawItems = [event.gallery_urls.trim()];
    }

    let folderUrl: string | null = null;
    const images: string[] = [];

    for (const item of rawItems) {
      if (!item) continue;
      if (
        item.includes('drive.google.com/drive/folders') ||
        item.includes('/folders/') ||
        (item.includes('drive.google.com') && !item.includes('/file/d/') && !item.includes('id='))
      ) {
        if (!folderUrl) folderUrl = item;
      } else {
        images.push(item);
      }
    }

    return { folderUrl, images };
  };

  const { folderUrl, images: explicitGalleryImages } = parseGalleryData();

  useEffect(() => {
    const { folderUrl: fUrl, images: explicitImgs } = parseGalleryData();
    if (explicitImgs.length > 0) {
      setDynamicGalleryImages(explicitImgs);
    } else if (fUrl) {
      setIsExtractingGallery(true);
      fetchDriveFolderImages(fUrl)
        .then((extracted) => {
          if (extracted && extracted.length > 0) {
            setDynamicGalleryImages(extracted);
          }
        })
        .catch((err) => console.error("Failed to extract folder images:", err))
        .finally(() => setIsExtractingGallery(false));
    } else {
      setDynamicGalleryImages([]);
    }
  }, [event?.gallery_urls]);

  const galleryImages = dynamicGalleryImages.length > 0 ? dynamicGalleryImages : explicitGalleryImages;

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
          
          {/* ── Right Sidebar Column (Poster & Actions - First on mobile) ── */}
          <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
            <div className="space-y-6">
              
              {/* Event Poster Card */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative group">
                  <img 
                    src={posterSrc} 
                    alt={event.name} 
                    referrerPolicy="no-referrer"
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
                    <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-1">Applications Close In</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {countdown.d}d:{String(countdown.h).padStart(2, '0')}h:{String(countdown.m).padStart(2, '0')}m
                    </p>
                  </div>
                )}
                {event.status !== 'upcoming' && (
                  <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-0.5">Status</p>
                    <p className="text-sm font-bold text-slate-600">Event Completed</p>
                  </div>
                )}

                {/* CTA */}
                {event.status === 'upcoming' && event.is_registration_open !== false && event.registration_link ? (
                  <a 
                    href={event.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-base"
                  >
                    Register Now <ExternalLink size={18} />
                  </a>
                ) : event.show_external_website && event.registration_link ? (
                  <a 
                    href={event.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-base"
                  >
                    Visit Event Website <ExternalLink size={18} />
                  </a>
                ) : (
                  <button 
                    disabled 
                    className="w-full py-4 bg-slate-200 text-slate-400 font-bold rounded-2xl cursor-not-allowed text-base"
                  >
                    Registrations Closed
                  </button>
                )}

                {/* Explore Highlights Button in Sidebar */}
                {(folderUrl || galleryImages.length > 0) && (
                  <Link 
                    to={`/events/${id}/highlights`}
                    className="w-full mt-3 py-3.5 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 text-[#0ea5e9] border border-sky-200/80 hover:border-sky-300 font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 text-sm group"
                  >
                    <Sparkles size={16} />
                    <span>Explore Highlights</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                <p className="text-center text-xs text-slate-400 mt-3 font-medium">Registrations are managed externally.</p>
              </div>

            </div>
          </div>

          {/* ── Left Main Content Column (Second on mobile) ── */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            
            {/* Event Highlights & Moments Showcase Card */}
            {(folderUrl || galleryImages.length > 0) && (
              <div className="bg-gradient-to-br from-white via-sky-50/30 to-slate-50 p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm mb-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] shrink-0">
                      <ImageIcon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Event Highlights & Moments</h2>
                        {galleryImages.length > 0 && (
                          <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9] font-mono text-xs font-bold rounded-full">
                            {galleryImages.length} Photos
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Captures, workshops, awards & participant highlights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <Link
                      to={`/events/${id}/highlights`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg group"
                    >
                      <Sparkles size={15} />
                      <span>Explore Highlights</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Loading skeleton while extracting Drive folder */}
                {isExtractingGallery && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0ea5e9] animate-pulse">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin" />
                      <span>Fetching photos from Google Drive...</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200/80 animate-pulse" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Preview Strip (First 4 photos, 4th has +more overlay) */}
                {!isExtractingGallery && galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImages.slice(0, 4).map((imgUrl, idx) => {
                      const isLast = idx === 3 && galleryImages.length > 4;
                      return (
                        <Link
                          key={idx}
                          to={`/events/${id}/highlights`}
                          className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative block cursor-pointer shadow-2xs hover:shadow-sm transition-all"
                        >
                          <img 
                            src={toDirectImageUrl(imgUrl, 600)!} 
                            alt={`${event.name} Preview ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const match = imgUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || imgUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                              if (match) {
                                const fileId = match[1];
                                if (target.src.includes('googleusercontent.com')) {
                                  target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
                                } else if (!target.src.includes('uc?export=view')) {
                                  target.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                                }
                              }
                            }}
                          />
                          {isLast ? (
                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 group-hover:bg-slate-950/80 transition-colors">
                              <span className="text-xl font-black font-mono">+{galleryImages.length - 3}</span>
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-200">More Photos</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                              <span className="text-white text-xs font-semibold">View Highlights</span>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Empty / Folder-only fallback */}
                {!isExtractingGallery && galleryImages.length === 0 && folderUrl && (
                  <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 text-center sm:text-left">
                      Official photo highlights are available. Click to explore captures.
                    </p>
                    <Link
                      to={`/events/${id}/highlights`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0ea5e9] text-white font-bold text-xs rounded-xl hover:bg-[#0284c7] transition-all shrink-0"
                    >
                      <Sparkles size={14} />
                      <span>Explore Highlights</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            )}

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

          </div>

        </div>
      </div>

    </div>
  );
};

export default EventDetail;
