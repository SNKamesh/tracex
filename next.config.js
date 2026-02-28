/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["react"],
  },
  output: "standalone",   // ⭐ ADD THIS LINE
};

module.exports = nextConfig;