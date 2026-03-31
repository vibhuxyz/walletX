/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
  // Prevents Bun monorepo HMR from losing module factories for next/image & next/link
  // by forcing Next.js to resolve them from the local package tree instead of the
  // shared .bun symlink cache.
  transpilePackages: [],
  experimental: {
    // Ensure server components resolve Next internals locally
    externalDir: true,
  },
};

export default nextConfig;
