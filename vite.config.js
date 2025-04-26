import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// eslint-disable-next-line import/no-default-export
export default defineConfig(({ command, mode }) => {
  // When we run `npm run deploy` we invoke `vite build --mode debug`
  // (see package.json).  In that "debug" mode we want **no minification**
  // and we want source-maps so that the deployed bundle remains readable.
  const debugBuild = mode === 'debug';

  // Use '/' base for the dev server so paths resolve correctly, and
  // '/skygit/' for production builds (GitHub Pages deployment).
  const isDevServer = command === 'serve';

  return {
    base: isDevServer ? '/' : '/skygit/',
    plugins: [
      svelte(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'SkyGit',
          short_name: 'SkyGit',
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          icons: [
            {
              src: '/skygit/images/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/skygit/images/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    build: {
      minify: debugBuild ? false : 'esbuild',
      sourcemap: debugBuild,
    },
  };
});
