import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, User, MessageSquare, ArrowRight } from 'lucide-react';
import { isValidEmail } from '../lib/utils';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid, complete email address (e.g. name@example.com or student@cuchd.in).");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send data to Web3Forms API
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // Web3Forms Access Key from .env
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY, 
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: "New Contact Message from ADC CU Website",
          from_name: "ADC Website Contact Form"
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({ name: '', email: '', message: '' });
          onClose();
        }, 2500);
      } else {
        setIsSubmitting(false);
        alert("Failed to send message. Please check your Access Key.");
      }
    } catch (error) {
      setIsSubmitting(false);
      alert("Something went wrong! Please try again later.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#001f2a]/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00caff] to-[#006783]" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-black/5 rounded-full transition-colors z-10"
              title="Close"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-7">
              <div className="mb-4">
                <h2 className="font-headline-md text-2xl font-bold text-on-surface">Get in Touch</h2>
                <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                  Have questions or want to collaborate? Send us a message!
                </p>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#00caff]/10 border border-[#00caff]/30 rounded-2xl p-6 text-center my-4"
                >
                  <div className="w-12 h-12 bg-[#00caff]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#006783]">
                    <Send size={24} />
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-[#006783] mb-1">Message Sent!</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">We'll get back to you as soon as possible.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-0.5">Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your Full Name"
                        className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff]/30 focus:border-[#006783] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-0.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        title="Please enter a valid email address (e.g. name@example.com)"
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff]/30 focus:border-[#006783] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-0.5">Message</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3 text-on-surface-variant/50 w-4 h-4" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="How can we help you?"
                        rows={3}
                        className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff]/30 focus:border-[#006783] transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#006783] text-white py-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-widest hover:bg-[#004d63] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message <Send size={15} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-on-surface-variant">
                      Looking to join the core team?{' '}
                      <Link
                        to="/join"
                        onClick={onClose}
                        className="text-[#006783] font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        Apply Here <ArrowRight size={12} />
                      </Link>
                    </p>
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

export default ContactModal;
