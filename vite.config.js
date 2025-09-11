import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Note: React plugin would be added here if @vitejs/plugin-react was installed
  // plugins: [react()],
  
  // Optimize dependency handling for plugin loading stability
  optimizeDeps: {
    // Include stable dependencies that should be pre-bundled
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'musical-conductor'
    ],
    
    // Exclude plugin modules and dynamic imports from optimization
    // This prevents Vite from trying to optimize plugin code that needs
    // to be loaded dynamically at runtime
    exclude: [
      '/plugins/'
    ],
    
    // Force dependency re-optimization on certain changes
    force: false
  },
  
  // Server configuration for better plugin loading experience
  server: {
    // Disable HMR overlay to prevent it from blocking plugin loading
    hmr: {
      overlay: false
    },
    
    // Configure file watching to handle plugin changes better
    watch: {
      // Ignore node_modules but watch plugin directories
      ignored: ['!**/node_modules/**']
    }
  },
  
  // Build configuration
  build: {
    // Source maps for better debugging of plugin issues
    sourcemap: true
  },
  
  // Define configuration for different environments
  define: {
    // Ensure plugin loading works in both dev and production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
});
