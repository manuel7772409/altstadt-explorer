// Generate raster app icons (180/192/512) from public/favicon.svg.
// Run: node scripts/generate-icons.mjs
//
// Uses `sharp`. If sharp is missing or its SVG backend is unavailable,
// install it: `npm install --save-dev sharp`.

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public', 'favicon.svg');

const TARGETS = [
  { out: 'public/apple-touch-icon.png', size: 180 },
  { out: 'public/icon-192.png',         size: 192 },
  { out: 'public/icon-512.png',         size: 512 },
];

const main = async () => {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.error('[generate-icons] `sharp` is not installed.');
    console.error('  Install it with:  npm install --save-dev sharp');
    process.exit(1);
  }
  const svg = await readFile(svgPath);
  for (const { out, size } of TARGETS) {
    const outPath = resolve(root, out);
    try {
      const buf = await sharp(svg, { density: 384 })
        .resize(size, size, { fit: 'cover' })
        .png({ compressionLevel: 9 })
        .toBuffer();
      await writeFile(outPath, buf);
      console.log(`  ✓ ${out} (${buf.length} bytes)`);
    } catch (e) {
      console.error(`  ✗ ${out} — ${e.message}`);
      process.exit(1);
    }
  }
  console.log('[generate-icons] done.');
};

main().catch((e) => { console.error(e); process.exit(1); });
