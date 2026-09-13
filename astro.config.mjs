// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://maevemiller.github.io',
  base: '/maeve-site/',
  vite: {
    plugins: [tailwindcss()]
  }
});