import React from 'react';
import logo from '../assets/Alexa Circular logo.png';
import cuLogo from '../assets/CU logo.png';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="w-full relative z-20 bg-[#001f2a] border-t border-white/10 overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00caff]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Premium Dark Glass Container */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] mx-4 my-8 md:mx-10 p-8 md:p-12 lg:p-16 shadow-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16">
          
          {/* Column 1: Brand & Chapter Location */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00caff] blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                <img src={logo} alt="ADC Logo" className="w-12 h-12 object-contain relative z-10 brightness-0 invert" />
              </div>
              <span className="font-display font-bold text-xl text-white leading-tight tracking-wide">
                Alexa Developers<br/>Community
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-[#00caff] font-mono text-xs uppercase tracking-[0.2em] font-bold">
                Official Student Chapter
              </p>
              <p className="text-[#bce9ff]/70 font-sans text-sm leading-relaxed">
                Chandigarh University, NH-95,<br/>
                Gharuan, Mohali,<br/>
                Punjab, India
              </p>
            </div>
          </div>

          {/* Column 2: Digital Ecosystem */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-white font-headline-sm font-bold uppercase tracking-widest text-sm opacity-90">Digital Ecosystem</h3>
            <div className="flex flex-col space-y-5">
              <a href="https://www.linkedin.com/company/alexadevscu/posts/" target="_blank" rel="noreferrer" className="group flex flex-col">
                <span className="flex items-center space-x-3 text-white font-sans text-sm font-medium group-hover:text-[#00caff] transition-colors duration-300">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#00caff]/20 transition-colors">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <span>LinkedIn ↗</span>
                </span>
                <span className="text-[#bce9ff]/50 text-xs mt-2 ml-11">Professional updates & events</span>
              </a>
              <a href="https://www.instagram.com/alexadev.cu/" target="_blank" rel="noreferrer" className="group flex flex-col">
                <span className="flex items-center space-x-3 text-white font-sans text-sm font-medium group-hover:text-[#00caff] transition-colors duration-300">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#00caff]/20 transition-colors">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <span>Instagram ↗</span>
                </span>
                <span className="text-[#bce9ff]/50 text-xs mt-2 ml-11">Campus workshops & BTS</span>
              </a>
            </div>
          </div>

          {/* Column 3: Direct Communications */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-white font-headline-sm font-bold uppercase tracking-widest text-sm opacity-90">Direct Comm</h3>
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col group">
                <a href="mailto:hello.alexacu@gmail.com" className="text-white font-sans text-sm font-medium group-hover:text-[#00caff] transition-colors duration-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00caff] animate-pulse" />
                  hello.alexacu@gmail.com
                </a>
                <span className="text-[#bce9ff]/50 text-xs mt-2">Mentor outreach and support</span>
              </div>
              <div className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[#00caff] font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Operating Hours</span>
                <span className="text-white font-sans text-sm">Mon - Fri: 09:00 AM - 04:30 PM IST</span>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Directory Navigation */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-white font-headline-sm font-bold uppercase tracking-widest text-sm opacity-90">Directory</h3>
            <div className="flex flex-col space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Events', href: '/events' },
                { label: 'Team', href: '/team' },
                { label: 'Join', href: '/join' },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="text-[#bce9ff]/70 font-sans text-sm hover:text-white hover:translate-x-2 transition-all duration-300 w-fit flex items-center gap-2">
                  <span className="text-[#00caff] opacity-0 -ml-4 transition-all duration-300 hover:opacity-100">▸</span> {label}
                </a>
              ))}
              {/* Admin — protected link */}
              <a href="/admin" className="text-[#00caff]/50 font-sans text-sm hover:text-[#00caff] hover:translate-x-2 transition-all duration-300 w-fit flex items-center gap-2 group">
                <span className="text-[#00caff] opacity-0 -ml-4 transition-all duration-300 group-hover:opacity-100">▸</span>
                <span>Admin</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </a>
            </div>
          </div>

        </div>

        {/* 🔒 The Copyright & Credit Bar */}
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
          <p className="text-[#bce9ff]/50 font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] leading-relaxed max-w-xl">
            &copy; {new Date().getFullYear()} Alexa Developers Community - Chandigarh University. All Rights Reserved.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center md:items-end text-right">
              <span className="text-[#bce9ff]/50 font-mono text-[10px] uppercase tracking-[0.1em] mb-2">In Collaboration With</span>
              <img src={cuLogo} alt="Chandigarh University" className="h-14 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10"></div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[#bce9ff]/50 font-mono text-[10px] uppercase tracking-[0.1em] mb-1">Engineered by the</span>
              <span className="text-[#00caff] font-bold text-sm tracking-wide">ADC Core Team</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
