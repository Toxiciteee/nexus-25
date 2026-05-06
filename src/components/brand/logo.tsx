import { cn } from "@/lib/utils";

/**
 * Logo Service de Toxicologie — tête de mort stylisée (toxique/danger),
 * ronde et lisse pour rester professionnelle et non morbide.
 */
export function LogoMark({
  className,
  variant = "primary",
}: {
  className?: string;
  variant?: "primary" | "white" | "outline";
}) {
  const stroke =
    variant === "white"
      ? "#ffffff"
      : variant === "outline"
        ? "currentColor"
        : "#ffffff";
  const fill =
    variant === "white"
      ? "rgba(255,255,255,0.18)"
      : variant === "outline"
        ? "transparent"
        : "rgba(255,255,255,0.16)";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      {/* Crâne — calotte arrondie */}
      <path
        d="M16 4c-5.5 0-10 4-10 9.5 0 3 1.4 5.6 3.6 7.3v3.2c0 1.1.9 2 2 2H12v-2.5h1.5V26h2v-2.5h1V26h2v-2.5h1.5V26h.4c1.1 0 2-.9 2-2v-3.2c2.2-1.7 3.6-4.3 3.6-7.3C26 8 21.5 4 16 4z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Œil gauche */}
      <ellipse cx="11.8" cy="14.2" rx="2.4" ry="2.6" fill={stroke} />
      {/* Œil droit */}
      <ellipse cx="20.2" cy="14.2" rx="2.4" ry="2.6" fill={stroke} />
      {/* Nez (triangle inversé) */}
      <path
        d="M16 17.4 L14.6 19.6 L17.4 19.6 Z"
        fill={stroke}
        opacity="0.85"
      />
      {/* Sourire dentures (3 traits courts) */}
      <path
        d="M13.5 22 L13.5 23.4 M16 22 L16 23.4 M18.5 22 L18.5 23.4"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

export function LogoBadge({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-11 w-11";
  const radius = size === "sm" ? "rounded-lg" : "rounded-2xl";
  return (
    <div
      className={cn(
        dim,
        radius,
        "bg-gradient-to-br from-(--color-primary) to-(--color-primary-700) text-white",
        "flex items-center justify-center shadow-lg shadow-(--color-primary)/25",
        "ring-1 ring-white/30",
        className,
      )}
    >
      <LogoMark className="p-1.5" />
    </div>
  );
}
