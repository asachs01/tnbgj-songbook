import Link from "next/link";

export default function HowToReadPage() {
  return (
    <article>
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
        &larr; All songs
      </Link>
      <h1 className="font-serif text-4xl mt-3 mb-6">
        How to Read the Chord Charts
      </h1>

      <p className="text-stone-700 leading-relaxed mb-8">
        If you&rsquo;ve ever sat in a jam circle and wished someone would just
        tell you <em>when</em> to change chords, that&rsquo;s exactly what these
        charts do. No sheet music, no tab &mdash; just a simple grid that shows
        you which chord to play and when.
      </p>

      {/* --- THE GRID --- */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl mb-3">What the grid looks like</h2>
        <p className="text-stone-700 leading-relaxed mb-4">
          Every song has one or more <strong>sections</strong> (Verse, Chorus,
          Break, A&nbsp;Part, B&nbsp;Part, etc.). Inside each section you&rsquo;ll
          see a table. Each <strong>row</strong> is a line of music &mdash;
          roughly one phrase of the song. Each <strong>cell</strong> in that row
          is one beat-group (typically one or two beats of a measure). Read left
          to right, top to bottom, just like reading a sentence.
        </p>
        <p className="text-stone-700 leading-relaxed mb-4">
          Here&rsquo;s the Verse section for{" "}
          <Link
            href="/songs/will-the-circle-be-unbroken"
            className="underline text-stone-900 hover:text-stone-600"
          >
            Will the Circle Be Unbroken
          </Link>{" "}
          (key of G):
        </p>

        {/* Static example grid */}
        <div className="mb-4">
          <h3 className="font-serif text-lg text-stone-600 mb-2">Verse</h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                {["G", "G", "G", "G", "G", "G", "G", "G"].map((c, i) => (
                  <td
                    key={i}
                    className="border border-stone-300 px-3 py-2 text-center font-serif"
                  >
                    {c}
                  </td>
                ))}
              </tr>
              <tr>
                {["C", "C", "C", "C", "G", "G", "G", "G"].map((c, i) => (
                  <td
                    key={i}
                    className="border border-stone-300 px-3 py-2 text-center font-serif"
                  >
                    {c}
                  </td>
                ))}
              </tr>
              <tr>
                {["G", "G", "G", "G", "G", "G", "G", "G"].map((c, i) => (
                  <td
                    key={i}
                    className="border border-stone-300 px-3 py-2 text-center font-serif"
                  >
                    {c}
                  </td>
                ))}
              </tr>
              <tr>
                {["G", "G", "D", "D", "G", "G", "G", "G"].map((c, i) => (
                  <td
                    key={i}
                    className="border border-stone-300 px-3 py-2 text-center font-serif"
                  >
                    {c}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-stone-700 leading-relaxed mb-2">
          Reading it aloud: &ldquo;Stay on G for the whole first line. Second
          line, start on C for four beats then back to G. Third line is all G
          again. Fourth line &mdash; G, G, then switch to D for two beats and
          come home to G.&rdquo; That&rsquo;s the whole verse.
        </p>
      </section>

      {/* --- SECTIONS --- */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl mb-3">Sections</h2>
        <p className="text-stone-700 leading-relaxed mb-4">
          Each labeled section maps to a part of the song:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-stone-700 mb-4">
          <li>
            <strong>Verse</strong> &mdash; the part with lyrics that change each
            time through.
          </li>
          <li>
            <strong>Chorus</strong> &mdash; the repeated part everyone sings
            together.
          </li>
          <li>
            <strong>Break</strong> &mdash; an instrumental solo section (same
            chords, no singing).
          </li>
          <li>
            <strong>A Part / B Part</strong> &mdash; common in fiddle tunes and
            instrumentals. The A&nbsp;Part is usually the main melody; the
            B&nbsp;Part is the contrasting section. You play A twice, then B
            twice (AABB), and repeat.
          </li>
        </ul>
        <p className="text-stone-700 leading-relaxed">
          If a song has the same chords for the verse and chorus (many do), you
          may see only one section. Use the lyrics to know where you are.
        </p>
      </section>

      {/* --- CHORD NOTATION --- */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl mb-3">Reading chord names</h2>
        <p className="text-stone-700 leading-relaxed mb-4">
          Most of the time you&rsquo;ll see plain letter names you already
          know &mdash; G, C, D, A, E. Here&rsquo;s how to read the fancier
          ones:
        </p>
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-stone-100">
              <th className="border border-stone-300 px-3 py-2 text-left font-serif">
                You see
              </th>
              <th className="border border-stone-300 px-3 py-2 text-left font-serif">
                It means
              </th>
              <th className="border border-stone-300 px-3 py-2 text-left font-serif">
                Plain English
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["G", "G major", "Just a regular G chord"],
              ["Am", "A minor", "A minor — the sad-sounding A chord"],
              ["D7", "D dominant 7th", "D with a bluesy extra note (add your pinky)"],
              ["Em7", "E minor 7th", "E minor with one more note stacked on"],
              [
                "G/B",
                "G over B",
                "G chord, but put a B note in the bass (low string)",
              ],
              ["Bdim", "B diminished", "A tense, spooky-sounding chord — rare in bluegrass"],
              ["Gsus4", "G suspended 4th", "G but hold the C note instead of B — it wants to resolve"],
            ].map(([name, full, desc], i) => (
              <tr key={i}>
                <td className="border border-stone-300 px-3 py-2 font-serif font-semibold">
                  {name}
                </td>
                <td className="border border-stone-300 px-3 py-2 text-stone-700">
                  {full}
                </td>
                <td className="border border-stone-300 px-3 py-2 text-stone-600">
                  {desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-stone-600 text-sm leading-relaxed">
          If you don&rsquo;t know a chord shape, don&rsquo;t panic. In a jam,
          playing the root note alone will keep you in the game until you can
          look it up later.
        </p>
      </section>

      {/* --- QUALITY --- */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl mb-3">
          What &ldquo;quality&rdquo; means
        </h2>
        <p className="text-stone-700 leading-relaxed mb-4">
          In the underlying data, every chord has a <em>root</em> (the letter
          name, like G or A) and a <em>quality</em> (what flavor of chord it
          is). Quality is just a music-theory word for the chord&rsquo;s
          personality:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-stone-700">
          <li>
            <strong>Major</strong> &mdash; bright, happy, resolved. The default.
            When you see just &ldquo;G&rdquo; with no suffix, it&rsquo;s major.
          </li>
          <li>
            <strong>Minor</strong> &mdash; darker, sadder. Written with a
            lowercase &ldquo;m&rdquo; after the letter (Am, Em).
          </li>
          <li>
            <strong>Dominant 7th</strong> &mdash; adds a bluesy tension. Written
            with just a &ldquo;7&rdquo; (D7, G7). Wants to pull you to the next
            chord.
          </li>
          <li>
            <strong>Minor 7th</strong> &mdash; minor plus that seventh note.
            Written &ldquo;m7&rdquo; (Em7, Am7).
          </li>
          <li>
            <strong>Major 7th</strong> &mdash; dreamy, jazzy. Written
            &ldquo;maj7&rdquo;. Rare in straight bluegrass.
          </li>
          <li>
            <strong>Diminished / Augmented</strong> &mdash; unusual colors.
            You&rsquo;ll barely see these in this book.
          </li>
        </ul>
      </section>

      {/* --- JAM TIPS --- */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl mb-3">Tips for the jam circle</h2>
        <ul className="list-disc pl-6 space-y-3 text-stone-700">
          <li>
            <strong>Glance at the grid before the song starts.</strong> Count
            how many different chords there are. Most bluegrass songs use three
            or four. Find the pattern &mdash; the changes almost always happen
            in the same spots each verse.
          </li>
          <li>
            <strong>Use the lyrics to track where you are.</strong> The chord
            grid and lyrics line up section by section. If you lose your place in
            the grid, listen for the words.
          </li>
          <li>
            <strong>Watch the guitar player&rsquo;s left hand.</strong> Even if
            you can&rsquo;t read the chart in real time, the guitar
            player&rsquo;s chord hand will telegraph every change.
          </li>
          <li>
            <strong>When in doubt, lay out.</strong> If you hit a chord you
            don&rsquo;t know, just mute for a beat and come back in on the next
            one you do know. Nobody will notice.
          </li>
          <li>
            <strong>Breaks use the same chords.</strong> When someone takes a
            solo, they&rsquo;re playing over the same chord progression as the
            verse (or chorus). Keep chugging along.
          </li>
          <li>
            <strong>Repetition is your friend.</strong> After two times through
            a song, you probably won&rsquo;t need the chart anymore. That&rsquo;s
            the whole point.
          </li>
        </ul>
      </section>

      <p className="text-stone-500 text-sm mt-8 border-t border-stone-200 pt-6">
        Questions? Grab the person next to you at the jam &mdash; bluegrass
        pickers love to help.{" "}
        <Link href="/notes" className="underline hover:text-stone-800">
          Known data issues
        </Link>{" "}
        are documented separately.
      </p>
    </article>
  );
}
