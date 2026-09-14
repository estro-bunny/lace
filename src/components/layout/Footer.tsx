export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-12 px-8 border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <span className="text-lg font-black font-headline gradient-text-shimmer">
          Lace
        </span>
        <p className="text-on-surface-variant text-sm text-center max-w-md">
          Your safeword is always one tap away. Consent is not optional. 🐇💗
        </p>
        <p className="text-on-surface-variant/60 text-xs">
          All data stays on your device. No accounts. No cloud. No tracking.
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-on-surface-variant/40">
          <span>Made with 🐇💗 by EstroBunny_xo</span>
          <span>·</span>
          <span>🏳️‍⚧️ still here ™</span>
        </div>
      </div>
    </footer>
  );
}
