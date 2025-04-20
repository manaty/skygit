import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
  base: '/skygit/',    // important for GitHub Pages
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
          { src: '/skygit/images/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/skygit/images/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
