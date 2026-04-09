"use client";

import { useState } from "react";

export default function ChordChartFallback({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mb-12">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-stone-600 underline hover:text-stone-900"
      >
        {open ? "Hide" : "Show"} original chord chart
      </button>
      {open && (
        <div className="mt-4 border border-stone-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-w-full h-auto" />
        </div>
      )}
    </section>
  );
}
