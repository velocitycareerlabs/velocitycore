module.exports = (packageName, options = {}) => ({
  roots: ['src', 'test'],
  // transform: {
  //   "^.+\\.ts$": "ts-jest",
  // },
  coverageDirectory: 'coverage/',
  testRegex: '(.*.(test|spec)).(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: false,
  collectCoverageFrom: [
    '**/src/**/*.{js,jsx}',
    '!**/src/index.js',
    '!**/src/main*.js',
    '!**/coverage/**',
    '!**/test/**',
    '!**/e2e/**',
    '!**/node_modules/**',
    '!**/migrations/**',
  ],
  coverageReporters: [['lcov', { projectRoot: '../../' }], 'text-summary'],
  verbose: true,
  displayName: packageName,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputName: `${packageName.split('/')[1]}-junit.xml`,
        outputDirectory: '<rootDir>/../../test-results',
        ancestorSeparator: ' › ',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
  ...options,
});
