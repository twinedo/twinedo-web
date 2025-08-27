#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple TypeScript-like transpilation for basic cases
// This is a minimal approach since we're using mostly standard JS features
const content = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');

// Basic transformations to make it Node.js compatible
let transformed = content
  .replace(/import\s+(.+?)\s+from\s+['"](.+?)['"]/g, (match, imports, module) => {
    if (module.startsWith('@/') || module.startsWith('./') || module.startsWith('../')) {
      return `const ${imports} = require('${module}');`;
    }
    return `const ${imports} = require('${module}');`;
  })
  .replace(/export\s+const\s+(\w+)/g, 'const $1')
  .replace(/export\s+\{([^}]+)\}/g, (match, exports) => {
    const exportList = exports.split(',').map(e => e.trim());
    return exportList.map(exp => `module.exports.${exp} = ${exp};`).join('\n');
  })
  .replace(/export\s+default\s+(.+);?/g, 'module.exports = $1;');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Write the transformed content
fs.writeFileSync(path.join(__dirname, 'dist', 'index.js'), transformed);

console.log('Build completed successfully!');