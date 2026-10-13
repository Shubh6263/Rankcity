const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf, offset = 0, length = buf.length) {
  let c = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data ? data.length : 0;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  if (data) data.copy(chunk, 8);
  const crcData = Buffer.concat([typeBuf, data || Buffer.alloc(0)]);
  const crc = crc32(crcData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const scanlineWidth = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineWidth);
  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineWidth;
    rawData[rawOffset] = 0;
    const rowStart = y * width * 4;
    rgbaBuffer.copy(rawData, rawOffset + 1, rowStart, rowStart + width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Math helpers for rendering
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Distance to rounded rectangle
function sdRoundRect(px, py, rx, ry, rw, rh, rad) {
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  const dx = Math.abs(px - cx) - (rw / 2 - rad);
  const dy = Math.abs(py - cy) - (rh / 2 - rad);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  const outside = Math.hypot(ox, oy);
  const inside = Math.min(Math.max(dx, dy), 0);
  return outside + inside - rad;
}

// Distance to 5-pointed star
function pointInStar(px, py, cx, cy, rOuter, rInner) {
  const angle = Math.atan2(py - cy, px - cx);
  const dist = Math.hypot(px - cx, py - cy);
  // Rotated so top point is straight up (-PI/2)
  const normAngle = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const sector = (Math.PI * 2) / 5;
  const rel = (normAngle % sector) / sector;
  // interpolate radius between outer point and inner notch
  const t = Math.abs(rel - 0.5) * 2;
  const expectedR = rInner + (rOuter - rInner) * t;
  return dist - expectedR;
}

function renderRankCityIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const scale = size / 512;

  // Maskable icons need 15% safe padding
  const paddingRatio = isMaskable ? 0.76 : 0.88;
  const contentScale = scale * paddingRatio;
  const offsetX = (size - 512 * contentScale) / 2;
  const offsetY = (size - 512 * contentScale) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Background gradient: Rich Blue (#2563EB -> #1D4ED8 -> #1E40AF)
      const gradT = clamp((x * 0.7 + y * 0.9) / (size * 1.6), 0, 1);
      let bgR = Math.round(37 * (1 - gradT) + 30 * gradT);
      let bgG = Math.round(99 * (1 - gradT) + 64 * gradT);
      let bgB = Math.round(235 * (1 - gradT) + 175 * gradT);
      let bgA = 255;

      // In non-maskable icons, we apply a smooth rounded container (squircle)
      if (!isMaskable) {
        const bgDist = sdRoundRect(x, y, size * 0.04, size * 0.04, size * 0.92, size * 0.92, size * 0.22);
        if (bgDist > 0) {
          // Antialias edge
          const edgeAlpha = clamp(1 - bgDist, 0, 1);
          bgA = Math.round(edgeAlpha * 255);
        }
      }

      if (bgA === 0) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Normalized coordinates inside the icon canvas
      const nx = (x - offsetX) / contentScale;
      const ny = (y - offsetY) / contentScale;

      let fgR = 255;
      let fgG = 255;
      let fgB = 255;
      let fgA = 0;

      // 1. Stylized City Skyline Bars at the bottom
      // Bar 1 (Left): 130..170, y from 350 to 395
      // Bar 2 (Mid): 180..220, y from 315 to 395
      // Bar 3 (Right): 230..270, y from 335 to 395
      const bars = [
        { x1: 135, y1: 345, w: 32, h: 55, rad: 6 },
        { x1: 177, y1: 305, w: 34, h: 95, rad: 6 },
        { x1: 221, y1: 330, w: 32, h: 70, rad: 6 },
      ];
      for (const bar of bars) {
        const dBar = sdRoundRect(nx, ny, bar.x1, bar.y1, bar.w, bar.h, bar.rad);
        if (dBar < 1) {
          const a = clamp(1 - dBar, 0, 1);
          fgA = Math.max(fgA, a * 0.92);
          // Subtle sky blue tint for skyline bars
          fgR = 219;
          fgG = 234;
          fgB = 254; // #DBEAFE
        }
      }

      // 2. Bold Letter "R" Monogram
      // Left vertical stem: x: 135..190, y: 110..395 (top half solid, bottom connects with bar motif)
      const dStem = sdRoundRect(nx, ny, 135, 110, 52, 285, 12);
      if (dStem < 1) {
        const a = clamp(1 - dStem, 0, 1);
        fgA = Math.max(fgA, a);
        fgR = 255;
        fgG = 255;
        fgB = 255;
      }

      // R upper outer loop: centered at (210, 185) with outer radius 85, inner cutout 38
      // loop extends to right x from 185 to 310, y: 110 to 260
      const dLoopOuter = sdRoundRect(nx, ny, 175, 110, 150, 145, 72);
      const dLoopInner = sdRoundRect(nx, ny, 187, 155, 85, 55, 27);
      if (dLoopOuter < 1 && dLoopInner > -1) {
        const aOuter = clamp(1 - dLoopOuter, 0, 1);
        const aInner = clamp(dLoopInner + 1, 0, 1);
        const aLoop = Math.min(aOuter, aInner);
        if (aLoop > fgA) {
          fgA = aLoop;
          fgR = 255;
          fgG = 255;
          fgB = 255;
        }
      }

      // R diagonal kick/leg: from (220, 240) to (330, 395), thickness ~ 48
      const dLeg = distToSegment(nx, ny, 215, 245, 320, 390) - 26;
      if (dLeg < 1) {
        const aLeg = clamp(1 - dLeg, 0, 1);
        if (aLeg > fgA) {
          fgA = aLeg;
          fgR = 255;
          fgG = 255;
          fgB = 255;
        }
      }

      // 3. Golden Ranking Star Emblem at Top-Right
      // Center at (345, 130), rOuter = 46, rInner = 20
      const dStar = pointInStar(nx, ny, 345, 130, 48, 21);
      if (dStar < 1) {
        const aStar = clamp(1 - dStar, 0, 1);
        // Star gradient from amber-300 (#FDE047) to amber-500 (#F59E0B)
        const starGrad = clamp((nx - 300) / 90, 0, 1);
        const sR = Math.round(254 * (1 - starGrad) + 245 * starGrad);
        const sG = Math.round(224 * (1 - starGrad) + 158 * starGrad);
        const sB = Math.round(71 * (1 - starGrad) + 11 * starGrad);
        // Star takes precedence
        fgA = Math.max(fgA, aStar);
        fgR = Math.round(fgR * (1 - aStar) + sR * aStar);
        fgG = Math.round(fgG * (1 - aStar) + sG * aStar);
        fgB = Math.round(fgB * (1 - aStar) + sB * aStar);
      }

      // 4. Subtle Ranking Crown / Ribbon Accent Sparkle at (375, 82)
      const dSparkle = pointInStar(nx, ny, 385, 78, 16, 7);
      if (dSparkle < 1) {
        const aSparkle = clamp(1 - dSparkle, 0, 1);
        fgA = Math.max(fgA, aSparkle);
        fgR = Math.round(fgR * (1 - aSparkle) + 254 * aSparkle);
        fgG = Math.round(fgG * (1 - aSparkle) + 240 * aSparkle);
        fgB = Math.round(fgB * (1 - aSparkle) + 138 * aSparkle);
      }

      // Blend foreground over background
      const finalR = Math.round(bgR * (1 - fgA) + fgR * fgA);
      const finalG = Math.round(bgG * (1 - fgA) + fgG * fgA);
      const finalB = Math.round(bgB * (1 - fgA) + fgB * fgA);

      buf[idx] = finalR;
      buf[idx + 1] = finalG;
      buf[idx + 2] = finalB;
      buf[idx + 3] = bgA;
    }
  }

  return encodePNG(size, size, buf);
}

// Generate SVG vector icon
function generateSVG(isMaskable = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="rc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="50%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#1E40AF" />
    </linearGradient>
    <linearGradient id="rc-star" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <filter id="rc-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.25" />
    </filter>
  </defs>
  ${
    isMaskable
      ? `<rect width="512" height="512" fill="url(#rc-bg)" />`
      : `<rect width="472" height="472" x="20" y="20" rx="110" fill="url(#rc-bg)" filter="url(#rc-glow)" />`
  }
  <!-- City Skyline Ranking Bars -->
  <g fill="#DBEAFE" opacity="0.95">
    <rect x="135" y="345" width="32" height="55" rx="6" />
    <rect x="177" y="305" width="34" height="95" rx="6" />
    <rect x="221" y="330" width="32" height="70" rx="6" />
  </g>
  <!-- Letter R Stem -->
  <rect x="135" y="110" width="52" height="285" rx="12" fill="#FFFFFF" />
  <!-- Letter R Loop -->
  <path d="M 187 110 L 260 110 C 304 110 335 142 335 182 C 335 222 304 255 260 255 L 187 255 Z" fill="#FFFFFF" />
  <path d="M 187 155 L 255 155 C 275 155 288 166 288 182 C 288 198 275 210 255 210 L 187 210 Z" fill="url(#rc-bg)" />
  <!-- Letter R Leg -->
  <path d="M 215 235 L 280 235 L 340 395 L 285 395 Z" fill="#FFFFFF" />
  <!-- Golden Ranking Star -->
  <polygon points="345,90 357,118 387,121 364,141 371,170 345,154 319,170 326,141 303,121 333,118" fill="url(#rc-star)" filter="url(#rc-glow)" />
  <!-- Sparkle Accent -->
  <polygon points="385,68 389,76 397,78 391,84 393,92 385,87 377,92 379,84 373,78 381,76" fill="#FEF08A" />
</svg>`;
}

// Generate all icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA Icons for RankCity...');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
for (const s of sizes) {
  const png = renderRankCityIcon(s, false);
  fs.writeFileSync(path.join(iconsDir, `icon-${s}x${s}.png`), png);
  console.log(`✓ Generated icon-${s}x${s}.png (${png.length} bytes)`);
}

// Maskable icons
for (const s of [192, 512]) {
  const png = renderRankCityIcon(s, true);
  fs.writeFileSync(path.join(iconsDir, `icon-maskable-${s}x${s}.png`), png);
  console.log(`✓ Generated icon-maskable-${s}x${s}.png (${png.length} bytes)`);
}

// Apple touch icon in root /public and icons/
const appleIcon = renderRankCityIcon(180, false);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), appleIcon);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);
console.log('✓ Generated apple-touch-icon.png');

// Favicons
const favIcon = renderRankCityIcon(48, false);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.png'), favIcon);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), favIcon);
console.log('✓ Generated favicon.png & favicon.ico');

// SVG files
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), generateSVG(false));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), generateSVG(true));
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), generateSVG(false));
console.log('✓ Generated SVGs');

console.log('All PWA icons generated successfully!');
