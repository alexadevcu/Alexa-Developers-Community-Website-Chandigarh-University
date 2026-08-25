import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import logo from '../assets/Alexa Circular logo.png';
import cuLogo from '../assets/CU Logo red &white.png';

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
      <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl md:rounded-[2rem] mx-3 my-4 md:mx-10 md:my-8 p-5 md:p-12 lg:p-16 shadow-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-16">
          
          {/* Column 1: Brand & Chapter Location */}
          <div className="flex flex-col space-y-3.5 md:space-y-6">
            <div className="flex items-center space-x-3.5 group cursor-default">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[#00caff] blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                <img src={logo} alt="ADC Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain relative z-10 brightness-0 invert" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl text-white leading-tight tracking-wide">
                Alexa Developers<br/>Community
              </span>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-[#00caff] font-mono text-xs uppercase tracking-[0.2em] font-bold">
                Official Student Chapter
              </p>
              <p className="text-[#bce9ff]/70 font-sans text-xs md:text-sm leading-relaxed">
                Chandigarh University, NH-05, Gharuan, Mohali, Punjab, 140413.
              </p>
            </div>
          </div>

          {/* Column 2: Digital Ecosystem */}
          <div className="flex flex-col space-y-3 md:space-y-6">
            <h3 className="text-white font-headline-sm font-bold uppercase tracking-widest text-xs md:text-sm opacity-90">Digital Ecosystem</h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3 sm:space-y-5">
              <a href="https://www.linkedin.com/company/alexadevscu/posts/" target="_blank" rel="noreferrer" className="group flex flex-col p-2.5 sm:p-0 bg-white/5 sm:bg-transparent rounded-xl border border-white/5 sm:border-none">
                <span className="flex items-center space-x-2 text-white font-sans text-xs md:text-sm font-medium group-hover:text-[#00caff] transition-colors duration-300">
                  <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg group-hover:bg-[#00caff]/20 transition-colors">
                    <LinkedinIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1">LinkedIn <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70 group-hover:opacity-100 transition-all" /></span>
                </span>
                <span className="text-[#bce9ff]/50 text-[10px] sm:text-xs mt-1 sm:mt-2 sm:ml-11 hidden sm:block">Professional updates & events</span>
              </a>
              <a href="https://www.instagram.com/alexadev.cu/" target="_blank" rel="noreferrer" className="group flex flex-col p-2.5 sm:p-0 bg-white/5 sm:bg-transparent rounded-xl border border-white/5 sm:border-none">
                <span className="flex items-center space-x-2 text-white font-sans text-xs md:text-sm font-medium group-hover:text-[#00caff] transition-colors duration-300">
                  <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg group-hover:bg-[#00caff]/20 transition-colors">
                    <InstagramIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1">Instagram <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70 group-hover:opacity-100 transition-all" /></span>
                </span>
                <span className="text-[#bce9ff]/50 text-[10px] sm:text-xs mt-1 sm:mt-2 sm:ml-11 hidden sm:block">Campus workshops & BTS</span>
              </a>
            </div>
          </div>

          {/* Column 3: Direct Communications */}
          <div className="flex flex-col space-y-3 md:space-y-6">
            <h3 className="text-white font-headline-sm font-bold uppercase tracking-widest text-xs md:text-sm opacity-90">Direct Comm</h3>
            <div className="flex flex-col space-y-3 md:space-y-6">
              <div className="flex flex-col group">
                <a href="mailto:adc.cu@cumail.in" className="text-white font-sans text-xs md:text-sm font-medium group-hover:text-[#00caff] transition-colors duration-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00caff] animate-pulse" />
                  adc.cu@cumail.in
                </a>
              </div>
              <div className="flex flex-col p-3 md:p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[#00caff] font-mono text-[10px] md:text-xs uppercase tracking-widest mb-0.5 font-bold">Operating Hours</span>
                <span className="text-white font-sans text-xs md:text-sm">Mon - Fri: 09:00 AM - 04:30 PM IST</span>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Directory Navigation */}
          <div className="flex flex-col space-y-3 md:space-y-6">
            <h3 className="text-white font-headline-sm font-bold uppercase tracking-widest text-xs md:text-sm opacity-90">Directory</h3>
            <div className="grid grid-cols-3 sm:grid-cols-2 md:flex md:flex-col gap-2 md:gap-0 md:space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Events', href: '/events' },
                { label: 'Team', href: '/team' },
                { label: 'Legacy', href: '/legacy' },
                { label: 'Join', href: '/join' },
                { label: 'Hall of Fame', href: '/hall-of-fame' },
              ].map(({ label, href }) => (
                <Link key={label} to={href} className="group relative text-[#bce9ff]/70 font-sans text-xs md:text-sm hover:text-white transition-all duration-300 w-fit">
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* 🔒 The Copyright & Credit Bar */}
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-5 md:pt-8 mt-6 md:mt-12 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 md:gap-6">
          <p className="text-[#bce9ff]/50 font-mono text-[10px] md:text-xs uppercase tracking-[0.1em] leading-relaxed max-w-xl">
            &copy; {new Date().getFullYear()} Alexa Developers Community - Chandigarh University. All Rights Reserved.
          </p>
          <div className="flex flex-row items-center justify-center md:justify-end gap-4 md:gap-6">
            <div className="flex flex-col items-center md:items-end text-center md:text-right">
              <span className="text-[#bce9ff]/50 font-mono text-[10px] md:text-xs uppercase tracking-[0.1em] mb-1">In Collaboration With</span>
              <img src={cuLogo} alt="Chandigarh University" className="h-10 md:h-14 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
            <div className="w-px h-8 md:h-12 bg-white/10"></div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[#bce9ff]/50 font-mono text-[10px] md:text-xs uppercase tracking-[0.1em] mb-0.5">Engineered under</span>
              <span className="text-xs md:text-sm font-bold tracking-wide text-[#00caff]">
                <a
                  href="https://linktr.ee/vasu_gera"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Vasu Gera
                </a>{' '}
                <span className="text-[#bce9ff]/70 font-normal">&</span> ADC Core Team
              </span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
