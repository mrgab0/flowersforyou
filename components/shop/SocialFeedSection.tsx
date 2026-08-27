"use client";

import { Instagram, Sparkles } from "lucide-react";

interface SocialFeedSectionProps {
  title?: string;
  embedHtml?: string;
  instagramEmbedHtml?: string;
  tiktokEmbedHtml?: string;
  enableInstagramFeed?: boolean;
  enableTiktokFeed?: boolean;
}

export function SocialFeedSection({
  title = "Síguenos en Instagram & TikTok 📸",
  embedHtml,
  instagramEmbedHtml,
  tiktokEmbedHtml,
  enableInstagramFeed = true,
  enableTiktokFeed = true,
}: SocialFeedSectionProps) {
  const hasInsta = enableInstagramFeed && instagramEmbedHtml && instagramEmbedHtml.trim().length > 0;
  const hasTiktok = enableTiktokFeed && tiktokEmbedHtml && tiktokEmbedHtml.trim().length > 0;
  const hasLegacy = embedHtml && embedHtml.trim().length > 0;

  if (!hasInsta && !hasTiktok && !hasLegacy) return null;

  const isDual = hasInsta && hasTiktok;

  return (
    <section className="py-14 bg-gradient-to-b from-transparent via-pink-50/40 to-transparent dark:via-pink-950/20 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-950/60 text-[#FF97A4] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles size={14} /> Feeds & Tendencias en Vivo
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Descubre nuestros últimos diseños florales y momentos especiales capturados en redes sociales.
          </p>
        </div>

        {/* Cuadrícula Dual de Embeds (Instagram + TikTok Simultáneos) */}
        {isDual ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Lado Izquierdo: Instagram */}
            <div className="bg-white dark:bg-[#12131A] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col items-center">
              <div className="flex items-center gap-2 text-[#E1306C] font-extrabold text-xs uppercase tracking-wider mb-4">
                <Instagram size={16} /> Feed de Instagram
              </div>
              <div
                className="w-full flex justify-center [&>iframe]:max-w-full [&>iframe]:rounded-2xl [&>blockquote]:mx-auto text-center"
                dangerouslySetInnerHTML={{ __html: instagramEmbedHtml! }}
              />
            </div>

            {/* Lado Derecho: TikTok */}
            <div className="bg-white dark:bg-[#12131A] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col items-center">
              <div className="flex items-center gap-2 text-[#000000] dark:text-white font-extrabold text-xs uppercase tracking-wider mb-4">
                <span className="text-base">🎵</span> Feed de TikTok
              </div>
              <div
                className="w-full flex justify-center [&>iframe]:max-w-full [&>iframe]:rounded-2xl [&>blockquote]:mx-auto text-center"
                dangerouslySetInnerHTML={{ __html: tiktokEmbedHtml! }}
              />
            </div>
          </div>
        ) : (
          /* Embed Individual Unificado */
          <div className="bg-white dark:bg-[#12131A] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex justify-center max-w-2xl mx-auto">
            <div
              className="w-full flex justify-center [&>iframe]:max-w-full [&>iframe]:rounded-2xl [&>blockquote]:mx-auto text-center"
              dangerouslySetInnerHTML={{
                __html: hasInsta
                  ? instagramEmbedHtml!
                  : hasTiktok
                  ? tiktokEmbedHtml!
                  : embedHtml!
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
