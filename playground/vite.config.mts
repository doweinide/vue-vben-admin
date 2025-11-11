import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => {
              // eslint-disable-next-line no-console
              console.log('target', path.replace(/^\/api/, ''));
              return path.replace(/^\/api/, '');
            },
            // mock代理目标地址
            target: 'http://localhost:3333',
            ws: true,
          },
        },
      },
    },
  };
});
