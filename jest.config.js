module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // testMatch: ['*/?(.)+(spec|test).[jt]s?(x)'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+.tsx?$': 'ts-jest',
    '^.+.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 100000,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
