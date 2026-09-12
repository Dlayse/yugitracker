import { useEffect, useMemo, useRef } from 'react';
import './CardFoilOverlay.css';

/*
 * En una carta de verdad la rareza no se nota como "más brillo", sino en QUÉ
 * parte de la carta lleva foil y con qué textura:
 *
 *   Rare             nombre en plata; ilustración mate
 *   Super Rare       solo la ilustración, holograma de trama fina
 *   Ultra Rare       nombre en oro + ilustración holográfica
 *   Secret Rare      nombre y arte con líneas DIAGONALES finas (efecto cristal)
 *   Prismatic Secret igual, pero trama horizontal+vertical y nombre moteado
 *   Ultimate Rare    relieve: bordes, nombre y estrellas resaltados, sin diagonales
 *   Ghost Rare       la ilustración sale casi blanca, "vaciada", con halo 3D
 *   Collector's Rare arco iris tipo mancha de aceite, sin dirección fija
 *   Starlight Rare   toda la carta con trama horizontal prismática
 *   Parallel / DT    toda la carta con líneas paralelas finas
 *   Starfoil         estrellas · Mosaic cuadrados · Shatterfoil cristal roto
 *   Gold / Premium   oro en nombre, marco y bordes (Premium además en relieve)
 *   Quarter Century  foil paralelo + nombre en oro + marca de agua del 25
 *
 * Las zonas están medidas sobre las imágenes reales de YGOPRODeck y son las
 * mismas en monstruo, mágica y trampa (ver CardFoilOverlay.css).
 */

type NameFoil = 'silver' | 'gold' | 'rainbow' | 'speckled' | 'platinum';
type ArtFoil = 'holo' | 'diagonal' | 'grid' | 'emboss' | 'ghost' | 'oilslick' | 'gold' | 'hieroglyph';
type CardFoil = 'parallel' | 'starlight' | 'platinum' | 'qcr' | 'stars' | 'mosaic' | 'shatter' | 'gold';

interface FoilSpec {
  /** Foil sobre las letras del nombre. */
  name?: NameFoil;
  /** Foil dentro del recuadro de la ilustración. */
  art?: ArtFoil;
  /** Foil sobre toda la superficie de la carta. */
  card?: CardFoil;
  /** Marco y bordes resaltados, como en Ultimate y Premium Gold. */
  emboss?: boolean;
  /** Marca de agua del 25.º aniversario. */
  seal25?: boolean;
}

/**
 * Traduce el texto de rareza que devuelve la API a las capas que hay que pintar.
 *
 * **El orden de las comprobaciones importa**: "Gold Secret Rare" contiene tanto
 * "gold" como "secret", y "Quarter Century Secret Rare" contiene "secret". Van
 * de lo más específico a lo más genérico, y Common cae al final sin foil.
 */
function resolveFoil(rarity: string): FoilSpec | null {
  const r = (rarity || '').toLowerCase();

  // --- Cimas de la escala ---
  if (r.includes('10000')) return { name: 'gold', card: 'qcr' };
  if (r.includes('quarter') || r.includes('25th')) return { name: 'gold', card: 'qcr', seal25: true };
  if (r.includes('starlight')) return { name: 'rainbow', card: 'starlight' };
  if (r.includes('pharaoh')) return { name: 'gold', art: 'hieroglyph', card: 'parallel' };
  if (r.includes('ghost')) return { name: 'silver', art: 'ghost' };
  if (r.includes('collector')) return { name: 'rainbow', art: 'oilslick', emboss: true };
  if (r.includes('ultimate')) return { name: 'gold', art: 'emboss', emboss: true };

  // --- Variantes de Secret ---
  if (r.includes('platinum') && r.includes('secret')) return { name: 'platinum', card: 'platinum' };
  if (r.includes('platinum')) return { card: 'platinum' };
  if (r.includes('prismatic') || r.includes('millennium')) return { name: 'speckled', art: 'grid' };

  // --- Series doradas (antes que los genéricos "gold" y "secret") ---
  if (r.includes('premium gold')) return { name: 'gold', art: 'holo', card: 'gold', emboss: true };
  if (r.includes('gold') && r.includes('secret')) return { name: 'gold', art: 'diagonal', card: 'gold' };
  if (r.includes('gold')) return { name: 'gold', art: 'gold', card: 'gold' };

  // --- Tramas que cubren la carta entera ---
  if (r.includes('starfoil')) return { card: 'stars' };
  if (r.includes('mosaic')) return { card: 'mosaic' };
  if (r.includes('shatterfoil')) return { card: 'shatter' };

  /*
   * Las Parallel se combinan con la rareza base ("Ultra Parallel Rare"), así
   * que el foil paralelo se suma a lo que ya lleve esa rareza.
   */
  if (r.includes('parallel') || r.includes('duel terminal')) {
    const base: FoilSpec = { card: 'parallel' };
    if (r.includes('secret')) return { ...base, name: 'rainbow', art: 'diagonal' };
    if (r.includes('ultra')) return { ...base, name: 'gold', art: 'holo' };
    if (r.includes('super')) return { ...base, art: 'holo' };
    return base;
  }

  // --- Escalera clásica ---
  if (r.includes('secret')) return { name: 'rainbow', art: 'diagonal' };
  if (r.includes('ultra')) return { name: 'gold', art: 'holo' };
  if (r.includes('super')) return { art: 'holo' };
  if (r.includes('short print')) return null;
  if (r.includes('rare')) return { name: 'silver' };

  return null; // Common y cualquier otra cosa sin foil.
}

interface Props {
  rarity: string;
}

export default function CardFoilOverlay({ rarity }: Props) {
  const spec = useMemo(() => resolveFoil(rarity), [rarity]);
  const ref = useRef<HTMLDivElement>(null);

  /*
   * Un foil real solo se enciende al mover la carta bajo la luz. Aquí se sigue
   * el puntero por encima de la carta y su posición se guarda en dos variables
   * CSS que el reflejo usa como origen.
   *
   * Se escribe directamente sobre el nodo, sin pasar por el estado de React:
   * un `setState` por cada píxel de movimiento repintaría la cuadrícula entera.
   * Y `pointermove` solo se escucha mientras el cursor está encima, así que no
   * quedan cientos de escuchas activas a la vez.
   */
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty('--foil-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--foil-y', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    const onEnter = () => host.addEventListener('pointermove', onMove);
    const onLeave = () => {
      host.removeEventListener('pointermove', onMove);
      el.style.removeProperty('--foil-x');
      el.style.removeProperty('--foil-y');
    };

    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointermove', onMove);
    };
  }, [spec]);

  if (!spec) return null; // Common: nada que pintar, y una capa menos por carta.

  return (
    <div ref={ref} className="foil" aria-hidden="true">
      {spec.card && <div className={`foil-zone foil-zone--card foil-card--${spec.card}`} />}
      {spec.art && <div className={`foil-zone foil-zone--art foil-art--${spec.art}`} />}
      {spec.name && <div className={`foil-zone foil-zone--name foil-name--${spec.name}`} />}
      {spec.emboss && <div className="foil-zone foil-zone--card foil-emboss" />}
      {spec.seal25 && <div className="foil-zone foil-zone--seal" />}
      <div className="foil-zone foil-zone--card foil-glare" />
    </div>
  );
}
