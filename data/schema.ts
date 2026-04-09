/**
 * TNBGJ Bluegrass Songbook — Chord Data Schema
 *
 * Format-agnostic data model designed to support multiple representations
 * (chord grids, Nashville numbers, tablature) and transposition without
 * storing duplicate data.
 *
 * All pitch information is stored as abstract note names so that any
 * renderer can transpose on the fly by shifting semitones.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Chromatic note name. Sharps use "#", flats use "b".
 * Examples: "A", "Bb", "C#", "F"
 */
export type NoteName =
  | "A" | "A#" | "Ab"
  | "B" | "Bb"
  | "C" | "C#"
  | "D" | "D#" | "Db"
  | "E" | "Eb"
  | "F" | "F#"
  | "G" | "G#" | "Gb";

/**
 * Chord quality. Seventh chords are first-class values — they are standard
 * bluegrass voicings (A7, B7, D7, E7, Em7, Bm7), not exotic modifiers.
 */
export type ChordQuality =
  | "major"
  | "minor"
  | "7"          // dominant 7th  (e.g. A7, E7)
  | "major7"     // major 7th     (e.g. Cmaj7)
  | "minor7"     // minor 7th     (e.g. Em7, Bm7)
  | "dim"        // diminished
  | "aug"        // augmented
  | "sus2"
  | "sus4";

/**
 * Time signature as a tuple: [beats_per_measure, beat_unit].
 * Most bluegrass is [4, 4]; waltzes are [3, 4].
 */
export type TimeSignature = [number, number];

// ---------------------------------------------------------------------------
// Chord cell — the atomic unit shared by all representations
// ---------------------------------------------------------------------------

/**
 * A single chord event occupying one or more grid cells (beats).
 *
 * The same ChordCell can feed a chord-grid renderer, a Nashville-number
 * renderer, or a tab generator — each just interprets `root` + `quality`
 * differently.
 */
export interface ChordCell {
  /** Root note of the chord. Always a single note name, never "Em". */
  root: NoteName;

  /** Chord quality. See ChordQuality for allowed values. */
  quality: ChordQuality;

  /**
   * Number of beat-cells this chord spans in the grid.
   * Defaults to 1 if omitted.
   */
  cells?: number;

  /**
   * Optional bass note for slash chords (e.g. G/B has bass "B").
   * When absent the bass is assumed to be the root.
   */
  bass?: NoteName;
}

// ---------------------------------------------------------------------------
// Song structure
// ---------------------------------------------------------------------------

/** A named section of a song (Verse, Chorus, A Part, B Part, etc.) */
export interface SongSection {
  /** Human-readable section label. */
  name: string;

  /**
   * Rows of chord cells. Each row is one line in a chord grid — typically
   * one phrase or two measures. The number of cells per row should equal
   * beats_per_measure * measures_per_row, but renderers should be tolerant.
   */
  rows: ChordCell[][];
}

/** Lyric block — a verse, chorus, or other lyric section. */
export interface LyricSection {
  /** Section type label (e.g. "verse", "chorus", "bridge"). */
  type: string;

  /** Lines of lyrics, one string per line. */
  lines: string[];
}

/**
 * Complete song record. Holds lyrics, chord data, and metadata.
 *
 * By storing `key` separately from the chord cells, transposition is a
 * pure function: shift every `root` (and `bass`) by the interval between
 * the stored key and the target key — no duplicate data needed.
 */
export interface Song {
  /** URL-safe identifier. */
  slug: string;

  /** Display title. */
  title: string;

  /**
   * The key the chord data is written in. Used as the reference point
   * for transposition. Null when the key could not be determined.
   */
  key: NoteName | null;

  /**
   * Time signature. Defaults to [4, 4] when omitted.
   * Waltzes (3/4) should always be explicit.
   */
  time_signature?: TimeSignature;

  /** Chord grid sections (Verse, Chorus, A Part, etc.). */
  sections: SongSection[];

  /** Lyric sections, in performance order. */
  lyrics?: LyricSection[];

  /** Page number in the original printed songbook. */
  original_page?: number;

  /**
   * Machine-readable warnings from the extraction pipeline.
   * Intended to be resolved over time and eventually removed.
   */
  _warnings?: string[];
}

// ---------------------------------------------------------------------------
// Top-level collection
// ---------------------------------------------------------------------------

/** Root structure for the songbook data files. */
export interface Songbook {
  songs: Song[];
}
