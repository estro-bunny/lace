interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
}

export default function MaterialIcon({
  name,
  className = "",
  filled,
  "aria-hidden": ariaHidden,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden={ariaHidden ?? "true"}
    >
      {name}
    </span>
  );
}
