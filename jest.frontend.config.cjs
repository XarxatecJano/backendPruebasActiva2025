module.exports = {
  displayName: 'Frontend Tests',
  testMatch: ['**/__tests__/frontend/**/*.simple.test.js', '**/__tests__/frontend/basic.test.js'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/frontend/setup/testSetup.js'],
  collectCoverageFrom: [
    'public/js/**/*.js',
    '!public/js/home.js'
  ],
  coverageDirectory: 'coverage/frontend',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  moduleFileExtensions: ['js'],
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};