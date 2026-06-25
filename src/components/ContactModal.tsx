import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, User, MessageSquare } from 'lucide-react';

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-lg bg-surface/95 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,103,131,0.3)] overflow-hidden"
          >
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00caff] to-[#006783]" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-10">
              <h2 className="font-headline-xl text-3xl text-on-surface mb-2">Get in Touch</h2>
              <p className="font-body-md text-on-surface-variant mb-8">
                Have questions about the community or want to collaborate? Send us a message!
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
                  <h3 className="font-headline-md text-xl text-[#006783] mb-2">Message Sent!</h3>
                  <p className="font-body-sm text-on-surface-variant">We'll get back to you as soon as possible.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Alex Mercer"
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
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Message</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 text-on-surface-variant/50 w-5 h-5" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="How can we help you?"
                        rows={4}
                        className="w-full bg-surface-variant/50 border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00caff] focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#006783] text-white py-4 rounded-2xl font-label-md uppercase tracking-widest hover:bg-[#004d63] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
                  </button>
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
