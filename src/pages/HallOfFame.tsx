import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Quote, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import bannerImg from '../assets/Banner1.jpeg';

interface HallOfFameEntry {
  id: string;
  member_name: string;
  event_name: string;
  photo_url: string | null;
  category: 'achievement' | 'representation';
  order_index: number;
}

import { getCachedData, setCachedData } from '../lib/cache';

const HallOfFame = () => {
  const cachedHof = getCachedData<HallOfFameEntry[]>('hall_of_fame');
  const [hofEntries, setHofEntries] = useState<HallOfFameEntry[]>(() => cachedHof || []);
  const [isLoading, setIsLoading] = useState(() => !cachedHof);

  useEffect(() => {
    const fetchHof = async () => {
      try {
        const { data } = await supabase
          .from('hall_of_fame')
          .select('*')
          .order('order_index', { ascending: true })
          .limit(50);
        if (data) {
          setHofEntries(data);
          setCachedData('hall_of_fame', data);
        }
      } catch (err) {
        console.error("Error fetching hall of fame:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHof();
  }, []);

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-20">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-48 md:h-72 lg:h-96 rounded-3xl overflow-hidden mb-12 shadow-md relative"
        >
          <img src={bannerImg} alt="Hall of Fame Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <h1 className="font-headline-xl text-4xl md:text-5xl lg:text-6xl text-white mb-2 drop-shadow-lg font-bold">Hall of Fame</h1>
            <p className="font-body-lg text-white/90 text-lg md:text-xl max-w-2xl drop-shadow">Celebrating the exceptional achievements and representations by our community.</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0ea5e9] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Achievements Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-8 border-b border-outline-variant/30 pb-4">
                <Award className="text-[#006783] w-8 h-8" />
                <h2 className="font-headline-md text-3xl text-on-surface font-bold">Achievements</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hofEntries.filter(e => e.category === 'achievement').length > 0 ? (
                  hofEntries.filter(e => e.category === 'achievement').map((entry, idx) => (
                    <motion.div 
                      key={entry.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}
                      className="relative group rounded-[2rem] overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                    >
                      {entry.photo_url ? (
                        <img src={entry.photo_url.match(/\/d\/([a-zA-Z0-9_-]+)/) || entry.photo_url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ? `https://lh3.googleusercontent.com/d/${(entry.photo_url.match(/\/d\/([a-zA-Z0-9_-]+)/) || entry.photo_url.match(/[?&]id=([a-zA-Z0-9_-]+)/))![1]}` : entry.photo_url} alt={entry.member_name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-surface-dim flex items-center justify-center">
                          <Award className="text-outline/30 w-16 h-16" />
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 min-h-[4.5rem] flex flex-col justify-end">
                          <h4 className="font-bold text-white text-xl sm:text-2xl leading-tight drop-shadow-md line-clamp-2">{entry.member_name}</h4>
                          <p className="text-[#0ea5e9] font-semibold text-sm mt-1 tracking-wide drop-shadow">{entry.event_name}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full p-8 rounded-3xl border border-dashed border-outline-variant/50 text-center text-on-surface-variant bg-surface-dim/30">
                    <Award className="w-10 h-10 mx-auto mb-3 text-outline/40" />
                    <p>No achievements posted yet.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Representation Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-3 mb-8 border-b border-outline-variant/30 pb-4">
                <Quote className="text-[#0ea5e9] w-8 h-8" />
                <h2 className="font-headline-md text-3xl text-on-surface font-bold">Representation</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hofEntries.filter(e => e.category === 'representation').length > 0 ? (
                  hofEntries.filter(e => e.category === 'representation').map((entry, idx) => (
                    <motion.div 
                      key={entry.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}
                      className="relative group rounded-[2rem] overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                    >
                      {entry.photo_url ? (
                        <img src={entry.photo_url.match(/\/d\/([a-zA-Z0-9_-]+)/) || entry.photo_url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ? `https://lh3.googleusercontent.com/d/${(entry.photo_url.match(/\/d\/([a-zA-Z0-9_-]+)/) || entry.photo_url.match(/[?&]id=([a-zA-Z0-9_-]+)/))![1]}` : entry.photo_url} alt={entry.member_name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-surface-dim flex items-center justify-center">
                          <Users className="text-outline/30 w-16 h-16" />
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 min-h-[4.5rem] flex flex-col justify-end">
                          <h4 className="font-bold text-white text-xl sm:text-2xl leading-tight drop-shadow-md line-clamp-2">{entry.member_name}</h4>
                          <p className="text-[#0ea5e9] font-semibold text-sm mt-1 tracking-wide drop-shadow">{entry.event_name}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full p-8 rounded-3xl border border-dashed border-outline-variant/50 text-center text-on-surface-variant bg-surface-dim/30">
                    <Quote className="w-10 h-10 mx-auto mb-3 text-outline/40" />
                    <p>No representations posted yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HallOfFame;
