import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

const keyPath = path.resolve(__dirname, './certs/key.pem');
const certPath = path.resolve(__dirname, './certs/cert.pem');

const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);
const httpsOptions = useHttps
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  : false;

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    https: httpsOptions, // 自动使用 HTTPS，否则降级为 HTTP
    hmr: {
      protocol: useHttps ? 'wss' : 'ws',
      host: 'dev.rentspot.com',
      port: 5173,
    },
  }
});