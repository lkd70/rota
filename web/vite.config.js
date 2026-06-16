import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildPreferenceBootSnippet } from './src/lib/prefs/preferences.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'preference-boot',
      transformIndexHtml(html) {
        return html.replace(
          '<head>',
          `<head>\n    <script>${buildPreferenceBootSnippet()}</script>`,
        );
      },
    },
  ],
  base: './',
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
    },
  },
  test: {
    include: ['src/**/*.test.js'],
  },
});
