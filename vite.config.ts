import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // These are necessary to deploy with Nginx using a subfolder.
  // See https://gist.github.com/huangzhuolin/24f73163e3670b1cd327f2b357fd456a
  base: 'http://localhost:8080/lvmweb',
  build: {
    outDir: './dist/lvmweb',
  },
});
