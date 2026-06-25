import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Plus, Trash2, Image as ImageIcon, Calendar, Edit3, X, CheckCircle2,
  Activity, LayoutDashboard, Clock, LogOut, Users, Link as LinkIcon, UserCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Event {
  id: string; name: string; type: string; description: string;
  partnerships: string; event_date: string; registration_link: string;
  poster_url: string; status: 'upcoming' | 'completed'; is_registration_open: boolean;
}

interface Member {
  id: string; name: string; role: string;
  role_category: 'president' | 'vice_president' | 'community_manager' | 'lead' | 'member';
  batch_year: string; is_current: boolean; photo_url: string | null;
  linkedin_url: string | null; bio: string | null; order_index: number;
}

// ─── Drive link → embed URL ──────────────────────────────────────────────────
const toDirectImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return url;
};

const ROLE_CATEGORIES = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'community_manager', label: 'Community Manager' },
  { value: 'lead', label: 'Lead' },
  { value: 'member', label: 'Member' },
];

// ─── Member Avatar Helper ─────────────────────────────────────────────────────
const MemberAvatar: React.FC<{ url: string | null; name: string; size?: string }> = ({ url, name, size = 'w-14 h-14' }) => {
  const imgUrl = toDirectImageUrl(url);
  return (
    <div className={`${size} rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0`}>
      {imgUrl ? (
        <img src={imgUrl} alt={name} className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => { 
            const img = e.currentTarget;
            const match = url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || url?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            const fallback = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : null;
            if (fallback && img.src !== fallback) {
              img.src = fallback;
            } else {
              img.style.display = 'none';
              img.nextElementSibling?.classList.remove('hidden');
            }
          }} />
      ) : null}
      <div className={`${imgUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
        <UserCircle size={28} className="text-slate-300" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'team'>('events');

  // ── Auth ──
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // ══════════════════════════════════════════════════════════════════════
  //  EVENTS STATE & LOGIC
  // ══════════════════════════════════════════════════════════════════════
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({ status: 'upcoming', is_registration_open: true });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (!error && data) setEvents(data);
    setEventsLoading(false);
  };

  const resetEventForm = () => {
    setEventForm({ status: 'upcoming', is_registration_open: true });
    setSelectedFile(null); setPreviewUrl(null); setEditingEventId(null);
  };

  const handleEventEdit = (event: Event) => {
    setEventForm({ ...event, event_date: new Date(event.event_date).toISOString().slice(0, 16) });
    setPreviewUrl(event.poster_url); setEditingEventId(event.id); setEventModalOpen(true);
  };

  const handleEventDelete = async (id: string) => {
    if (!window.confirm('Delete this event? Cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setEvents(prev => prev.filter(e => e.id !== id));
    else alert('Error: ' + error.message);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from('event_posters').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('event_posters').getPublicUrl(fileName).data.publicUrl;
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let finalPosterUrl = eventForm.poster_url;
      if (selectedFile) finalPosterUrl = await uploadImage(selectedFile);
      const payload = { ...eventForm, poster_url: finalPosterUrl };
      if (editingEventId) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingEventId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([payload]);
        if (error) throw error;
      }
      setEventModalOpen(false); resetEventForm(); fetchEvents();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setIsUploading(false); }
  };

  const toggleRegistration = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('events').update({ is_registration_open: newStatus }).eq('id', id);
    if (!error) setEvents(prev => prev.map(e => e.id === id ? { ...e, is_registration_open: newStatus } : e));
    else alert('Failed to update: ' + error.message);
  };

  const totalEvents = events.length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const completedCount = events.filter(e => e.status === 'completed').length;

  // ══════════════════════════════════════════════════════════════════════
  //  TEAM STATE & LOGIC
  // ══════════════════════════════════════════════════════════════════════
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    role_category: 'member', batch_year: '2026-27', is_current: true, order_index: 0,
  });
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [isMemberSaving, setIsMemberSaving] = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setMembersLoading(true);
    const { data, error } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
    if (!error && data) setMembers(data);
    setMembersLoading(false);
  };

  const resetMemberForm = () => {
    setMemberForm({ role_category: 'member', batch_year: '2026-27', is_current: true, order_index: 0 });
    setMemberPhotoPreview(null); setEditingMemberId(null);
  };

  const handleMemberEdit = (m: Member) => {
    setMemberForm({ ...m });
    setMemberPhotoPreview(toDirectImageUrl(m.photo_url));
    setEditingMemberId(m.id); setMemberModalOpen(true);
  };

  const handleMemberDelete = async (id: string) => {
    if (!window.confirm('Delete this team member? Cannot be undone.')) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (!error) setMembers(prev => prev.filter(m => m.id !== id));
    else alert('Error: ' + error.message);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsMemberSaving(true);
      const payload = { ...memberForm };
      
      // Auto-fill Role Title if left blank
      if (!payload.role || payload.role.trim() === '') {
        const cat = ROLE_CATEGORIES.find(c => c.value === (payload.role_category || 'member'));
        payload.role = cat ? cat.label : 'Member';
      }

      if (editingMemberId) {
        const { error } = await supabase.from('team_members').update(payload).eq('id', editingMemberId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('team_members').insert([payload]);
        if (error) throw error;
      }
      setMemberModalOpen(false); resetMemberForm(); fetchMembers();
    } catch (err: any) { 
      console.error("Submission error:", err);
      alert('Error saving member: ' + (err.message || JSON.stringify(err))); 
    } finally {
      setIsMemberSaving(false);
    }
  };

  const currentMembers = members.filter(m => m.is_current).length;
  const pastMembers = members.filter(m => !m.is_current).length;

  // ══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#0ea5e9]/20 pt-16">

      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between sticky top-16 z-20">
        <h1 className="text-2xl font-display font-black text-slate-800 flex items-center gap-3">
          <LayoutDashboard size={26} className="text-[#0ea5e9]" /> Admin Hub
        </h1>
        <button onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 text-sm font-semibold">
          <LogOut size={15} /> Logout
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-12 flex gap-0">
        {[
          { key: 'events', label: 'Events', icon: Calendar },
          { key: 'team', label: 'Team', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key}
            onClick={() => setActiveTab(key as 'events' | 'team')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === key
                ? 'border-[#0ea5e9] text-[#0ea5e9]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">

        {/* ── EVENTS TAB ─────────────────────────────────────── */}
        {activeTab === 'events' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Events', value: totalEvents, icon: Activity, color: 'text-blue-600 bg-blue-50' },
                { label: 'Upcoming', value: upcomingCount, icon: Calendar, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Completed', value: completedCount, icon: Clock, color: 'text-slate-600 bg-slate-100' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{label}</p>
                    <p className="text-3xl font-display font-black text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mb-6">
              <button onClick={() => { resetEventForm(); setEventModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Create Event
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsLoading ? (
                <div className="col-span-full flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <Calendar size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No events yet. Create one above.</p>
                </div>
              ) : events.map(event => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-44 bg-slate-100">
                    <img src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800'}
                      alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${event.status === 'upcoming' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`}>{event.status}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-white text-[#0ea5e9]">{event.type}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-display text-lg font-bold text-slate-800 mb-1 line-clamp-1">{event.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                      <Calendar size={12} className="text-[#0ea5e9]" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button onClick={() => toggleRegistration(event.id, event.is_registration_open ?? true)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                          (event.is_registration_open ?? true)
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            : 'text-red-700 bg-red-50 hover:bg-red-100'
                        }`}>
                        <CheckCircle2 size={11} />
                        {(event.is_registration_open ?? true) ? 'Reg Open' : 'Reg Closed'}
                      </button>
                      <div className="flex gap-1">
                        <button onClick={() => handleEventEdit(event)} className="text-slate-400 hover:text-[#0ea5e9] p-1.5 rounded hover:bg-slate-50 transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => handleEventDelete(event.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-50 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TEAM TAB ───────────────────────────────────────── */}
        {activeTab === 'team' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Members', value: members.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
                { label: 'Current Team', value: currentMembers, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Past Members', value: pastMembers, icon: Clock, color: 'text-slate-600 bg-slate-100' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{label}</p>
                    <p className="text-3xl font-display font-black text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mb-6">
              <button onClick={() => { resetMemberForm(); setMemberModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Add Member
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {membersLoading ? (
                <div className="flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <Users size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No members yet. Add one above.</p>
                </div>
              ) : members.map(m => (
                <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                  <MemberAvatar url={m.photo_url} name={m.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-slate-800 text-sm">{m.name}</h3>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${m.is_current ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {m.is_current ? 'Current' : `Past · ${m.batch_year}`}
                      </span>
                    </div>
                    <p className="text-[#0ea5e9] text-xs font-bold uppercase tracking-widest">{m.role}</p>
                    <p className="text-slate-400 text-xs">{ROLE_CATEGORIES.find(c => c.value === m.role_category)?.label} · Order #{m.order_index}</p>
                  </div>
                  {m.linkedin_url && (
                    <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-[#0ea5e9] transition-colors flex-shrink-0">
                      <LinkIcon size={16} />
                    </a>
                  )}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleMemberEdit(m)} className="text-slate-400 hover:text-[#0ea5e9] p-1.5 rounded hover:bg-slate-50 transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => handleMemberDelete(m.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-50 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── EVENT MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {eventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEventModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-display font-bold text-slate-800">{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
                <button onClick={() => { setEventModalOpen(false); resetEventForm(); }} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="event-form" onSubmit={handleEventSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Name *</label>
                      <input required type="text" value={eventForm.name || ''} onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Type *</label>
                      <input required type="text" value={eventForm.type || ''} onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                    <textarea required rows={3} value={eventForm.description || ''} onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date & Time *</label>
                      <input required type="datetime-local" value={eventForm.event_date || ''} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status *</label>
                      <select required value={eventForm.status || 'upcoming'} onChange={e => setEventForm({ ...eventForm, status: e.target.value as 'upcoming' | 'completed' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none">
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Partnerships</label>
                      <input type="text" value={eventForm.partnerships || ''} onChange={e => setEventForm({ ...eventForm, partnerships: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Link</label>
                      <input type="url" value={eventForm.registration_link || ''} onChange={e => setEventForm({ ...eventForm, registration_link: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Poster Image *</label>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-center relative hover:bg-slate-100 transition-colors h-40">
                      {previewUrl ? (
                        <div className="absolute inset-0 p-2"><div className="w-full h-full rounded-lg overflow-hidden">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div></div>
                      ) : (
                        <><ImageIcon size={28} className="text-slate-300 mb-2" /><p className="text-sm text-slate-400">Click to upload image</p></>
                      )}
                      <input required={!eventForm.poster_url} type="file" accept="image/*" onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 p-5 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => { setEventModalOpen(false); resetEventForm(); }}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="event-form" disabled={isUploading}
                  className="px-6 py-2.5 bg-[#0ea5e9] text-white font-semibold rounded-xl hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
                  {isUploading ? 'Saving...' : (editingEventId ? 'Update Event' : 'Publish Event')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MEMBER MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {memberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMemberModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-display font-bold text-slate-800">{editingMemberId ? 'Edit Member' : 'Add Member'}</h2>
                <button onClick={() => { setMemberModalOpen(false); resetMemberForm(); }} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="member-form" onSubmit={handleMemberSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                      <input required type="text" value={memberForm.name || ''} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Title <span className="text-slate-400 font-normal">(Leave blank for default)</span></label>
                      <input type="text" placeholder='e.g. "Technical Lead"' value={memberForm.role || ''} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Category *</label>
                      <select required value={memberForm.role_category || 'member'}
                        onChange={e => setMemberForm({ ...memberForm, role_category: e.target.value as Member['role_category'] })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none">
                        {ROLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Batch Year *</label>
                      <input required type="text" placeholder="e.g. 2026-27" value={memberForm.batch_year || ''} onChange={e => setMemberForm({ ...memberForm, batch_year: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Index</label>
                      <input type="number" min={0} value={memberForm.order_index ?? 0} onChange={e => setMemberForm({ ...memberForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div className="flex items-center gap-4 pt-7">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={memberForm.is_current ?? true}
                            onChange={e => setMemberForm({ ...memberForm, is_current: e.target.checked })} />
                          <div className={`w-12 h-6 rounded-full transition-colors ${memberForm.is_current ? 'bg-[#0ea5e9]' : 'bg-slate-200'}`} />
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${memberForm.is_current ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Current Member</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Photo URL <span className="text-slate-400 font-normal">(Google Drive share link)</span>
                    </label>
                    <input type="url" placeholder="https://drive.google.com/file/d/..."
                      value={memberForm.photo_url || ''} onChange={e => {
                        const v = e.target.value;
                        setMemberForm({ ...memberForm, photo_url: v });
                        setMemberPhotoPreview(toDirectImageUrl(v));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    {memberPhotoPreview && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={memberPhotoPreview} alt="Preview" className="w-full h-full object-cover"
                            onError={() => setMemberPhotoPreview(null)} />
                        </div>
                        <span className="text-xs text-slate-400">Preview — if broken, check your Drive sharing permissions</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
                    <input type="url" placeholder="https://linkedin.com/in/..."
                      value={memberForm.linkedin_url || ''} onChange={e => setMemberForm({ ...memberForm, linkedin_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Bio</label>
                    <textarea rows={2} value={memberForm.bio || ''} onChange={e => setMemberForm({ ...memberForm, bio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none resize-none" />
                  </div>
                </form>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 p-5 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => { setMemberModalOpen(false); resetMemberForm(); }}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="member-form" disabled={isMemberSaving}
                  className="px-6 py-2.5 bg-[#0ea5e9] text-white font-semibold rounded-xl hover:bg-[#0284c7] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isMemberSaving ? 'Saving...' : (editingMemberId ? 'Update Member' : 'Add Member')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
