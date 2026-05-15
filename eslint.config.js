// @ts-check

import { tanstackConfig } from '@tanstack/eslint-config';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

/** @type {import("eslint").Linter.Config[]} */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default [
  ...tanstackConfig,

  {
    plugins: {
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
