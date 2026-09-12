import React, { useMemo } from 'react';
import './CardFoilOverlay.css';

/**
 * Normaliza el string de rareza de la API a nuestras clases CSS.
 */
const getRarityClass = (rarityString: string): string => {
  const r = (rarityString || '').toLowerCase();

  // 1. Special & High End
  if (r.includes('quarter') || r.includes('25th')) return 'foil-qcr';
  if (r.includes('ghost')) return 'foil-ghost';
  if (r.includes('platinum')) return 'foil-platinum';
  
  // 2. Pattern Foils (Common in Battle Packs/Structure Decks)
  if (r.includes('mosaic')) return 'foil-mosaic';
  if (r.includes('starfoil')) return 'foil-starfoil';
  if (r.includes('shatterfoil')) return 'foil-shatterfoil';
  if (r.includes('parallel')) return 'foil-parallel';
  
  // 3. Texture / Etched
  if (r.includes('ultimate')) return 'foil-ultimate';
  if (r.includes('collector')) return 'foil-secret'; 
  
  // 4. Grid / Sparkle
  if (r.includes('starlight') || r.includes('prismatic')) return 'foil-starlight';
  if (r.includes('pharaoh') || r.includes('millennium')) return 'foil-starlight'; // Use starlight grid for pharaoh

  // 5. Gold Variants
  // Priority: Gold Secret -> Premium Gold -> Gold
  if (r.includes('gold') && r.includes('secret')) return 'foil-gold-secret'; // The complex texture
  if (r.includes('premium gold')) return 'foil-premium-gold'; // The sharp border style
  if (r.includes('gold')) return 'foil-gold'; // Standard diffuse
  
  // 6. Standard Lines
  if (r.includes('secret')) return 'foil-secret';
  
  // 7. Standard Foils
  if (r.includes('ultra')) return 'foil-ultra';
  if (r.includes('super')) return 'foil-super';
  if (r.includes('rare')) return 'foil-rare';

  return 'foil-common';
};

interface Props {
    rarity: string;
}

const CardFoilOverlay: React.FC<Props> = ({ rarity }) => {
  const rarityClass = useMemo(() => getRarityClass(rarity), [rarity]);

  // Si es común, no renderizamos nada para ahorrar recursos
  if (rarityClass === 'foil-common') return null;

  return (
    <div 
      className={`foil-overlay ${rarityClass}`} 
      aria-hidden="true" /* Decorativo, no accesible */
    />
  );
};

export default CardFoilOverlay;