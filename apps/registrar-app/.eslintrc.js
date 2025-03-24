const eslintConfig = require('../../.eslintrc');

module.exports = {
  ...eslintConfig,
  root: true,
  extends: [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'airbnb',
    'airbnb/hooks',
  ].concat(eslintConfig.extends),
  plugins: eslintConfig.plugins.concat(['unused-imports', 'import']),
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
        paths: ['./'],
      },
    },
  },
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  ignorePatterns: ['secrets.js', '__generated__'],
  rules: {
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
    'no-shadow': 'off',
    'autofix/no-debugger': 'error',
    'no-console': ['error', { allow: ['warn', 'error', 'dir', 'info'] }],
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
    'prefer-arrow-functions/prefer-arrow-functions': [
      'warn',
      {
        classPropertiesAllowed: false,
        disallowPrototype: false,
        returnStyle: 'unchanged',
        singleReturnOnly: false,
      },
    ],
    'import/prefer-default-export': 0,
    'react/jsx-props-no-spreading': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': ['error', { allowAfterThis: true, allow: ['_id'] }],
    quotes: [2, 'single', { avoidEscape: true }],
    'no-use-before-define': 0,
    'global-require': 0,
    'react/require-default-props': 'off',
    'react/prop-types': 'off',
    'object-curly-newline': 'off',
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    ...eslintConfig.rules,
    'better-mutation/no-mutation': [
      'error',
      {
        commonjs: true,
        allowThis: true,
        reducers: ['reduce', 'addHook', 'decorate'],
        exceptions: [
          { object: 'draftState' }, // immer,
          { property: 'current' }, // react ref
        ],
      },
    ],
    complexity: ['error', 10],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
  },
};
