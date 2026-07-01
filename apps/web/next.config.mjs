/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy /api/* to the backend so the browser never needs a separate origin
    // (keeps auth simple and avoids CORS in dev). Configure via API_PROXY_TARGET.
    const target = process.env.API_PROXY_TARGET || 'http://localhost:4000';
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};
export default nextConfig;
