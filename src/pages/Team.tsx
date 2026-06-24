import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Member {
  id: string;
  name: string;
  role: string;
  role_category: 'president' | 'vice_president' | 'community_manager' | 'lead' | 'member';
  batch_year: string;
  is_current: boolean;
  photo_url: string | null;
  linkedin_url: string | null;
  bio: string | null;
  order_index: number;
}

// Convert Google Drive share link → embeddable image URL
const toDirectImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return url;
};

const CATEGORY_ORDER = ['president', 'vice_president', 'community_manager', 'lead', 'member'];
const CATEGORY_LABELS: Record<string, string> = {
  president: 'President',
  vice_president: 'Vice Presidents',
  community_manager: 'Community Managers',
  lead: 'Leads',
  member: 'Members',
};
const CATEGORY_COLS: Record<string, string> = {
  president: 'grid-cols-1 max-w-xs mx-auto',
  vice_president: 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto',
  community_manager: 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto',
  lead: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  member: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
};

const MemberCard: React.FC<{ member: Member; large?: boolean }> = ({ member, large }) => {
  const imgUrl = toDirectImageUrl(member.photo_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group ${large ? 'flex flex-col items-center text-center' : 'flex flex-col'}`}
    >
      {/* Photo */}
      <div className={`relative bg-slate-100 overflow-hidden ${large ? 'w-48 h-48 rounded-full mt-8 mx-auto border-4 border-white shadow-lg' : 'w-full h-48'}`}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        {/* Fallback silhouette */}
        <div className={`${imgUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-slate-100`}>
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-slate-300" fill="currentColor">
            <circle cx="40" cy="30" r="18" />
            <ellipse cx="40" cy="70" rx="28" ry="18" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 flex flex-col flex-grow ${large ? 'items-center' : ''}`}>
        <h3 className={`font-display font-bold text-slate-800 ${large ? 'text-xl mb-1' : 'text-base mb-0.5'}`}>
          {member.name}
        </h3>
        <span className={`text-[#0ea5e9] font-mono font-bold uppercase tracking-widest ${large ? 'text-sm mb-3' : 'text-[10px] mb-2'}`}>
          {member.role}
        </span>
        {member.bio && (
          <p className={`text-slate-500 text-sm leading-relaxed line-clamp-2 ${large ? 'max-w-xs mb-4' : 'mb-3'}`}>
            {member.bio}
          </p>
        )}
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 text-slate-400 hover:text-[#0ea5e9] text-xs font-semibold transition-colors"
          >
            <ExternalLink size={14} /> LinkedIn
          </a>
        )}
      </div>
    </motion.div>
  );
};

const SmallMemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const imgUrl = toDirectImageUrl(member.photo_url);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 mb-2 border-2 border-white shadow">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${imgUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-slate-100`}>
          <svg viewBox="0 0 80 80" className="w-10 h-10 text-slate-300" fill="currentColor">
            <circle cx="40" cy="30" r="18" />
            <ellipse cx="40" cy="70" rx="28" ry="18" />
          </svg>
        </div>
      </div>
      <p className="font-bold text-slate-800 text-sm leading-tight">{member.name}</p>
      <p className="text-[#0ea5e9] text-[9px] font-bold uppercase tracking-wider mt-0.5">{member.role}</p>
      {member.linkedin_url && (
        <a href={member.linkedin_url} target="_blank" rel="noreferrer"
          className="mt-1.5 text-slate-300 hover:text-[#0ea5e9] transition-colors">
          <ExternalLink size={12} />
        </a>
      )}
    </motion.div>
  );
};

const Team: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openPastYear, setOpenPastYear] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('order_index', { ascending: true });
      if (!error && data) setMembers(data);
      setIsLoading(false);
    };
    fetch();
  }, []);

  const currentMembers = members.filter(m => m.is_current);
  const pastMembers = members.filter(m => !m.is_current);

  // Group past members by batch year
  const pastByYear: Record<string, Member[]> = {};
  pastMembers.forEach(m => {
    if (!pastByYear[m.batch_year]) pastByYear[m.batch_year] = [];
    pastByYear[m.batch_year].push(m);
  });
  const pastYears = Object.keys(pastByYear).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <div className="w-14 h-14 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans pb-32 selection:bg-[#0ea5e9]/20">

      {/* Hero Header */}
      <div className="relative w-full bg-slate-800 pt-28 pb-20 px-6 md:px-16 lg:px-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 via-slate-800 to-slate-900" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-[#0ea5e9]" />
            <span className="text-[#0ea5e9] font-mono text-xs uppercase tracking-[0.3em] font-bold">The People Behind ADC</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-none mb-4">
            Our Team
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Meet the passionate leaders and contributors who drive ADC CU forward.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-16 pt-16">

        {/* Current Team — by hierarchy */}
        {currentMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Users size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-semibold">No team members added yet.</p>
          </div>
        ) : (
          <>
            {CATEGORY_ORDER.map(cat => {
              const group = currentMembers
                .filter(m => m.role_category === cat)
                .sort((a, b) => a.order_index - b.order_index);
              if (group.length === 0) return null;

              const isPresident = cat === 'president';
              const isMember = cat === 'member';

              return (
                <div key={cat} className="mb-16">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-widest">
                      {CATEGORY_LABELS[cat]}
                    </h2>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-slate-400 text-sm font-mono">{group.length}</span>
                  </div>

                  {isMember ? (
                    <div className={`grid gap-3 ${CATEGORY_COLS[cat]}`}>
                      {group.map(m => <SmallMemberCard key={m.id} member={m} />)}
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${CATEGORY_COLS[cat]}`}>
                      {group.map(m => <MemberCard key={m.id} member={m} large={isPresident} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Past Teams */}
        {pastYears.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-16">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-display font-black text-slate-700 uppercase tracking-widest">Past Teams</h2>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-4">
              {pastYears.map(year => (
                <div key={year} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenPastYear(openPastYear === year ? null : year)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display font-black text-slate-800 text-lg">Batch {year}</span>
                      <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
                        {pastByYear[year].length} members
                      </span>
                    </div>
                    {openPastYear === year
                      ? <ChevronUp size={20} className="text-slate-400" />
                      : <ChevronDown size={20} className="text-slate-400" />}
                  </button>

                  <AnimatePresence>
                    {openPastYear === year && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {pastByYear[year]
                              .sort((a, b) => a.order_index - b.order_index)
                              .map(m => <SmallMemberCard key={m.id} member={m} />)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
