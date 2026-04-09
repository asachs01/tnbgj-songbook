import Link from "next/link";
import { notFound } from "next/navigation";
import {
  songs,
  getSong,
  getGrid,
  chartFilenameForSlug,
} from "@/lib/songs";
import ChordChartFallback from "./chart-fallback";
import ChordSectionInteractive from "./chord-section";

export function generateStaticParams() {
  return songs.map((s) => ({ slug: s.slug }));
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const song = getSong(slug);
  if (!song) notFound();
  const grid = getGrid(slug);
  const chart = chartFilenameForSlug(slug);

  return (
    <article>
      <header className="mb-8">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
          &larr; All songs
        </Link>
        <h1 className="font-serif text-3xl lg:text-4xl mt-3">{song.title}</h1>
        <div className="mt-2 text-sm text-stone-600">
          <span className="uppercase tracking-wider">Key {song.key}</span>
          <span className="mx-2 text-stone-300">&middot;</span>
          <span>Page {song.original_page}</span>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Left column: chords */}
        <div>
          {grid && grid.sections.length > 0 && (
            <ChordSectionInteractive sections={grid.sections} songKey={song.key} />
          )}

          {chart && (
            <ChordChartFallback
              src={`/chord-charts/${chart}`}
              alt={`${song.title} chord chart`}
            />
          )}
        </div>

        {/* Right column: lyrics */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl mb-4">Lyrics</h2>
          <div className="space-y-6 leading-relaxed text-stone-800">
            {song.lyrics.map((block, i) => (
              <div key={i}>
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">
                  {block.type}
                </div>
                <div className="lyric-block font-serif text-lg">
                  {block.lines.join("\n")}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
