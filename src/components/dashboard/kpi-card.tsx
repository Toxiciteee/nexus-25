"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  variant,
  icon,
  index = 0,
}: {
  label: string;
  value: number;
  variant: "outline" | "warning" | "success";
  icon?: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-(--color-muted-foreground)">{label}</p>
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
              <div className="text-(--color-muted-foreground)/40">{icon}</div>
            )}
          </div>
        </CardContent>
        {/* Subtle gradient accent */}
        <div
          className={`absolute inset-x-0 bottom-0 h-0.5 ${
            variant === "success"
              ? "bg-gradient-to-r from-emerald-400 to-teal-500"
              : variant === "warning"
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-slate-300 to-slate-400"
          }`}
        />
      </Card>
    </motion.div>
  );
}
