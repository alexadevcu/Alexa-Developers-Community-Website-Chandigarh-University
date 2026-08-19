import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ExternalLink, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';

interface Member {
  id: string;
  name: string;
  role: string;
  role_category: 'president' | 'vice_president' | 'community_manager' | 'lead' | 'member';
  batch_year: string;
  is_current: boolean;
  photo_url: string | null;
  linkedin_url: string | null;
  instagram_url?: string | null;
  email?: string | null;
  bio: string | null;
  order_index: number;
}

const toDirectImageUrl = (url: string | null, width = 800): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`;
  return url;
};

const CATEGORY_LABELS: Record<string, string> = {
  president: 'PRESIDENT',
  vice_president: 'VICE PRESIDENT',
  community_manager: 'COMMUNITY MANAGER',
  lead: 'EXECUTIVE LEAD',
  member: 'TEAM MEMBER',
};

const TeamMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let data: Member[] | null = null;
        
        // Attempt full fetch
        const res = await supabase.from('team_members').select('*');
        if (res.data) {
          data = res.data as Member[];
        } else if (res.error) {
          console.warn("Full fetch error, attempting base columns fallback:", res.error.message);
          const fallbackRes = await supabase.from('team_members').select('id, name, role, role_category, batch_year, is_current, photo_url, linkedin_url, bio, order_index');
          if (fallbackRes.data) {
            data = fallbackRes.data as Member[];
          }
        }

        if (!data || data.length === 0) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        const rawParam = decodeURIComponent(id).toLowerCase().trim();
        const slugParam = slugify(rawParam);

        const matched = data.find((m: Member) => {
          if (!m) return false;
          const mId = m.id ? m.id.toLowerCase().trim() : '';
          const mNameSlug = m.name ? slugify(m.name) : '';
          const mNameRaw = m.name ? m.name.toLowerCase().trim() : '';

          return (
            mId === rawParam ||
            mId === slugParam ||
            mNameSlug === slugParam ||
            mNameSlug === rawParam ||
            mNameRaw === rawParam
          );
        });

        if (!matched) {
          console.warn("No team member matched for parameter:", id, "Available members:", data.map(m => ({ id: m.id, name: m.name, slug: slugify(m.name) })));
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setMember(matched);

        // Preload photo if available
        if (matched.photo_url) {
          const imgUrl = toDirectImageUrl(matched.photo_url);
          if (imgUrl) {
            const img = new Image();
            img.onload = () => setIsLoading(false);
            img.onerror = () => setIsLoading(false);
            img.src = imgUrl;
            return;
          }
        }
        setIsLoading(false);

      } catch (err) {
        console.error("Error fetching member detail:", err);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-[#0ea5e9]/20 border-t-[#0ea5e9]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-slate-400 text-xs font-mono tracking-widest uppercase animate-pulse">Loading Profile</p>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center pt-28">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
          <User size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Member Not Found</h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          The team member profile you are looking for does not exist or may have been removed.
        </p>
        <Link
          to="/team"
          className="px-6 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-md"
        >
          <ArrowLeft size={18} /> Back to Team
        </Link>
      </div>
    );
  }

  const imgUrl = toDirectImageUrl(member.photo_url);
  const categoryTitle = CATEGORY_LABELS[member.role_category] || 'EXECUTIVE LEAD';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0ea5e9]/20 pb-32 pt-20">
      
      {/* ── Top Back Button Header ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-6 pb-4">
        <button
          onClick={() => navigate('/team')}
          className="p-2 text-slate-700 hover:text-[#0ea5e9] transition-colors rounded-lg hover:bg-slate-100 flex items-center gap-2 group"
          aria-label="Back to Team"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Role Category Tagline */}
          <p className="text-[#0a369d] font-mono text-xs font-bold uppercase tracking-[0.25em] mb-2">
            {categoryTitle}
          </p>

          {/* Member Name */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-12">
            {member.name}
          </h1>

          {/* Card Hero Container */}
          <div className="relative w-full rounded-3xl bg-slate-50/50 p-6 md:p-10 border border-slate-100 overflow-hidden mb-16">
            
            {/* Faded Role Title Watermark Background */}
            <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 text-[6rem] sm:text-[10rem] md:text-[14rem] font-black text-slate-200/40 uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
              {member.role || categoryTitle}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              
              {/* Profile Photo */}
              <div className="w-48 h-56 sm:w-56 sm:h-64 md:w-64 md:h-72 rounded-2xl overflow-hidden bg-slate-200 shadow-sm shrink-0 border border-slate-200">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <User size={80} />
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 text-center md:text-left pt-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0a369d] uppercase tracking-tight leading-tight mb-2">
                  {member.role || 'CORE TEAM MEMBER'}
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm sm:text-base mb-1">
                  COMPUTER SCIENCE
                </p>
                <p className="text-slate-400 font-mono text-xs sm:text-sm font-semibold tracking-wider mb-6">
                  {member.batch_year || '2024-2028'}
                </p>

                {member.bio && (
                  <p className="text-slate-600 font-medium text-base sm:text-lg leading-relaxed max-w-2xl bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60">
                    {member.bio}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full border-t border-slate-200 mb-2" />

          {/* Social Links List (as specified: LINKEDIN, INSTAGRAM, EMAIL) */}
          <div className="w-full divide-y divide-slate-200 border-b border-slate-200">
            
            {/* LINKEDIN */}
            <a
              href={member.linkedin_url || '#'}
              target={member.linkedin_url ? "_blank" : "_self"}
              rel="noreferrer"
              onClick={(e) => { if (!member.linkedin_url) { e.preventDefault(); } }}
              className={`py-5 px-2 flex items-center justify-between group transition-colors ${
                member.linkedin_url ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="font-black text-xl sm:text-2xl text-[#0f172a] uppercase tracking-wider group-hover:text-[#0a369d] transition-colors">
                LINKEDIN
              </span>
              {member.linkedin_url && (
                <ExternalLink size={20} className="text-slate-400 group-hover:text-[#0a369d] transition-colors" />
              )}
            </a>

            {/* INSTAGRAM */}
            <a
              href={member.instagram_url || '#'}
              target={member.instagram_url ? "_blank" : "_self"}
              rel="noreferrer"
              onClick={(e) => { if (!member.instagram_url) { e.preventDefault(); } }}
              className={`py-5 px-2 flex items-center justify-between group transition-colors ${
                member.instagram_url ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="font-black text-xl sm:text-2xl text-[#0f172a] uppercase tracking-wider group-hover:text-[#0a369d] transition-colors">
                INSTAGRAM
              </span>
              {member.instagram_url && (
                <ExternalLink size={20} className="text-slate-400 group-hover:text-[#0a369d] transition-colors" />
              )}
            </a>

            {/* EMAIL */}
            <a
              href={member.email ? `mailto:${member.email}` : '#'}
              onClick={(e) => { if (!member.email) { e.preventDefault(); } }}
              className={`py-5 px-2 flex items-center justify-between group transition-colors ${
                member.email ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="font-black text-xl sm:text-2xl text-[#0f172a] uppercase tracking-wider group-hover:text-[#0a369d] transition-colors">
                EMAIL
              </span>
              {member.email && (
                <Mail size={20} className="text-slate-400 group-hover:text-[#0a369d] transition-colors" />
              )}
            </a>

          </div>

        </motion.div>
      </div>

    </div>
  );
};

export default TeamMemberDetail;
