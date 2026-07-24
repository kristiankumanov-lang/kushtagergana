import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical pulls in temporal-polyfill, which Turbopack's bundler mangles
  // when inlined into server chunks — keep it as a real Node require instead.
  serverExternalPackages: ["node-ical"],
};

export default nextConfig;
