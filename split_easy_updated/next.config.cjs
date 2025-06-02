import { join } from "path";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias["@"] = join(process.cwd(), "src");
    return config;
  },
  serverActions: {
    bodySizeLimit: "10mb", // set to desired value
  },
};
