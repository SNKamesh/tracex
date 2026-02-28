/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", 
  experimental: {
    optimizePackageImports: ["react"],
  },};
module.exports = nextConfig;