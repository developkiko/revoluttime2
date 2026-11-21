import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageIcon, VideoIcon } from "lucide-react";

import { AtomLoader } from "@/components/videos/AtomLoader";
import { listAlbums, listItems } from "@/lib/gallery-data";

export async function generateMetadata(
  props: PageProps<"/[lang]/gallery/[slug]">
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.gallery" });
  return { title: `${slug} — ${t("title")}`, description: t("description") };
}

// Слуги альбомов берутся из БД в рантайме; для Cache Components нужен
// непустой generateStaticParams — отдаём одну нейтральную страницу.
export function generateStaticParams() {
  return [{ slug: "album" }];
}

/** Альбом галереи (№6): адаптивная сетка фото + видео-карточки.
 *  Видео — нативный плеер с controlsList nodownload. */
export default async function GalleryAlbumPage({
  params,
}: PageProps<"/[lang]/gallery/[slug]">) {
  const { lang, slug } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("gallery");

  await connection();
  const [albums, items] = await Promise.all([listAlbums(), listItems(slug)]);
  const album = albums.find((entry) => entry.slug === slug);

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          {/* Обычная ссылка с локалью из params: client-Link тянет
              usePathname и роняет пререндер [slug] (грабля project.md №5) */}
          <a
            href={`/${lang}/gallery`}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← {t("allAlbums")}
          </a>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {album?.title ?? slug}
          </h1>
          {album?.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">{album.description}</p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center">
            <AtomLoader size={110} className="text-foreground/70" />
            <p className="max-w-sm text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
            {items.map((item) => (
              <figure
                key={item.id}
                className="break-inside-avoid overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    poster={item.poster ?? undefined}
                    controls
                    preload="metadata"
                    controlsList="nodownload noremoteplayback"
                    className="w-full"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- Blob/CDN URL
                  <img
                    src={item.url}
                    alt={item.title ?? ""}
                    loading="lazy"
                    className="w-full"
                  />
                )}
                {item.title && (
                  <figcaption className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                    {item.type === "video" ? (
                      <VideoIcon className="size-3 shrink-0 text-primary" />
                    ) : (
                      <ImageIcon className="size-3 shrink-0 text-primary" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
