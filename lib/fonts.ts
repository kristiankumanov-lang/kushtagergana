import { Inter, Playfair_Display } from "next/font/google";

// perf #5, i18n routing: extracted out of app/layout.tsx so both root
// layouts (the locale-aware marketing site under app/[[...locale]]/ and
// the standalone app/enquiry/ branch) can import the exact same font
// instances instead of duplicating (and risking drift on) this config.
// next/font dedupes by identical call-site config regardless of which
// module makes the call, so this doesn't add any extra requests.

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  // italic reinstated (perf #5, part A2): Caveat was removed entirely —
  // 148 KiB for one decorative kicker line, and every bg text rendered in
  // it (kicker "·", the former kitchen.freshNote's commas/period, directBadge's
  // mid-word hyphen) forced BOTH its latin and cyrillic files to load
  // regardless of how the individual usages were split up, since Cyrillic
  // prose routinely contains latin-range punctuation. Playfair already
  // loads both subsets for its normal weight (the calendar's "Септември
  // 2026" has digits), so italic here is additive, not a new dual-subset
  // cost. `.font-hand` is gone; former call sites use `font-display
  // italic`. (freshNote itself was later removed — final-touches round —
  // but the other two triggers still apply, so this reasoning stands.)
  style: ["normal", "italic"],
  // perf #5, part A3: no element in the codebase applies a font-weight
  // utility on top of `font-display` — every Playfair heading/kicker
  // renders at the browser default (400). The variable axis (400-900)
  // was shipping 500 unused weights. Pin to 400 only.
  weight: ["400"],
  // preload:false (perf #4, part B): renders the Hero h1, but so does
  // Inter (subtitle) below — both compete with the LCP image for
  // bandwidth if preloaded. Measured LCP 2109ms -> 1991ms with this off,
  // CLS unchanged at 0 (next/font's fallback is metric-matched, no
  // reflow on swap). FOUT window is brief and doesn't affect layout —
  // see the perf #4 report for screenshots.
  preload: false,
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  // perf #5, part A3: tried pinning weight to the 4 actually-used values
  // (400/500/600/700, vs the full 100-900 variable axis) — measured zero
  // byte change. Google's font CSS backend serves the *same* underlying
  // variable file regardless of how many discrete weights next/font
  // requests for it (only requesting a *single* weight, as Playfair does
  // below, gets a genuinely smaller static instance); an array just
  // relabels one file under 4 near-duplicate @font-face rules, bloating
  // the CSS for no payload win. Left at the default (one rule, same
  // bytes, smaller CSS) rather than "narrowed" in name only.
  // preload:false (perf #4, part B): renders Hero subtitle/CTA + nav.
  // Measured LCP 1991ms -> 1940ms with this off, CLS unchanged at 0.
  preload: false,
});
