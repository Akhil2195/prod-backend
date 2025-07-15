// jest.config.mjs
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/test/test-setup.js'],
//   transform: {},
  testTimeout: 20000,
};
