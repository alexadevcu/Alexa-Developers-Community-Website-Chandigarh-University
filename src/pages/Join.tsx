import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Rocket, Play } from 'lucide-react';
import landingGif from '../assets/Homepage/landinggif.gif'; 
import CoreTeamApplyModal from '../components/CoreTeamApplyModal';

const Join: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  return (
    <div className="w-full bg-surface text-on-surface pb-24" style={{ paddingTop: '100px' }}>

      {/* Header */}
      <div className="text-center px-6 mb-16">
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
          community showcase and take the first step towards building what's next.
        </motion.p>
      </div>

      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="mx-auto px-6"
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
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
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

      {/* Apply Now Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex justify-center mt-12 mb-20"
      >
        <a
          href="https://whatsapp.com/channel/0029Vb8eGmx7YScy56dDu93n"
          target="_blank"
          rel="noopener noreferrer"
          className="px-12 py-4 bg-[#006783] text-white font-label-md font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#004d63] hover:-translate-y-1 transition-all duration-400 shadow-lg hover:shadow-xl"
        >
          JOIN US
        </a>
      </motion.div>

      {/* Divider */}
      <div className="mx-auto mb-16 border-t border-outline-variant/30" style={{ maxWidth: '900px' }} />

      {/* The Process */}
      <div className="px-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-headline-lg font-bold text-[#001f2a] mb-4 tracking-tight">
            THE PROCESS
          </h2>
          <p className="text-on-surface-variant font-body-lg">Three simple steps to integrate into the ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div
            className="relative rounded-[2rem] overflow-hidden group hover:-translate-y-2 hover:border-[#00caff]/50 transition-all duration-500 shadow-xl"
            style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', padding: '2.5rem' }}
          >
            <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.05, pointerEvents: 'none' }}>
              <FileText size={100} strokeWidth={1} className="text-[#006783]" />
            </div>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div
                className="font-mono text-lg font-bold text-[#006783] mb-6 flex items-center justify-center bg-[#00caff]/10 rounded-full"
                style={{ width: 48, height: 48, border: '2px solid rgba(0,202,255,0.3)' }}
              >
                1
              </div>
              <h3 className="text-2xl font-headline-md text-on-surface mb-3">Initialize Profile</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-body-sm">
                Fill out the digital application form. Tell us about your tech stack, your passion
                projects, and what drives you to build.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="relative rounded-[2rem] overflow-hidden group hover:-translate-y-2 hover:border-[#00caff]/50 transition-all duration-500 shadow-xl"
            style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', padding: '2.5rem' }}
          >
            <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.05, pointerEvents: 'none' }}>
              <MessageSquare size={100} strokeWidth={1} className="text-[#006783]" />
            </div>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div
                className="font-mono text-lg font-bold text-[#006783] mb-6 flex items-center justify-center bg-[#00caff]/10 rounded-full"
                style={{ width: 48, height: 48, border: '2px solid rgba(0,202,255,0.3)' }}
              >
                2
              </div>
              <h3 className="text-2xl font-headline-md text-on-surface mb-3">Technical Sync</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-body-sm">
                Engage in a brief technical discussion with our core team. We want to understand
                your problem-solving approach and alignment.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="relative rounded-[2rem] overflow-hidden group hover:-translate-y-2 hover:border-[#00caff]/50 transition-all duration-500 shadow-xl"
            style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', padding: '2.5rem' }}
          >
            <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.05, pointerEvents: 'none' }}>
              <Rocket size={100} strokeWidth={1} className="text-[#006783]" />
            </div>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div
                className="font-mono text-lg font-bold text-[#006783] mb-6 flex items-center justify-center bg-[#00caff]/10 rounded-full"
                style={{ width: 48, height: 48, border: '2px solid rgba(0,202,255,0.3)' }}
              >
                3
              </div>
              <h3 className="text-2xl font-headline-md text-on-surface mb-3">Access Granted</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-body-sm">
                Receive your credentials, join our secure communication channels, and start
                contributing to ongoing community initiatives.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Core Team Callout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full px-6 relative z-10" 
        style={{ maxWidth: '900px', margin: '6rem auto 0' }}
      >
        <div className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-14 text-center group bg-surface-variant/40 border border-[#00caff]/20 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00caff] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-3xl md:text-4xl font-headline-lg font-bold text-[#001f2a] mb-6">Want to lead the ecosystem?</h2>
          <p className="text-[#006783] font-body-md text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            We are constantly looking for exceptional talent to join the ADC Core Team. If you have the drive to architect operations, lead technical tracks, or shape the future of our community, step up to the challenge.
          </p>
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center justify-center px-10 py-4 bg-white/80 border border-[#006783]/30 text-[#006783] font-label-md uppercase tracking-[0.2em] hover:bg-[#006783] hover:text-white transition-all duration-300 rounded-full shadow-lg hover:shadow-xl"
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
