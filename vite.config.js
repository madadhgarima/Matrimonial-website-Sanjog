import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Automatically detect all existing HTML files in the project root
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html') && !file.includes('temp') && !file.includes('backup'));
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace('.html', '');
  input[name] = resolve(__dirname, file);
});

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
