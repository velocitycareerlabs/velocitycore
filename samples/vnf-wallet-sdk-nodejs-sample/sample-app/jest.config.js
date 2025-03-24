module.exports = {
  // Use ts-jest to handle TypeScript files
  preset: 'ts-jest',

  // Use Node.js as the test environment
  testEnvironment: 'node',

  // Enable support for ECMAScript Modules (ESM)
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Transform TypeScript files using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Allow transforming specific node_modules if they use ESM
  transformIgnorePatterns: [
    '/node_modules/(?!(your-esm-package|@velocitycareerlabs/vnf-nodejs-wallet-sdk)/)',
  ],

  // Fix for Jest failing to resolve ESM imports with file extensions
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Jest will look for test files in these locations
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // Clear mocks before each test
  clearMocks: true,

  // Set a timeout for tests
  testTimeout: 30000, // 30 seconds

  // Enable coverage collection
  // collectCoverage: true,
  // collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  // coverageDirectory: 'coverage',
};
