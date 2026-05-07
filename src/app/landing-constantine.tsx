"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";

/**
 * Section Constantine — galerie photo mosaïque + texte de présentation.
 *
 * Photos attendues dans /public/constantine/ :
 *   - sidi-rached.jpg     (vue panoramique du pont Sidi Rached / aqueduc)
 *   - sidi-mcid.jpg       (pont suspendu Sidi M'Cid + Médersa)
 *   - rocher.jpg          (vieille ville perchée sur le rocher)
 *   - viaduc.jpg          (viaduc en pierre vu du bas)
 *   - statue.jpg          (statue romaine — Cirta)
 *   - rhumel.jpg          (gorges du Rhumel + pont en arc)
 */
export function ConstantineShowcase() {
  return (
    <section className="py-20 px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-primary)/80 font-medium mb-3">
              Constantine — la ville des ponts suspendus
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Au cœur du CHU&nbsp;Dr&nbsp;Benbadis.
            </h2>
            <p className="text-(--color-muted-foreground) leading-relaxed">
              Le Service de Toxicologie est rattaché au Centre Hospitalier
              Universitaire de Constantine, établissement de référence pour
              l'Est&nbsp;algérien. Implanté dans la ville historique des ponts,
              il accueille les demandes d'analyse provenant des hôpitaux,
              dispensaires et instances judiciaires de la région.
            </p>
            <p className="text-(--color-muted-foreground) leading-relaxed mt-3">
              Cirta antique, capitale numide, perchée sur son rocher au-dessus
              des gorges du&nbsp;Rhumel — Constantine porte l'héritage de plus
              de deux millénaires d'histoire et de savoir.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-(--color-muted-foreground) px-3 py-1.5 rounded-full bg-(--color-primary-50) border border-(--color-primary)/15">
              <MapPin className="h-4 w-4 text-(--color-primary)" />
              CHU de Constantine — Algérie
            </div>
          </motion.div>

          {/* Photo principale — Sidi Rached */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-(--color-border)"
          >
            <Image
              src="/constantine/sidi-rached.jpg"
              alt="Pont Sidi Rached à Constantine, vu depuis les gorges du Rhumel"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
            <figcaption className="absolute bottom-3 left-4 text-white text-xs font-medium drop-shadow-md">
              Pont Sidi Rached
            </figcaption>
          </motion.figure>
        </div>

        {/* Mosaïque de 5 photos — disposition asymétrique */}
        <div className="grid grid-cols-12 gap-3 md:gap-4 mt-8">
          <PhotoTile
            src="/constantine/sidi-mcid.jpg"
            alt="Pont suspendu Sidi M'Cid avec la Médersa au second plan"
            caption="Sidi M'Cid"
            className="col-span-12 md:col-span-7 aspect-[16/10]"
            delay={0}
          />
          <PhotoTile
            src="/constantine/statue.jpg"
            alt="Statue de Constantine I — héritage de Cirta"
            caption="Cirta antique"
            className="col-span-6 md:col-span-5 aspect-[4/5]"
            delay={0.05}
            objectPosition="object-[70%_30%]"
          />
          <PhotoTile
            src="/constantine/rocher.jpg"
            alt="La vieille ville de Constantine perchée sur son rocher"
            caption="Le Rocher"
            className="col-span-6 md:col-span-4 aspect-[4/5]"
            delay={0.1}
          />
          <PhotoTile
            src="/constantine/viaduc.jpg"
            alt="Viaduc en pierre — arches monumentales"
            caption="Viaduc"
            className="col-span-12 md:col-span-4 aspect-[4/5] md:aspect-[4/5]"
            delay={0.15}
          />
          <PhotoTile
            src="/constantine/rhumel.jpg"
            alt="Gorges du Rhumel et pont en arc"
            caption="Gorges du Rhumel"
            className="col-span-12 md:col-span-4 aspect-[4/5]"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function PhotoTile({
  src,
  alt,
  caption,
  className,
  delay,
  objectPosition,
}: {
  src: string;
  alt: string;
  caption: string;
  className: string;
  delay: number;
  objectPosition?: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative ${className} rounded-xl overflow-hidden ring-1 ring-(--color-border) group cursor-default`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${objectPosition ?? ""}`}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 via-black/20 to-transparent opacity-90" />
      <figcaption className="absolute bottom-2.5 left-3 text-white text-xs font-medium drop-shadow-md">
        {caption}
      </figcaption>
    </motion.figure>
  );
}
