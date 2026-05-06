import { cn } from "@/lib/utils";

/**
 * Logo du Service de Toxicologie — flacon labo stylisé + goutte d'analyse.
 * SVG inline, sans dépendance externe, parfaitement net à toutes les tailles.
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
      ? "rgba(255,255,255,0.15)"
      : variant === "outline"
        ? "transparent"
        : "rgba(255,255,255,0.18)";
  const drop =
    variant === "white" ? "#ffffff" : variant === "outline" ? "currentColor" : "#7dd3fc";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      {/* Flacon (goulot + corps) */}
      <path
        d="M12 4h8M13 4v6.2L7.6 21.2A3 3 0 0 0 10.3 25.5h11.4a3 3 0 0 0 2.7-4.3L19 10.2V4"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      {/* Liquide */}
      <path
        d="M9.4 18h13.2"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Goutte d'analyse */}
      <circle cx="16" cy="21" r="1.6" fill={drop} />
      <circle cx="13.5" cy="22.8" r="0.9" fill={drop} opacity="0.7" />
      <circle cx="18.8" cy="22.6" r="0.7" fill={drop} opacity="0.6" />
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
        "bg-gradient-to-br from-(--color-primary) to-sky-500 text-white",
        "flex items-center justify-center shadow-lg shadow-sky-500/20",
        "ring-1 ring-white/30",
        className,
      )}
    >
      <LogoMark className="p-1.5" />
    </div>
  );
}
