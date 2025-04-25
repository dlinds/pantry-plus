/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*", // Proxy to Express backend
      },
    ];
  },
};

module.exports = nextConfig;
