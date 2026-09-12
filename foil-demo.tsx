import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import CardFoilOverlay from './components/CardFoilOverlay';
import './index.css';

/*
 * Banco de pruebas de los brillos (solo desarrollo: `npm run dev` y abrir
 * /foil-demo.html). Vite solo empaqueta index.html, así que esta página no
 * llega a producción.
 *
 * Existe porque ajustar un foil a ojo, carta a carta dentro de la colección,
 * es desesperante: aquí salen todas las rarezas juntas sobre la misma
 * ilustración y se comparan de un vistazo. Usa el componente de verdad, no una
 * copia, así que lo que se ve aquí es exactamente lo que se ve en la app.
 */

const RAREZAS = [
  'Common',
  'Short Print',
  'Rare',
  'Super Rare',
  'Ultra Rare',
  'Secret Rare',
  'Prismatic Secret Rare',
  'Platinum Secret Rare',
  'Ultimate Rare',
  'Ghost Rare',
  "Collector's Rare",
  'Starlight Rare',
  'Quarter Century Secret Rare',
  '10000 Secret Rare',
  "Pharaoh's Rare",
  'Gold Rare',
  'Premium Gold Rare',
  'Gold Secret Rare',
  'Parallel Rare',
  'Ultra Parallel Rare',
  'Duel Terminal Rare Parallel Rare',
  'Starfoil Rare',
  'Mosaic Rare',
  'Shatterfoil Rare',
];

const CARTAS: Record<string, string> = {
  'Dark Magician': 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
  'Blue-Eyes White Dragon': 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
  'Monster Reborn (mágica)': 'https://images.ygoprodeck.com/images/cards/83764718.jpg',
};

function Demo() {
  const [carta, setCarta] = useState<string>('Dark Magician');
  const [ancho, setAncho] = useState(220);
  const [zonas, setZonas] = useState(false);

  return (
    <div className="min-h-screen p-6 text-main">
      <header className="mb-6 flex flex-wrap items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold">Brillos por rareza</h1>
          <p className="text-muted text-sm">
            Pasa el cursor por encima: el reflejo sigue al puntero, como al girar la carta.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-xs text-muted">
          Carta
          <select
            value={carta}
            onChange={(e) => setCarta(e.target.value)}
            className="bg-bg-surface border border-border-base rounded-lg px-3 py-1.5 text-sm text-main"
          >
            {Object.keys(CARTAS).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          Tamaño: {ancho}px
          <input
            type="range"
            min={120}
            max={420}
            value={ancho}
            onChange={(e) => setAncho(Number(e.target.value))}
            className="accent-primary"
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={zonas} onChange={(e) => setZonas(e.target.checked)} />
          Marcar las zonas medidas
        </label>
      </header>

      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${ancho}px, 1fr))` }}>
        {RAREZAS.map((rareza) => (
          <figure key={rareza} className="flex flex-col gap-2">
            <div
              className="card-container relative w-full aspect-[421/614] rounded-lg overflow-hidden bg-black"
              style={{ containerType: 'inline-size' }}
            >
              <img src={CARTAS[carta]} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <CardFoilOverlay rarity={rareza} />
              {zonas && (
                <>
                  <div
                    className="absolute border border-dashed border-cyan-400/80 z-[30]"
                    style={{ top: '17.2%', right: '11.5%', bottom: '29.4%', left: '10.4%' }}
                  />
                  <div
                    className="absolute border border-dashed border-pink-400/80 z-[30]"
                    style={{ top: '5.4%', right: '20%', bottom: '89.5%', left: '5.8%' }}
                  />
                </>
              )}
            </div>
            <figcaption className="text-xs font-medium text-muted text-center leading-tight">{rareza}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Falta #root');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
);
