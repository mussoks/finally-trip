import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' 로 두면 GitHub Pages 같은 하위 경로에 올려도 그대로 동작해요.
export default defineConfig({
  base: './',
  plugins: [react()],
});
