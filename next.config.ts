import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  serverExternalPackages: ["@pyroscope/nodejs", "@datadog/pprof"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "media.gqmagazine.fr" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.motor1.com" },
      { protocol: "https", hostname: "images.caradisiac.com" },
      { protocol: "https", hostname: "www.pushstart.it" },
      { protocol: "https", hostname: "octane.rent" },
    ],
  },
};

export default nextConfig;
