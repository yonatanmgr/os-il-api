/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {github_read_only: process.env.github_read_only, MONGODB_URI: process.env.MONGODB_URI, update_password: process.env.update_password},

  
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
        ]
      }
    ]
  }

}

module.exports = nextConfig
// next.config.js
