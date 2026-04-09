import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(process.env.BASE_PATH ? { basePath: process.env.BASE_PATH } : {}),
};

export default nextConfig;
