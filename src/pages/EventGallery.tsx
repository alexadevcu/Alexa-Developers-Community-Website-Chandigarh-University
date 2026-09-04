import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Share2, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  Calendar, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2 
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
  gallery_urls?: string | null;
  venue?: string | null;
}

export const toDirectImageUrl = (url: string | null, width = 1200): string | null => {
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

const EventGallery: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Lightbox Modal State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('events').select('*');

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

        // Parse gallery URLs
        if (matched.gallery_urls) {
          let rawItems: string[] = [];
          try {
            const trimmed = matched.gallery_urls.trim();
            if (trimmed.startsWith('[')) {
              rawItems = JSON.parse(trimmed);
            } else {
              rawItems = trimmed.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
            }
          } catch {
            rawItems = [matched.gallery_urls.trim()];
          }

          let foundFolder: string | null = null;
          const explicitImgs: string[] = [];

          for (const item of rawItems) {
            if (!item) continue;
            if (
              item.includes('drive.google.com/drive/folders') ||
              item.includes('/folders/') ||
              (item.includes('drive.google.com') && !item.includes('/file/d/') && !item.includes('id='))
            ) {
              if (!foundFolder) foundFolder = item;
            } else {
              explicitImgs.push(item);
            }
          }

          if (explicitImgs.length > 0) {
            setGalleryImages(explicitImgs);
          } else if (foundFolder) {
            setIsExtracting(true);
            try {
              const extracted = await fetchDriveFolderImages(foundFolder);
              if (extracted && extracted.length > 0) {
                setGalleryImages(extracted);
              }
            } catch (err) {
              console.error("Failed to extract folder photos:", err);
            } finally {
              setIsExtracting(false);
            }
          }
        }
      } catch (err) {
        console.error("Error loading event gallery:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activePhotoIndex === null) return;
    if (e.key === 'Escape') {
      setActivePhotoIndex(null);
    } else if (e.key === 'ArrowLeft') {
      setActivePhotoIndex(prev => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
    } else if (e.key === 'ArrowRight') {
      setActivePhotoIndex(prev => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
    }
  }, [activePhotoIndex, galleryImages.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event?.name || 'ADC CU'} - Highlights & Moments`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Gallery link copied to clipboard!');
    }
  };

  const formatDate = () => {
    if (!event) return '';
    const start = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (event.end_date) {
      const end = new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    }
    return start;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 pt-16">
        <motion.div
          className="w-14 h-14 rounded-full border-4 border-[#0ea5e9]/20 border-t-[#0ea5e9]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading Event Gallery</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center pt-24">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
          <ImageIcon size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Gallery Not Found</h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          The photo highlights for this event may not be available or the link is invalid.
        </p>
        <Link
          to="/events"
          className="px-6 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-md"
        >
          <ArrowLeft size={18} /> Back to Events
        </Link>
      </div>
    );
  }

  const activePhotoUrl = activePhotoIndex !== null ? galleryImages[activePhotoIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#0ea5e9]/20 pb-32 pt-16">
      
      {/* ── Sub Navigation Bar ────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-12 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-[#0ea5e9] font-bold text-sm transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Event Details</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9] text-[#0ea5e9] hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Share2 size={14} /> 
              <span>Share Highlights</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Gallery Header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3.5 py-1 bg-sky-50 text-[#0ea5e9] border border-sky-200 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} />
                EVENT HIGHLIGHTS & MEMORIES
              </span>
              {galleryImages.length > 0 && (
                <span className="px-3.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-mono text-xs font-semibold">
                  {galleryImages.length} Photos Captured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
              {event.name}
            </h1>

            {/* Subtitle & Info */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600 font-mono text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#0ea5e9]" />
                <span>{formatDate()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#0ea5e9]" />
                <span>{event.venue || "Chandigarh University"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Photo Gallery Grid ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10">
        
        {/* Loading skeleton */}
        {isExtracting && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0ea5e9] animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin" />
              <span>Loading high-resolution photo highlights...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200/80 animate-pulse flex items-center justify-center text-slate-300">
                  <ImageIcon size={32} className="opacity-40" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Photos */}
        {!isExtracting && galleryImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((imgUrl, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.5) }}
                onClick={() => setActivePhotoIndex(idx)}
                className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative cursor-pointer shadow-xs hover:shadow-md transition-all"
              >
                <img 
                  src={toDirectImageUrl(imgUrl, 600)!} 
                  alt={`${event.name} Moment ${idx + 1}`} 
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

                {/* Hover overlay with zoom hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5 text-white">
                  <span className="text-xs font-mono font-medium">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Maximize2 size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state fallback */}
        {!isExtracting && galleryImages.length === 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9]">
              <ImageIcon size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Photos Being Curated</h2>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Highlights and captured moments from this event will appear here once uploaded by the community team.
              </p>
            </div>
            <Link
              to={`/events/${event.id}`}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Event Details</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Interactive Full-Screen Lightbox Modal ──────────────────── */}
      <AnimatePresence>
        {activePhotoIndex !== null && activePhotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Lightbox Top Header */}
            <div 
              className="flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs md:text-sm font-semibold text-white/80 bg-white/10 px-3 py-1.5 rounded-lg">
                  {activePhotoIndex + 1} / {galleryImages.length}
                </span>
                <span className="text-xs md:text-sm font-medium text-white/60 hidden sm:inline">
                  {event.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={toDirectImageUrl(activePhotoUrl, 1600)!}
                  download={`ADC_CU_${slugify(event.name)}_photo_${activePhotoIndex + 1}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Download Photo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} />
                  <span className="hidden md:inline">Download</span>
                </a>
                <a
                  href={toDirectImageUrl(activePhotoUrl, 1600)!}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Open Original in New Tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => setActivePhotoIndex(null)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Close (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lightbox Main Image Area */}
            <div 
              className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={activePhotoIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                src={toDirectImageUrl(activePhotoUrl, 1600)!}
                alt={`${event.name} High Resolution Photo`}
                referrerPolicy="no-referrer"
                className="max-h-[82vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  const match = activePhotoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || activePhotoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                  if (match) {
                    const fileId = match[1];
                    if (target.src.includes('googleusercontent.com')) {
                      target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
                    } else if (!target.src.includes('uc?export=view')) {
                      target.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                    }
                  }
                }}
              />

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex(prev => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
                }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all shadow-lg hover:scale-110"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex(prev => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all shadow-lg hover:scale-110"
                title="Next photo (Right arrow)"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Lightbox Bottom Footer / Thumbnails hint */}
            <div 
              className="flex items-center justify-center text-xs text-white/50 font-mono text-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Use arrow keys (← / →) or swipe to navigate &bull; Esc to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventGallery;
