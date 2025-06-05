import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
  // Ensure a simple, reliable base path
  base: '/',
});


// IMPORTANT!!! Don't use reCAPTCHA, it's terrible
// import fs from 'fs'
// import path from 'path'

// const keyPath = path.resolve(__dirname, './certs/key.pem')
// const certPath = path.resolve(__dirname, './certs/cert.pem')

// // 证书存在时启用 HTTPS
// const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath)
// const httpsOptions = useHttps
//   ? {
//       key: fs.readFileSync(keyPath),
//       cert: fs.readFileSync(certPath),
//     }
//   : false

// export default defineConfig({
//   plugins: [vue()],
//   server: {
//     host: true,               // 接收 localhost 和 dev.rentspot.com
//     port: 5173,
//     https: httpsOptions,      // 如果证书存在则启用 HTTPS
//     hmr: {
//       protocol: useHttps ? 'wss' : 'ws',
//       host: 'localhost',      // 一律用 localhost，组员不会出错
//       port: 5173,
//     },
//   },
// })