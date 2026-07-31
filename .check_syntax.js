const fs = require('fs');
const files = [
  'js/config.js',
  'js/Map.js',
  'js/Player.js',
  'js/main.js'
];
let ok = true;
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    const stripped = code.replace(/(^|\n)\s*import\s+[\s\S]*?from\s+['\"][\s\S]*?['\"];?/g, '')
                         .replace(/(^|\n)\s*export\s+(default\s+)?/g, '\n');
    new Function(stripped);
    console.log('OK', f);
  } catch (e) {
    ok = false;
    console.error('SYNTAX ERROR in', f + ':', e.message);
  }
}
process.exit(ok ? 0 : 1);
