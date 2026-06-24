import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Lightbulb, Rocket, GraduationCap, Users, Calendar, Award, Quote } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Lenis from 'lenis';
import teamGroupPic from '../assets/homepage/Landinggrouppic.jpg';
import drAbhishekPic from '../assets/homepage/Faculty/DrAbhishek_Panday.jpg';
import jasneetMamPic from '../assets/homepage/Faculty/Jasneet mam.jpg';
import prabhneetSirPic from '../assets/homepage/Faculty/Prabhneet sir.jpg';

// --- GLOBAL AUDIO MUTE HACK FOR SPLINE ---
// Spline uses the Web Audio API. We can forcefully intercept and suspend 
// all AudioContexts created on this page to permanently mute the 3D scene.
if (typeof window !== 'undefined') {
  const OriginalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (OriginalAudioContext) {
    (window as any).AudioContext = function() {
      const ctx = new OriginalAudioContext();
      ctx.suspend(); // Immediately suspend audio hardware
      ctx.resume = async () => {}; // Prevent Spline from ever waking it up
      return ctx;
    };
    (window as any).webkitAudioContext = (window as any).AudioContext;
  }
}

const Counter: React.FC<{ value: number, suffix?: string }> = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className="font-headline-xl font-bold text-5xl md:text-6xl text-[#006783]">
      {isInView ? (
        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>
          {value}{suffix}
        </motion.span>
      ) : '0'}
    </span>
  );
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  // Delay Spline mount so rings spin smoothly before heavy WebGL init
  const [showSpline, setShowSpline] = useState(false);

  // Initialize smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Dismiss both the HTML loader (hard refresh) and the React overlay (client-side nav)
  const dismissLoader = () => {
    setIsLoading(false);
    // Also clear HTML loader if it still exists (hard refresh case)
    const htmlLoader = document.getElementById('initial-loader');
    if (htmlLoader) {
      htmlLoader.classList.add('hidden');
      setTimeout(() => htmlLoader.remove(), 500);
    }
  };

  // Mount Spline AFTER 800ms — gives the CSS spinner uncontested GPU time first
  useEffect(() => {
    const splineTimer = setTimeout(() => setShowSpline(true), 800);
    return () => clearTimeout(splineTimer);
  }, []);

  // 8-second fallback: dismiss loader if Spline never fires onLoad
  useEffect(() => {
    const fallbackTimer = setTimeout(() => dismissLoader(), 8000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <>
      {/* React Loading Overlay — shows on client-side navigation to home (HTML loader already removed) */}
      {isLoading && (
        <div
          className="fixed inset-0 z-[100] bg-[#f7f9fb] flex flex-col items-center justify-center"
          style={{ transition: 'opacity 0.5s ease' }}
        >
          <div className="relative w-48 h-48 flex items-center justify-center" style={{ transform: 'translateZ(0)' }}>
            {/* Outer ring */}
            <div className="animate-smooth-spin absolute w-48 h-48 rounded-full border-[3px] border-transparent border-t-[#00caff] border-r-[#006783] shadow-[0_0_30px_rgba(0,202,255,0.2)]" />
            {/* Inner ring */}
            <div className="animate-smooth-spin-reverse absolute w-40 h-40 rounded-full border-[2px] border-transparent border-b-[#00caff] border-l-[#006783] opacity-70" />
            {/* Logo */}
            <div className="relative w-28 h-28 z-10 bg-[#f7f9fb] rounded-full p-4 flex items-center justify-center">
              <img src="/logo.png" alt="ADC" className="w-full h-full object-contain" />
            </div>
          </div>
          <p className="mt-10 text-[11px] tracking-[0.3em] uppercase text-[#006783] font-sans animate-pulse">
            Loading Ecosystem
          </p>
        </div>
      )}

    <div className={`w-full bg-surface relative ${isLoading ? 'h-screen overflow-hidden' : 'overflow-hidden'}`}>
      
      <div className="relative z-10">
        {/* 2. Hero Section */}
      <section className="min-h-[80vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 relative overflow-hidden">
        
        {/* Full-width Spline Background — mounted after 800ms to not compete with spinner GPU */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {showSpline && (
            <Spline 
              scene="/advanced.splinecode" 
              className="w-full h-full object-cover" 
              onLoad={() => {
                // Small buffer after 3D scene is loaded, then dismiss
                setTimeout(() => dismissLoader(), 800);
              }}
            />
          )}
        </div>
        
        {/* Left text readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent w-full md:w-[70%] z-0 pointer-events-none" />
        
        {/* Mobile-only bottom text readability gradient (since text stacks vertically on phones) */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-transparent w-full md:hidden z-0 pointer-events-none" />
        
        {/* Bottom watermark hider gradient */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-surface via-surface/80 to-transparent z-0 pointer-events-none" />
        {/* Hard cover for the spline logo bottom right */}
        <div className="absolute bottom-0 right-0 w-64 h-16 bg-surface z-0 pointer-events-none hidden md:block" />

        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-3xl z-10 relative pt-12 pb-12 pointer-events-none"
        >
          <motion.h1 variants={fadeUpVariant} className="font-headline-xl text-on-surface leading-[1.05] tracking-tighter mb-6 text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] font-bold text-left drop-shadow-sm">
            Build the <span className="text-[#006783] drop-shadow-md">Future</span><br/>of Voice
          </motion.h1>
          <motion.p variants={fadeUpVariant} className="font-body-lg text-on-surface-variant max-w-xl text-lg sm:text-xl md:text-2xl font-medium text-left drop-shadow-sm leading-relaxed">
            A state-of-the-art collective pioneering Voice Interfaces, Edge AI integrations, and next-generation developer tooling at Chandigarh University.
          </motion.p>
        </motion.div>
      </section>

      {/* 3. Sponsors Marquee */}
      <section className="py-12 border-y border-outline-variant/20 bg-surface-container-lowest overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface-container-lowest to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface-container-lowest to-transparent z-10 pointer-events-none" />
        <div className="flex w-max animate-[marquee_20s_linear_infinite] transform-gpu" style={{ willChange: 'transform' }}>
          {[...Array(16)].map((_, i) => (
            <div key={i} className="mx-12 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 flex items-center gap-2">
              <div className="h-8 w-8 bg-on-surface rounded-full shrink-0" />
              <span className="font-headline-md font-bold text-on-surface whitespace-nowrap">PARTNER {(i % 8) + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Empowering Innovation */}
      <section id="empowering" className="py-20 px-4 max-w-container-max mx-auto">
        <div>
          <h2 className="font-headline-xl text-on-surface mb-12 text-center md:text-left text-4xl md:text-5xl tracking-tight">
            Empowering Innovation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lightbulb, title: "Workshops", desc: "Deep dives into VUI design and AWS architecture." },
              { icon: Rocket, title: "Hackathons", desc: "48-hour sprints to build production-ready skills." },
              { icon: GraduationCap, title: "Skill Labs", desc: "Experimental sandbox for generative AI integration." },
              { icon: Users, title: "Mentorship", desc: "Direct feedback loops with Alexa Champions." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl group">
                <div className="h-14 w-14 rounded-xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center text-[#006783] mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="font-headline-md text-on-surface mb-3 text-2xl">{item.title}</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. About Us */}
      <section id="about-us" className="py-20 px-4 max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-headline-xl text-on-surface text-4xl md:text-5xl tracking-tight mb-8">Bridging the Gap Between Academia and Industry.</h2>
            <p className="font-body-lg text-on-surface-variant text-xl leading-relaxed mb-6">
              The ADC is engineered to provide unparalleled exposure to modern tech stacks. We synthesize theoretical knowledge with rigorous practical application through hackathons, bootcamps, and specialized mentor sessions.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Global networking with Alexa Champions",
                "Hands-on building with AWS & VUI",
                "Exclusive access to beta developer tools"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-label-md text-on-surface">
                  <div className="h-6 w-6 rounded-full bg-[#bce9ff] flex items-center justify-center text-[#001f2a]">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#00caff]/20 to-transparent rounded-[3rem] blur-2xl opacity-50" />
            <div className="relative aspect-square md:aspect-[4/5] bg-surface-variant rounded-[2.5rem] border border-outline-variant/30 overflow-hidden shadow-2xl group hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 bg-surface-dim transition-transform duration-700 group-hover:scale-105" />
              <img src={teamGroupPic} alt="ADC CU Team" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-6 left-6 right-6 bottom-6 border border-white/20 rounded-[1.5rem] z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Events Organized */}
      <section id="events" className="py-20 px-4 bg-transparent relative z-10">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <h2 className="font-headline-xl text-on-surface text-4xl md:text-5xl tracking-tight">
              Community Events
            </h2>
            <a href="#" className="flex items-center gap-2 text-[#006783] font-label-md hover:gap-3 transition-all uppercase tracking-wider">
              View All Events <ArrowRight size={18} />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-3xl overflow-hidden group cursor-pointer flex flex-col h-full">
                <div className="h-56 bg-surface-variant relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                  <div className="absolute top-4 left-4 bg-surface px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider z-20 shadow-sm">Upcoming</div>
                  <div className="w-full h-full bg-surface-dim transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <p className="text-[#006783] font-label-sm uppercase tracking-widest mb-3">Oct {10 + i}, 2026</p>
                  <h3 className="font-headline-md text-on-surface mb-4 text-2xl leading-tight group-hover:text-[#006783] transition-colors">Advanced Voice Interactions Summit {i}</h3>
                  <div className="mt-auto flex items-center gap-2 text-on-surface-variant font-label-sm uppercase tracking-widest group-hover:text-[#006783] transition-colors">
                    Register <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Community Statistics */}
      <section className="py-20 px-4 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">By the Numbers</h2>
            <p className="font-body-lg text-on-surface-variant text-lg">Measurable impact across the university ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="w-10 h-10 text-[#006783] mb-6" />, val: 500, suffix: '+', label: 'Active Members' },
              { icon: <Calendar className="w-10 h-10 text-[#006783] mb-6" />, val: 24, suffix: '', label: 'Workshops Hosted' },
              { icon: <Award className="w-10 h-10 text-[#006783] mb-6" />, val: 12, suffix: '+', label: 'Hackathons Won' }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-10 flex flex-col items-center justify-center text-center rounded-[2rem]">
                {stat.icon}
                <Counter value={stat.val} suffix={stat.suffix} />
                <span className="font-label-md tracking-widest uppercase text-on-surface-variant mt-4">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 8. Innovation Gallery */}
      <section id="gallery" className="py-20 px-4 max-w-container-max mx-auto">
        <div className="mb-12">
          <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">Innovation Gallery</h2>
          <p className="font-body-lg text-on-surface-variant text-lg max-w-2xl">Glimpses of collaboration, creativity, and the power of voice technology.</p>
        </div>
        
        {/* Bento Box Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
          {/* Left Large Vertical Image */}
          <div className="md:col-span-1 md:row-span-2 rounded-[2rem] overflow-hidden group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Students collaborating at a desk" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          
          {/* Right Top Left */}
          <div className="rounded-[2rem] overflow-hidden group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" alt="Student coding on laptop with Alexa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          
          {/* Right Top Right */}
          <div className="rounded-[2rem] overflow-hidden group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" alt="Wide room shot of students" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          
          {/* Right Bottom Wide */}
          <div className="md:col-span-2 md:row-span-1 rounded-[2rem] overflow-hidden group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80" alt="Students gathered around a table" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* 8.5 Member Spotlight */}
      <section className="py-20 px-4 max-w-container-max mx-auto bg-transparent">
        <div className="text-center mb-16">
          <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight text-on-surface mb-4">Member Spotlight</h2>
          <p className="font-body-lg text-on-surface-variant text-lg">Hear from the makers shaping the voice ecosystem.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              quote: "\"Being part of the Alexa Developers Community has completely changed how I think about user interaction. The mentorship here is world-class.\"", 
              name: "Maya Singh", 
              role: "UI/UX Designer • 2023", 
              avatar: "https://i.pravatar.cc/150?img=5" 
            },
            { 
              quote: "\"The hackathons are intense but rewarding. I built my first functional smart home skill in just 48 hours thanks to the SDK workshops.\"", 
              name: "Julian Vance", 
              role: "Engineer • 2024", 
              avatar: "https://i.pravatar.cc/150?img=11" 
            },
            { 
              quote: "\"It's more than just coding; it's about the connections. I found my co-founder for our voice-AI startup right here in this community.\"", 
              name: "Aisha Roberts", 
              role: "Tech Enthusiast • 2023", 
              avatar: "https://i.pravatar.cc/150?img=9" 
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant/30 rounded-[2.5rem] p-10 flex flex-col h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
              <Quote className="w-8 h-8 text-[#006783] mb-6 fill-[#006783]/20" />
              <p className="font-body-lg text-on-surface-variant text-lg italic leading-relaxed mb-10 flex-grow">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h4 className="font-headline-md text-on-surface text-lg font-bold">{testimonial.name}</h4>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Faculty Coordinators */}
      <section id="team" className="py-20 px-4 bg-[#001f2a] text-white relative overflow-hidden">
        {/* Tech grid overlay background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-container-max mx-auto relative z-10">
          <div className="mb-8">
            <h2 className="font-headline-xl text-4xl md:text-5xl tracking-tight mb-4 text-center">Faculty Coordinators</h2>
            <p className="text-[#bce9ff] text-center max-w-2xl mx-auto mb-12 opacity-80 font-body-lg">Guiding the next generation of innovators.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                { name: "Dr. Jasneet Kaur Mam", title: "Faculty Advisor and HOD of 4th Year CSE", image: jasneetMamPic },
                { name: "Er Prabhneet Singh Sir", title: "Co-Faculty Adviser", image: prabhneetSirPic },
                { name: "Dr. Abhishek Kumar Sir", title: "Research Mentor", image: drAbhishekPic }
              ].map((faculty, i) => (
                <div key={i} className="flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-transform bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="w-32 h-32 rounded-full bg-surface-variant/20 mb-6 border-2 border-[#00caff] relative overflow-hidden shadow-[0_0_20px_rgba(0,202,255,0.2)]">
                    <img src={faculty.image} alt={faculty.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00caff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-headline-md text-2xl mb-2">{faculty.name}</h4>
                  <p className="font-label-sm text-[#00caff] uppercase tracking-widest mt-1 opacity-90 leading-relaxed">{faculty.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* 9. Join Us Finale */}
      <section id="join" className="w-full py-32 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-surface-container-lowest border-t border-outline-variant/30">
        {/* Deep ambient blur background */}
        <div className="absolute inset-0 bg-surface/50 opacity-80 backdrop-blur-xl z-0 pointer-events-none"></div>

        {/* Rotating 360-degree border ring adapted for light theme */}
        <div className="absolute inset-0 border-[2px] border-[#00caff]/20 m-8 rounded-[100px] z-0 shadow-[0_0_50px_rgba(0,103,131,0.05)_inset]" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center py-16">
          <h2 className="text-4xl md:text-6xl font-headline-xl text-on-surface tracking-tight mb-6">
            Ready to Build Your Network?
          </h2>
          <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-12">
            Join a community of hundreds of student developers. Get exclusive access to workshops, hackathons, and mentorship.
          </p>
          <Link to="/join" className="bg-transparent border border-[#006783] text-[#006783] px-10 py-5 font-headline-md font-bold text-lg rounded-full uppercase tracking-widest hover:bg-[#006783] hover:text-white transition-colors duration-300">
            Join the Community
          </Link>
        </div>
      </section>
      </div>
    </div>
    </>
  );
};

export default Home;
