import { useMemo } from 'react';
import './CardFoilOverlay.css';

/*
 * En una carta de verdad la rareza no se nota como "más brillo", sino en QUÉ
 * parte de la carta lleva foil y con qué textura. Esta es la tabla completa,
 * con las zonas que pinta cada una:
 *
 *   RAREZA                       NOMBRE    ILUSTRACIÓN        CARTA ENTERA
 *   ---------------------------------------------------------------------------
 *   Common                        —          —                  —
 *   Short Print / Super Short     —          —                  —
 *   Normal Rare                   —          —                  —
 *   Rare                          plata      —                  —
 *   Super Rare                    —          holo de puntos     —
 *   Ultra Rare                    oro        holo de puntos     —
 *   Secret Rare                   arcoíris   diagonales finas   —
 *   Ultra / Extra Secret Rare     oro        diagonales finas   —
 *   Prismatic Secret / Millennium moteado    horizontal+vertical —
 *   Platinum Secret Rare          platino    —                  platino
 *   Platinum Rare                 —          —                  platino
 *   Ultimate Rare                 oro        relieve grabado    —      + relieve
 *   Ghost Rare / Holographic      plata      vaciada, casi blanca —
 *   Ghost/Gold Rare               oro        vaciada, casi blanca —     + relieve
 *   Collector's Rare              arcoíris   mancha de aceite   —      + relieve
 *   Starlight / Alternate Rare    arcoíris   —                  trama horizontal
 *   Quarter Century Secret Rare   oro        —                  paralelo + sello 25
 *   10000 Secret Rare             oro        —                  paralelo
 *   Grand Master Rare             oro        —                  jeroglíficos + relieve
 *   Pharaoh's Rare                oro        jeroglíficos       paralelo
 *   Gold Rare                     oro        oro                oro
 *   Gold Secret Rare              oro        diagonales finas   oro
 *   Premium Gold Rare             oro        holo de puntos     oro    + relieve
 *   Starfoil Rare                 —          —                  estrellas
 *   Mosaic Rare                   —          —                  cuadrados
 *   Shatterfoil Rare              —          —                  cristal roto
 *   Parallel (Normal/Super/Ultra/Secret)  según su rareza base  + líneas paralelas
 *   Duel Terminal (las cuatro)            según su rareza base  + líneas paralelas
 *
 * Las zonas están medidas sobre las imágenes reales de YGOPRODeck y son las
 * mismas en monstruo, mágica y trampa (ver CardFoilOverlay.css).
 */

type NameFoil = 'silver' | 'gold' | 'rainbow' | 'speckled' | 'platinum';
type ArtFoil = 'holo' | 'diagonal' | 'grid' | 'emboss' | 'ghost' | 'oilslick' | 'gold' | 'hieroglyph';
type CardFoil =
  | 'parallel'
  | 'starlight'
  | 'platinum'
  | 'qcr'
  | 'stars'
  | 'mosaic'
  | 'shatter'
  | 'gold'
  | 'grandmaster';

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
 * La lista sale de recorrer unas 13.000 cartas de YGOPRODeck y quedarse con
 * todas las cadenas distintas de `set_rarity`, así que cubre lo que el catálogo
 * usa de verdad, no lo que debería usar. Algunas entradas del campo no son
 * rarezas sino notas de edición ("New", "Reprint", "2", "European debut"): esas
 * caen al final sin foil, que es lo correcto.
 *
 * **EL ORDEN ES LO QUE HACE QUE FUNCIONE.** Casi todas las rarezas contienen el
 * nombre de otra más genérica, así que se comprueba de lo más específico a lo
 * más general. Tres ejemplos de por qué:
 *
 *   "Super Short Print"   contiene "super" pero NO lleva foil
 *   "Gold Secret Rare"    contiene "gold" y "secret"
 *   "Ultra Rare (Pharaoh's Rare)" contiene "ultra"
 *
 * Mover una línea hacia abajo puede dejar una rareza sin su brillo, o darle el
 * de otra. Si se añade una nueva, colocarla por especificidad y comprobarla en
 * /foil-demo.html.
 */
function resolveFoil(rarity: string): FoilSpec | null {
  const r = (rarity || '').toLowerCase().trim();
  if (!r) return null;

  // --- Sin foil. Van las primeras porque "Super Short Print" lleva "super". ---
  if (r.includes('short print')) return null;

  // --- Cimas de la escala ---

  // 10000 Secret Rare: la más extrema del OCG, foil sobre toda la carta.
  if (r.includes('10000')) return { name: 'gold', card: 'qcr' };

  // Quarter Century: foil paralelo, nombre en oro y la marca de agua del 25.
  if (r.includes('quarter century') || r.includes('25th')) {
    return { name: 'gold', card: 'qcr', seal25: true };
  }

  /*
   * Grand Master Rare: arco iris sobre atributo, nivel y borde del cuadro de
   * texto, con una cenefa de jeroglíficos en el canto de la carta.
   */
  if (r.includes('grand master')) {
    return { name: 'gold', card: 'grandmaster', emboss: true };
  }

  // Starlight (también llamada Alternate Rare): trama horizontal en toda la carta.
  if (r.includes('starlight') || r.includes('alternate rare')) {
    return { name: 'rainbow', card: 'starlight' };
  }

  // Pharaoh's Rare: una Ultra con jeroglíficos diminutos dentro del foil.
  if (r.includes('pharaoh')) return { name: 'gold', art: 'hieroglyph', card: 'parallel' };

  // Ghost/Gold Rare: ilustración vaciada de Ghost con el nombre perfilado en oro.
  if (r.includes('ghost') && r.includes('gold')) return { name: 'gold', art: 'ghost', emboss: true };

  // Ghost Rare (Holographic Rare en el OCG): la ilustración sale casi blanca.
  if (r.includes('ghost') || r.includes('holographic')) return { name: 'silver', art: 'ghost' };

  // Collector's: arco iris de mancha de aceite, con relieve.
  if (r.includes('collector')) return { name: 'rainbow', art: 'oilslick', emboss: true };

  // Ultimate: la única que se nota con el dedo. Relieve, sin diagonales.
  if (r.includes('ultimate')) return { name: 'gold', art: 'emboss', emboss: true };

  // --- Familia Secret (antes que "secret" a secas y que "ultra") ---

  if (r.includes('platinum') && r.includes('secret')) return { name: 'platinum', card: 'platinum' };
  if (r.includes('platinum')) return { card: 'platinum' };

  // Prismatic y Millennium: trama horizontal+vertical y nombre moteado.
  if (r.includes('prismatic') || r.includes('millennium')) return { name: 'speckled', art: 'grid' };

  // Ultra Secret / Extra Secret: foil de Secret con el nombre en oro.
  if (r.includes('secret') && (r.includes('ultra') || r.includes('extra'))) {
    return { name: 'gold', art: 'diagonal' };
  }

  // --- Serie dorada (antes que los genéricos "gold" y "secret") ---

  if (r.includes('premium gold')) return { name: 'gold', art: 'holo', card: 'gold', emboss: true };
  if (r.includes('gold') && r.includes('secret')) return { name: 'gold', art: 'diagonal', card: 'gold' };
  if (r.includes('gold')) return { name: 'gold', art: 'gold', card: 'gold' };

  // --- Tramas que cubren la carta entera ---

  if (r.includes('starfoil')) return { card: 'stars' };
  if (r.includes('mosaic')) return { card: 'mosaic' };
  if (r.includes('shatterfoil')) return { card: 'shatter' };

  /*
   * Parallel y Duel Terminal. Son un acabado que se SUMA a una rareza base
   * ("Duel Terminal Super Parallel Rare" = una Super con foil paralelo), así
   * que se mira qué rareza lleva dentro. Ojo: "Duel Terminal Normal Rare
   * Parallel Rare" lleva "normal" y "rare", y manda "normal".
   */
  if (r.includes('parallel') || r.includes('duel terminal')) {
    const base: FoilSpec = { card: 'parallel' };
    if (r.includes('secret')) return { ...base, name: 'rainbow', art: 'diagonal' };
    if (r.includes('ultra')) return { ...base, name: 'gold', art: 'holo' };
    if (r.includes('super')) return { ...base, art: 'holo' };
    if (r.includes('normal')) return base;
    if (r.includes('rare')) return { ...base, name: 'silver' };
    return base;
  }

  // --- Escalera clásica ---

  if (r.includes('secret')) return { name: 'rainbow', art: 'diagonal' };
  if (r.includes('ultra')) return { name: 'gold', art: 'holo' };
  if (r.includes('super')) return { art: 'holo' };

  /*
   * "Rare" a secas va la última porque aparece dentro de casi todas las
   * demás. Normal Rare es una Common en hueco de Rare: sin foil.
   */
  if (r.includes('normal rare')) return null;
  if (r.includes('rare')) return { name: 'silver' };

  // Common y las notas de edición que ensucian el campo ("New", "Reprint"...).
  return null;
}

interface Props {
  rarity: string;
}

/**
 * Capas de foil de una carta.
 *
 * Solo pinta: el seguimiento del puntero y la inclinación viven en
 * `useCardPointer`, enganchado al contenedor de la carta, porque el reflejo
 * tiene que existir también en las Common, que no pintan ninguna capa.
 */
export default function CardFoilOverlay({ rarity }: Props) {
  const spec = useMemo(() => resolveFoil(rarity), [rarity]);

  if (!spec) return null; // Common: nada que pintar, y una capa menos por carta.

  return (
    <div className="foil" aria-hidden="true">
      {spec.card && <div className={`foil-zone foil-zone--card foil-card--${spec.card}`} />}
      {spec.art && <div className={`foil-zone foil-zone--art foil-art--${spec.art}`} />}
      {spec.name && <div className={`foil-zone foil-zone--name foil-name--${spec.name}`} />}
      {spec.emboss && <div className="foil-emboss" />}
      {spec.seal25 && <div className="foil-seal" />}
      <div className="foil-glare" />
    </div>
  );
}
