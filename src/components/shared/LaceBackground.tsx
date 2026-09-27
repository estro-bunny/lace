/**
 * The drawn lattice background: stroked thread and negative space, not a
 * blurred gradient orb. Its opacity and "heat" (the lit thread color) are
 * driven by CSS variables that other components set as intensity changes.
 */
export function LaceBackground() {
  return (
    <>
      <div className="lace-bloom" />
      <div className="lace-lattice">
        <svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 840" aria-hidden="true">
          <defs>
            <pattern id="weave" width="68" height="68" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
              <g className="weave" fill="none" strokeWidth="1">
                <path d="M34 2C48 12 48 24 34 34C20 24 20 12 34 2Z" />
                <path d="M34 34C48 44 48 56 34 66C20 56 20 44 34 34Z" />
                <path d="M2 34C12 20 24 20 34 34C24 48 12 48 2 34Z" />
                <path d="M34 34C44 20 56 20 66 34C56 48 44 48 34 34Z" />
                <circle cx="34" cy="34" r="3.2" />
                <circle cx="0" cy="0" r="2" />
                <circle cx="68" cy="0" r="2" />
                <circle cx="0" cy="68" r="2" />
                <circle cx="68" cy="68" r="2" />
              </g>
            </pattern>
            <pattern id="heatp" width="68" height="68" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
              <g className="heat" fill="none" strokeWidth="1.1">
                <path d="M34 2C48 12 48 24 34 34C20 24 20 12 34 2Z" />
                <path d="M2 34C12 20 24 20 34 34C24 48 12 48 2 34Z" />
              </g>
            </pattern>
            <radialGradient id="fo" cx="50%" cy="34%" r="74%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="60%" stopColor="#fff" stopOpacity=".5" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="mk">
              <rect width="400" height="840" fill="url(#fo)" />
            </mask>
          </defs>
          <rect width="400" height="840" fill="url(#weave)" mask="url(#mk)" />
          <rect width="400" height="840" fill="url(#heatp)" mask="url(#mk)" />
        </svg>
      </div>
    </>
  );
}
