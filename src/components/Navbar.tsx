import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logo from '../assets/Alexa Circular logo.png';
import cuLogo from '../assets/CU logo.png';
import ContactModal from './ContactModal';

const Navbar = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-4 md:px-margin-desktop max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <img src={cuLogo} alt="Chandigarh University Logo" className="h-10 object-contain drop-shadow-sm" />
              <div className="h-6 w-px bg-outline-variant/50 mx-1"></div>
              <img src={logo} alt="ADC Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-sm" />
            </div>
            <span className="font-headline-md text-on-surface font-bold tracking-tight group-hover:text-primary transition-colors hidden sm:block">
              Alexa Developers
            </span>
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" onClick={(e) => { if(window.location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="text-on-surface-variant hover:text-primary transition-colors font-label-md cursor-pointer">Home</Link>
            <Link to="/events" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Events</Link>
            <Link to="/team" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Team</Link>
            <a href="/#hall-of-fame" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Hall of Fame</a>
            <button 
              onClick={() => setIsContactOpen(true)}
              className="bg-[#006783] text-white px-6 py-2.5 rounded-full font-label-sm uppercase tracking-widest hover:bg-[#004d63] hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Contact Us
            </button>
          </div>
          <button className="md:hidden text-on-surface">
            <Menu />
          </button>
        </div>
      </nav>

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  );
};

export default Navbar;
