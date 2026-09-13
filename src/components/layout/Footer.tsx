export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-12 px-8 border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <span className="text-lg font-black font-headline bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
          Lace
        </span>
        <p className="text-on-surface-variant text-sm text-center max-w-md">
          Your safeword is always one tap away. Consent is not optional.
        </p>
        <p className="text-on-surface-variant/60 text-xs">
          All data stays on your device. No accounts. No cloud. No tracking.
        </p>
      </div>
    </footer>
  );
}
