/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  webpack: (config) => {
    // Ensure webpack resolves Node built-ins when running in Node runtime
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;