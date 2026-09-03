import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: 'animapu\\.vercel\\.app' }],
      destination: 'https://www.animapu.my.id/:path*',
      permanent: true,
    }]
  },
  experimental: {
    scrollRestoration: true,
  },
  turbopack: {
    // You can now safely use __dirname here
    root: path.join(__dirname, '..'),
  },
  devIndicators: false,
};

export default nextConfig;
