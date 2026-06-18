const fs = require('fs');
const path = require('path');

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.js')) files.push(full);
  }
}
walk(path.join(__dirname, '..', 'src'));
walk(path.join(__dirname, '..', 'scripts'));
for (const file of files) {
  require('child_process').execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
console.log(`Syntax check passed for ${files.length} JavaScript files.`);
