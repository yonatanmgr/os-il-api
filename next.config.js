/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {github_read_only: process.env.github_read_only, MONGODB_URI: process.env.MONGODB_URI},

  
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
        ]
      }
    ]
  }

}

module.exports = nextConfig
// next.config.js
