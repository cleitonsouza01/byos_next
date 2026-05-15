#!/usr/bin/env node
/**
 * One-shot generator: emits public/setup-xiao-c6-75v1.png — a 640×384 1-bit
 * PNG "ready to pair" placeholder. Rerun if the design changes.
 *
 * Sharp-only (no project source imports) so this runs as plain Node ESM
 * without a TS loader.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 640;
const H = 384;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="white"/>
  <text x="50%" y="42%" font-family="Helvetica, Arial, sans-serif"
        font-size="40" font-weight="700" fill="black" text-anchor="middle">
    TRMNL BYOS
  </text>
  <text x="50%" y="58%" font-family="Helvetica, Arial, sans-serif"
        font-size="22" fill="black" text-anchor="middle">
    Paired. Waiting for your first refresh.
  </text>
  <text x="50%" y="75%" font-family="Helvetica, Arial, sans-serif"
        font-size="14" fill="#333" text-anchor="middle">
    640 × 384 · 1-bit
  </text>
</svg>`;

// Rasterize the SVG, threshold to pure B/W, then write as a 2-color
// (1-bit indexed) PNG. `palette: true, colors: 2` is sharp's path to a
// 1bpp PNG that `file(1)` reports as "1-bit grayscale" or "1-bit colormap".
const png = await sharp(Buffer.from(svg))
    .resize(W, H)
    .grayscale()
    .threshold(180)
    .png({ palette: true, colors: 2, effort: 10 })
    .toBuffer();

writeFileSync("public/setup-xiao-c6-75v1.png", png);
console.log(`wrote public/setup-xiao-c6-75v1.png (${png.length} bytes)`);
