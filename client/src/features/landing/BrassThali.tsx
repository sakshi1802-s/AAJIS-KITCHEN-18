/**
 * An empty brass thali, drawn rather than photographed.
 *
 * The reference photo's plate is covered in food and cropped at the rim, so
 * there was no empty plate in it to lift out. Drawing one gives a genuinely
 * empty plate, at any size, for no download — and the brass is sampled from
 * that photo, so it sits on the same table as everything else.
 */
export function BrassThali({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="An empty brass thali">
      <defs>
        {/* Light falls from the top left, the way it does in the photograph. */}
        <radialGradient id="thali-rim" cx="36%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#f0cd8a" />
          <stop offset="38%" stopColor="#cf9a45" />
          <stop offset="72%" stopColor="#a5702a" />
          <stop offset="100%" stopColor="#6e4718" />
        </radialGradient>

        {/*
          The well is lit from the OPPOSITE side to the rim. A dish lit from
          the same side as its rim reads as a dome; put the bright part on the
          far inner wall and the eye sees a hollow.
        */}
        <radialGradient id="thali-well" cx="64%" cy="74%" r="82%">
          <stop offset="0%" stopColor="#dcae62" />
          <stop offset="40%" stopColor="#b17c33" />
          <stop offset="78%" stopColor="#82551e" />
          <stop offset="100%" stopColor="#5b3a12" />
        </radialGradient>

        <linearGradient id="thali-sheen" x1="18%" y1="8%" x2="74%" y2="86%">
          <stop offset="0%" stopColor="#fff3d4" stopOpacity="0.75" />
          <stop offset="34%" stopColor="#fff3d4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fff3d4" stopOpacity="0" />
        </linearGradient>

        {/* Both of these fade out rather than stopping, so nothing shows an
            end: a stroked arc leaves visible caps on a circle this big. */}
        <linearGradient id="thali-innerwall" x1="8%" y1="14%" x2="78%" y2="88%">
          <stop offset="0%" stopColor="#3b270c" stopOpacity="0.6" />
          <stop offset="46%" stopColor="#3b270c" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3b270c" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="thali-lip" x1="12%" y1="10%" x2="82%" y2="84%">
          <stop offset="0%" stopColor="#fff2d6" stopOpacity="0.9" />
          <stop offset="38%" stopColor="#fff2d6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fff2d6" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="thali-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1b0f05" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1b0f05" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* What it casts on the table. */}
      <ellipse cx="204" cy="352" rx="176" ry="30" fill="url(#thali-shadow)" />

      {/* The rim, then the well sunk into it. */}
      <circle cx="200" cy="196" r="188" fill="url(#thali-rim)" />
      <circle cx="200" cy="196" r="188" fill="none" stroke="#4e310f" strokeOpacity="0.65" strokeWidth="2.5" />
      {/* Where the rim turns down into the well. */}
      <circle cx="200" cy="196" r="154" fill="none" stroke="url(#thali-lip)" strokeWidth="3.5" />
      <circle cx="200" cy="196" r="150" fill="url(#thali-well)" />
      {/* The near inner wall in shadow, which is what makes it look hollow. */}
      <circle cx="200" cy="196" r="150" fill="url(#thali-innerwall)" />

      {/* The beaten rings a thali picks up from the lathe. */}
      <circle cx="200" cy="196" r="128" fill="none" stroke="#e0b46a" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="200" cy="196" r="100" fill="none" stroke="#e0b46a" strokeOpacity="0.16" strokeWidth="1.5" />
      <circle cx="200" cy="196" r="68" fill="none" stroke="#e0b46a" strokeOpacity="0.13" strokeWidth="1.5" />

      {/* A bright lip around the rim, brightest where the light lands. */}
      <circle cx="200" cy="196" r="172" fill="none" stroke="url(#thali-lip)" strokeWidth="7" />
      {/* One long sheen over the whole thing, last so it crosses both. */}
      <circle cx="200" cy="196" r="188" fill="url(#thali-sheen)" />
    </svg>
  );
}
