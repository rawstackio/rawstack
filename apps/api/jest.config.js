module.exports = {
  testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: './coverage/unit',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  watchman: false,
};
