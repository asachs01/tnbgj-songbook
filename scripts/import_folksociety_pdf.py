#!/usr/bin/env python3
"""
Extract songs from FolkSociety bluegrass songbook PDF into the
TNBGJ songbook JSON schema (data/schema.ts).

Per-song layout on each page:
  1. Title (first non-blank line of the page; sometimes title spans 2 lines)
  2. 0-N Nashville chord-number rows
  3. Lyrics with inline [Chord] markers (e.g. "[G]Blue moon of Kentucky")

We:
  - Use pdftotext -layout with form-feed page boundaries to walk the body
  - Identify song boundaries by detecting where a known-title line begins a page
  - Build a title set from each section's sub-TOC (page numbers in sub-TOCs
    for Country/Folk/Gospel are relative-to-section, not absolute, so we
    only use the TOC for the title list)
  - Convert Nashville rows to ChordCell rows (1 = C convention)
  - Convert inline-chord lyrics into LyricSection records

Songs use key="C" with a _warning noting the Nashville-default mapping;
canonical key from the source recording is not in the PDF.
"""

import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

PDF_PATH = Path("/Users/asachs/.claude/channels/discord/inbox/1778587837952-1503583969109610687.pdf")
REPO_ROOT = Path("/Users/asachs/Documents/projects/music/songbook-import")
OUT_PATH = REPO_ROOT / "data/songs-folksociety.json"
EXISTING_SONGS = REPO_ROOT / "data/songs.json"

NASHVILLE_TO_NOTE = {"1": "C", "2": "D", "3": "E", "4": "F", "5": "G", "6": "A", "7": "B"}

# A whole line that is *only* Nashville chord tokens: digits, optional 'm'/'7'
# combos, '/' for slash chords (e.g. '5/7'), and whitespace.
CHORD_ROW_RE = re.compile(r"^[\s0-9mM7bs/+\-]+$")

# A letter-chord token: G, Bm, C7, F/A, Cmaj7, D/C
LETTER_CHORD_TOKEN_RE = re.compile(
    r"^([A-G])([#b]?)(maj7|min7|m7|m|7|dim|aug|sus2|sus4)?(?:/([A-G][#b]?))?$"
)

# Inline chord pattern: [G], [Bm], [C7], [F/A], [Cmaj7]
INLINE_CHORD_RE = re.compile(
    r"\[([A-G][#b]?(?:maj7|min7|m7|m|7|dim|aug|sus2|sus4)?(?:/[A-G][#b]?)?)\]"
)


def normalise_title(title: str) -> str:
    t = unicodedata.normalize("NFKD", title)
    t = re.sub(r"[‘’“”]", "", t)
    t = re.sub(r"[^a-zA-Z0-9 ]", "", t)
    return re.sub(r"\s+", " ", t).strip().lower()


def slugify(title: str) -> str:
    t = unicodedata.normalize("NFKD", title)
    t = re.sub(r"[‘’“”]", "'", t)
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t)
    return t.strip("-").lower()


# ---------------------------------------------------------------------------
# PDF page IO
# ---------------------------------------------------------------------------

def pdf_full_layout(pdf_path: Path) -> list[str]:
    """Return one string per PDF page in layout mode."""
    out = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True, text=True, check=False,
    )
    # pdftotext emits form-feed (\x0c) between pages
    return out.stdout.split("\x0c")


def parse_toc_titles(toc_pages: list[str]) -> set[str]:
    """Return a set of normalised titles from all sub-TOC tables. Page
    numbers are ignored — sub-TOC pages restart at 1 per section, so the
    only thing we can trust is the title strings."""
    titles: set[str] = set()
    # Sub-TOCs live in the first ~16 pages
    toc_blob = "\n".join(toc_pages[:16])
    for line in toc_blob.splitlines():
        line = line.rstrip()
        m = re.match(r"^(.+?)\.{4,}\s*\d+\s*$", line)
        if not m:
            continue
        title = m.group(1).strip().rstrip(".").strip()
        if title in {"Bluegrass", "Country", "Folk", "Gospel"}:
            continue
        titles.add(normalise_title(title))
    return titles


# ---------------------------------------------------------------------------
# Chord-row parsing
# ---------------------------------------------------------------------------

def parse_nashville_token(tok: str) -> dict | None:
    """Parse '1', '4m', '57' (split), '1m7', '7b' (treated as b7), etc."""
    tok = tok.strip()
    if not tok or not tok[0].isdigit():
        return None
    m = re.match(r"^(\d)([bs]?)(m|maj7|min7|m7|7|dim|aug)?$", tok)
    if not m:
        return None
    degree, accidental, suffix = m.group(1), m.group(2) or "", m.group(3) or ""
    root = NASHVILLE_TO_NOTE.get(degree)
    if root is None:
        return None
    # 'b' as in '7b' = flat-7. Apply to root.
    if accidental == "b":
        # Flatten: shift root down by a semitone. Use the simple lookup.
        FLAT_MAP = {"C": "B", "D": "Db", "E": "Eb", "F": "E", "G": "Gb", "A": "Ab", "B": "Bb"}
        root = FLAT_MAP.get(root, root)
    if accidental == "s":
        SHARP_MAP = {"C": "C#", "D": "D#", "E": "F", "F": "F#", "G": "G#", "A": "A#", "B": "C"}
        root = SHARP_MAP.get(root, root)
    quality = {
        "": "major", "m": "minor", "7": "7",
        "m7": "minor7", "min7": "minor7", "maj7": "major7",
        "dim": "dim", "aug": "aug",
    }.get(suffix, "major")
    return {"root": root, "quality": quality, "cells": 1}


def split_nashville_row(line: str) -> list[dict]:
    """Tokenize a Nashville row. Multi-digit runs like '57' get split into
    '5' '7' so each becomes a chord cell."""
    cells: list[dict] = []
    expanded = re.sub(r"(\d[bs]?)(?=\d)", r"\1 ", line)
    for tok in expanded.split():
        # Drop bare '/', '+', '-' that occasionally show up as separators
        tok = tok.strip("/+-")
        if not tok:
            continue
        cell = parse_nashville_token(tok)
        if cell is not None:
            cells.append(cell)
    return cells


def is_nashville_row(line: str) -> bool:
    """True for a whitespace-separated row of Nashville-chord tokens."""
    stripped = line.strip()
    if not stripped:
        return False
    digits = sum(c.isdigit() for c in stripped)
    if digits < 2:
        return False
    for c in stripped:
        if c.isalpha() and c not in "mM7bs":
            return False
    return True


def parse_letter_chord_token(tok: str) -> dict | None:
    """Parse 'G', 'Bm', 'C7', 'F/A', 'D/C', 'Cmaj7' into a ChordCell."""
    m = LETTER_CHORD_TOKEN_RE.match(tok)
    if not m:
        return None
    root = m.group(1) + (m.group(2) or "")
    suffix = m.group(3) or ""
    bass = m.group(4)
    quality = {
        "": "major", "m": "minor", "7": "7",
        "maj7": "major7", "m7": "minor7", "min7": "minor7",
        "dim": "dim", "aug": "aug", "sus2": "sus2", "sus4": "sus4",
    }.get(suffix, "major")
    cell: dict = {"root": root, "quality": quality, "cells": 1}
    if bass:
        cell["bass"] = bass
    return cell


def is_letter_chord_row(line: str) -> bool:
    """True for a whitespace-separated row of letter-chord tokens."""
    stripped = line.strip()
    if not stripped:
        return False
    # Reject lines that are obviously prose: any token with 2+ consecutive
    # lowercase letters (e.g. "the", "moon") fails.
    tokens = stripped.split()
    if len(tokens) < 2:
        return False
    chord_tokens = 0
    for tok in tokens:
        if LETTER_CHORD_TOKEN_RE.match(tok):
            chord_tokens += 1
        else:
            # Allow stray '+' / '-' markers
            if tok in {"+", "-", "x2", "x3", "x4"}:
                continue
            return False
    return chord_tokens >= 2


def split_letter_chord_row(line: str) -> list[dict]:
    cells: list[dict] = []
    for tok in line.split():
        cell = parse_letter_chord_token(tok)
        if cell is not None:
            cells.append(cell)
    return cells


# ---------------------------------------------------------------------------
# Song extraction
# ---------------------------------------------------------------------------

def looks_like_title(line: str, known_titles: set[str]) -> bool:
    return normalise_title(line) in known_titles


def parse_page_song(page_text: str, known_titles: set[str]) -> dict | None:
    """If this page begins a song, return its parsed record. Else None."""
    lines = page_text.splitlines()
    # Skip leading blanks to find the first content line
    idx = 0
    while idx < len(lines) and not lines[idx].strip():
        idx += 1
    if idx >= len(lines):
        return None
    first = lines[idx].strip()
    # Some titles wrap onto 2 lines; try first-line, then first+second-line
    title_candidates = [first]
    if idx + 1 < len(lines) and lines[idx + 1].strip():
        title_candidates.append(first + " " + lines[idx + 1].strip())

    matched_title = None
    title_consumed_lines = 1
    for offset, cand in enumerate(title_candidates):
        if looks_like_title(cand, known_titles):
            matched_title = cand
            title_consumed_lines = offset + 1
            break

    if matched_title is None:
        return None

    cursor = idx + title_consumed_lines

    # Collect chord rows (Nashville or letter-chord) at the head of the song
    chord_rows: list[list[dict]] = []
    chord_style: str | None = None  # "nashville" or "letter"
    while cursor < len(lines):
        ln = lines[cursor]
        if not ln.strip():
            cursor += 1
            continue
        if is_nashville_row(ln):
            row = split_nashville_row(ln)
            if row:
                chord_rows.append(row)
                chord_style = chord_style or "nashville"
            cursor += 1
            continue
        if is_letter_chord_row(ln):
            row = split_letter_chord_row(ln)
            if row:
                chord_rows.append(row)
                chord_style = chord_style or "letter"
            cursor += 1
            continue
        break

    # Lyric block: everything from cursor to end of page
    lyric_lines: list[str] = []
    for ln in lines[cursor:]:
        s = ln.strip()
        if not s:
            if lyric_lines and lyric_lines[-1] != "":
                lyric_lines.append("")
            continue
        lyric_lines.append(s)
    while lyric_lines and not lyric_lines[-1]:
        lyric_lines.pop()

    sections: list[dict] = []
    current: list[str] = []
    for ln in lyric_lines:
        if ln == "":
            if current:
                sections.append({"type": "verse", "lines": current})
                current = []
        else:
            current.append(ln)
    if current:
        sections.append({"type": "verse", "lines": current})

    chord_sections: list[dict] = []
    if chord_rows:
        chord_sections.append({"name": "A Part", "rows": chord_rows})

    return {
        "title": matched_title,
        "sections": chord_sections,
        "lyrics": sections,
        "chord_style": chord_style,
    }


def merge_song_continuations(songs_with_pages: list[tuple[int, dict]]) -> list[dict]:
    """When a song's lyrics overflow onto a subsequent page that does NOT
    start with a known title, append those orphan lyrics onto the previous
    song. Caller filters to pages that began songs already, so this is just
    a no-op pass-through here. Continuation merging happens during the
    body walk in main()."""
    return [s for _, s in songs_with_pages]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    pages = pdf_full_layout(PDF_PATH)
    print(f"PDF has {len(pages)} pages", file=sys.stderr)

    known_titles = parse_toc_titles(pages)
    print(f"TOC yielded {len(known_titles)} unique titles", file=sys.stderr)

    with EXISTING_SONGS.open() as f:
        existing = json.load(f)
    existing_titles = {normalise_title(s["title"]) for s in existing["songs"]}

    # Walk pages, build (page_idx, parsed_song) pairs for every page that
    # begins a song. Pages between two song-starts are continuation pages
    # for the earlier song.
    page_songs: list[tuple[int, dict]] = []
    for i, page_text in enumerate(pages):
        # Pages are 1-indexed in pdftotext's view
        page_num = i + 1
        parsed = parse_page_song(page_text, known_titles)
        if parsed is not None:
            page_songs.append((page_num, parsed))

    # Merge orphan continuation pages into the prior song's lyrics
    final_songs: list[dict] = []
    for idx, (page, song) in enumerate(page_songs):
        end_page = page_songs[idx + 1][0] - 1 if idx + 1 < len(page_songs) else page
        if end_page > page:
            for cp in range(page + 1, end_page + 1):
                page_text = pages[cp - 1]
                # Only treat as continuation if the first non-blank line is
                # NOT itself a known song title (defensive).
                lines = page_text.splitlines()
                first_content = next((ln.strip() for ln in lines if ln.strip()), "")
                if looks_like_title(first_content, known_titles):
                    continue
                # Append the page's non-blank lines as additional verse(s)
                cont_lines: list[str] = []
                for ln in lines:
                    s = ln.strip()
                    if not s:
                        if cont_lines and cont_lines[-1] != "":
                            cont_lines.append("")
                        continue
                    if is_nashville_row(ln):
                        row = split_nashville_row(ln)
                        if row:
                            if not song["sections"]:
                                song["sections"].append({"name": "A Part", "rows": []})
                            song["sections"][0]["rows"].append(row)
                        continue
                    if is_letter_chord_row(ln):
                        row = split_letter_chord_row(ln)
                        if row:
                            if not song["sections"]:
                                song["sections"].append({"name": "A Part", "rows": []})
                            song["sections"][0]["rows"].append(row)
                        continue
                    cont_lines.append(s)
                # Group continuation lyrics into verses
                cur: list[str] = []
                for ln in cont_lines:
                    if ln == "":
                        if cur:
                            song["lyrics"].append({"type": "verse", "lines": cur})
                            cur = []
                    else:
                        cur.append(ln)
                if cur:
                    song["lyrics"].append({"type": "verse", "lines": cur})

        norm = normalise_title(song["title"])
        warnings: list[str] = []
        style = song.get("chord_style")
        if style == "letter":
            # Letter-chord source: key inferred from first chord, no Nashville mapping
            song_key = (
                song["sections"][0]["rows"][0][0]["root"]
                if song["sections"] and song["sections"][0]["rows"]
                else None
            )
        elif style == "nashville":
            warnings.append(
                "nashville-default-key: chord cells use C as the 1-degree "
                "reference; source PDF uses key-agnostic Nashville notation, so "
                "the canonical recording key is unspecified"
            )
            song_key = "C"
        else:
            warnings.append(
                "no-chord-rows: extraction found no chord rows for this song; "
                "review the source page and fill in manually"
            )
            song_key = None

        if norm in existing_titles:
            warnings.insert(
                0,
                "title-collision: an entry with this normalized title already "
                "exists in songs.json — review for arrangement/key differences"
            )

        final_songs.append({
            "slug": slugify(song["title"]),
            "title": song["title"],
            "key": song_key,
            "sections": song["sections"],
            "lyrics": song["lyrics"],
            "original_page": page,
            "_source": "folksociety-bluegrass-songbook-2018",
            "_warnings": warnings,
        })

    out = {"songs": final_songs}
    OUT_PATH.write_text(json.dumps(out, indent=2) + "\n")

    collisions = sum(
        1 for s in final_songs if any("title-collision" in w for w in s["_warnings"])
    )
    print(f"Wrote {len(final_songs)} songs to {OUT_PATH}", file=sys.stderr)
    print(f"Title collisions with existing data: {collisions}", file=sys.stderr)

    # Diagnostic: which TOC titles never matched a body page?
    extracted_norms = {normalise_title(s["title"]) for s in final_songs}
    missing = sorted(known_titles - extracted_norms)
    print(f"TOC titles not found in body: {len(missing)}", file=sys.stderr)
    for m in missing[:15]:
        print(f"  ? {m}", file=sys.stderr)
    if len(missing) > 15:
        print(f"  ... and {len(missing) - 15} more", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
