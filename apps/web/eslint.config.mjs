import nextConfig from 'eslint-config-next';

const config = [
  { ignores: ['packages/api-client/**'] },
  ...nextConfig,
];

export default config;
