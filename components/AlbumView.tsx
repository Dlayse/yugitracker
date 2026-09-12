import React, { useState, useEffect } from 'react';
import type { Card, AlbumColumns } from '../types';
import { CardItem } from './CardItem';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Grid as GridIcon } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface Props {
  cards: Card[];
  onCardPress: (card: Card) => void;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

// Yu-Gi-Oh card aspect ratio is roughly 59mm / 86mm (~0.686)
const CARD_ASPECT_RATIO = 0.686;

export const AlbumView: React.FC<Props> = ({ cards, onCardPress, isSelectionMode, selectedIds, onToggleSelect }) => {
  const { state, dispatch } = useStore();
  const { albumColumns } = state.ui;
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  // Determine items per page based on columns (Square grid: 2x2, 3x3, 4x4)
  const itemsPerPage = albumColumns * albumColumns;
  const totalPages = Math.ceil(cards.length / itemsPerPage) || 1;

  // Calculate Binder Aspect Ratio
  // Reduced spine offset from 0.12 to 0.06 for a slimmer look
  const binderAspectRatio = CARD_ASPECT_RATIO + 0.06;

  // Reset page if total pages shrinks
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const handlePrev = () => {
      if (currentPage > 0) {
        setDirection(-1);
        setCurrentPage(p => p - 1);
      }
  };

  const handleNext = () => {
      if (currentPage < totalPages - 1) {
        setDirection(1);
        setCurrentPage(p => p + 1);
      }
  };
  
  const handleColumnsChange = (cols: AlbumColumns) => {
      setDirection(0);
      dispatch({ type: 'SET_ALBUM_COLUMNS', payload: cols });
      setCurrentPage(0);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [totalPages, currentPage]);

  const startIndex = currentPage * itemsPerPage;
  const currentCards = cards.slice(startIndex, startIndex + itemsPerPage);
  
  const emptySlots = itemsPerPage - currentCards.length;
  const placeholders = Array.from({ length: Math.max(0, emptySlots) });

  // Animation Variants
  const variants: Variants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      transformOrigin: 'left center',
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      transformOrigin: 'left center',
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 70,
        damping: 18
      }
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      transformOrigin: 'left center',
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }),
  };

  return (
    // MAIN CONTAINER: Fixed height relative to viewport to prevent scrolling.
    <div className="flex flex-col items-center w-full h-[calc(100vh-90px)] overflow-hidden select-none relative z-0">
      
      {/* BINDER AREA */}
      {/* Added pb-20 to ensure the binder sits above the floating controls */}
      <div className="w-full h-full flex items-center justify-center p-2 pb-20 min-h-0 relative z-10">
           
           <div 
                className="relative rounded-r-2xl rounded-l-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] bg-[#111] border border-white/5"
                style={{
                    aspectRatio: `${binderAspectRatio}`,
                    height: '100%', 
                    maxHeight: '100%',
                    maxWidth: '100%',
                    perspective: '2000px'
                }}
           >
                {/* 1. SPINE (Fixed Left) - Reduced to 6% width */}
                <div className="absolute left-0 top-0 bottom-0 w-[6%] bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#111] border-r border-black z-30 flex flex-col justify-around py-[12%] shadow-2xl rounded-l-md">
                    {/* Rings - Reduced height to 4% */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="relative w-full h-[4%]">
                             <div className="absolute left-[-30%] w-[180%] h-[90%] top-[5%] bg-gradient-to-b from-gray-400 via-white to-gray-500 rounded-full shadow-lg transform -rotate-2 z-20" />
                             <div className="absolute left-[20%] top-[35%] w-[40%] h-[50%] bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,1)] z-10 opacity-80" />
                        </div>
                    ))}
                </div>

                {/* 2. PAGE CONTENT - Starts at 6% */}
                <div className="absolute left-[6%] top-0 bottom-0 right-0 bg-[#0e0e10] rounded-r-2xl overflow-hidden border-l border-white/5">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div 
                            key={`${currentPage}-${albumColumns}`}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 flex flex-col justify-center origin-left bg-zinc-900"
                            style={{ 
                                transformStyle: 'preserve-3d', 
                                backfaceVisibility: 'hidden',
                                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent 8%)'
                            }}
                        >
                            {/* Plastic Texture */}
                            <div className="absolute inset-0 pointer-events-none opacity-15 bg-[url('https://www.transparenttextures.com/patterns/plastic-surface.png')] mix-blend-overlay z-10" />

                            {/* GRID CONTENT */}
                            <div 
                                className="h-full w-full grid place-items-center"
                                style={{ 
                                    gridTemplateColumns: `repeat(${albumColumns}, 1fr)`,
                                    gridTemplateRows: `repeat(${albumColumns}, 1fr)`,
                                    gap: '1%',
                                    padding: '2%'
                                }}
                            >
                                {currentCards.map(card => (
                                    <div key={card.uid} className="relative w-full h-full p-[3%] flex items-center justify-center">
                                        {/* Pocket Weld Seams */}
                                        <div className="absolute inset-0 border border-white/10 rounded-[3px]" style={{ boxShadow: 'inset 0 0 4px rgba(0,0,0,0.6)' }} />
                                        
                                        {/* Card Container */}
                                        <div className="w-full h-full relative z-20 hover:z-30 transition-transform duration-200 hover:scale-[1.04] shadow-md rounded-[3px] overflow-hidden">
                                            <CardItem 
                                                card={card}
                                                onPress={onCardPress}
                                                viewMode="album"
                                                isSelectionMode={isSelectionMode}
                                                isSelected={selectedIds.has(card.uid)}
                                                onToggleSelect={() => onToggleSelect(card.uid)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {placeholders.map((_, i) => (
                                    <div key={`empty-${i}`} className="relative w-full h-full p-[3%] opacity-10">
                                        <div className="absolute inset-0 border border-white/10 rounded-[3px] border-dashed" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
           </div>
      </div>

      {/* ALBUM CONTROLS (Floating Bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-between gap-8 bg-black/80 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10 shadow-2xl z-50 min-w-[320px]">
          <div className="flex items-center gap-3">
              <GridIcon size={16} className="text-muted" />
              <div className="flex bg-white/10 rounded-full p-0.5 gap-1">
                  {[2, 3, 4].map((cols) => (
                      <button
                          key={cols}
                          onClick={() => handleColumnsChange(cols as AlbumColumns)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                              albumColumns === cols 
                              ? 'bg-primary text-black shadow-md scale-105' 
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}
                      >
                          {cols}
                      </button>
                  ))}
              </div>
          </div>

          <div className="w-[1px] h-6 bg-white/10" />

          <div className="flex items-center gap-4">
               <span className="text-xs font-mono text-white/80">
                  <span className="text-primary font-bold text-sm">{currentPage + 1}</span> / {totalPages}
               </span>
               <div className="flex gap-1">
                  <button 
                      onClick={handlePrev} 
                      disabled={currentPage === 0}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                      <ChevronLeft size={20} />
                  </button>
                  <button 
                      onClick={handleNext} 
                      disabled={currentPage >= totalPages - 1}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                      <ChevronRight size={20} />
                  </button>
               </div>
          </div>
      </div>
    </div>
  );
};