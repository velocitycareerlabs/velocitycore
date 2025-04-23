const eslintConfig = require('../../.eslintrc');

module.exports = {
  ...eslintConfig,
  root: true,
  extends: eslintConfig.extends.concat([
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ]),
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  rules: {
    ...eslintConfig.rules,
    'import/no-unresolved': [
      'error',
      { ignore: ['@velocitycareerlabs/components-organizations-registrar.*'] },
    ],
  },
};
