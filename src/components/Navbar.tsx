import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import logo from '../assets/Alexa Circular logo.png';
import cuLogo from '../assets/CU logo.png';
import ContactModal from './ContactModal';

const Navbar = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', to: '/', isHash: false },
    { label: 'Events', to: '/events', isHash: false },
    { label: 'Team', to: '/team', isHash: false },
    { label: 'Hall of Fame', to: '/hall-of-fame', isHash: false },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all duration-300">
        {/* Top bar: Logo + Desktop links + Contact */}
        <div className="flex justify-between items-center h-16 px-4 md:px-margin-desktop max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src={cuLogo} alt="Chandigarh University Logo" className="h-8 sm:h-10 object-contain drop-shadow-sm" />
            <div className="h-6 w-px bg-outline-variant/50 mx-1"></div>
            <img src={logo} alt="ADC Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-sm" />
            <span className="font-headline-md text-on-surface font-bold tracking-tight group-hover:text-primary transition-colors hidden sm:block text-sm md:text-base ml-1">
              Alexa Developers
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map(link => {
              const isActive = !link.isHash && location.pathname === link.to;
              return link.isHash ? (
                <a key={link.label} href={link.to} className="text-on-surface-variant hover:text-primary transition-colors font-label-md">{link.label}</a>
              ) : (
                <div key={link.label} className="relative pb-1">
                  <Link
                    to={link.to}
                    onClick={(e) => { if (link.to === '/' && location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                    className={`font-label-md transition-all ${isActive ? 'text-[#006783] font-bold' : 'text-on-surface-variant hover:text-[#006783]'}`}
                  >
                    {link.label}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#006783] rounded-full"
                      style={{ boxShadow: '0 0 8px rgba(0,103,131,0.7)' }}
                    />
                  )}
                </div>
              );
            })}
            <button
              onClick={() => setIsContactOpen(true)}
              className="bg-[#006783] text-white px-6 py-2.5 rounded-full font-label-sm uppercase tracking-widest hover:bg-[#004d63] hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile: Hamburger + Contact */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsContactOpen(true)}
              className="bg-[#006783] text-white px-4 py-1.5 rounded-full font-label-sm text-xs uppercase tracking-wider shadow-md shrink-0"
            >
              Contact
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-[#006783] bg-[#006783]/5 hover:bg-[#006783]/10 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Glass Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20 flex flex-col pt-8 pb-12 px-6 overflow-y-auto"
            >
              <div className="flex flex-col gap-2 flex-grow">
                {navLinks.map((link, idx) => {
                  const isActive = !link.isHash && location.pathname === link.to;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.3 }}
                    >
                      {link.isHash ? (
                        <a
                          href={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between py-4 border-b border-outline-variant/20 text-lg font-headline-md transition-colors ${isActive ? 'text-[#006783] font-bold' : 'text-on-surface-variant hover:text-[#006783]'}`}
                        >
                          {link.label}
                          <ChevronRight size={18} className="opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          onClick={(e) => { 
                            if (link.to === '/' && location.pathname === '/') { 
                              e.preventDefault(); 
                              window.scrollTo({ top: 0, behavior: 'smooth' }); 
                              setIsMobileMenuOpen(false);
                            } 
                          }}
                          className={`flex items-center justify-between py-4 border-b border-outline-variant/20 text-lg font-headline-md transition-colors ${isActive ? 'text-[#006783] font-bold' : 'text-on-surface-variant hover:text-[#006783]'}`}
                        >
                          {link.label}
                          <ChevronRight size={18} className="opacity-50" />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Bottom graphic/info on mobile menu */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-auto pt-10 text-center"
              >
                <img src={logo} alt="ADC" className="w-12 h-12 mx-auto mb-4 opacity-50 grayscale" />
                <p className="text-xs font-label-md uppercase tracking-widest text-on-surface-variant/70">
                  Alexa Developers Community<br/>Chandigarh University
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
};

export default Navbar;
