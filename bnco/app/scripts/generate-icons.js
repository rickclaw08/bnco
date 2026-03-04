/**
 * BNCO Icon Generator
 *
 * Generates PNG icons for PWA and App Store.
 * Uses sharp (preferred) or canvas to render SVG to PNG.
 * Falls back to an HTML file for browser-based generation.
 *
 * Design: Sage green (#7C9082) circle with white "B" lettermark.
 *
 * Usage: node scripts/generate-icons.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'icons');

const SIZES = [
  { name: 'icon-60.png', size: 60 },
  { name: 'icon-120.png', size: 120 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'icon-1024.png', size: 1024 },
];

const SAGE_GREEN = '#7C9082';
const BG_COLOR = '#F5F0EB';

function generateSVG(size, maskable = false) {
  const padding = maskable ? size * 0.1 : 0;
  const circleR = (size / 2) - padding;
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(circleR * 1.1);
  const bgRect = maskable
    ? `<rect width="${size}" height="${size}" fill="${BG_COLOR}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgRect}
  <circle cx="${cx}" cy="${cy}" r="${circleR}" fill="${SAGE_GREEN}"/>
  <text x="${cx}" y="${cy}" dy="0.35em" text-anchor="middle"
        font-family="'Helvetica Neue',Arial,sans-serif"
        font-weight="700" font-size="${fontSize}" fill="white">B</text>
</svg>`;
}

async function main() {
  console.log('BNCO Icon Generator');
  console.log('===================');
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let sharp;
  try {
    sharp = (await import('sharp')).default;
    console.log('Using sharp for PNG generation.\n');
  } catch {
    console.log('sharp not available, generating SVG fallbacks.\n');
    for (const { name, size, maskable } of SIZES) {
      const svgName = name.replace('.png', '.svg');
      writeFileSync(join(OUTPUT_DIR, svgName), generateSVG(size, maskable));
      console.log(`  Created ${svgName} (${size}x${size})`);
    }
    console.log('\nInstall sharp for PNG output: npm install sharp');
    return;
  }

  for (const { name, size, maskable } of SIZES) {
    const svg = Buffer.from(generateSVG(size, maskable));
    const png = await sharp(svg).resize(size, size).png().toBuffer();
    writeFileSync(join(OUTPUT_DIR, name), png);
    console.log(`  Created ${name} (${size}x${size})`);
  }

  // Apple touch icon (180x180)
  const touchSvg = Buffer.from(generateSVG(180, false));
  const touchPng = await sharp(touchSvg).resize(180, 180).png().toBuffer();
  writeFileSync(join(OUTPUT_DIR, 'apple-touch-icon.png'), touchPng);
  console.log('  Created apple-touch-icon.png (180x180)');

  console.log('\nDone! All PNG icons generated.');
}

main();
