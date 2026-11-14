import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { localApiProxy } from './scripts/local-proxy.mjs';
import { resolve } from 'node:path';
export default defineConfig(({mode}) => {
 const env=loadEnv(mode,process.cwd(),'');
 return {
  root: resolve('local'), publicDir: resolve('public'),
  define: { 'import.meta.env.VITE_DECIDEFAST_LOCAL': JSON.stringify('true') },
  resolve:{alias:{'@':resolve('src')}},
  plugins:[
   tanstackRouter({target:'react',routesDirectory:resolve('src/routes'),generatedRouteTree:resolve('src/routeTree.gen.ts'),autoCodeSplitting:false}),
   react(),tailwind(),
   {name:'decidefast-local-proxy',configureServer(server){server.middlewares.use(localApiProxy(env.N8N_BASE_URL||process.env.N8N_BASE_URL));}},
   VitePWA({registerType:'autoUpdate',injectRegister:null,devOptions:{enabled:false},filename:'sw.js',manifest:{name:'DecideFast',short_name:'DecideFast',description:'Offline Decision Intelligence Agent',display:'standalone',start_url:'/',theme_color:'#10151e',background_color:'#10151e',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,png,ico,ttf,webmanifest}'],navigateFallback:'/index.html',navigateFallbackDenylist:[/^\/api\//,/^\/~oauth/],runtimeCaching:[{urlPattern:({request,url})=>request.mode==='navigate'&&!url.pathname.startsWith('/api/')&&!url.pathname.startsWith('/~oauth'),handler:'NetworkFirst',options:{cacheName:'decidefast-navigation',networkTimeoutSeconds:5}},{urlPattern:({url,sameOrigin})=>sameOrigin&&/\/assets\/.+-[\w-]+\.(js|css|ttf)$/.test(url.pathname),handler:'CacheFirst',options:{cacheName:'decidefast-assets',expiration:{maxEntries:100}}}]}}),
  ],
  server:{host:'127.0.0.1',port:3000,fs:{allow:[process.cwd()]}},
  build:{outDir:resolve('dist-local'),emptyOutDir:true},
 };
});
