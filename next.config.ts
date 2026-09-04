import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical pulls in temporal-polyfill, which Turbopack's bundler mangles
  // when inlined into server chunks — keep it as a real Node require instead.
  serverExternalPackages: ["node-ical"],
  images: {
    // Next 16 requires an explicit allowlist for `quality` — anything not
    // listed here silently snaps to the nearest allowed value (75 default).
    // 68: house/kitchen/yard photos (65-70 is plenty for this content).
    // 50: the already-blurred map placeholder, where compression artifacts
    // are invisible under the blur.
    qualities: [50, 68, 75],
  },
};

export default nextConfig;
