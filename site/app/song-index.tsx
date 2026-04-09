"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { slug: string; title: string; key: string };

export default function SongIndex({ songs }: { songs: Item[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) ||
        s.key.toLowerCase().includes(needle),
    );
  }, [q, songs]);

  const groups = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const s of filtered) {
      const letter = (s.title[0] || "?").toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by title or key…"
        className="w-full mb-8 rounded border border-stone-300 bg-white px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
      {groups.length === 0 && (
        <p className="text-stone-500">No songs match.</p>
      )}
      {groups.map(([letter, items]) => (
        <section key={letter} className="mb-8">
          <h2 className="font-serif text-xl text-stone-500 border-b border-stone-200 pb-1 mb-3">
            {letter}
          </h2>
          <ul className="divide-y divide-stone-100">
            {items.map((s) => (
              <li key={s.slug} className="py-2 flex items-baseline justify-between">
                <Link
                  href={`/songs/${s.slug}`}
                  className="font-serif text-lg hover:underline"
                >
                  {s.title}
                </Link>
                <span className="text-xs uppercase tracking-wider text-stone-500">
                  {s.key}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
