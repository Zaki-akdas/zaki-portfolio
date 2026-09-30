/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Media lives in Supabase Storage (public `media` bucket); /uploads/* is a
  // 302 to the CDN, so no origin headers are needed here anymore.
  webpack: (config) => {
    config.resolve.alias["@"] = process.cwd();
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
