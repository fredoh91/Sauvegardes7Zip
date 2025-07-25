import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // setupFiles: ['./tests/setup.js'], // Plus nécessaire
    setupFiles: './tests/setup.js', // Chemin vers votre fichier de configuration
  },
});