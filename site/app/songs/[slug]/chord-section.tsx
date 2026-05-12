"use client";

import { useState } from "react";
import type { ChordSection } from "@/lib/chord-utils";
import { formatChord, transposeKey } from "@/lib/chord-utils";

export default function ChordSectionInteractive({
  sections,
  songKey,
}: {
  sections: ChordSection[];
  songKey: string;
}) {
  const [semitones, setSemitones] = useState(0);
  const displayKey = semitones ? transposeKey(songKey, semitones) : songKey;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 flex-wrap">
        <h2 className="font-serif text-2xl">Chords</h2>
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <span className="uppercase tracking-wider">Key {displayKey}</span>
          <button
            type="button"
            onClick={() => setSemitones((s) => s - 1)}
            className="min-w-11 min-h-11 w-11 h-11 rounded border border-stone-300 hover:bg-stone-100 active:bg-stone-200 text-stone-700 font-mono text-base touch-manipulation"
            aria-label="Transpose down"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setSemitones(0)}
            className="min-h-11 h-11 px-3 rounded border border-stone-300 hover:bg-stone-100 active:bg-stone-200 text-stone-700 text-xs disabled:opacity-40 touch-manipulation"
            disabled={semitones === 0}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setSemitones((s) => s + 1)}
            className="min-w-11 min-h-11 w-11 h-11 rounded border border-stone-300 hover:bg-stone-100 active:bg-stone-200 text-stone-700 font-mono text-base touch-manipulation"
            aria-label="Transpose up"
          >
            +
          </button>
          {semitones !== 0 && (
            <span className="text-xs text-stone-400">
              {semitones > 0 ? "+" : ""}
              {semitones}
            </span>
          )}
        </div>
      </div>
      {sections.map((sec, si) => (
        <div key={si} className="mb-6">
          <h3 className="font-serif text-lg text-stone-600 mb-2">{sec.name}</h3>
          <table className="w-full border-collapse text-sm md:text-base">
            <tbody>
              {sec.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      colSpan={cell.cells || 1}
                      className="border border-stone-300 px-2 py-2 md:px-3 md:py-3 text-center font-serif"
                    >
                      {formatChord(cell, semitones)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
