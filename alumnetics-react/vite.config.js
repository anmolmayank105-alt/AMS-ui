import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Production Optimizations
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2015',
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info'] // Remove specific console methods
      }
    },
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk for React and React Router
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separate chunk for pages
          'pages': [
            './src/pages/AlumniDashboard.jsx',
            './src/pages/StudentDashboard.jsx',
            './src/pages/AdminDashboard.jsx'
          ]
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // Source maps for production debugging (disable if not needed)
    sourcemap: false,
    
    // Output directory
    outDir: 'dist',
    
    // Asset inlining threshold (smaller assets will be inlined as base64)
    assetsInlineLimit: 4096 // 4kb
  },
  
  // Development server config
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Listen on all addresses
    open: false // Don't auto-open browser
  },
  
  // Preview server config (for testing production build)
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [] // Add dependencies that should not be pre-bundled
  }
})
