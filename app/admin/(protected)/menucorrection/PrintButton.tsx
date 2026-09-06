"use client";

export function PrintButton() {
  return (
    <button className="min-h-12 rounded-xl bg-wood-700 px-6 font-bold text-white hover:bg-wood-900" type="button" onClick={() => window.print()}>
      Печат
    </button>
  );
}
