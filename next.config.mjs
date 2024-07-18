import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.clip.studio",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/studio", destination: "/studio/templates", permanent: true },
    ];
  },
};

export default withContentCollections(nextConfig);
