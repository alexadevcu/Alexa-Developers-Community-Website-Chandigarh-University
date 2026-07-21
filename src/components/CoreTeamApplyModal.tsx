import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, BookOpen, Link as LinkIcon, Users, FileText, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CoreTeamApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CoreTeamApplyModal: React.FC<CoreTeamApplyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ 
    uid: '', 
    email: '', 
    year: '',
    degree: '',
    resume: '',
    team: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Save to Supabase (backend spreadsheet)
      const { error: supabaseError } = await supabase
        .from('core_team_applications')
        .insert([{
          uid: formData.uid,
          email: formData.email,
          year: formData.year,
          degree: formData.degree,
          resume: formData.resume,
          team: formData.team,
          reason: formData.reason
        }]);

      if (supabaseError) {
        console.error("Failed to save to Supabase:", supabaseError);
      }

      // 2. Send Email via Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY, 
          subject: `Core Team Application: ${formData.uid} - ${formData.team}`,
          from_name: "ADC Core Team Applications",
          email: formData.email,
          uid: formData.uid,
          year: formData.year,
          degree: formData.degree,
          resume: formData.resume,
          team: formData.team,
          reason: formData.reason
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({ uid: '', email: '', year: '', degree: '', resume: '', team: '', reason: '' });
          onClose();
        }, 2500);
      } else {
        setIsSubmitting(false);
        alert("Failed to submit application. Please check your connection.");
      }
    } catch (error) {
      setIsSubmitting(false);
      alert("Something went wrong! Please try again later.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#001f2a]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-2xl bg-surface/95 backdrop-blur-xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,103,131,0.3)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00caff] to-[#006783]" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface hover:bg-black/5 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-10">
              <h2 className="font-headline-xl text-3xl text-on-surface mb-2">Apply for Core Team</h2>
              <p className="font-body-md text-on-surface-variant mb-8">
                Ready to architect operations and lead the community? Submit your application below.
              </p>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#00caff]/10 border border-[#00caff]/30 rounded-2xl p-6 text-center"
                >
                  <div className="w-16 h-16 bg-[#00caff]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#006783]">
                    <Send size={32} />
                  </div>
                  <h3 className="font-headline-md text-xl text-[#006783] mb-2">Application Submitted!</h3>
                  <p className="font-body-sm text-on-surface-variant">We'll review your application and get back to you soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">UID</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <input
                        type="text"
                        name="uid"
                        value={formData.uid}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 21BCSXXXX"
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="alex@example.com"
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Current Year</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all appearance-none"
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Degree Pursuing</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        required
                        placeholder="e.g. B.E. CSE"
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Team you want to join</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <select
                        name="team"
                        value={formData.team}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all appearance-none"
                      >
                        <option value="" disabled>Select a team</option>
                        <option value="Tech Team">Tech Team</option>
                        <option value="Design Team">Design Team</option>
                        <option value="Management Team">Management Team</option>
                        <option value="Content Team">Content/Social Media Team</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Resume Link (Google Drive)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <input
                        type="url"
                        name="resume"
                        value={formData.resume}
                        onChange={handleChange}
                        required
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Reason to Join</label>
                    <div className="relative">
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        placeholder="Why do you want to join this team?"
                        rows={3}
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#006783] text-white py-4 rounded-2xl font-label-md uppercase tracking-widest hover:bg-[#004d63] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Application <Send size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CoreTeamApplyModal;
