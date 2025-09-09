// Vite config to externalize @renderx-plugins/host-sdk for Rollup
export default {
  build: {
    rollupOptions: {
      external: ['@renderx-plugins/host-sdk']
    }
  }
};
