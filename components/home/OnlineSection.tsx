import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { VideoPlayerCard } from "@/components/videos/VideoPlayerCard";
import { dateLocaleFor } from "@/lib/i18n-date";
import type { SiteVideo } from "@/lib/videos-data";
import { db, dbConfigured } from "@/lib/ultra/db";

/**
 * «Онлайн»-блок главной (Фаза C, решение владельца 21.11): ОДНО видео с
 * галочкой «на главную» из site_videos; авто-гашение по home_until
 * (настраиваемые ~12 ч — ставит админ-API при включении галочки). Видео
 * нет / истекло / БД недоступна → секция не рендерится вовсе.
 * Рантайм-данные (cacheComponents): `await connection()` внутри Suspense.
 */
async function OnlineVideo({ lang }: { lang: string }) {
  await connection();
  const t = await getTranslations("home.online");

  let video: SiteVideo | null = null;
  if (dbConfigured()) {
    try {
      const rows = await db<{
        id: string;
        title: string;
        description: string | null;
        provider: string;
        url: string;
        kind: string;
        poster: string | null;
        duration_seconds: number | null;
        created_at: string;
      }>(
        `SELECT id, title, description, provider, url, kind, poster,
                duration_seconds, created_at
         FROM site_videos
         WHERE active = true
           AND on_home = true
           AND (home_until IS NULL OR home_until > now())
         ORDER BY updated_at DESC
         LIMIT 1`
      );
      const row = rows[0];
      if (row) {
        video = {
          id: row.id,
          title: row.title,
          description: row.description,
          provider: row.provider === "youtube" ? "youtube" : "blob",
          url: row.url,
          kind: row.kind === "stream" ? "stream" : "video",
          poster: row.poster,
          durationSeconds: row.duration_seconds,
          createdAt: row.created_at,
        };
      }
    } catch (error) {
      console.error("[online] home video read failed", error);
    }
  }

  // Нет активного видео «на главную» — секции не существует.
  if (!video) return null;

  const addedLabel = new Intl.DateTimeFormat(dateLocaleFor(lang), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(video.createdAt));

  return (
    <section data-spotlight className="border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center mb-2">
          {t("title")}
        </h2>
        <p className="text-center text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto mb-8">
          {t("subtitle")}
        </p>
        <div className="mx-auto max-w-3xl">
          <VideoPlayerCard
            video={video}
            title={video.title}
            addedLabel={addedLabel}
            watchOnYoutube={t("watchOnYoutube")}
          />
        </div>
      </div>
    </section>
  );
}

/** Скелет на время стриминга рантайм-части (PPR): та же высота, что у
 *  секции с видео, чтобы вёрстка не прыгала. */
function OnlineSkeleton() {
  return (
    <section className="border-t" aria-hidden>
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="mx-auto h-8 w-56 animate-pulse rounded-full bg-muted/70" />
          <div className="aspect-video w-full animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    </section>
  );
}

export function OnlineSection({ lang }: { lang: string }) {
  return (
    <Suspense fallback={<OnlineSkeleton />}>
      <OnlineVideo lang={lang} />
    </Suspense>
  );
}
