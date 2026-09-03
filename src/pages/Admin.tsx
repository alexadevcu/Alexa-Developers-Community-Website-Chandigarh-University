import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Trash2, Image as ImageIcon, Calendar, Edit3, X, CheckCircle2,
  Activity, LayoutDashboard, Clock, LogOut, Users, Link as LinkIcon, UserCircle, Archive, Pin, History,
  Award, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Event {
  id: string; name: string; type: string; description: string;
  partnerships: string; event_date: string; registration_link: string;
  poster_url: string; status: 'upcoming' | 'completed'; is_registration_open: boolean;
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

interface Member {
  id: string; name: string; role: string;
  role_category: 'president' | 'vice_president' | 'community_manager' | 'lead' | 'member';
  batch_year: string; is_current: boolean; photo_url: string | null;
  linkedin_url: string | null; instagram_url?: string | null; email?: string | null;
  bio: string | null; order_index: number;
}

interface HallOfFameEntry {
  id: string;
  member_name: string;
  event_name: string;
  photo_url: string | null;
  category: 'achievement' | 'representation';
  order_index: number;
  created_at?: string;
}

interface LegacyMember {
  id: string;
  name: string;
  role: 'President' | 'Vice President';
  tenure: string;
  company: string;
  company_role: string;
  location: string;
  photo_url?: string | null;
  linkedin_url?: string | null;
  quote?: string | null;
  bio: string;
  key_contributions: string;
  order_index: number;
  created_at?: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
  order_index: number;
  created_at?: string;
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
  const [activeTab, setActiveTab] = useState<'events' | 'team' | 'legacy' | 'hall_of_fame' | 'sponsors'>('events');

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
  const [eventsSearchTerm, setEventsSearchTerm] = useState('');
  const [eventsStatusFilter, setEventsStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'archived'>('all');
  const [eventsSortBy, setEventsSortBy] = useState<'date_desc' | 'date_asc' | 'name'>('date_desc');
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({ status: 'upcoming', is_registration_open: true, is_archived: false, is_pinned: false });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filteredAndSortedEvents = React.useMemo(() => {
    let result = events;
    if (eventsSearchTerm) {
      const lowerQuery = eventsSearchTerm.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(lowerQuery) || 
        (e.type && e.type.toLowerCase().includes(lowerQuery)) ||
        (e.venue && e.venue.toLowerCase().includes(lowerQuery))
      );
    }
    if (eventsStatusFilter !== 'all') {
      if (eventsStatusFilter === 'archived') {
        result = result.filter(e => e.is_archived);
      } else {
        result = result.filter(e => e.status === eventsStatusFilter && !e.is_archived);
      }
    }
    return result.sort((a, b) => {
      if (eventsSortBy === 'date_desc') return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
      if (eventsSortBy === 'date_asc') return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      if (eventsSortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [events, eventsSearchTerm, eventsStatusFilter, eventsSortBy]);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(500);
    if (!error && data) setEvents(data);
    setEventsLoading(false);
  };

  const resetEventForm = () => {
    setEventForm({ status: 'upcoming', is_registration_open: true, is_archived: false, is_pinned: false });
    setSelectedFile(null); setPreviewUrl(null); setEditingEventId(null);
  };

  const handleEventEdit = (event: Event) => {
    setEventForm({ 
      ...event, 
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''
    });
    setPreviewUrl(event.poster_url); setEditingEventId(event.id); setEventModalOpen(true);
  };

  const handleEventDelete = async (id: string) => {
    if (!window.confirm('Delete this event? Cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted successfully');
    }
    else toast.error('Error: ' + error.message);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload a JPEG, PNG, or WEBP image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
      const payload: any = { 
        ...eventForm, 
        poster_url: finalPosterUrl,
        end_date: eventForm.end_date ? eventForm.end_date : null
      };
      
      if (editingEventId) {
        let { error } = await supabase.from('events').update(payload).eq('id', editingEventId);
        if (error && error.message.includes('show_external_website')) {
          delete payload.show_external_website;
          const retry = await supabase.from('events').update(payload).eq('id', editingEventId);
          if (retry.error) throw retry.error;
        } else if (error) throw error;
      } else {
        let { error } = await supabase.from('events').insert([payload]);
        if (error && error.message.includes('show_external_website')) {
          delete payload.show_external_website;
          const retry = await supabase.from('events').insert([payload]);
          if (retry.error) throw retry.error;
        } else if (error) throw error;
      }

      setEventModalOpen(false); resetEventForm(); fetchEvents();
      toast.success(editingEventId ? 'Event updated!' : 'Event created!');
    } catch (err: any) { toast.error('Error: ' + err.message); }
    finally { setIsUploading(false); }
  };

  const toggleRegistration = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('events').update({ is_registration_open: newStatus }).eq('id', id);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, is_registration_open: newStatus } : e));
      toast.success(`Registration ${newStatus ? 'opened' : 'closed'}`);
    } else toast.error('Failed to update: ' + error.message);
  };

  const toggleArchive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('events').update({ is_archived: !currentStatus }).eq('id', id);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, is_archived: !currentStatus } : e));
      toast.success(`Event ${!currentStatus ? 'archived' : 'unarchived'}`);
    } else toast.error('Failed to update archive status');
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('events').update({ is_pinned: !currentStatus }).eq('id', id);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, is_pinned: !currentStatus } : e));
      toast.success(`Event ${!currentStatus ? 'pinned' : 'unpinned'}`);
    } else toast.error('Failed to update pin status');
  };

  const totalEvents = events.length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const completedCount = events.filter(e => e.status === 'completed').length;

  // ══════════════════════════════════════════════════════════════════════
  //  TEAM STATE & LOGIC
  // ══════════════════════════════════════════════════════════════════════
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [teamSortBy, setTeamSortBy] = useState<'name' | 'role' | 'order_index' | 'batch_year'>('order_index');
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    role_category: 'member', batch_year: '2026-27', is_current: true, order_index: 0,
  });
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [isMemberSaving, setIsMemberSaving] = useState(false);

  const filteredAndSortedMembers = React.useMemo(() => {
    let result = members;
    if (teamSearchTerm) {
      const lowerQuery = teamSearchTerm.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(lowerQuery) || 
        m.role.toLowerCase().includes(lowerQuery) ||
        (m.batch_year && m.batch_year.toLowerCase().includes(lowerQuery))
      );
    }
    return result.sort((a, b) => {
      if (teamSortBy === 'order_index') return a.order_index - b.order_index;
      if (teamSortBy === 'name') return a.name.localeCompare(b.name);
      if (teamSortBy === 'role') {
        const getRoleWeight = (cat: string) => {
          const idx = ROLE_CATEGORIES.findIndex(c => c.value === cat);
          return idx === -1 ? 999 : idx;
        };
        const weightDiff = getRoleWeight(a.role_category) - getRoleWeight(b.role_category);
        if (weightDiff !== 0) return weightDiff;
        return a.name.localeCompare(b.name);
      }
      if (teamSortBy === 'batch_year') return (b.batch_year || '').localeCompare(a.batch_year || '');
      return 0;
    });
  }, [members, teamSearchTerm, teamSortBy]);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setMembersLoading(true);
    const { data, error } = await supabase.from('team_members').select('*').order('order_index', { ascending: true }).limit(500);
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
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Team member deleted');
    }
    else toast.error('Error: ' + error.message);
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
        let { error } = await supabase.from('team_members').update(payload).eq('id', editingMemberId);
        if (error && (error.message.includes('instagram_url') || error.message.includes('email'))) {
          delete (payload as any).instagram_url;
          delete (payload as any).email;
          const retry = await supabase.from('team_members').update(payload).eq('id', editingMemberId);
          if (retry.error) throw retry.error;
        } else if (error) throw error;
      } else {
        let { error } = await supabase.from('team_members').insert([payload]);
        if (error && (error.message.includes('instagram_url') || error.message.includes('email'))) {
          delete (payload as any).instagram_url;
          delete (payload as any).email;
          const retry = await supabase.from('team_members').insert([payload]);
          if (retry.error) throw retry.error;
        } else if (error) throw error;
      }
      setMemberModalOpen(false); resetMemberForm(); fetchMembers();
      toast.success(editingMemberId ? 'Member updated!' : 'Member added!');
    } catch (err: any) { 
      console.error("Submission error:", err);
      toast.error('Error saving member: ' + (err.message || JSON.stringify(err))); 
    } finally {
      setIsMemberSaving(false);
    }
  };

  const currentMembers = members.filter(m => m.is_current).length;
  const pastMembers = members.filter(m => !m.is_current).length;

  // ══════════════════════════════════════════════════════════════════════
  //  HALL OF FAME STATE & LOGIC
  // ══════════════════════════════════════════════════════════════════════
  const [hofEntries, setHofEntries] = useState<HallOfFameEntry[]>([]);
  const [hofLoading, setHofLoading] = useState(true);
  const [hofModalOpen, setHofModalOpen] = useState(false);
  const [editingHofId, setEditingHofId] = useState<string | null>(null);
  const [hofForm, setHofForm] = useState<Partial<HallOfFameEntry>>({
    category: 'achievement', order_index: 0
  });
  const [hofPhotoPreview, setHofPhotoPreview] = useState<string | null>(null);
  const [isHofSaving, setIsHofSaving] = useState(false);

  useEffect(() => { fetchHofEntries(); }, []);

  const fetchHofEntries = async () => {
    setHofLoading(true);
    const { data, error } = await supabase.from('hall_of_fame').select('*').order('created_at', { ascending: false }).limit(500);
    if (!error && data) setHofEntries(data);
    setHofLoading(false);
  };

  const resetHofForm = () => {
    setHofForm({ category: 'achievement', order_index: 0 });
    setHofPhotoPreview(null); setEditingHofId(null);
  };

  const handleHofEdit = (entry: HallOfFameEntry) => {
    setHofForm({ ...entry });
    setHofPhotoPreview(toDirectImageUrl(entry.photo_url));
    setEditingHofId(entry.id); setHofModalOpen(true);
  };

  const handleHofDelete = async (id: string) => {
    if (!window.confirm('Delete this entry? Cannot be undone.')) return;
    const { error } = await supabase.from('hall_of_fame').delete().eq('id', id);
    if (!error) {
      setHofEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Hall of Fame entry deleted');
    }
    else toast.error('Error: ' + error.message);
  };

  const handleHofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsHofSaving(true);
      const payload = { ...hofForm };

      if (editingHofId) {
        const { error } = await supabase.from('hall_of_fame').update(payload).eq('id', editingHofId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hall_of_fame').insert([payload]);
        if (error) throw error;
      }
      setHofModalOpen(false); resetHofForm(); fetchHofEntries();
      toast.success(editingHofId ? 'Entry updated!' : 'Entry added!');
    } catch (err: any) { 
      console.error("Submission error:", err);
      toast.error('Error saving entry: ' + (err.message || JSON.stringify(err))); 
    } finally {
      setIsHofSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  LEGACY MEMBERS STATE & LOGIC
  // ══════════════════════════════════════════════════════════════════════
  const [legacyMembers, setLegacyMembers] = useState<LegacyMember[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(true);
  const [legacySearchTerm, setLegacySearchTerm] = useState('');
  const [legacyRoleFilter, setLegacyRoleFilter] = useState<'all' | 'President' | 'Vice President'>('all');
  const [legacyModalOpen, setLegacyModalOpen] = useState(false);
  const [isLegacySaving, setIsLegacySaving] = useState(false);
  const [editingLegacyId, setEditingLegacyId] = useState<string | null>(null);
  const [legacyForm, setLegacyForm] = useState<Partial<LegacyMember>>({
    role: 'President',
    tenure: '2023 - 2024',
    company: '',
    company_role: '',
    location: 'Bengaluru, India',
    order_index: 0
  });
  const [legacyPhotoPreview, setLegacyPhotoPreview] = useState<string | null>(null);

  const fetchLegacyMembers = async () => {
    try {
      setLegacyLoading(true);
      const { data, error } = await supabase
        .from('legacy_members')
        .select('*')
        .order('order_index', { ascending: true })
        .limit(500);
      if (!error && data) setLegacyMembers(data);
    } catch (err) {
      console.error('Error fetching legacy members:', err);
    } finally {
      setLegacyLoading(false);
    }
  };

  useEffect(() => {
    fetchLegacyMembers();
  }, []);

  const resetLegacyForm = () => {
    setLegacyForm({
      name: '',
      role: 'President',
      tenure: '2023 - 2024',
      company: '',
      company_role: '',
      location: 'Bengaluru, India',
      photo_url: '',
      linkedin_url: '',
      quote: '',
      bio: '',
      key_contributions: '',
      order_index: 0
    });
    setLegacyPhotoPreview(null);
    setEditingLegacyId(null);
  };

  const handleLegacyEdit = (member: LegacyMember) => {
    setLegacyForm({ ...member });
    setLegacyPhotoPreview(toDirectImageUrl(member.photo_url || null));
    setEditingLegacyId(member.id);
    setLegacyModalOpen(true);
  };

  const handleLegacyDelete = async (id: string) => {
    if (!window.confirm('Delete this Legacy member? Cannot be undone.')) return;
    const { error } = await supabase.from('legacy_members').delete().eq('id', id);
    if (!error) {
      setLegacyMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Legacy member deleted');
    } else {
      toast.error('Error deleting member: ' + error.message);
    }
  };

  const handleLegacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLegacySaving(true);

      // Rule Validation Check:
      // President: 1 per year/tenure
      // Vice President: max 2 per year/tenure
      const sameTenureMembers = legacyMembers.filter(
        m => m.tenure.trim().toLowerCase() === (legacyForm.tenure || '').trim().toLowerCase() && m.id !== editingLegacyId
      );

      if (legacyForm.role === 'President') {
        const existingPresident = sameTenureMembers.find(m => m.role === 'President');
        if (existingPresident) {
          toast(`Note: ${existingPresident.name} is already listed as President for ${legacyForm.tenure}.`, { icon: 'ℹ️' });
        }
      } else if (legacyForm.role === 'Vice President') {
        const existingVPs = sameTenureMembers.filter(m => m.role === 'Vice President');
        if (existingVPs.length >= 2) {
          toast(`Note: There are already ${existingVPs.length} Vice Presidents listed for ${legacyForm.tenure}.`, { icon: 'ℹ️' });
        }
      }

      const payload = {
        name: legacyForm.name,
        role: legacyForm.role,
        tenure: legacyForm.tenure,
        company: legacyForm.company,
        company_role: legacyForm.company_role,
        location: legacyForm.location,
        photo_url: legacyForm.photo_url || null,
        linkedin_url: legacyForm.linkedin_url || null,
        quote: legacyForm.quote || null,
        bio: legacyForm.bio,
        key_contributions: legacyForm.key_contributions || '',
        order_index: legacyForm.order_index ?? 0
      };

      if (editingLegacyId) {
        const { error } = await supabase.from('legacy_members').update(payload).eq('id', editingLegacyId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('legacy_members').insert([payload]);
        if (error) throw error;
      }

      setLegacyModalOpen(false);
      resetLegacyForm();
      fetchLegacyMembers();
      toast.success(editingLegacyId ? 'Legacy member updated!' : 'Legacy member added!');
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Error saving entry: ' + (err.message || JSON.stringify(err)));
    } finally {
      setIsLegacySaving(false);
    }
  };

  const filteredLegacyMembers = React.useMemo(() => {
    let result = legacyMembers;
    if (legacySearchTerm) {
      const q = legacySearchTerm.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.company_role.toLowerCase().includes(q) ||
        m.tenure.toLowerCase().includes(q)
      );
    }
    if (legacyRoleFilter !== 'all') {
      result = result.filter(m => m.role === legacyRoleFilter);
    }
    return result;
  }, [legacyMembers, legacySearchTerm, legacyRoleFilter]);

  // ══════════════════════════════════════════════════════════════════════
  //  SPONSORS STATE & LOGIC
  // ══════════════════════════════════════════════════════════════════════
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [sponsorsSearchTerm, setSponsorsSearchTerm] = useState('');
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponsorForm, setSponsorForm] = useState<Partial<Sponsor>>({ order_index: 0 });
  const [sponsorFile, setSponsorFile] = useState<File | null>(null);
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string | null>(null);
  const [isSponsorSaving, setIsSponsorSaving] = useState(false);

  useEffect(() => { fetchSponsors(); }, []);

  const fetchSponsors = async () => {
    setSponsorsLoading(true);
    const { data, error } = await supabase.from('sponsors').select('*').order('order_index', { ascending: true });
    if (!error && data) setSponsors(data);
    setSponsorsLoading(false);
  };

  const resetSponsorForm = () => {
    setSponsorForm({ name: '', logo_url: '', website_url: '', order_index: sponsors.length });
    setSponsorFile(null);
    setSponsorLogoPreview(null);
    setEditingSponsorId(null);
  };

  const handleSponsorEdit = (sponsor: Sponsor) => {
    setSponsorForm({ ...sponsor });
    setSponsorLogoPreview(toDirectImageUrl(sponsor.logo_url) || sponsor.logo_url);
    setEditingSponsorId(sponsor.id);
    setSponsorModalOpen(true);
  };

  const handleSponsorDelete = async (id: string) => {
    if (!window.confirm(`Delete "${id}" sponsor? Cannot be undone.`)) return;
    const { error } = await supabase.from('sponsors').delete().eq('id', id);
    if (!error) {
      setSponsors(prev => prev.filter(s => s.id !== id));
      toast.success('Sponsor deleted successfully');
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  const uploadSponsorLogo = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `sponsor_${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('sponsors').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('sponsors').getPublicUrl(fileName).data.publicUrl;
  };

  const handleSponsorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (PNG, JPEG, WEBP, SVG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(null);
      setSponsorFile(file);
      setSponsorLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSponsorSaving(true);
      let finalLogoUrl = sponsorForm.logo_url?.trim() || '';
      if (sponsorFile) {
        finalLogoUrl = await uploadSponsorLogo(sponsorFile);
      }
      if (!finalLogoUrl) {
        toast.error('Please upload a logo image or provide a logo URL.');
        return;
      }

      const payload = {
        name: sponsorForm.name?.trim() || 'Sponsor',
        logo_url: finalLogoUrl,
        website_url: sponsorForm.website_url?.trim() || null,
        order_index: Number(sponsorForm.order_index) || 0
      };

      if (editingSponsorId) {
        const { error } = await supabase.from('sponsors').update(payload).eq('id', editingSponsorId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sponsors').insert([payload]);
        if (error) throw error;
      }

      setSponsorModalOpen(false);
      resetSponsorForm();
      fetchSponsors();
      toast.success(editingSponsorId ? 'Sponsor updated!' : 'Sponsor added!');
    } catch (err: any) {
      toast.error('Error: ' + (err.message || 'Failed to save sponsor'));
    } finally {
      setIsSponsorSaving(false);
    }
  };

  const filteredSponsors = React.useMemo(() => {
    if (!sponsorsSearchTerm) return sponsors;
    const q = sponsorsSearchTerm.toLowerCase();
    return sponsors.filter(s => s.name.toLowerCase().includes(q) || (s.website_url && s.website_url.toLowerCase().includes(q)));
  }, [sponsors, sponsorsSearchTerm]);

  // ══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#0ea5e9]/20 pt-16">
      <Toaster position="top-right" toastOptions={{ className: 'font-semibold text-sm rounded-xl border border-slate-200 shadow-sm' }} />

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
      <div className="bg-white border-b border-slate-200 px-6 md:px-12 flex gap-0 overflow-x-auto">
        {[
          { key: 'events', label: 'Events', icon: Calendar },
          { key: 'team', label: 'Team', icon: Users },
          { key: 'legacy', label: 'Legacy', icon: History },
          { key: 'hall_of_fame', label: 'Hall of Fame', icon: Activity },
          { key: 'sponsors', label: 'Sponsors', icon: Award },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
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

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={eventsSearchTerm}
                  onChange={(e) => setEventsSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none w-full sm:w-64"
                />
                <select
                  value={eventsStatusFilter}
                  onChange={(e) => setEventsStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none w-full sm:w-auto cursor-pointer"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={eventsSortBy}
                  onChange={(e) => setEventsSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none w-full sm:w-auto cursor-pointer"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              <button onClick={() => { resetEventForm(); setEventModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
                <Plus size={18} /> Create Event
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsLoading ? (
                <div className="col-span-full flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : filteredAndSortedEvents.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <Calendar size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No events found.</p>
                </div>
              ) : filteredAndSortedEvents.map(event => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-44 bg-slate-100">
                    <img src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800'}
                      alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${event.status === 'upcoming' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`}>{event.status}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-white text-[#0ea5e9]">{event.type}</span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex gap-2">
                      {event.is_pinned && <span className="p-1 rounded bg-amber-100 text-amber-700"><Pin size={12} className="fill-amber-700" /></span>}
                      {event.is_archived && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-red-100 text-red-700">Archived</span>}
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-display text-lg font-bold text-slate-800 mb-1 line-clamp-1">{event.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#0ea5e9]" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </div>
                      {event.end_date && (
                        <>
                          <span>-</span>
                          <div className="flex items-center gap-1">
                            {new Date(event.end_date).toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button onClick={() => toggleRegistration(event.id, event.is_registration_open ?? true)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                          (event.status === 'upcoming' && (event.is_registration_open ?? true))
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            : 'text-red-700 bg-red-50 hover:bg-red-100'
                        }`}>
                        <CheckCircle2 size={11} />
                        {(event.status === 'upcoming' && (event.is_registration_open ?? true)) ? 'Reg Open' : 'Reg Closed'}
                      </button>
                      <div className="flex gap-1">
                        <button onClick={() => togglePin(event.id, event.is_pinned ?? false)} 
                          className={`p-1.5 rounded transition-colors ${event.is_pinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'}`} title="Toggle Pin">
                          <Pin size={16} />
                        </button>
                        <button onClick={() => toggleArchive(event.id, event.is_archived ?? false)} 
                          className={`p-1.5 rounded transition-colors ${event.is_archived ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-slate-50'}`} title="Toggle Archive">
                          <Archive size={16} />
                        </button>
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

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={teamSearchTerm}
                  onChange={(e) => setTeamSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none w-full sm:w-64"
                />
                <select
                  value={teamSortBy}
                  onChange={(e) => setTeamSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none w-full sm:w-auto cursor-pointer"
                >
                  <option value="order_index">Sort by Order</option>
                  <option value="name">Sort by Name</option>
                  <option value="role">Sort by Role</option>
                  <option value="batch_year">Sort by Batch</option>
                </select>
              </div>
              <button onClick={() => { resetMemberForm(); setMemberModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
                <Plus size={18} /> Add Member
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {membersLoading ? (
                <div className="flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : filteredAndSortedMembers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <Users size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No members found.</p>
                </div>
              ) : filteredAndSortedMembers.map(m => (
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
        {/* ── HALL OF FAME TAB ───────────────────────────────────────── */}
        {activeTab === 'hall_of_fame' && (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={() => { resetHofForm(); setHofModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Add Entry
              </button>
            </div>

            {/* Hall of Fame List */}
            <div className="space-y-3">
              {hofLoading ? (
                <div className="flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : hofEntries.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <Activity size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No entries yet. Add one above.</p>
                </div>
              ) : hofEntries.map(entry => (
                <div key={entry.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                  <MemberAvatar url={entry.photo_url} name={entry.member_name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-slate-800 text-sm">{entry.member_name}</h3>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${entry.category === 'achievement' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {entry.category}
                      </span>
                    </div>
                    <p className="text-[#0ea5e9] text-xs font-bold uppercase tracking-widest">{entry.event_name}</p>
                    <p className="text-slate-400 text-xs">Order #{entry.order_index}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleHofEdit(entry)} className="text-slate-400 hover:text-[#0ea5e9] p-1.5 rounded hover:bg-slate-50 transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => handleHofDelete(entry.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-50 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── LEGACY TAB ─────────────────────────────────────────── */}
        {activeTab === 'legacy' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by name, company, tenure..."
                  value={legacySearchTerm}
                  onChange={(e) => setLegacySearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] outline-none w-full sm:w-72"
                />
                <select
                  value={legacyRoleFilter}
                  onChange={(e) => setLegacyRoleFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] outline-none w-full sm:w-auto cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="President">Presidents</option>
                  <option value="Vice President">Vice Presidents</option>
                </select>
              </div>
              <button onClick={() => { resetLegacyForm(); setLegacyModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
                <Plus size={18} /> Add Legacy Member
              </button>
            </div>

            {/* Legacy Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legacyLoading ? (
                <div className="col-span-full flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : filteredLegacyMembers.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <History size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No legacy members found.</p>
                </div>
              ) : filteredLegacyMembers.map(member => (
                <div key={member.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <MemberAvatar url={member.photo_url || null} name={member.name} size="w-14 h-14" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{member.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${member.role === 'President' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'bg-slate-100 text-slate-700'}`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-semibold text-slate-400 mb-1">Tenure: {member.tenure}</p>
                      <p className="text-xs font-semibold text-slate-700">
                        {member.company_role} @ <span className="text-[#0ea5e9] font-bold">{member.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Order #{member.order_index} • {member.location}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleLegacyEdit(member)} className="text-slate-400 hover:text-[#0ea5e9] p-1.5 rounded hover:bg-slate-50 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleLegacyDelete(member.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SPONSORS TAB ───────────────────────────────────────── */}
        {activeTab === 'sponsors' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search sponsors by name or website..."
                  value={sponsorsSearchTerm}
                  onChange={(e) => setSponsorsSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0ea5e9] outline-none w-full sm:w-80"
                />
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl whitespace-nowrap">
                  Total: {sponsors.length}
                </span>
              </div>
              <button 
                onClick={() => { resetSponsorForm(); setSponsorModalOpen(true); }}
                className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0284c7] transition-all flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
              >
                <Plus size={18} /> Add Sponsor
              </button>
            </div>

            {/* Sponsors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {sponsorsLoading ? (
                <div className="col-span-full flex justify-center py-24">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
                </div>
              ) : filteredSponsors.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <Award size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No sponsors found. Click "Add Sponsor" above to add one.</p>
                </div>
              ) : filteredSponsors.map(sponsor => {
                const previewImg = toDirectImageUrl(sponsor.logo_url) || sponsor.logo_url;
                return (
                  <div key={sponsor.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all group">
                    <div>
                      <div className="h-28 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-4 mb-4 overflow-hidden group-hover:bg-slate-100/50 transition-colors">
                        <img 
                          src={previewImg} 
                          alt={sponsor.name} 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x80?text=Logo+Error';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{sponsor.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          #{sponsor.order_index}
                        </span>
                      </div>
                      {sponsor.website_url ? (
                        <a 
                          href={sponsor.website_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-[#0ea5e9] hover:underline flex items-center gap-1 truncate mb-3"
                        >
                          <Globe size={12} className="shrink-0" />
                          <span className="truncate">{sponsor.website_url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400 mb-3 italic">No website link</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1 text-xs text-slate-400">
                      <button 
                        onClick={() => handleSponsorEdit(sponsor)} 
                        className="text-slate-400 hover:text-[#0ea5e9] p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Edit Sponsor"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleSponsorDelete(sponsor.id)} 
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Delete Sponsor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
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
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date & Time *</label>
                      <input required type="datetime-local" value={eventForm.event_date || ''} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date & Time (Optional)</label>
                      <input type="datetime-local" value={eventForm.end_date || ''} onChange={e => setEventForm({ ...eventForm, end_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status *</label>
                      <select required value={eventForm.status || 'upcoming'} onChange={e => setEventForm({ ...eventForm, status: e.target.value as 'upcoming' | 'completed' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none">
                        <option value="upcoming">Upcoming (Ongoing)</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Partnerships</label>
                      <input type="text" value={eventForm.partnerships || ''} onChange={e => setEventForm({ ...eventForm, partnerships: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">External Website / Registration Link</label>
                    <input type="url" value={eventForm.registration_link || ''} onChange={e => setEventForm({ ...eventForm, registration_link: e.target.value })}
                      placeholder="https://... (e.g. hackathon site, event portal, or registration form)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    
                    <div className="flex items-center gap-2.5 mt-2.5">
                      <input 
                        type="checkbox" 
                        id="show_external_website"
                        checked={eventForm.show_external_website ?? false}
                        onChange={e => setEventForm({ ...eventForm, show_external_website: e.target.checked })}
                        className="w-4 h-4 text-[#0ea5e9] rounded border-slate-300 focus:ring-[#0ea5e9] cursor-pointer"
                      />
                      <label htmlFor="show_external_website" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Keep "Visit Event Website" button visible when this event is Completed
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Venue</label>
                      <input type="text" value={eventForm.venue || ''} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Why Participate? (Optional)</label>
                    <textarea rows={3} value={eventForm.why_participate || ''} onChange={e => setEventForm({ ...eventForm, why_participate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none resize-y" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Eligibility (Optional)</label>
                    <textarea rows={2} value={eventForm.eligibility || ''} onChange={e => setEventForm({ ...eventForm, eligibility: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none resize-y" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rules & Guidelines (Optional)</label>
                    <textarea rows={3} value={eventForm.rules_guidelines || ''} onChange={e => setEventForm({ ...eventForm, rules_guidelines: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none resize-y" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gallery URLs (Comma-separated Google Drive Links)</label>
                    <textarea rows={2} value={eventForm.gallery_urls || ''} onChange={e => setEventForm({ ...eventForm, gallery_urls: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..., https://drive.google.com/file/d/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none resize-y" />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
                      <input type="url" placeholder="https://linkedin.com/in/..."
                        value={memberForm.linkedin_url || ''} onChange={e => setMemberForm({ ...memberForm, linkedin_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instagram URL</label>
                      <input type="url" placeholder="https://instagram.com/..."
                        value={memberForm.instagram_url || ''} onChange={e => setMemberForm({ ...memberForm, instagram_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <input type="email" placeholder="name@example.com"
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        title="Please enter a valid email address (e.g. name@example.com)"
                        value={memberForm.email || ''} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
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
      {/* ── HOF MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {hofModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setHofModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-display font-bold text-slate-800">{editingHofId ? 'Edit Entry' : 'Add Entry'}</h2>
                <button onClick={() => { setHofModalOpen(false); resetHofForm(); }} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="hof-form" onSubmit={handleHofSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Member Name *</label>
                      <input required type="text" value={hofForm.member_name || ''} onChange={e => setHofForm({ ...hofForm, member_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Name *</label>
                      <input required type="text" value={hofForm.event_name || ''} onChange={e => setHofForm({ ...hofForm, event_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                      <select required value={hofForm.category || 'achievement'}
                        onChange={e => setHofForm({ ...hofForm, category: e.target.value as 'achievement' | 'representation' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none">
                        <option value="achievement">Achievement</option>
                        <option value="representation">Representation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Index</label>
                      <input type="number" min={0} value={hofForm.order_index ?? 0} onChange={e => setHofForm({ ...hofForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Photo URL <span className="text-slate-400 font-normal">(Google Drive share link)</span>
                    </label>
                    <input type="url" placeholder="https://drive.google.com/file/d/..."
                      value={hofForm.photo_url || ''} onChange={e => {
                        const v = e.target.value;
                        setHofForm({ ...hofForm, photo_url: v });
                        setHofPhotoPreview(toDirectImageUrl(v));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" />
                    {hofPhotoPreview && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={hofPhotoPreview} alt="Preview" className="w-full h-full object-cover"
                            onError={() => setHofPhotoPreview(null)} />
                        </div>
                        <span className="text-xs text-slate-400">Preview — if broken, check your Drive sharing permissions</span>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 p-5 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => { setHofModalOpen(false); resetHofForm(); }}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="hof-form" disabled={isHofSaving}
                  className="px-6 py-2.5 bg-[#0ea5e9] text-white font-semibold rounded-xl hover:bg-[#0284c7] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isHofSaving ? 'Saving...' : (editingHofId ? 'Update Entry' : 'Add Entry')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LEGACY MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {legacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setLegacyModalOpen(false); resetLegacyForm(); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-display font-bold text-slate-800">
                  {editingLegacyId ? 'Edit Legacy Member' : 'Add Legacy Member'}
                </h2>
                <button onClick={() => { setLegacyModalOpen(false); resetLegacyForm(); }} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="legacy-form" onSubmit={handleLegacySubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                      <input required type="text" value={legacyForm.name || ''} onChange={e => setLegacyForm({ ...legacyForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role *</label>
                      <select required value={legacyForm.role || 'President'}
                        onChange={e => setLegacyForm({ ...legacyForm, role: e.target.value as 'President' | 'Vice President' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none">
                        <option value="President">President (1 per tenure)</option>
                        <option value="Vice President">Vice President (Up to 2 per tenure)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tenure / Graduation Year *</label>
                      <input required type="text" placeholder="e.g. 2023 - 2024 or 2024" value={legacyForm.tenure || ''} onChange={e => setLegacyForm({ ...legacyForm, tenure: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Index</label>
                      <input type="number" min={0} value={legacyForm.order_index ?? 0} onChange={e => setLegacyForm({ ...legacyForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Placed Company *</label>
                      <input required type="text" placeholder="e.g. Amazon / Microsoft" value={legacyForm.company || ''} onChange={e => setLegacyForm({ ...legacyForm, company: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Role *</label>
                      <input required type="text" placeholder="e.g. SDE II / Cloud Engineer" value={legacyForm.company_role || ''} onChange={e => setLegacyForm({ ...legacyForm, company_role: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location *</label>
                      <input required type="text" placeholder="e.g. Bengaluru, India" value={legacyForm.location || ''} onChange={e => setLegacyForm({ ...legacyForm, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Photo URL <span className="text-slate-400 font-normal">(Google Drive link)</span>
                      </label>
                      <input type="url" placeholder="https://drive.google.com/file/d/..."
                        value={legacyForm.photo_url || ''} onChange={e => {
                          const v = e.target.value;
                          setLegacyForm({ ...legacyForm, photo_url: v });
                          setLegacyPhotoPreview(toDirectImageUrl(v));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                      {legacyPhotoPreview && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={legacyPhotoPreview} alt="Preview" className="w-full h-full object-cover"
                              onError={() => setLegacyPhotoPreview(null)} />
                          </div>
                          <span className="text-xs text-slate-400">Photo preview</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="url" placeholder="https://linkedin.com/in/..."
                        value={legacyForm.linkedin_url || ''} onChange={e => setLegacyForm({ ...legacyForm, linkedin_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Personal Quote <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input type="text" placeholder='e.g. "Community impact comes from building platforms..."'
                      value={legacyForm.quote || ''} onChange={e => setLegacyForm({ ...legacyForm, quote: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Overview / Bio *</label>
                    <textarea rows={3} required value={legacyForm.bio || ''} onChange={e => setLegacyForm({ ...legacyForm, bio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Key Contributions & Impact <span className="text-slate-400 font-normal">(One achievement per line)</span>
                    </label>
                    <textarea rows={3} placeholder="Engineered chapter expansion to 1500+ members&#10;Organized CU Tech Innovate Hackathon&#10;Established AWS mentorship labs"
                      value={legacyForm.key_contributions || ''} onChange={e => setLegacyForm({ ...legacyForm, key_contributions: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none resize-none font-mono text-xs" />
                  </div>
                </form>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 p-5 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => { setLegacyModalOpen(false); resetLegacyForm(); }}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="legacy-form" disabled={isLegacySaving}
                  className="px-6 py-2.5 bg-[#0ea5e9] text-white font-semibold rounded-xl hover:bg-[#0284c7] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLegacySaving ? 'Saving...' : (editingLegacyId ? 'Update Legacy Member' : 'Add Legacy Member')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SPONSOR MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {sponsorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSponsorModalOpen(false); resetSponsorForm(); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-display font-bold text-slate-800">{editingSponsorId ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
                <button onClick={() => { setSponsorModalOpen(false); resetSponsorForm(); }} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="sponsor-form" onSubmit={handleSponsorSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sponsor / Company Name *</label>
                    <input required type="text" placeholder='e.g. "Amazon Web Services", "GeeksforGeeks"'
                      value={sponsorForm.name || ''} onChange={e => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Upload Logo Image <span className="text-slate-400 font-normal">(PNG, WEBP, SVG, JPEG - Max 5MB)</span>
                    </label>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleSponsorFileChange}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0ea5e9]/10 file:text-[#0ea5e9] hover:file:bg-[#0ea5e9]/20 cursor-pointer" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Or Logo URL <span className="text-slate-400 font-normal">(Direct image URL or Google Drive link)</span>
                    </label>
                    <input type="url" placeholder="https://..."
                      value={sponsorForm.logo_url || ''} 
                      onChange={e => {
                        const v = e.target.value;
                        setSponsorForm({ ...sponsorForm, logo_url: v });
                        if (!sponsorFile) setSponsorLogoPreview(toDirectImageUrl(v) || v);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                  </div>

                  {sponsorLogoPreview && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Logo Preview:</p>
                      <div className="h-24 max-w-[240px] bg-white border border-slate-200 rounded-lg flex items-center justify-center p-3 overflow-hidden">
                        <img src={sponsorLogoPreview} alt="Preview" className="max-h-full max-w-full object-contain"
                          onError={() => setSponsorLogoPreview(null)} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="url" placeholder="https://company.com"
                        value={sponsorForm.website_url || ''} onChange={e => setSponsorForm({ ...sponsorForm, website_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Index <span className="text-slate-400 font-normal">(Lower shows first)</span></label>
                      <input type="number" min="0" value={sponsorForm.order_index ?? 0}
                        onChange={e => setSponsorForm({ ...sponsorForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#0ea5e9] outline-none" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 p-5 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => { setSponsorModalOpen(false); resetSponsorForm(); }}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="sponsor-form" disabled={isSponsorSaving}
                  className="px-6 py-2.5 bg-[#0ea5e9] text-white font-semibold rounded-xl hover:bg-[#0284c7] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSponsorSaving ? 'Saving...' : (editingSponsorId ? 'Update Sponsor' : 'Add Sponsor')}
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
