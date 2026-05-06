import Link from "next/link";
import {
  ShieldCheck,
  Microscope,
  ClipboardList,
  ChevronRight,
  Mail,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { LogoBadge } from "@/components/brand/logo";
import { LandingHero, FadeIn } from "./landing-client";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-(--color-background) text-(--color-foreground)">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-(--color-background)/80 border-b border-(--color-border)">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoBadge size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Service de Toxicologie</p>
              <p className="text-[11px] text-(--color-muted-foreground)">
                CHU Constantine
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#missions" className="text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors">
              Missions
            </a>
            <a href="#unites" className="text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors">
              Unités
            </a>
            <a href="#contact" className="text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors">
              Contact
            </a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-(--color-primary) text-(--color-primary-foreground) text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Connexion
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <LandingHero />

      {/* MISSIONS */}
      <section id="missions" className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-primary)/80 font-medium mb-3">
              Nos missions
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 max-w-2xl">
              Une expertise toxicologique au service du diagnostic et de la justice.
            </h2>
            <p className="text-(--color-muted-foreground) max-w-2xl">
              Le Service de Toxicologie du CHU Constantine intervient dans
              l'identification, le dosage et l'interprétation des substances
              toxiques pour la prise en charge clinique, le suivi thérapeutique
              et l'expertise médico-légale.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            <MissionCard
              icon={<Microscope className="h-5 w-5" />}
              title="Analyses cliniques"
              description="Identification et dosage des substances toxiques dans les milieux biologiques."
              delay={0}
            />
            <MissionCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Expertise médico-légale"
              description="Rapports d'expertise rigoureux pour les enquêtes et procédures judiciaires."
              delay={0.05}
            />
            <MissionCard
              icon={<Stethoscope className="h-5 w-5" />}
              title="Suivi thérapeutique"
              description="Optimisation des traitements par dosage des concentrations sanguines."
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* UNITÉS */}
      <section id="unites" className="py-20 px-6 lg:px-8 bg-(--color-primary-50)/40">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-primary)/80 font-medium mb-3">
              Cinq unités spécialisées
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 max-w-2xl">
              Un service organisé en pôles d'expertise complémentaires.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {UNITES.map((u, i) => (
              <UniteCard key={u.code} unite={u} delay={i * 0.04} />
            ))}
          </div>
        </div>
      </section>

      {/* CONSTANTINE */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-primary)/80 font-medium mb-3">
              Constantine — la ville aux ponts suspendus
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Au cœur du CHU Dr Benbadis.
            </h2>
            <p className="text-(--color-muted-foreground) leading-relaxed">
              Le Service de Toxicologie est rattaché au Centre Hospitalier
              Universitaire de Constantine, établissement de référence pour
              l'Est algérien. Implanté dans la ville historique des ponts, il
              accueille les demandes d'analyse provenant des hôpitaux,
              dispensaires et instances judiciaires de la région.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-(--color-muted-foreground)">
              <MapPin className="h-4 w-4" />
              CHU de Constantine — Algérie
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-(--color-border)">
              {/* Illustration vectorielle stylisée de Constantine (ponts suspendus) */}
              <ConstantineIllustration />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA + footer */}
      <section id="contact" className="py-16 px-6 lg:px-8 border-t border-(--color-border)">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
              Espace professionnel
            </h2>
            <p className="text-(--color-muted-foreground) mb-8 max-w-xl mx-auto">
              L'accès à l'application est réservé au personnel du Service de
              Toxicologie. Connectez-vous avec votre adresse e-mail
              professionnelle.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--color-primary) text-(--color-primary-foreground) font-medium hover:opacity-90 transition-all shadow-lg shadow-(--color-primary)/30"
            >
              Accéder à l'espace
              <ChevronRight className="h-5 w-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-(--color-border) py-6 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-(--color-muted-foreground)">
          <div className="flex items-center gap-2">
            <LogoBadge size="sm" />
            <span>Service de Toxicologie · CHU Constantine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span>Cheffe du service : Pr. Sabah Benboudiaf</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MissionCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="group relative h-full p-6 rounded-2xl bg-(--color-card) border border-(--color-border) hover:border-(--color-primary)/40 hover:shadow-md transition-all">
        <div className="h-10 w-10 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-(--color-foreground) mb-2">{title}</h3>
        <p className="text-sm text-(--color-muted-foreground) leading-relaxed">
          {description}
        </p>
      </div>
    </FadeIn>
  );
}

const UNITES = [
  { code: "URG", nom: "Urgences toxicologiques", desc: "Intoxications aiguës" },
  { code: "MEDLEG", nom: "Médico-légale", desc: "Expertises judiciaires" },
  { code: "PHARMA", nom: "Pharmacodépendance", desc: "Substances psycho-actives" },
  { code: "SUIVI", nom: "Suivi thérapeutique", desc: "Dosage des médicaments" },
  { code: "COSM", nom: "Contrôle cosmétiques", desc: "Sécurité produits" },
];

function UniteCard({
  unite,
  delay,
}: {
  unite: { code: string; nom: string; desc: string };
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="group p-5 rounded-xl bg-(--color-card) border border-(--color-border) hover:border-(--color-primary)/40 hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 rounded-md bg-(--color-primary)/10 text-(--color-primary) text-xs font-mono font-semibold">
            {unite.code}
          </span>
        </div>
        <h3 className="font-semibold text-(--color-foreground)">{unite.nom}</h3>
        <p className="text-sm text-(--color-muted-foreground) mt-1">
          {unite.desc}
        </p>
      </div>
    </FadeIn>
  );
}

function ConstantineIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustration stylisée de Constantine"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f1e6" />
          <stop offset="1" stopColor="#e9e5d2" />
        </linearGradient>
        <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8a07a" />
          <stop offset="1" stopColor="#7d7556" />
        </linearGradient>
        <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa86a" />
          <stop offset="1" stopColor="#7e8a4f" />
        </linearGradient>
      </defs>

      {/* Ciel */}
      <rect width="400" height="300" fill="url(#sky)" />

      {/* Soleil pâle */}
      <circle cx="320" cy="60" r="34" fill="#f1e9c8" opacity="0.8" />

      {/* Collines lointaines */}
      <path
        d="M0 195 Q 80 155 160 175 T 320 165 T 400 180 L 400 300 L 0 300 Z"
        fill="url(#hills)"
        opacity="0.55"
      />
      <path
        d="M0 215 Q 90 180 200 195 T 400 200 L 400 300 L 0 300 Z"
        fill="url(#hills)"
        opacity="0.75"
      />

      {/* Falaises du Rhumel + Pont Sidi M'Cid */}
      <path
        d="M40 240 L 40 155 L 95 155 L 95 240 Z"
        fill="url(#rock)"
      />
      <path
        d="M280 240 L 280 165 L 360 165 L 360 240 Z"
        fill="url(#rock)"
      />
      {/* Le pont (câbles + tablier) */}
      <line x1="60" y1="100" x2="340" y2="100" stroke="#5e6b4a" strokeWidth="2.5" />
      <line x1="95" y1="155" x2="280" y2="165" stroke="#43533c" strokeWidth="3" />
      {/* Pylônes */}
      <line x1="95" y1="100" x2="95" y2="155" stroke="#43533c" strokeWidth="3" />
      <line x1="280" y1="100" x2="280" y2="165" stroke="#43533c" strokeWidth="3" />
      {/* Câbles suspendus */}
      <path
        d="M95 100 Q 187 145 280 100"
        fill="none"
        stroke="#43533c"
        strokeWidth="1.5"
      />
      {[120, 150, 180, 210, 240, 270].map((x) => (
        <line
          key={x}
          x1={x}
          y1={100 + Math.sin(((x - 95) / 185) * Math.PI) * 35}
          x2={x}
          y2="160"
          stroke="#43533c"
          strokeWidth="0.8"
        />
      ))}

      {/* Bâtiments stylisés */}
      <rect x="50" y="135" width="12" height="20" fill="#d4cba8" />
      <rect x="65" y="125" width="14" height="30" fill="#bfb692" />
      <rect x="83" y="140" width="10" height="15" fill="#d4cba8" />
      <rect x="290" y="145" width="14" height="20" fill="#d4cba8" />
      <rect x="308" y="135" width="16" height="30" fill="#bfb692" />
      <rect x="328" y="148" width="12" height="17" fill="#d4cba8" />
    </svg>
  );
}
