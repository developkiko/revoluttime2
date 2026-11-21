import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { AtomLoader } from "@/components/videos/AtomLoader";
import { listAlbums } from "@/lib/gallery-data";

export async function generateMetadata(
  props: PageProps<"/[lang]/gallery">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.gallery" });
  return { title: t("title"), description: t("description") };
}

/** Галерея (владелец 22.11 №6): разделы/альбомы, адаптивная сетка обложек.
 *  Пустая БД → empty-state с атомом. Рантайм-данные: connection(). */
export default async function GalleryPage({
  params,
}: PageProps<"/[lang]/gallery">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("gallery");

  await connection();
  const albums = await listAlbums();

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <ImageIcon className="size-5 text-primary" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("title")}
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center">
            <AtomLoader size={110} className="text-foreground/70" />
            <p className="max-w-sm text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-muted/60">
                  {album.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Blob/CDN URL
                    <img
                      src={album.cover}
                      alt={album.title}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-muted-foreground/40">
                      <ImageIcon className="size-10" />
                    </span>
                  )}
                  <span className="absolute bottom-2 end-2 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium tabular-nums backdrop-blur">
                    {album.itemsCount}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h2 className="font-semibold leading-snug group-hover:text-primary">
                    {album.title}
                  </h2>
                  {album.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {album.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
