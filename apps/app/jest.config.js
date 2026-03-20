module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-reanimated|@tanstack/react-query|@rawstack|react-native-config|react-native-toast-message|styled-components|axios|async-mutex)/)',
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
