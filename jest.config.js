/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/lib/**/*.test.ts'],
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.test.ts'],
};
