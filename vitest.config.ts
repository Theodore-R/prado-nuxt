import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'composables/**/*.ts',
        'lib/**/*.ts',
        'server/api/**/*.ts',
        'server/utils/**/*.ts',
        'utils/**/*.ts',
      ],
      exclude: ['node_modules', '.nuxt', 'tests'],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '#imports': resolve(__dirname, '.nuxt/imports.d.ts'),
    },
  },
})
