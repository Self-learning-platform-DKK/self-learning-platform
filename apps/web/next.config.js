/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sql-tutor/shared', '@sql-tutor/validation'],
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
