import babelParser from '@babel/eslint-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
      jsdoc,
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.json'],
        },
      },
    },
    rules: {
      // Prettier formatting
      'prettier/prettier': 'error',

      // General JS rules
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',

      // JSDoc rules
      ...jsdoc.configs.recommended.rules,
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
        },
      ],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',

      'jsdoc/require-description-complete-sentence': 'warn',

      'jsdoc/require-param-type': 'warn',
      'jsdoc/require-returns-type': 'warn',
    },
  },
];
