import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilmIcon } from "lucide-react";

import { ShareButton } from "@/components/videos/ShareButton";

import { VideoPlayerCard } from "@/components/videos/VideoPlayerCard";
import { AtomLoader } from "@/components/videos/AtomLoader";
import { listSiteVideos } from "@/lib/videos-data";

export async function generateMetadata(
  props: PageProps<"/[lang]/videos">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.videos" });
  return { title: t("title"), description: t("description") };
}

const DATE_LOCALE: Record<string, string> = {
  de: "de-DE",
  ru: "ru-RU",
  en: "en-US",
};

/** Галерея видео (Фаза B): активные записи site_videos (kind=video).
 *  Пустая БД или нет записей → empty-state с атомом H₂. */
export default async function VideosPage({
  params,
}: PageProps<"/[lang]/videos">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("videos");

  // Данные из БД — рантайм (cacheComponents): без connection() страница
  // попала бы в статический пререндер и не увидела бы новых видео.
  await connection();
  const videos = await listSiteVideos("video");
  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALE[lang] ?? "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <FilmIcon className="size-5 text-primary" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("videosTitle")}
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("videosSubtitle")}
          </p>
          {/* Поделиться (Фаза G): нативный шаринг или меню для немцев */}
          <div className="mt-4">
            <ShareButton path="/videos" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center">
            <AtomLoader size={110} className="text-foreground/70" />
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("videosEmpty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <VideoPlayerCard
                key={video.id}
                video={video}
                title={t("durationLabel")}
                addedLabel={dateFormatter.format(new Date(video.createdAt))}
                watchOnYoutube={t("watchOnYoutube")}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
