"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  variant,
  icon,
  href,
  index = 0,
}: {
  label: string;
  value: number;
  variant: "outline" | "warning" | "success";
  icon?: ReactNode;
  href: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Link href={href} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) rounded-lg">
        <Card className="relative overflow-hidden transition-shadow group-hover:shadow-md cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-(--color-muted-foreground) flex items-center gap-1.5">
                  {label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-(--color-primary)" />
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <motion.span
                    className="text-3xl font-semibold tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.15 }}
                  >
                    {value}
                  </motion.span>
                  <Badge variant={variant} className="text-[10px]">
                    {variant === "success"
                      ? "OK"
                      : variant === "warning"
                        ? "À traiter"
                        : "Draft"}
                  </Badge>
                </div>
              </div>
              {icon && (
                <div className="text-(--color-muted-foreground)/40 group-hover:text-(--color-primary)/60 transition-colors">
                  {icon}
                </div>
              )}
            </div>
          </CardContent>
          <div
            className={`absolute inset-x-0 bottom-0 h-0.5 transition-all group-hover:h-1 ${
              variant === "success"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                : variant === "warning"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gradient-to-r from-slate-300 to-slate-400"
            }`}
          />
        </Card>
      </Link>
    </motion.div>
  );
}
