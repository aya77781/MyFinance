// Genere les icones MyFinance (tuile teal + M geometrique) en PNG.
// Usage : node scripts/generate-icons.mjs  (sharp requis : npm i sharp --no-save)
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const PUBLIC = join(ROOT, 'public');

const TEAL_A = '#43E3C4';
const TEAL_B = '#15A98B';
const DARK = '#08221C';
const NAVY = '#0F1520';

const M_PATH = 'M4 19 V6 a1 1 0 0 1 1.7-0.7 L12 11 L17.3 5.3 A1 1 0 0 1 19 6 V19';

// Tuile pleine : carre arrondi degrade teal + M sombre.
function tileSvg(size, rxRatio = 0.226) {
  const rx = Math.round(size * rxRatio);
  const scale = size / 47.6;
  const tx = size / 2 - 11.5 * scale;
  const ty = size / 2 - 12.15 * scale;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${TEAL_A}"/><stop offset="1" stop-color="${TEAL_B}"/>
  </linearGradient></defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${rx}" fill="url(#g)"/>
  <g transform="translate(${tx},${ty}) scale(${scale})" fill="none" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${M_PATH}"/>
  </g>
</svg>`;
}

// M seul (icone adaptative Android / monochrome), centre dans la zone de securite.
function glyphSvg(size, color, scaleRatio = 17) {
  const scale = (size / 1024) * scaleRatio;
  const tx = size / 2 - 11.5 * scale;
  const ty = size / 2 - 12.15 * scale;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${tx},${ty}) scale(${scale})" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${M_PATH}"/>
  </g>
</svg>`;
}

// Fond plein degrade teal (fond de l'icone adaptative).
function bgSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${TEAL_A}"/><stop offset="1" stop-color="${TEAL_B}"/>
  </linearGradient></defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
</svg>`;
}

async function png(svg, dir, file, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(dir, file));
  console.log('  ', file);
}

async function run() {
  console.log('Generation des icones natives (assets/) :');
  await png(tileSvg(1024), ASSETS, 'icon.png', 1024);
  await png(tileSvg(1024), ASSETS, 'splash-icon.png', 1024);
  await png(tileSvg(196), ASSETS, 'favicon.png', 196);
  await png(bgSvg(1024), ASSETS, 'android-icon-background.png', 1024);
  await png(glyphSvg(1024, DARK), ASSETS, 'android-icon-foreground.png', 1024);
  await png(glyphSvg(1024, '#FFFFFF'), ASSETS, 'android-icon-monochrome.png', 1024);

  // Icones web "Ajouter a l'ecran d'accueil" (PWA). Carre PLEIN (rx=0) :
  // iOS et Android appliquent eux-memes l'arrondi/le masque.
  console.log('Generation des icones web (public/) :');
  await png(tileSvg(180, 0), PUBLIC, 'apple-touch-icon.png', 180);
  await png(tileSvg(192, 0), PUBLIC, 'icon-192.png', 192);
  await png(tileSvg(512, 0), PUBLIC, 'icon-512.png', 512);
  console.log('Termine.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
