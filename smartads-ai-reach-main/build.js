#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Use the explicit path to vite binary
  const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');
  console.log('Building with Vite...');
  execSync(`"${vitePath}" build`, { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
