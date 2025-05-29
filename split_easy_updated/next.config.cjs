/** @type {import('next').NextConfig} */
import { join } from "path";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  async headers() {
    return [
      {
        source: "/:path*", // apply to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },

  // 2) Your existing webpack alias
  webpack: (config) => {
    config.resolve.alias["@"] = join(process.cwd(), "src");
    return config;
  },
};

export default nextConfig;
