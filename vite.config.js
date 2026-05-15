import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import rollupNodeResolve from '@rollup/plugin-node-resolve';
import rollupBabel from '@rollup/plugin-babel';

export default defineConfig({
  base: '/saas-po/',
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
    visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodeResolve(),
        rollupBabel({
          babelHelpers: 'bundled',
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          include: ['src/**/*'],
        }),
      ],
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          const parts = id.split('node_modules/')[1].split('/');
          const name = parts[0].startsWith('@')
            ? `${parts[0]}/${parts[1]}`
            : parts[0];

          // React Ecosystem
          const reactGroup = ['react', 'react-dom', 'framer-motion'];
          if (reactGroup.includes(name)) return 'react-core';

          // MUI and Emotion (styled components)
          const muiEmotionGroup = [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
          ];
          if (muiEmotionGroup.includes(name)) return 'mui-emotion';

          // TanStack (query, form, table, router)
          if (name.startsWith('@tanstack/')) return 'tanstack';

          // Radix UI components
          if (name.startsWith('@radix-ui/')) return 'radix-ui';

          // Tailwind Ecosystem
          const tailwindGroup = [
            'tailwindcss',
            'tailwind-merge',
            'tailwind-variants',
            'tw-animate-css',
          ];
          if (tailwindGroup.includes(name)) return 'tailwind';

          // Utility Libraries
          const utilities = ['date-fns', 'moment', 'clsx', 'zod', 'js-cookie'];
          if (utilities.includes(name)) return 'utilities';

          // D3 and Visualization
          if (name === 'd3') return 'd3-lib';

          // UI Enhancements & Toolkits
          const uiTools = [
            'lucide-react',
            'cmdk',
            'sonner',
            'react-day-picker',
          ];
          if (uiTools.includes(name)) return 'ui-tools';

          // File Processing
          const fileTools = ['exceljs', 'file-saver'];
          if (fileTools.includes(name)) return 'file-tools';

          // Theming & Settings
          if (name === 'next-themes') return 'themes';

          // Testing Utilities (only during dev or preview)
          const testUtils = ['@testing-library/react', '@testing-library/dom'];
          if (testUtils.includes(name)) return 'testing';

          // Default: vendor splitting
          return `vendor-${name.replace('@', '').replace('/', '-')}`;
        },
      },
    },
  },
});
