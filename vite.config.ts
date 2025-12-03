import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Mặc định dùng HTTPS; đặt VITE_USE_HTTPS=false nếu muốn tắt.
const useHttps = process.env.VITE_USE_HTTPS !== 'false';
const httpsConfig = useHttps
  ? {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
    }
  : undefined;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsConfig,
    port: 5174,
    open: true,
    hmr: {
      protocol: useHttps ? 'wss' : 'ws',
      host: 'localhost',
      port: 5174,
    },
  },
});
