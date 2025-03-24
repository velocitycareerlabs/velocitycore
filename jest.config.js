module.exports = {
  roots: [],
  projects: [
    '<rootDir>/packages/*/jest.config.js',
    '<rootDir>/servers/*/jest.config.js',
    '<rootDir>/lambdas/*/jest.config.js',
    '<rootDir>/tools/*/jest.config.js',
    '<rootDir>/apps/*/jest.config.js',
  ],
  coverageDirectory: '<rootDir>/reports/coverage/',
  collectCoverage: false,
  collectCoverageFrom: [
    '**/src/**/*.{js,jsx}',
    '!**/src/index.js',
    '!**/src/main*.js',
    '!**/coverage/**',
    '!**/test/**',
    '!**/node_modules/**',
    '!**/migrations/**',
  ],
  verbose: true,
};
