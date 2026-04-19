const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const envPath = path.join(__dirname, '../.env');
const swPath = path.join(__dirname, '../public/sw.js');

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = pkg.version;

console.log(`Syncing version: ${version}`);

// 1. Update .env
fs.writeFileSync(envPath, `VITE_APP_VERSION=${version}\n`);

// 2. Update sw.js CACHE_NAME and cache buster
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace CACHE_NAME version: cocktail-cache-vx.x.x
swContent = swContent.replace(/const CACHE_NAME = 'cocktail-cache-v[^']*';/, `const CACHE_NAME = 'cocktail-cache-v${version}';`);

// Replace all.json to ensure it always uses the cache buster string
swContent = swContent.replace(/'\.\/all\.json(.*?)'/, `\'./all.json?v=${version}\'`);

fs.writeFileSync(swPath, swContent);

console.log('Version sync complete.');
