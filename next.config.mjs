/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Media lives in Supabase Storage (public `media` bucket); /uploads/* is a
  // 302 to the CDN, so no origin headers are needed here anymore.
  webpack: (config) => {
    config.resolve.alias["@"] = process.cwd();
    return config;
  },
};

export default nextConfig;
