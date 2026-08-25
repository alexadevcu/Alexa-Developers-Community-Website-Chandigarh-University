import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, ExternalLink } from 'lucide-react';
import landingGif from '../assets/Homepage/landinggif.gif'; 
import CoreTeamApplyModal from '../components/CoreTeamApplyModal';

const cuimsSteps = [
  { step: 1, title: "Log in to CUIMS", desc: "Access the official CUIMS portal using your university UID and password." },
  { step: 2, title: "Open Navigation Menu", desc: "Click the Navigation Bar menu icon located at the top-left corner of your dashboard." },
  { step: 3, title: "Open SRMS", desc: "Scroll down and open the Student Relation Management System (SRMS) module." },
  { step: 4, title: "Clubs & Societies", desc: "Select the 'Clubs & Societies' tab from the system menu." },
  { step: 5, title: "Entity Type: Co-curricular", desc: "Choose 'Co-curricular' as the entity type for registration." },
  { step: 6, title: "Select Category", desc: "Select the appropriate category (Club, Department Society, Professional Society, or Community)." },
  { step: 7, title: "Find & Register", desc: "Search for 'Alexa Developers Community' and click Join/Register." },
  { step: 8, title: "Submit Request", desc: "Confirm and submit your membership registration request." },
  { step: 9, title: "Check Application Status", desc: "Navigate to 'My Joined Clubs' to monitor your application progress." },
  { step: 10, title: "Official Member!", desc: "Once your status updates to 'Approved', you are officially an ADC CU member!" },
];

const Join: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  return (
    <div className="w-full bg-surface text-on-surface pb-24" style={{ paddingTop: '100px' }}>

      {/* Header */}
      <div className="text-center px-6 mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-headline-xl tracking-tighter mb-6 font-bold drop-shadow-sm text-[#006783]"
        >
          JOIN THE FUTURE.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto leading-relaxed font-body-lg"
        >
          Become a part of an elite network of developers, designers, and innovators. Watch our
          community showcase and follow the CUIMS registration process to join.
        </motion.p>
      </div>

      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="mx-auto px-6 mb-16"
        style={{ maxWidth: '900px' }}
      >
        <div
          className="relative rounded-3xl overflow-hidden border border-outline-variant/30 shadow-[0_20px_60px_-15px_rgba(0,103,131,0.3)] bg-surface-container-lowest"
          style={{ width: '100%', aspectRatio: '16/9', minHeight: '200px' }}  
        >
          {!isPlaying ? (
            <div
              className="absolute inset-0 cursor-pointer group"
              onClick={() => setIsPlaying(true)}
            >
              {/* Background video thumbnail */}
              <img
                src={landingGif}
                alt="Showcase Thumbnail"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              {/* Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,103,131,0.2), rgba(0,31,42,0.8))' }} />
              {/* Play button */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="group-hover:border-[#00caff] group-hover:shadow-[0_0_30px_rgba(0,202,255,0.5)] transition-all duration-300"
                  style={{ width: 80, height: 60, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,103,131,0.7)', backdropFilter: 'blur(12px)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play className="group-hover:text-[#00caff] group-hover:fill-[#00caff] transition-colors duration-300"
                    style={{ width: 28, height: 28, fill: 'white', color: 'white', marginLeft: 4 }} />
                </div>
              </div>
            </div>
          ) : (
            <iframe
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              src="https://www.youtube.com/embed/Eng0oWg-ECk?autoplay=1"
              title="ADC Showcase"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-4 px-6 mb-20"
      >
        <a
          href="https://uims.cuchd.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-[#006783] text-white font-label-md font-bold uppercase tracking-wider rounded-full hover:bg-[#004d63] hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          Open CUIMS Portal <ExternalLink size={18} />
        </a>
        <a
          href="https://whatsapp.com/channel/0029Vb8eGmx7YScy56dDu93n"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 border border-[#006783] text-[#006783] font-label-md font-bold uppercase tracking-wider rounded-full hover:bg-[#006783]/10 transition-all flex items-center gap-2"
        >
          Join WhatsApp Channel <ArrowRight size={18} />
        </a>
      </motion.div>

      {/* Divider */}
      <div className="mx-auto mb-16 border-t border-outline-variant/30" style={{ maxWidth: '1000px' }} />

      {/* ── CUIMS REGISTRATION PROCESS ── */}
      <div className="px-6 max-w-6xl mx-auto">

        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-headline-lg font-bold text-[#001f2a] mb-4 tracking-tight">
            HOW TO JOIN VIA CUIMS
          </h2>
          <p className="text-on-surface-variant font-body-lg max-w-2xl mx-auto">
            Follow the official student portal step-by-step guide to register for Alexa Developers Community.
          </p>
        </div>

        {/* Step-by-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {cuimsSteps.map((s) => (
            <div 
              key={s.step}
              className="glass-card rounded-3xl p-6 border border-outline-variant/30 hover:border-[#00caff]/50 transition-all duration-300 shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#006783] text-white font-mono font-bold flex items-center justify-center shrink-0 shadow-md">
                {s.step}
              </div>
              <div>
                <h4 className="font-headline-md text-lg font-bold text-on-surface mb-1">{s.title}</h4>
                <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Core Team Callout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full px-6 relative z-10" 
        style={{ maxWidth: '900px', margin: '2rem auto 0' }}
      >
        <div className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-14 text-center group bg-surface-variant/40 border border-[#00caff]/20 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00caff] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-3xl md:text-4xl font-headline-lg font-bold text-[#001f2a] mb-6">Want to lead the ecosystem?</h2>
          <p className="text-[#006783] font-body-md text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            We are constantly looking for exceptional talent to join the ADC Core Team. If you have the drive to architect operations, lead technical tracks, or shape the future of our community, step up to the challenge.
          </p>
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center justify-center px-10 py-4 bg-[#006783] border border-[#006783] text-white font-label-md font-bold uppercase tracking-[0.2em] hover:bg-[#004d63] transition-all duration-300 rounded-full shadow-lg hover:shadow-xl"
          >
            Apply for Core Team
          </button>
        </div>
      </motion.div>

      <CoreTeamApplyModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
      />
    </div>
  );
};

export default Join;
