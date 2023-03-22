/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {github_read_token: process.env.github_read_only}
}

module.exports = nextConfig
