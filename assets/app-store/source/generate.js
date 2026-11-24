// Rebuilds the editable SVG layouts and App Store PNGs from Simulator captures.
// Usage: node assets/app-store/source/generate.js
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../../..');
const source = path.join(root, 'assets/screenshots/raw/iphone_69_list_detail_filled.png');
const home = path.join(root, 'assets/screenshots/raw/iphone_69_home_filled.png');
const slides = [
  ['home', 'やりたいことを、', 'ひとつずつ叶えよう。', home],
  ['list_detail', 'あなたの夢を、', '自由にリスト化。', source],
  ['share', '大切な人と、', '夢を共有しよう。', home],
  ['achievement', '叶えた瞬間も、', '思い出に。', source],
  ['tags', 'やりたいことを、', 'もっと自由に。', source],
  ['premium', 'もっとたくさんの夢を', '叶えていこう。', home],
];
const targets = [
  { folder: 'iphone', name: '69', w: 1320, h: 2868 },
  { folder: 'iphone', name: '65', w: 1242, h: 2688 },
];
const xml = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

for (const target of targets) {
  for (let i = 0; i < slides.length; i++) {
    const [slug, line1, line2, imagePath] = slides[i];
    const w = target.w, h = target.h;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1320 2868">
      <defs><clipPath id="screen"><rect x="337" y="760" width="646" height="880" rx="70"/></clipPath><filter id="shadow" x="-25%" y="-10%" width="150%" height="140%"><feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#75451f" flood-opacity=".18"/></filter></defs>
      <rect width="1320" height="2868" fill="#fff9e9"/>
      <circle cx="1150" cy="90" r="380" fill="#ffefc1" opacity=".78"/><circle cx="75" cy="2420" r="360" fill="#ffe2be" opacity=".52"/>
      <text x="660" y="285" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN',sans-serif" font-size="48" font-weight="700" fill="#d97706">夢ノート</text>
      <text x="660" y="420" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN',sans-serif" font-size="70" font-weight="700" fill="#653719">${xml(line1)}</text>
      <text x="660" y="515" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN',sans-serif" font-size="70" font-weight="700" fill="#653719">${xml(line2)}</text>
      <rect x="310" y="730" width="700" height="1530" rx="108" fill="#27211c" filter="url(#shadow)"/>
      <rect x="324" y="744" width="672" height="1502" rx="88" fill="#171411"/>
      <rect x="337" y="760" width="646" height="1460" rx="70" fill="#fff9e9"/>
      <g clip-path="url(#screen)"><image href="${path.relative(path.join(root, 'assets/app-store/source'), imagePath).split(path.sep).join('/')}" x="337" y="760" width="646" height="1404" preserveAspectRatio="xMidYMin meet"/></g>
      <rect x="570" y="2215" width="180" height="12" rx="6" fill="#d8d1c9"/>
      <rect x="455" y="2375" width="410" height="54" rx="27" fill="#fff" opacity=".84"/><text x="660" y="2413" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN',sans-serif" font-size="27" fill="#84512d">書くたびに、叶える日が近づく。</text>
      <text x="660" y="2678" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN',sans-serif" font-size="32" fill="#9b6a44">夢ノート — やりたいことを全部叶えよう</text>
    </svg>`;
    const outDir = path.join(root, 'assets/app-store', target.folder);
    fs.mkdirSync(outDir, { recursive: true });
    const prefix = `iphone_${target.name}_${String(i + 1).padStart(2, '0')}_${slug}`;
    const svgPath = path.join(root, 'assets/app-store/source', `${prefix}.svg`);
    fs.writeFileSync(svgPath, svg);
    const pngPath = path.join(outDir, `${prefix}.png`);
    execFileSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--headless=new', '--no-sandbox', '--disable-gpu', `--window-size=${w},${h}`, '--hide-scrollbars',
      `--user-data-dir=/private/tmp/chrome-yumenote-${target.name}`,
      `--screenshot=${pngPath}`, `file://${svgPath}`,
    ], { stdio: 'ignore' });
  }
}
