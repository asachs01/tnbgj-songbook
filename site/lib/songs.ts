import songsData from "@/data/songs.json";
import gridsData from "@/data/chord-grids.json";
import chartManifest from "@/data/chart-manifest.json";

export type LyricBlock = { type: string; lines: string[] };

export type Song = {
  title: string;
  slug: string;
  key: string;
  lyrics: LyricBlock[];
  chord_sections: unknown[];
  original_page: number;
};

export type ChordCell = {
  root: string;
  quality: string;
  bass?: string;
  cells: number;
};

export type ChordSection = {
  name: string;
  rows: ChordCell[][];
};

export type ChordGrid = {
  slug: string;
  title: string;
  key: string;
  sections: ChordSection[];
};

export const songs: Song[] = (songsData as { songs: Song[] }).songs;
export const grids: ChordGrid[] = (gridsData as { songs: ChordGrid[] }).songs;

export function getSong(slug: string): Song | undefined {
  return songs.find((s) => s.slug === slug);
}

export function getGrid(slug: string): ChordGrid | undefined {
  return grids.find((g) => g.slug === slug);
}

const QUALITY_MAP: Record<string, string> = {
  major: "",
  minor: "m",
  min: "m",
  m: "m",
  dom7: "7",
  "7": "7",
  maj7: "maj7",
  min7: "m7",
  m7: "m7",
  dim: "dim",
  dim7: "dim7",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
};

export function formatChord(cell: ChordCell): string {
  const q = QUALITY_MAP[cell.quality] ?? cell.quality ?? "";
  const bass = cell.bass ? `/${cell.bass}` : "";
  return `${cell.root}${q}${bass}`;
}

const manifest = chartManifest as Record<string, string>;

export function chartFilenameForSlug(slug: string): string | null {
  return manifest[slug] ?? null;
}
