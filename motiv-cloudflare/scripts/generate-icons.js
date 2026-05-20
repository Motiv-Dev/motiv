// Run: node scripts/generate-icons.js
// Generates PWA icons as simple orange "M" on dark background
const fs = require("fs");
const path = require("path");

function createSVG(size) {
  const fontSize = Math.round(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#1c1917"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-weight="900" font-size="${fontSize}" fill="#f97316">M</text>
</svg>`;
}

const iconsDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

[192, 512].forEach((size) => {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), createSVG(size));
  console.log(`Created icon-${size}.svg`);
});

// Also create a simple favicon
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1c1917"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-weight="900" font-size="18" fill="#f97316">M</text>
</svg>`;
fs.writeFileSync(path.join(__dirname, "..", "public", "favicon.svg"), favicon);
console.log("Created favicon.svg");
