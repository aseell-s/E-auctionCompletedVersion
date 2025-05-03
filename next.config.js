/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "1s4v5jf13d.ufs.sh",
      "9gp5skgzim.ufs.sh" ,

      // Allow UploadThing domains
      "uploadthing.com",
      "utfs.io",
      "nk5jx0d1gb.ufs.sh",
      // Add any other domains that might be used by UploadThing
      "utfs.io",
      "uploadthing-production.up.railway.app",
      // Using a wildcard for all uploadthing subdomains
      "*.ufs.sh",
      "imgs.search.brave.com",
      "images.unsplash.com",
      "localhost",
    ],
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
