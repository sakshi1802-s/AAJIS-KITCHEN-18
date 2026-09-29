/**
 * An empty copper thali, drawn rather than photographed.
 *
 * The plate in the reference photo is covered in food and cropped at the rim,
 * so there was no empty plate in it to lift out. This is drawn instead, but
 * the copper is sampled from that photo — highlight #d1b998, mid #8e6a2a,
 * shadow #442708 — so it is the same metal on the same table.
 *
 * Two things make it read as a dish and not a coin: the well is lit from the
 * side opposite the rim, because a hollow catches its light on the far wall;
 * and the highlights are gradients, not stroked arcs, which would show their
 * own ends on a circle this big.
 */

/** Petals around the rim, the way a puja thali is beaten. */
const PETALS = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
/** A finer ring of beads inside them. */
const BEADS = Array.from({ length: 48 }, (_, i) => (i * 360) / 48);

export function CopperThali({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <defs>
        {/* Light falls from the top left, the way it does in the photograph. */}
        <radialGradient id="cu-rim" cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#e8cfa8" />
          <stop offset="30%" stopColor="#c08a3e" />
          <stop offset="64%" stopColor="#8e6a2a" />
          <stop offset="100%" stopColor="#442708" />
        </radialGradient>

        {/* The far wall of the hollow, so the light sits opposite the rim's. */}
        <radialGradient id="cu-well" cx="66%" cy="76%" r="84%">
          <stop offset="0%" stopColor="#d1b998" />
          <stop offset="34%" stopColor="#a8792f" />
          <stop offset="74%" stopColor="#6d4a17" />
          <stop offset="100%" stopColor="#3d2207" />
        </radialGradient>

        <linearGradient id="cu-lip" x1="10%" y1="8%" x2="84%" y2="86%">
          <stop offset="0%" stopColor="#ffeecb" stopOpacity="0.92" />
          <stop offset="36%" stopColor="#ffeecb" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#ffeecb" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="cu-wall" x1="8%" y1="12%" x2="80%" y2="88%">
          <stop offset="0%" stopColor="#331d06" stopOpacity="0.62" />
          <stop offset="44%" stopColor="#331d06" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#331d06" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="cu-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#170c03" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#170c03" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* What it casts on the table. */}
      <ellipse cx="204" cy="356" rx="180" ry="30" fill="url(#cu-shadow)" />

      {/* The rim. */}
      <circle cx="200" cy="200" r="190" fill="url(#cu-rim)" />
      <circle cx="200" cy="200" r="190" fill="none" stroke="#2e1a05" strokeOpacity="0.7" strokeWidth="2.5" />

      {/* Beaten into the rim: petals, then beads. Cut as dark lines with a
          light edge under them, the way an engraving catches light — a pale
          fill would disappear against the bright side of the rim. */}
      <g fill="none" strokeWidth="2.2">
        {PETALS.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 200 200)`}>
            <ellipse cx="200" cy="33" rx="7.5" ry="14" stroke="#f3dcb4" strokeOpacity="0.3" />
            <ellipse cx="200" cy="31" rx="7.5" ry="14" stroke="#331d05" strokeOpacity="0.5" />
          </g>
        ))}
      </g>
      <g fill="#331d05" fillOpacity="0.42">
        {BEADS.map((deg) => (
          <circle key={deg} cx="200" cy="60" r="2.6" transform={`rotate(${deg} 200 200)`} />
        ))}
      </g>
      <circle cx="200" cy="200" r="170" fill="none" stroke="#331d05" strokeOpacity="0.4" strokeWidth="1.5" />

      {/* The well sunk into it. */}
      <circle cx="200" cy="200" r="150" fill="none" stroke="url(#cu-lip)" strokeWidth="4" />
      <circle cx="200" cy="200" r="146" fill="url(#cu-well)" />
      <circle cx="200" cy="200" r="146" fill="url(#cu-wall)" />

      {/* The rings it picks up off the lathe. */}
      <circle cx="200" cy="200" r="128" fill="none" stroke="#e8cfa8" strokeOpacity="0.16" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="100" fill="none" stroke="#e8cfa8" strokeOpacity="0.13" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="70" fill="none" stroke="#e8cfa8" strokeOpacity="0.1" strokeWidth="1.5" />

      {/* A bright lip around the rim, brightest where the light lands. */}
      <circle cx="200" cy="200" r="186" fill="none" stroke="url(#cu-lip)" strokeWidth="6" />
    </svg>
  );
}
