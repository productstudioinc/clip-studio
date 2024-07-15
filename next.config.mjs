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
};

export default nextConfig;
