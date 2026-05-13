#!/usr/bin/env python3
"""
Fix the "every Nashville-default song is in key C" bug.

The FolkSociety import defaulted 1=C for Nashville-notation songs, but the
inline [Chord] brackets in the lyrics carry the source's actual key (G, D,
A — typical bluegrass). The chart and the lyrics therefore disagree.

This script walks every song in site/data/songs.json that carries the
'nashville-default-key' warning, takes the first inline-chord bracket in
its lyrics as the song's I chord, sets `key` accordingly, rewrites the
matching chord-grid entry by mapping every C-defaulted cell to the new key
(C→I, D→II, E→III, F→IV, G→V, A→VI, B→VII), and drops the warning.

Songs without inline brackets are left as-is — we can't infer their key
from the data we have.
"""

import json
import re
import sys
from pathlib import Path

SITE_DATA = Path(__file__).resolve().parent.parent / "site" / "data"
SONGS_FILE = SITE_DATA / "songs.json"
GRIDS_FILE = SITE_DATA / "chord-grids.json"

INLINE_CHORD_RE = re.compile(
    r"\[([A-G])([#b]?)(maj7|min7|m7|m|7|dim|aug|sus2|sus4)?(?:/[A-G][#b]?)?\]"
)

# Major-scale degree → semitones from the I
SCALE_OFFSETS = {1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11}
# Reverse: a root note "C" in key C is degree 1; "D" is degree 2; etc.
NASHVILLE_C_TO_DEGREE = {"C": 1, "D": 2, "E": 3, "F": 4, "G": 5, "A": 6, "B": 7}

NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]


def first_inline_chord(lyrics: list[dict]) -> tuple[str, str] | None:
    """Return (root, quality_letter) of the first inline chord, or None."""
    for block in lyrics:
        for line in block.get("lines", []):
            m = INLINE_CHORD_RE.search(line)
            if m:
                root = m.group(1) + (m.group(2) or "")
                qualifier = m.group(3) or ""
                return (root, qualifier)
    return None


def note_index(note: str) -> int | None:
    if note in NOTES_SHARP:
        return NOTES_SHARP.index(note)
    if note in NOTES_FLAT:
        return NOTES_FLAT.index(note)
    return None


def transpose_root(root: str, semitones: int, prefer_sharp: bool) -> str:
    idx = note_index(root)
    if idx is None:
        return root
    new_idx = (idx + semitones) % 12
    return NOTES_SHARP[new_idx] if prefer_sharp else NOTES_FLAT[new_idx]


def rewrite_chord_cell(cell: dict, key_offset: int, prefer_sharp: bool) -> dict:
    """Map a 1=C-defaulted cell's root to the new key by adding key_offset
    semitones."""
    new_cell = dict(cell)
    new_cell["root"] = transpose_root(cell["root"], key_offset, prefer_sharp)
    if "bass" in cell:
        new_cell["bass"] = transpose_root(cell["bass"], key_offset, prefer_sharp)
    return new_cell


def main() -> int:
    songs_doc = json.loads(SONGS_FILE.read_text())
    grids_doc = json.loads(GRIDS_FILE.read_text())

    grids_by_slug = {g["slug"]: g for g in grids_doc["songs"]}

    inferred = 0
    skipped_no_brackets = 0
    skipped_no_grid = 0
    inferred_keys: dict[str, int] = {}

    for song in songs_doc["songs"]:
        warnings = song.get("_warnings") or []
        if not any("nashville-default-key" in w for w in warnings):
            continue
        grid = grids_by_slug.get(song["slug"])
        if grid is None:
            skipped_no_grid += 1
            continue

        first = first_inline_chord(song.get("lyrics") or [])
        if first is None:
            skipped_no_brackets += 1
            continue
        new_key, qualifier = first
        # Treat "m" qualifier on the first chord as a key signal too — but the
        # `key` field stores major-flavored note name. Renderer can decide.
        new_idx = note_index(new_key)
        if new_idx is None:
            skipped_no_brackets += 1
            continue
        # Decide sharp vs flat spelling based on the source root.
        prefer_sharp = "b" not in new_key
        key_offset = new_idx  # semitones from C

        song["key"] = new_key
        # Drop the nashville-default-key warning; preserve any others.
        song["_warnings"] = [w for w in warnings if "nashville-default-key" not in w]
        if not song["_warnings"]:
            del song["_warnings"]

        grid["key"] = new_key
        for section in grid["sections"]:
            section["rows"] = [
                [rewrite_chord_cell(cell, key_offset, prefer_sharp) for cell in row]
                for row in section["rows"]
            ]

        inferred += 1
        inferred_keys[new_key] = inferred_keys.get(new_key, 0) + 1

    SONGS_FILE.write_text(json.dumps(songs_doc, indent=2) + "\n")
    GRIDS_FILE.write_text(json.dumps(grids_doc, indent=2) + "\n")

    print(f"inferred key for {inferred} songs")
    print(f"skipped (no inline brackets): {skipped_no_brackets}")
    print(f"skipped (no chord grid): {skipped_no_grid}")
    print("key distribution:")
    for k in sorted(inferred_keys, key=lambda x: -inferred_keys[x]):
        print(f"  {k}: {inferred_keys[k]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
