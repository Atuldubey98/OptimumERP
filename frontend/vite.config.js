import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: "../",
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Core Bundle: React, UI frameworks, and Translation stack
            // Combined to prevent all circular dependencies and guarantee load order
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-error-boundary/') ||
              id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next/') ||
              id.includes('node_modules/@chakra-ui/') ||
              id.includes('node_modules/@emotion/') ||
              id.includes('node_modules/framer-motion/') ||
              id.includes('node_modules/chakra-react-select/')
            ) {
              return 'vendor-core'
            }

            // 2. Forms & Validation
            if (id.includes('node_modules/formik/') || id.includes('node_modules/yup/')) {
              return 'form-vendor'
            }

            // 3. Icons are large and safe to split
            if (id.includes('node_modules/react-icons/')) {
              return 'icons-vendor'
            }

            // 4. Misc utilities
            if (
              id.includes('node_modules/axios/') ||
              id.includes('node_modules/moment/') ||
              id.includes('node_modules/@fontsource/')
            ) {
              return 'utils-vendor'
            }
          }
        },
      },
    },
  },
})
