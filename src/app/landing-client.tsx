"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ChevronRight, Activity, ShieldCheck } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Photo Constantine en arrière-plan, fortement adoucie */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/constantine/sidi-mcid.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-(--color-background)/85 via-(--color-background)/90 to-(--color-background)" />
      </div>
      <div className="absolute inset-0 bg-dots opacity-30 -z-10" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-(--color-primary-50)/40 via-transparent to-transparent -z-10" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--color-primary-100) text-(--color-primary-700) text-xs font-medium mb-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-primary)" />
            Service universitaire — CHU Constantine
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight"
          >
            Service de
            <br />
            <span className="text-(--color-primary)">Toxicologie</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-lg text-(--color-muted-foreground) max-w-lg leading-relaxed"
          >
            Plateforme professionnelle de gestion des analyses toxicologiques —
            du prélèvement à la signature du rapport, traçabilité complète et
            workflow hiérarchique.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--color-primary) text-(--color-primary-foreground) font-medium hover:opacity-90 transition-all shadow-lg shadow-(--color-primary)/30 hover:shadow-xl hover:shadow-(--color-primary)/35 hover:-translate-y-0.5"
            >
              Accéder à l'espace
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#missions"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-(--color-border) text-(--color-foreground) hover:bg-(--color-accent) transition-colors"
            >
              Découvrir le service
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10 flex items-center gap-6 text-sm text-(--color-muted-foreground)"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-(--color-primary)" />5 unités spécialisées
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-(--color-primary)" />
              Validation hiérarchique
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}

export function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      {/* Carte centrale */}
      <div className="relative rounded-2xl bg-(--color-card) border border-(--color-border) shadow-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-(--color-border) flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="ml-3 text-[11px] font-mono text-(--color-muted-foreground)">
            tox.chu-constantine
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-(--color-muted-foreground)">N° rapport</p>
            <p className="font-mono font-semibold text-lg text-(--color-primary)">TOX-247</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-(--color-border)">
            <Stat label="Patients" value="142" />
            <Stat label="Analyses" value="389" />
            <Stat label="En attente" value="12" tone="warning" />
            <Stat label="Validées" value="377" tone="success" />
          </div>

          <div className="space-y-2">
            <Progress label="Pharmacodépendance" value={68} />
            <Progress label="Médico-légale" value={42} />
            <Progress label="Suivi thérapeutique" value={84} />
          </div>
        </div>
      </div>

      {/* Badges flottants */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute -left-4 top-10 px-3 py-2 rounded-xl bg-(--color-card) border border-(--color-border) shadow-lg flex items-center gap-2 text-sm"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Rapport validé
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -right-4 bottom-12 px-3 py-2 rounded-xl bg-(--color-card) border border-(--color-border) shadow-lg flex items-center gap-2 text-xs"
      >
        <span className="h-2 w-2 rounded-full bg-(--color-primary)" />
        <span>Workflow hiérarchique</span>
      </motion.div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning" | "success";
}) {
  const toneCls =
    tone === "warning"
      ? "text-amber-600"
      : tone === "success"
        ? "text-(--color-success)"
        : "text-(--color-foreground)";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-(--color-muted-foreground)">
        {label}
      </p>
      <p className={`text-2xl font-semibold tabular-nums ${toneCls}`}>{value}</p>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-(--color-muted-foreground)">{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-(--color-muted) rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-(--color-primary) to-(--color-primary-700)"
        />
      </div>
    </div>
  );
}
