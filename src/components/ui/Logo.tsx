import Link from "next/link";
import Image from "next/image";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const iconSizes = {
    sm: 24,
    md: 36,
    lg: 56,
  };

  return (
    <Link href="/" className="no-underline flex items-center gap-2 group">
      <div className="relative animate-breathe">
        <div className="absolute inset-0 rounded-full bg-chaos-pink/25 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Image
          src="/logo.png"
          alt="Lace"
          width={iconSizes[size]}
          height={iconSizes[size]}
          className="object-contain relative z-10"
          priority
        />
      </div>
      <span
        className={`${sizeClasses[size]} font-[600] tracking-tighter font-[var(--font-headline)] gradient-text-shimmer`}
      >
        Lace
      </span>
    </Link>
  );
}
