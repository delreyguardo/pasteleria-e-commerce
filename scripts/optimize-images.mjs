/**
 * optimize-images.mjs
 * Convierte PNG/JPG a WebP optimizado y genera versión comprimida
 * Uso: node scripts/optimize-images.mjs
 */

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.join(__dirname, "../public/images");
const OUTPUT_DIR = path.join(__dirname, "../public/images");

const QUALITY = 82; // 0-100 — buen balance calidad/tamaño
const MAX_WIDTH = 1200; // máx ancho para imágenes de producto

async function optimizeImages() {
  const files = await readdir(INPUT_DIR);
  const images = files.filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

  console.log(`\n🎨 Optimizando ${images.length} imágenes...\n`);

  for (const file of images) {
    const inputPath = path.join(INPUT_DIR, file);
    const baseName = path.parse(file).name;
    const outputWebP = path.join(OUTPUT_DIR, `${baseName}.webp`);

    try {
      const meta = await sharp(inputPath).metadata();
      const originalKB = Math.round((await import("fs")).statSync(inputPath).size / 1024);

      await sharp(inputPath)
        .resize({
          width: MAX_WIDTH,
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY })
        .toFile(outputWebP);

      const newKB = Math.round((await import("fs")).statSync(outputWebP).size / 1024);
      const saving = Math.round((1 - newKB / originalKB) * 100);

      console.log(
        `  ✅ ${file.padEnd(30)} ${String(originalKB + " KB").padStart(8)} → ${String(newKB + " KB").padStart(7)} WebP  (${saving}% ahorro)`
      );
    } catch (err) {
      console.error(`  ❌ Error en ${file}:`, err.message);
    }
  }

  console.log("\n✨ Listo. Ahora actualizá las referencias en el código de .png/.jpg → .webp\n");
}

optimizeImages();
