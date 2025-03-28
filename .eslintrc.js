module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier', 'prettier/prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    BigInt: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['prettier', 'better-mutation', 'prefer-arrow-functions', 'autofix'],
  rules: {
    'autofix/no-debugger': 'error',
    'better-mutation/no-mutation': [
      'error',
      {
        commonjs: true,
        allowThis: true,
        reducers: ['reduce', 'addHook', 'decorate'],
      },
    ],
    'better-mutation/no-mutating-functions': 'error',
    'better-mutation/no-mutating-methods': 'error',
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
    'global-require': 'off',
    'max-depth': ['error', { max: 2 }],
    'max-len': ['error', { code: 150 }],
    'max-nested-callbacks': ['error', 3],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-param-reassign': 0,
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          // eslint-disable-next-line max-len
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-underscore-dangle': ['error', { allowAfterThis: true, allow: ['_id'] }],
    'no-use-before-define': 0, // override airbnb
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
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
    quotes: [2, 'single', { avoidEscape: true }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.test.jsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/e2e/**/*.js',
          '**/e2e/**/*.ts',
          '**/e2e/**/*.jsx',
          '**/e2e/**/*.tsx',
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
  },
  overrides: [
    {
      files: [
        '**/*.test.js',
        '**/*.test.jsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**/*.js',
        '**/test/**/*.ts',
        '**/tests/**/*.js',
        '**/tests/**/*.ts',
      ],
      env: {
        jest: true,
      },
      rules: {
        'better-mutation/no-mutating-functions': 'off',
        'better-mutation/no-mutating-methods': 'off',
        'better-mutation/no-mutation': 'off',
        'max-nested-callbacks': ['error', 8],
      },
    },
  ],
};
