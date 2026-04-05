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
          // Core React runtime + all libs that call React.createContext at module init
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-error-boundary/') ||
              id.includes('node_modules/react-i18next/') ||
              id.includes('node_modules/formik/') ||
              id.includes('node_modules/yup/')) {
            return 'react-vendor'
          }

          // Chakra UI + emotion (heavy, but kept together since they're tightly coupled)
          if (id.includes('node_modules/@chakra-ui/') ||
              id.includes('node_modules/@emotion/') ||
              id.includes('node_modules/chakra-react-select/')) {
            return 'ui-vendor'
          }

          // Framer Motion split out separately to reduce ui-vendor size
          if (id.includes('node_modules/framer-motion/')) {
            return 'motion-vendor'
          }

          // Icons (react-icons ships per-icon files but can still be large)
          if (id.includes('node_modules/react-icons/')) {
            return 'icons-vendor'
          }

          // i18n stack (pure JS, no React.createContext — safe to split)
          if (id.includes('node_modules/i18next') &&
              !id.includes('node_modules/react-i18next/')) {
            return 'i18n-vendor'
          }

          // Forms & validation — merged into react-vendor above to fix load-order issue

          // Misc utilities
          if (id.includes('node_modules/axios/') ||
              id.includes('node_modules/moment/') ||
              id.includes('node_modules/@fontsource/')) {
            return 'utils-vendor'
          }
        },
      },
    },
  },
})
