/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Standalone output bundles only required files for production Docker images
  output: "standalone",
};

module.exports = nextConfig;
