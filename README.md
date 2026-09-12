# Yugi-Tracker

Gestor de colecciones de cartas de **Yu-Gi-Oh!**. Organiza tus cartas en carpetas y guarda de
cada una lo que de verdad distingue un ejemplar de otro: edición, rareza, idioma, estado de
conservación y lo que pagaste por ella.

Los datos de las cartas vienen de la API pública de [YGOPRODeck](https://ygoprodeck.com/api-guide/).

## Qué hace

- **Carpetas** con portada propia, ordenables a mano o por nombre y valor.
- **Ficha por ejemplar**: set e impresión concreta, rareza, 1.ª edición o limitada, idioma,
  estado (de Mint a Poor), precio pagado, etiquetas y notas.
- **Cuatro vistas**: cuadrícula, lista, álbum (a modo de carpeta de fundas, con páginas que
  pasan) y display, que enseña solo las imágenes.
- **Brillos por rareza**: cada rareza brilla donde brilla en la carta real (ver abajo).
- **Cartas buscadas**: márcalas como *wanted* para llevar la lista de lo que te falta.
- **Filtros** por tipo de carta, tipo de monstruo, propiedad de mágica o trampa, set y rareza.
- **Temas**: acento y fondo a elegir, con claro y oscuro automáticos, y colores propios guardados.
- **Copias de seguridad**: exporta e importa toda la colección en un JSON.

## Los brillos de rareza

Lo que distingue una rareza de otra no es "cuánto brilla", sino **qué parte de la carta lleva
foil y con qué trama**: la Rare solo el nombre, la Super Rare solo la ilustración, la Secret
Rare ambas con líneas diagonales, la Parallel toda la superficie. Las coordenadas de cada zona
están medidas sobre las imágenes reales de YGOPRODeck y son iguales en monstruo, mágica y trampa.

Cada rareza se declara con cuatro variables CSS (textura, tamaño, modo de mezcla y opacidad);
de pintarlas se encargan dos reglas genéricas. Añadir una rareza nueva es escribir esas
variables, no copiar un bloque entero.

Para ajustarlos hay un banco de pruebas con todas las rarezas a la vez sobre la misma carta:

```bash
npm run dev
```

y abrir **http://localhost:3000/foil-demo.html**. Permite cambiar de carta, cambiar el tamaño y
dibujar las zonas medidas encima. Usa el componente de verdad, así que lo que se ve ahí es
exactamente lo que se ve en la colección. Vite solo empaqueta `index.html`, de modo que esta
página no llega a producción.

> Al tocar `CardFoilOverlay.css`, ojo con una trampa: **ni `z-index` ni `opacity` en los
> contenedores**. Cualquiera de los dos crea un contexto de apilamiento que aísla la mezcla, los
> `mix-blend-mode` dejan de ver la imagen de la carta y el efecto degenera en un velo de color
> que apaga la ilustración. Está explicado al principio del archivo.

## Puesta en marcha

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

La aplicación queda en `http://localhost:3000`. No hace falta ninguna clave de API.

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Comprueba los tipos y genera `dist/`. |
| `npm run preview` | Sirve `dist/` para probar la versión de producción. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript sin generar nada. |

## Dónde se guarda la colección

**En el navegador, en `localStorage`.** Conviene tenerlo presente:

- La colección vive solo en el equipo y el navegador donde la creaste. No se sincroniza.
- Si borras los datos de navegación, se va con ellos. Exporta una copia de vez en cuando.
- El límite ronda los 5 MB. Con muchas cartas y portadas personalizadas se puede llegar; si
  ocurre, la aplicación avisa en vez de fallar en silencio.

Migrar esto a una base de datos con cuentas de usuario es el siguiente paso natural del
proyecto, y es lo único que habría que rehacer: los componentes no dependen de dónde salen
los datos.

## Stack

Vite 6 · React 19 · TypeScript en modo `strict` · Tailwind CSS 4 · framer-motion · lucide-react.

## Estructura

```
App.tsx              Pantalla principal: filtrado, orden y selección múltiple
index.css            Tema (variables CSS) y estilos base
types.ts             Tipos compartidos
utils.ts             Rarezas, estados, colores del tema, exportación
context/             Estado global (useReducer) y guardado en localStorage
services/            Cliente de la API de YGOPRODeck, con caché y freno de peticiones
components/          Vistas de carta y carpeta, cabecera, filtros, brillos
foil-demo.html       Banco de pruebas de los brillos (solo desarrollo)
components/Modals/   Añadir carta, editar carta, carpeta y tema
```

## Cosas a tener en cuenta

- **Los nombres de carta van en inglés.** La API de YGOPRODeck no ofrece español (solo inglés,
  francés, alemán, italiano y portugués).
- **Las imágenes se enlazan desde el servidor de YGOPRODeck.** Sus condiciones piden alojarlas
  por cuenta propia y avisan de que pueden bloquear por IP. Para uso personal en local no da
  problemas, pero **antes de publicar esto en internet hay que cachear las imágenes**.
- La API corta el acceso durante una hora si se superan 20 peticiones por segundo. El cliente
  de `services/cardService.ts` cachea y espacia las llamadas para no acercarse.

## Créditos

Datos e imágenes de cartas: [YGOPRODeck](https://ygoprodeck.com/). Yu-Gi-Oh! es una marca de
Konami. Este es un proyecto personal sin relación con Konami.
