// @ts-check
// stylistic https://eslint.style/packages/default
import stylistic from '@stylistic/eslint-plugin';
// eslint-config-prettier
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    plugins: {
      '@stylistic': stylistic
    }
  },
  eslintPluginPrettierRecommended
]);
