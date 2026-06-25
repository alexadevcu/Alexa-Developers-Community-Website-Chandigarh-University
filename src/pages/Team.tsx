import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
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
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
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

const PresidentCard: React.FC<{ member: Member }> = ({ member }) => {
  const imgUrl = toDirectImageUrl(member.photo_url);
  const fallbackUrl = member.photo_url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || member.photo_url?.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    ? `https://drive.google.com/thumbnail?id=${(member.photo_url!.match(/\/d\/([a-zA-Z0-9_-]+)/) || member.photo_url!.match(/[?&]id=([a-zA-Z0-9_-]+)/))![1]}&sz=w1000`
    : null;

  return (
    <div className="w-full flex flex-col md:flex-row bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] rounded-[2.5rem] overflow-hidden mb-24">
      <div className="w-full md:w-1/2 p-10 md:p-16 lg:p-24 flex flex-col justify-center relative">
        <div className="absolute top-10 left-10 text-[10rem] text-[#0ea5e9]/5 font-serif leading-none select-none">"</div>
        <p className="text-2xl md:text-3xl lg:text-4xl font-sans font-light text-slate-800 leading-tight mb-10 relative z-10">
          {member.bio || 'Leading with innovation and a vision for the future of technology.'}
        </p>
        <div className="relative z-10">
          <h3 className="font-sans font-bold text-slate-900 text-2xl">{member.name}</h3>
          <p className="text-[#0ea5e9] text-sm mt-1 font-semibold tracking-wide">{member.role}</p>
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex mt-6 w-12 h-12 items-center justify-center rounded-full bg-white/60 border border-white/80 text-[#0077b5] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/2 relative min-h-[400px] bg-white/20">
        {imgUrl ? (
          <img src={imgUrl} alt={member.name} className="absolute inset-0 w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            onError={(e) => { 
              const img = e.currentTarget;
              if (fallbackUrl && img.src !== fallbackUrl) {
                img.src = fallbackUrl;
              } else {
                img.style.display = 'none';
                img.nextElementSibling?.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <div className={`${imgUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center min-h-[400px] backdrop-blur-sm`}>
           <User size={100} className="text-[#0ea5e9]/20" />
        </div>
      </div>
    </div>
  );
};

const MemberCard: React.FC<{ member: Member; onViewBio?: (m: Member) => void }> = ({ member, onViewBio }) => {
  const imgUrl = toDirectImageUrl(member.photo_url);
  const fallbackUrl = member.photo_url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || member.photo_url?.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    ? `https://drive.google.com/thumbnail?id=${(member.photo_url!.match(/\/d\/([a-zA-Z0-9_-]+)/) || member.photo_url!.match(/[?&]id=([a-zA-Z0-9_-]+)/))![1]}&sz=w1000`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col group bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] rounded-[2rem] overflow-hidden hover:bg-white/60 hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo Container */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/30 border-b border-white/40">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={member.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { 
              const img = e.currentTarget;
              if (fallbackUrl && img.src !== fallbackUrl) {
                img.src = fallbackUrl;
              } else {
                img.style.display = 'none';
                img.nextElementSibling?.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        {/* Fallback silhouette */}
        <div className={`${imgUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
           <User size={64} className="text-[#0ea5e9]/20" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className="font-sans font-bold text-slate-900 text-lg leading-tight mb-1">
          {member.name}
        </h3>
        <p className="text-[#0ea5e9]/80 font-medium text-sm mb-6 line-clamp-2">
          {member.role}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-auto pt-2">
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-[#0077b5] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
          {member.bio && (
            <button 
              onClick={() => onViewBio?.(member)}
              className="h-10 px-5 flex items-center gap-2 rounded-full bg-[#0ea5e9] border border-[#0ea5e9] text-white font-sans text-sm font-bold hover:bg-[#0284c7] hover:border-[#0284c7] hover:shadow-md hover:-translate-y-0.5 transition-all">
              View Bio
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Team: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllPast, setShowAllPast] = useState(false);
  const [selectedBio, setSelectedBio] = useState<Member | null>(null);

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
      <div className="min-h-screen flex items-center justify-center pt-16 bg-slate-50">
        <div className="w-14 h-14 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
      </div>
    );
  }

  const president = currentMembers.find(m => m.role_category === 'president');

  return (
    <div className="relative w-full min-h-screen font-sans pb-32 selection:bg-[#0ea5e9]/20 overflow-hidden">
      
      {/* ── Background Orbs for Glassmorphism ── */}
      <div className="fixed inset-0 z-0 bg-[#f8fafc] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0ea5e9]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#38bdf8]/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-[#818cf8]/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <div className="w-full pt-32 pb-24 px-6 md:px-16 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-light text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-4xl">
              Shaping the Future of Tech Together
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-light">
              We're a passionate team of student leaders, developers, and creators combining diverse skills to build innovative solutions and drive the community forward.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-16">

          {/* Current Team */}
          {currentMembers.length === 0 ? (
            <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm">
              <User size={40} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-sans">No team members added yet.</p>
            </div>
          ) : (
            <>
              {/* President Spotlight */}
              {president && <PresidentCard member={president} />}

              {/* Vice Presidents & Community Managers */}
              {(() => {
                const combined = currentMembers
                  .filter(m => m.role_category === 'vice_president' || m.role_category === 'community_manager')
                  .sort((a, b) => {
                    if (a.role_category !== b.role_category) return a.role_category === 'vice_president' ? -1 : 1;
                    return a.order_index - b.order_index;
                  });
                
                if (combined.length === 0) return null;
                
                return (
                  <div className="mb-24">
                    <h2 className="text-3xl font-sans font-light text-slate-900 mb-10 pb-4 border-b border-slate-200/50">
                      Vice Presidents & Community Managers
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                      {combined.map(m => <MemberCard key={m.id} member={m} onViewBio={setSelectedBio} />)}
                    </div>
                  </div>
                );
              })()}

              {/* Other Leaders / Members by Category */}
              {['lead', 'member'].map(cat => {
                const group = currentMembers
                  .filter(m => m.role_category === cat)
                  .sort((a, b) => a.order_index - b.order_index);
                
                if (group.length === 0) return null;

                return (
                  <div key={cat} className="mb-24">
                    <h2 className="text-3xl font-sans font-light text-slate-900 mb-10 pb-4 border-b border-slate-200/50">
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                      {group.map(m => <MemberCard key={m.id} member={m} onViewBio={setSelectedBio} />)}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Past Teams */}
          {pastMembers.length > 0 && (
            <div className="mt-16 pt-16 border-t border-slate-200/50">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-sans font-light text-slate-900">Past Leadership</h2>
                {!showAllPast && pastMembers.length > 8 && (
                  <button onClick={() => setShowAllPast(true)} className="text-[#0ea5e9] font-bold text-sm hover:text-[#0284c7] transition-colors flex items-center gap-1">
                    View All <ChevronDown size={16} />
                  </button>
                )}
              </div>

              {showAllPast ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                  {pastYears.map(year => (
                    <div key={year}>
                      <h3 className="text-xl font-sans font-bold text-slate-800 mb-6 border-b border-slate-200/50 pb-2">Batch {year}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {pastByYear[year].sort((a, b) => a.order_index - b.order_index).map(m => (
                          <div key={m.id} className="flex flex-col group">
                            <div className="relative w-full aspect-[4/5] bg-white/30 rounded-xl overflow-hidden mb-3 border border-white/50 shadow-sm">
                              {toDirectImageUrl(m.photo_url) ? (
                                <img src={toDirectImageUrl(m.photo_url)!} alt={m.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                                     onError={(e) => { 
                                       const img = e.currentTarget;
                                       const match = m.photo_url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || m.photo_url?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                       const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                                       if (fallback && img.src !== fallback) img.src = fallback;
                                       else { img.style.display = 'none'; img.nextElementSibling?.classList.remove('hidden'); }
                                     }} />
                              ) : null}
                              <div className={`${toDirectImageUrl(m.photo_url) ? 'hidden' : ''} w-full h-full flex items-center justify-center`}><User size={32} className="text-[#0ea5e9]/20" /></div>
                            </div>
                            <p className="font-sans font-bold text-slate-900 text-sm leading-tight mb-0.5">{m.name}</p>
                            <p className="text-[#0ea5e9]/80 text-xs font-medium">{m.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-8 pb-4 flex justify-center">
                     <button onClick={() => setShowAllPast(false)} className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                       Show Less <ChevronUp size={16} />
                     </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {pastMembers.slice(0, 8).map(m => (
                    <div key={m.id} className="flex flex-col group min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] snap-start">
                      <div className="relative w-full aspect-[4/5] bg-white/30 rounded-xl overflow-hidden mb-3 border border-white/50 shadow-sm">
                        {toDirectImageUrl(m.photo_url) ? (
                          <img src={toDirectImageUrl(m.photo_url)!} alt={m.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                               onError={(e) => { 
                                 const img = e.currentTarget;
                                 const match = m.photo_url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || m.photo_url?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                 const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                                 if (fallback && img.src !== fallback) img.src = fallback;
                                 else { img.style.display = 'none'; img.nextElementSibling?.classList.remove('hidden'); }
                               }} />
                        ) : null}
                        <div className={`${toDirectImageUrl(m.photo_url) ? 'hidden' : ''} w-full h-full flex items-center justify-center`}><User size={32} className="text-[#0ea5e9]/20" /></div>
                      </div>
                      <p className="font-sans font-bold text-slate-900 text-sm leading-tight mb-0.5 truncate">{m.name}</p>
                      <p className="text-[#0ea5e9]/80 text-xs font-medium truncate">{m.role}</p>
                    </div>
                  ))}
                  {pastMembers.length > 8 && (
                    <div className="flex items-center justify-center min-w-[140px] snap-start pl-2">
                      <button onClick={() => setShowAllPast(true)} className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/50 border border-white/60 text-[#0ea5e9] hover:bg-white hover:-translate-y-1 transition-all shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bio Modal ── */}
      <AnimatePresence>
        {selectedBio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBio(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[2rem] p-8 overflow-hidden">
              <button onClick={() => setSelectedBio(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  {toDirectImageUrl(selectedBio.photo_url) ? (
                    <img src={toDirectImageUrl(selectedBio.photo_url)!} alt={selectedBio.name} className="w-full h-full object-cover object-center" 
                         referrerPolicy="no-referrer"
                         onError={(e) => { 
                           const img = e.currentTarget;
                           const match = selectedBio.photo_url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || selectedBio.photo_url?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                           const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
                           
                           if (fallback && img.src !== fallback) {
                             img.src = fallback;
                           } else {
                             img.style.display = 'none';
                             img.nextElementSibling?.classList.remove('hidden');
                           }
                         }} />
                  ) : <div className="w-full h-full flex items-center justify-center"><User size={24} className="text-slate-300" /></div>}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-900 text-xl">{selectedBio.name}</h3>
                  <p className="text-[#0ea5e9] text-sm font-semibold">{selectedBio.role}</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-0 text-6xl text-slate-200 font-serif leading-none -mt-4 -ml-2 select-none">"</div>
                <p className="text-slate-700 leading-relaxed font-sans relative z-10">{selectedBio.bio}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Team;
