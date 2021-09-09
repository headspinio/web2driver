const fs = require('fs');
const wdIndexPath = require.resolve('webdriver');

const ENV_MUTATE_RE = /\n(\s+)?process\.env\.[a-zA-Z0-9_]+ ?=/g;

console.log(`Webdriver package is located at: ${wdIndexPath}`);
const code = fs.readFileSync(wdIndexPath).toString();
fs.writeFileSync(wdIndexPath, code.replace(ENV_MUTATE_RE, function (str) {
  return `\n// MUTED FOR WEB TRANSFORM: ${str.trim()}`;
}));
console.log('File updated');
