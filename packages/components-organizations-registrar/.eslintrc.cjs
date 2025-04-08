const eslintConfig = require('../../.eslintrc');

module.exports = {
  ...eslintConfig,
  root: true,
  extends: eslintConfig.extends.concat(['plugin:react/recommended', 'plugin:react/jsx-runtime']),
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  rules: {
    ...eslintConfig.rules,
    'import/prefer-default-export': 0,
    'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
  },
  overrides: [
    {
      files: ['**/*.{js,jsx}'],
    },
  ],
};
