/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Files in public/ are served by Next's static handler, which bypasses the
  // /uploads/[...file] route — so the SVG hardening headers must also be
  // declared here to cover locally-served uploads.
  async headers() {
    return [
      {
        source: "/uploads/:file.svg",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias["@"] = process.cwd();
    return config;
  },
};

export default nextConfig;
