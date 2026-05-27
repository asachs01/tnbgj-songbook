# Changelog

All notable changes to the TNBGJ Bluegrass Songbook data will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- **Search and transpose no longer crash on songs with no key.** The
  FolkSociety import left 13 songs with `key: null` (Angeline the Baker,
  I'll Fly Away, In the Pines, Will the Circle Be Unbroken, etc.). Typing
  in the search box called `null.toLowerCase()` and clicking transpose
  called `null.match()`, both throwing and breaking the feature. Search and
  transpose are now null-safe, and the 13 null keys were backfilled from the
  authoritative chord-grid keys in `chord-grids.json`.

### Added

- **FolkSociety Bluegrass Songbook import** (2018 edition, 324 pages,
  305 songs across Bluegrass/Country/Folk/Gospel sections). All 305 songs
  extracted via `scripts/import_folksociety_pdf.py`. 276 net-new titles
  added to `songs-merged.json` (total now 326); 29 titles overlap with the
  existing 50-song dataset and are kept in `songs-folksociety.json` only
  (existing curated entries in `songs.json` win the merge — review the
  FolkSociety version for arrangement/key differences). Chord-format
  breakdown: 288 Nashville (key="C" reference with `nashville-default-key`
  warning so the renderer can transpose), 7 letter-chord (key inferred
  from first chord), 10 inline-derived (no separate chord chart in source;
  chord rows synthesised from `[Chord]` tags inline in the lyrics, with
  `inline-derived-chords` warning noting measure boundaries are
  approximate). All songs have at least one chord row.
- **TypeScript schema** (`data/schema.ts`) — format-agnostic chord data model
  supporting chord grids, Nashville numbers, and tablature. Seventh chords
  (`7`, `major7`, `minor7`) are first-class quality values. Includes optional
  `bass` field for slash chords, optional `time_signature` per song, and a
  transposition-friendly design (shift root notes relative to stored key).
- **Merged data file** (`data/songs-merged.json`) — all 50 songs with both
  lyrics and chord grid data in a single file.
- `time_signature` field added to three waltz-time songs: "Farther Along",
  "In the Pines", and "Sitting Alone in the Moonlight" (all `[3, 4]`).

### Fixed

- **Em double-encoding** in "Down in the Willow Garden" — 8 chord cells had
  `root: "Em"` with `quality: "minor"`. Fixed to `root: "E"`,
  `quality: "minor"`.

### Changed

- `_warnings` on affected songs now document 7th-chord normalization losses
  from the original vision extraction pipeline.

### Known Issues — Needs Re-extraction

The original chord extraction pipeline normalized all 7th chords to plain
major/minor. The following songs have confirmed 7th chord data loss and need
re-extraction from source images to restore correct chord qualities:

| Song | Lost Chords | Current Storage |
|---|---|---|
| Blues Stay Away From Me | A7, E7 | A major, E major |
| Farther Along | A7 | A major |
| Fox on the Run | A7 | A major |
| Old Home Place | B7, A7 | B major, A major |
| Rabbit in the Log | D7 | D major |
| Shady Grove | Em7, Bm7 | E minor, B minor |
| Sitting Alone in the Moonlight | A7 | A major |

### Investigation: G# in "Sitting Alone in the Moonlight"

The chord grid contains G# major in a song keyed in A major. In bluegrass and
country music, this is almost certainly **Ab** (enharmonic equivalent)
functioning as a bVII borrowed chord or chromatic passing chord — a common
device in the style. However, the original source image shows "G#", so the
data faithfully preserves what was printed. Functionally G# major and Ab major
are the same chord; the choice of spelling is cosmetic. No data change was
made — this is preserved as-is pending a style decision on enharmonic
normalization.
