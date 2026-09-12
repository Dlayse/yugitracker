import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { searchCards } from '../../services/cardService';
import type { ApiCard, MainCardType, MonsterType, CardProperty } from '../../types';
import { debounce, analyzeCardType, getRarityWeight } from '../../utils';
import { Search, Loader2, X, Filter } from 'lucide-react';
import { CardFilter } from '../CardFilter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: ApiCard) => void;
}

interface FilterState {
    cardTypes: MainCardType[];
    monsterTypes: MonsterType[];
    properties: CardProperty[];
    sets: string[];
    rarities: string[];
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [results, setResults] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
      cardTypes: [],
      monsterTypes: [],
      properties: [],
      sets: [],
      rarities: []
  });

  const performSearch = debounce(async (val: string) => {
    if (val.length < 3) return;
    setLoading(true);
    const data = await searchCards(val);
    setResults(data);
    setLoading(false);
  }, 500);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    performSearch(e.target.value);
  };

  // 1. Derive Available Options from Search Results
  const { availableSets, availableRarities } = useMemo(() => {
      const sets = new Set<string>();
      const rarities = new Set<string>();

      results.forEach(card => {
          if (card.card_sets) {
              card.card_sets.forEach(s => {
                  const prefix = s.set_code.split('-')[0];
                  sets.add(prefix);
                  rarities.add(s.set_rarity);
              });
          }
      });

      return {
          availableSets: Array.from(sets).sort(),
          availableRarities: Array.from(rarities).sort((a, b) => {
              const wA = getRarityWeight(a);
              const wB = getRarityWeight(b);
              if (wA !== wB) return wB - wA;
              return a.localeCompare(b);
          })
      };
  }, [results]);

  // 2. Filter Results
  const filteredResults = useMemo(() => {
      if (filters.cardTypes.length === 0 && 
          filters.monsterTypes.length === 0 && 
          filters.properties.length === 0 && 
          filters.sets.length === 0 && 
          filters.rarities.length === 0) {
          return results;
      }

      return results.filter(card => {
          // Analyze Type on the fly for API cards
          const { cardType, monsterType, property } = analyzeCardType(card.type, card.race);

          // A. Type Filters
          if (filters.cardTypes.length > 0 && !filters.cardTypes.includes(cardType)) return false;
          
          if (cardType === 'Monster' && filters.monsterTypes.length > 0) {
              if (!monsterType || !filters.monsterTypes.includes(monsterType)) return false;
          }
          
          if ((cardType === 'Spell' || cardType === 'Trap') && filters.properties.length > 0) {
               if (!property || !filters.properties.includes(property)) return false;
          }

          // B. Set & Rarity Filters (Check if ANY of the card's sets match)
          if (filters.sets.length > 0 || filters.rarities.length > 0) {
              if (!card.card_sets) return false; // If no sets, cannot match set/rarity filters
              
              const matchesSet = filters.sets.length === 0 || card.card_sets.some(s => filters.sets.includes(s.set_code.split('-')[0]));
              const matchesRarity = filters.rarities.length === 0 || card.card_sets.some(s => filters.rarities.includes(s.set_rarity));
              
              if (!matchesSet || !matchesRarity) return false;
          }

          return true;
      });
  }, [results, filters]);

  const activeFilterCount = filters.cardTypes.length + filters.monsterTypes.length + filters.properties.length + filters.sets.length + filters.rarities.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start pt-10 sm:pt-20 justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-2xl bg-bg-surface border border-border-base rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-border-base flex items-center justify-between shrink-0 bg-bg-panel rounded-t-2xl">
            <h3 className="font-bold text-lg text-main">Añadir Carta</h3>
            <button onClick={onClose} className="p-1 hover:bg-main/10 rounded text-main/70 hover:text-main"><X size={20} /></button>
        </div>

        <div className="p-4 shrink-0 space-y-1 bg-bg-surface z-50">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-main/50" size={20} />
                    <input 
                        autoFocus
                        type="text" 
                        value={query}
                        onChange={handleInput}
                        placeholder="Buscar carta (min. 3 letras)..."
                        className="w-full bg-bg-panel border border-border-base text-main rounded-xl pl-10 pr-4 py-3 text-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder-main/30"
                    />
                </div>
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`px-3 sm:px-4 rounded-xl transition-colors flex items-center gap-2 border ${
                        isFilterOpen || activeFilterCount > 0 
                            ? 'bg-primary text-black border-primary hover:bg-primary/90' 
                            : 'bg-bg-panel text-main/60 border-border-base hover:text-main hover:bg-main/10'
                    }`}
                    title="Filtrar resultados"
                >
                    <Filter size={20} />
                    {activeFilterCount > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isFilterOpen ? 'bg-black text-primary' : 'bg-primary text-black border border-black/20'}`}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            <CardFilter 
                filters={filters}
                onChange={setFilters}
                isOpen={isFilterOpen}
                availableSets={availableSets}
                availableRarities={availableRarities}
            />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-bg-surface/50 rounded-b-2xl">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-main/50">
                    <Loader2 className="animate-spin mb-2" size={30} />
                    <p>Consultando base de datos...</p>
                </div>
            ) : filteredResults.length === 0 && query.length >= 3 ? (
                 <div className="text-center py-10 text-main/50">
                    {results.length > 0 ? 'No hay cartas que coincidan con los filtros.' : 'No se encontraron resultados.'}
                 </div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-10 text-main/30 text-sm">
                    Escribe el nombre de la carta para empezar.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredResults.slice(0, 50).map(card => (
                        <div 
                            key={card.id}
                            onClick={() => onSelect(card)}
                            className="flex items-center gap-4 p-2.5 hover:bg-main/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border-base"
                        >
                            {/* SAFE IMAGE ACCESS */}
                            <img 
                                src={card.card_images?.[0]?.image_url_small || 'https://images.ygoprodeck.com/images/cards/back_high.jpg'} 
                                className="w-10 h-14 object-cover rounded shadow-sm bg-black/20" 
                                alt="" 
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-main truncate">{card.name}</div>
                                <div className="text-xs text-primary truncate opacity-80">{card.type}</div>
                            </div>
                            {card.card_sets && (
                                <div className="text-[10px] text-muted font-mono hidden sm:block text-right">
                                    {card.card_sets.length} impresiones
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredResults.length > 50 && (
                        <div className="text-center text-xs text-muted py-2 italic">
                            Mostrando 50 de {filteredResults.length} resultados...
                        </div>
                    )}
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};