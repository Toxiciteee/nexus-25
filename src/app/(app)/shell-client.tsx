"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-(--color-primary)/10 text-(--color-primary) font-medium"
          : "text-(--color-foreground) hover:bg-(--color-accent)",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-(--color-primary) rounded-r"
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      )}
      <span
        className={cn(
          active ? "text-(--color-primary)" : "text-(--color-muted-foreground)",
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
