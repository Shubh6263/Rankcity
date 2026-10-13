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

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
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
    rawData[rawOffset] = 0; // Filter type 0 (None)
    const rowStart = y * width * 4;
    rgbaBuffer.copy(rawData, rawOffset + 1, rowStart, rowStart + width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(buf) {
  let pos = 8;
  let width = 0, height = 0;
  const idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const raw = Buffer.alloc(width * height * 4);
  let srcPos = 0;

  for (let y = 0; y < height; y++) {
    const filter = inflated[srcPos++];
    const rowOffset = y * stride;
    const prevRowOffset = (y - 1) * stride;

    for (let x = 0; x < stride; x++) {
      const cur = inflated[srcPos++];
      const a = x >= bpp ? raw[rowOffset + x - bpp] : 0;
      const b = y > 0 ? raw[prevRowOffset + x] : 0;
      const c = (y > 0 && x >= bpp) ? raw[prevRowOffset + x - bpp] : 0;

      let val = cur;
      if (filter === 1) val = (cur + a) & 0xff;
      else if (filter === 2) val = (cur + b) & 0xff;
      else if (filter === 3) val = (cur + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) val = (cur + paeth(a, b, c)) & 0xff;

      raw[rowOffset + x] = val;
    }
  }

  return { width, height, raw };
}

// Resample image using Bilinear Interpolation
function resample(src, targetSize, options = {}) {
  const {
    isMaskable = false,
    opaque = false,
    bgColor = [255, 255, 255, 255],
    padding = isMaskable ? 0.78 : (opaque ? 0.88 : 0.96),
  } = options;

  const targetBuf = Buffer.alloc(targetSize * targetSize * 4);
  const targetW = targetSize * padding;
  const targetH = targetSize * padding;
  const offsetX = (targetSize - targetW) / 2;
  const offsetY = (targetSize - targetH) / 2;

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const idx = (y * targetSize + x) * 4;

      // Default background
      if (opaque || isMaskable) {
        targetBuf[idx] = bgColor[0];
        targetBuf[idx + 1] = bgColor[1];
        targetBuf[idx + 2] = bgColor[2];
        targetBuf[idx + 3] = bgColor[3];
      } else {
        targetBuf[idx] = 0;
        targetBuf[idx + 1] = 0;
        targetBuf[idx + 2] = 0;
        targetBuf[idx + 3] = 0;
      }

      // Map to source coordinates
      const sx = ((x - offsetX) / targetW) * src.width;
      const sy = ((y - offsetY) / targetH) * src.height;

      if (sx >= 0 && sx < src.width && sy >= 0 && sy < src.height) {
        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const x1 = Math.min(src.width - 1, x0 + 1);
        const y1 = Math.min(src.height - 1, y0 + 1);

        const fx = sx - x0;
        const fy = sy - y0;

        const idx00 = (y0 * src.width + x0) * 4;
        const idx10 = (y0 * src.width + x1) * 4;
        const idx01 = (y1 * src.width + x0) * 4;
        const idx11 = (y1 * src.width + x1) * 4;

        // Bilinear blend for each channel
        for (let c = 0; c < 4; c++) {
          const top = src.raw[idx00 + c] * (1 - fx) + src.raw[idx10 + c] * fx;
          const btm = src.raw[idx01 + c] * (1 - fx) + src.raw[idx11 + c] * fx;
          const val = top * (1 - fy) + btm * fy;

          if (c < 3 && (opaque || isMaskable)) {
            // Blend foreground over opaque background using alpha
            const alpha = (src.raw[idx00 + 3] * (1 - fx) + src.raw[idx10 + 3] * fx) * (1 - fy) +
                          (src.raw[idx01 + 3] * (1 - fx) + src.raw[idx11 + 3] * fx) * fy;
            const aNorm = alpha / 255;
            targetBuf[idx + c] = Math.round(targetBuf[idx + c] * (1 - aNorm) + val * aNorm);
          } else if (c === 3 && (opaque || isMaskable)) {
            targetBuf[idx + 3] = 255; // Keep opaque
          } else {
            targetBuf[idx + c] = Math.round(val);
          }
        }
      }
    }
  }

  return encodePNG(targetSize, targetSize, targetBuf);
}

// Main execution
const sourceFile = path.join(__dirname, '..', 'rclogo.png');
if (!fs.existsSync(sourceFile)) {
  console.error('Source logo file not found:', sourceFile);
  process.exit(1);
}

console.log('Loading source logo:', sourceFile);
const srcPng = decodePNG(fs.readFileSync(sourceFile));
console.log(`Source decoded: ${srcPng.width}x${srcPng.height} RGBA`);

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy source logo to public folder as well
fs.copyFileSync(sourceFile, path.join(__dirname, '..', 'public', 'rclogo.png'));
console.log('✓ Copied to public/rclogo.png');

// 1. Generate standard launcher icons (purpose: any)
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
for (const s of sizes) {
  const png = resample(srcPng, s, { isMaskable: false, opaque: false });
  fs.writeFileSync(path.join(iconsDir, `icon-${s}x${s}.png`), png);
  console.log(`✓ Generated icon-${s}x${s}.png (${png.length} bytes)`);
}

// 2. Generate maskable icons (purpose: maskable) with 20% safe zone & clean white background
for (const s of [192, 512]) {
  const png = resample(srcPng, s, { isMaskable: true, opaque: true, bgColor: [255, 255, 255, 255] });
  fs.writeFileSync(path.join(iconsDir, `icon-maskable-${s}x${s}.png`), png);
  console.log(`✓ Generated icon-maskable-${s}x${s}.png (${png.length} bytes)`);
}

// 3. Apple Touch Icon (iOS requires opaque background, otherwise transparency turns black)
const appleIcon = resample(srcPng, 180, { isMaskable: false, opaque: true, bgColor: [255, 255, 255, 255] });
fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), appleIcon);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);
console.log('✓ Generated apple-touch-icon.png');

// 4. Favicons
const favIcon = resample(srcPng, 48, { isMaskable: false, opaque: false });
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.png'), favIcon);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), favIcon);
console.log('✓ Generated favicon.png & favicon.ico');

console.log('🎉 All PWA launcher icons successfully generated from rclogo.png!');
