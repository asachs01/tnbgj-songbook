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
      <div className="flex items-center gap-4 mb-4">
        <h2 className="font-serif text-2xl">Chords</h2>
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <span className="uppercase tracking-wider">Key {displayKey}</span>
          <button
            onClick={() => setSemitones((s) => s - 1)}
            className="w-8 h-8 rounded border border-stone-300 hover:bg-stone-100 text-stone-700 font-mono"
            aria-label="Transpose down"
          >
            -
          </button>
          <button
            onClick={() => setSemitones(0)}
            className="px-2 h-8 rounded border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs disabled:opacity-40"
            disabled={semitones === 0}
          >
            Reset
          </button>
          <button
            onClick={() => setSemitones((s) => s + 1)}
            className="w-8 h-8 rounded border border-stone-300 hover:bg-stone-100 text-stone-700 font-mono"
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
          <table className="w-full border-collapse text-sm">
            <tbody>
              {sec.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      colSpan={cell.cells || 1}
                      className="border border-stone-300 px-3 py-2 text-center font-serif"
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
