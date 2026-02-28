import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: {
    // Skip the optimizer in development — local Supabase uses plain http://
    // which Next.js can't proxy reliably from a server process.
    // In production the optimizer works fine with the https Supabase URLs.
    unoptimized: isDev,
    remotePatterns: [
      {
        // Supabase Storage public bucket URLs (production)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Google OAuth profile pictures
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
