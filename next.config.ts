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
  // perf #5, part D: tried experimental.inlineCss (documented, stable
  // enough for this Next version). Measured: FCP 1.9s -> 0.7s and Speed
  // Index 2.0s -> 1.1s, both big wins — but TBT 90ms -> 340ms (CSS now
  // duplicates into the RSC payload per the docs' own caveat) and LCP
  // unchanged (1900ms -> 1909ms, our actual bottleneck is the hero image,
  // which was never blocked by the CSS request). Net: Lighthouse
  // performance score dropped 97 -> 92. Left off — not a clean win for
  // the metric this whole effort is chasing. See the perf #5 report for
  // the full comparison if this trade-off looks worth revisiting.
};

export default nextConfig;
