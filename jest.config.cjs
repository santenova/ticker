/**
 * Two suites, one runner:
 *  - `logic` — connection and data-fetching code in plain Node, talking to the
 *    real endpoints it uses in the app (no mocks, no stub fetch).
 *  - `ui` — JSX components in jsdom, with @testing-library and DOM matchers.
 *
 * Sources are loaded as native ESM (see the `test` script in package.json);
 * Babel's only job is compiling JSX. `@/` resolves the way Vite resolves it.
 */
const path = require('path');

const shared = {
  // Suites live in /tests (integration) and next to the code they cover in
  // src/**/__tests__ (unit).
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'mjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/setup/styleStub.js',
    '\\.(png|jpe?g|gif|svg|webp|avif)$': '<rootDir>/tests/setup/fileStub.js',
  },
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      { configFile: path.join(__dirname, 'babel.config.cjs') },
    ],
  },
};

module.exports = {
  // Real network calls need headroom; the same limit applies to every project.
  testTimeout: 60000,
  projects: [
    {
      ...shared,
      displayName: 'logic',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/src/**/__tests__/**/*.test.js'],
    },
    {
      ...shared,
      displayName: 'ui',
      testEnvironment: 'jsdom',
      extensionsToTreatAsEsm: ['.jsx'],
      testMatch: ['<rootDir>/tests/**/*.test.jsx', '<rootDir>/src/**/__tests__/**/*.test.jsx'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/ui.js'],
    },
  ],
};