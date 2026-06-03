/** @type {import('next').NextConfig} */
const nextConfig = {
  // The `ws` package uses native C++ addons (bufferutil, utf-8-validate)
  // for performance. Webpack tries to bundle them as JS and fails.
  // `serverComponentsExternalPackages` tells Next.js: "Don't webpack
  // these — use Node.js require() at runtime instead."
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["ws", "bufferutil", "utf-8-validate"],
  },

  // Also tell webpack itself to treat these as external (for API routes
  // and server actions which aren't covered by the above)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("bufferutil", "utf-8-validate");
    }
    return config;
  },
};

export default nextConfig;
