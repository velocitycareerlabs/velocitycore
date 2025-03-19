// eslint-disable-next-line @typescript-eslint/no-var-requires
const eslintConfig = require('../../../.eslintrc');

module.exports = {
  ...eslintConfig,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['./'],
      },
      typescript: {
        project: ['./tsconfig.json'],
      },
    },
  },
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:@typescript-eslint/recommended', // Adds recommended TypeScript rules
    'plugin:prettier/recommended',
  ],
  plugins: [
    'prettier',
    'better-mutation',
    'prefer-arrow-functions',
    'autofix',
    '@typescript-eslint', // Add TypeScript plugin
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error', { singleQuote: true, endOfLine: 'auto' }],
    'prefer-arrow-functions/prefer-arrow-functions': [
      'warn',
      {
        classPropertiesAllowed: false,
        disallowPrototype: false,
        returnStyle: 'unchanged',
        singleReturnOnly: false,
      },
    ],
    'comma-dangle': [
      2,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
    complexity: ['error', 6],
    'no-param-reassign': 'off',
    'better-mutation/no-mutation': 'off',
    'no-nested-ternary': 'off',
    'max-depth': ['error', { max: 2 }],
    'max-len': ['error', { code: 150 }],
    'max-nested-callbacks': ['error', 3],
    'no-console': 'off',
    'no-underscore-dangle': ['error', { allowAfterThis: true, allow: ['_id'] }],
    'no-use-before-define': 'off', // Handled by @typescript-eslint/no-use-before-define
    '@typescript-eslint/explicit-module-boundary-types': 'off', // You can turn this on if you want function return types to be explicitly defined
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.test.jsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/test/**/*.js',
          '**/test/**/*.ts',
          '**/test/**/*.jsx',
          '**/test/**/*.tsx',
          '**/tests/**/*.js',
          '**/tests/**/*.ts',
          '**/tests/**/*.jsx',
          '**/tests/**/*.tsx',
          '**/setupTests.ts',
          '**/setupTests.js',
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['**/test/**/*.js', '**/test/**/*.ts', '**/test/**/*.tsx'],
      rules: {
        complexity: 'off',
        'no-console': 'off',
        'max-len': 'off',
        '@typescript-eslint/no-unused-vars': ['off'],
        'no-useless-constructor': 'off',
        'no-empty-function': 'off',
      },
    },
  ],
};
