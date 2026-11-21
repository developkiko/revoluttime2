// Генератор OG-картинки 1200×630 (Фаза G): диагональный градиент бренда
// (#070E21 → #1084FA) + атом H₂ (орбиты/ядро/электроны) без текстовых
// зависимостей — чистый PNG-райтер на node:zlib. Запуск: node scripts/generate-og-image.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1200;
const H = 630;

// sRGB-lerp между двумя цветами бренда по диагонали.
function lerp(a, b, t) {
  return a + (b - a) * t;
}
const from = [0x07, 0x0e, 0x21];
const to = [0x10, 0x84, 0xfa];

// Растеризация в RGBA-буфер.
const px = new Uint8Array(W * H * 4);
function blend(x, y, r, g, b, alpha) {
  if (x < 0 || y < 0 || x >= W || y >= H || alpha <= 0) return;
  const i = (y * W + x) * 4;
  const a = Math.min(1, alpha);
  px[i] = Math.round(lerp(px[i], r, a));
  px[i + 1] = Math.round(lerp(px[i + 1], g, a));
  px[i + 2] = Math.round(lerp(px[i + 2], b, a));
  px[i + 3] = 255;
}

// 1. Фон-градиент по диагонали.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = (x / W) * 0.55 + (y / H) * 0.45;
    const i = (y * W + x) * 4;
    px[i] = Math.round(lerp(from[0], to[0], t));
    px[i + 1] = Math.round(lerp(from[1], to[1], t));
    px[i + 2] = Math.round(lerp(from[2], to[2], t));
    px[i + 3] = 255;
  }
}

// 2. Атом H₂: три наклонных орбиты + ядро + 3 электрона (как AtomLoader).
const cx = W / 2;
const cy = H / 2;
const RX = 170;
const RY = 62;
const white = [255, 255, 255];

// Эллипс-контуры с толщиной линии (bresenham-подобный обход по углу).
function ring(rotationDeg, opacity, thickness = 3) {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const steps = 3000;
  for (let s = 0; s < steps; s++) {
    const th = (s / steps) * Math.PI * 2;
    const ex = RX * Math.cos(th);
    const ey = RY * Math.sin(th);
    const x = Math.round(cx + ex * cos - ey * sin);
    const y = Math.round(cy + ex * sin + ey * cos);
    for (let dx = 0; dx < thickness; dx++) {
      for (let dy = 0; dy < thickness; dy++) {
        blend(x + dx, y + dy, ...white, opacity);
      }
    }
  }
}
ring(60, 0.5);
ring(-60, 0.5);
ring(0, 0.32, 2);

// Ядро: мягкий диск с полупрозрачным свечением.
function disk(centerX, centerY, radius, r, g, b, alpha) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const d = Math.hypot(x, y);
      if (d <= radius) {
        blend(Math.round(centerX + x), Math.round(centerY + y), r, g, b, alpha);
      }
    }
  }
}
disk(cx, cy, 64, 16, 132, 250, 0.16); // свечение
disk(cx, cy, 40, 255, 255, 255, 0.14);
disk(cx, cy, 26, 255, 255, 255, 0.9);

// Электроны: яркие точки на орбитах.
function electron(angleOnOrbitDeg, orbitDeg) {
  const th = (angleOnOrbitDeg * Math.PI) / 180;
  const rad = (orbitDeg * Math.PI) / 180;
  const ex = RX * Math.cos(th);
  const ey = RY * Math.sin(th);
  const x = Math.round(cx + ex * Math.cos(rad) - ey * Math.sin(rad));
  const y = Math.round(cy + ex * Math.sin(rad) + ey * Math.cos(rad));
  disk(x, y, 9, 255, 255, 255, 0.95);
}
electron(20, 60);
electron(200, 60);
electron(120, -60);

// 3. PNG-сборка (no filter, CRC32 руками).
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (const byte of buf) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  return (crc ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
// Строки с фильтр-байтом 0.
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0;
  Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (1 + W * 4) + 1);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync("public/imgs/brand/og.png", png);
console.log("og.png:", W + "x" + H, (png.length / 1024).toFixed(0) + "KB");
