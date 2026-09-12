import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      /*
       * Aviso en vez de error, a propósito.
       *
       * La regla marca el patrón "reiniciar el estado local cuando cambia una
       * prop" que usan varios modales y la vista de álbum. Es mejorable —lo
       * idiomático sería remontar el componente con una `key`— pero son sitios
       * que hoy funcionan, y convertirlo en error obligaría a reescribirlos
       * todos a la vez. Queda visible para arreglarlo poco a poco.
       */
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
);
