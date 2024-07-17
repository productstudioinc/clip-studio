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
        hostname: "pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev",
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
