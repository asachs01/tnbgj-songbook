import { songs } from "@/lib/songs";
import SongIndex from "./song-index";

export default function HomePage() {
  const list = songs
    .map((s) => ({ slug: s.slug, title: s.title, key: s.key }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div>
      <h1 className="font-serif text-4xl mb-2">Songs</h1>
      <p className="text-stone-600 mb-8">{list.length} songs in the book.</p>
      <SongIndex songs={list} />
    </div>
  );
}
