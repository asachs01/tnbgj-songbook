import Link from "next/link";

export default function NotesPage() {
  return (
    <article className="prose">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
        ← All songs
      </Link>
      <h1 className="font-serif text-4xl mt-3 mb-6">Known data issues</h1>
      <p className="text-stone-700 leading-relaxed mb-4">
        The songbook is rendered as-is from the source JSON. A few rough edges
        are known and intentionally left unfixed in this site:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-stone-700">
        <li>
          Some E-minor chords appear double-encoded in the source data (e.g.
          rendered with stray characters or duplicated qualifiers).
        </li>
        <li>
          7th chords (dom7, m7, maj7) are inconsistently captured across songs;
          some are flattened to plain triads in the chord grids.
        </li>
        <li>
          Songs in 3/4 time are not visually distinguished from 4/4 in the
          chord grid — every cell is one beat-group regardless of meter.
        </li>
      </ul>
      <p className="text-stone-500 text-sm mt-8">
        Fixes will land in the source data, not in the site templates.
      </p>
    </article>
  );
}
