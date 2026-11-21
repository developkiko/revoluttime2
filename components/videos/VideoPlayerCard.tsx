import { VideoIcon } from "lucide-react";

import { FavoriteButton } from "@/components/videos/FavoriteButton";
import { formatDuration, type SiteVideo } from "@/lib/videos-data";

/** Фирменный YouTube-глиф (брендовые иконки удалены из lucide-react). */
function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  );
}

/** Плеер видео-карточки (Фаза B): Blob-файлы — нативный <video>,
 *  YouTube — nocookie-embed без скачивания. Рендерится сервером,
 *  интерактив не нужен. По решению владельца YouTube-контент не
 *  скачивается — рядом выводится ссылка «Смотреть на YouTube». */

export function VideoPlayerCard({
  video,
  title,
  watchOnYoutube,
  addedLabel,
}: {
  video: SiteVideo;
  title: string;
  /** Отформатированная дата добавления. */
  addedLabel: string;
  watchOnYoutube: string;
}) {
  const duration = formatDuration(video.durationSeconds);

  return (
    <article className="flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-video w-full bg-muted/60">
        {video.provider === "youtube" ? (
          <iframe
            src={video.url}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <video
            src={video.url}
            poster={video.poster ?? undefined}
            controls
            preload="metadata"
            // Запрет скачивания: Chromium-семейство уважает, для остальных
            // остаётся обычный просмотр без ссылки на файл.
            controlsList="nodownload noremoteplayback"
            className="absolute inset-0 size-full"
          />
        )}
      </div>

      <div className="flex flex-col gap-2 px-5 pb-5">
        <div className="flex items-center gap-2">
          {video.provider === "youtube" ? (
            <YoutubeGlyph className="size-4 shrink-0 text-destructive" />
          ) : (
            <VideoIcon className="size-4 shrink-0 text-primary" />
          )}
          <h2 className="truncate text-base font-semibold leading-snug">
            {video.title}
          </h2>
        </div>

        {video.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {video.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {duration && <span>{title} {duration}</span>}
          <span>{addedLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {video.provider === "youtube" && (
            <a
              href={video.url.replace("/embed/", "/watch?v=")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
            >
              <YoutubeGlyph className="size-3.5" />
              {watchOnYoutube}
            </a>
          )}
          {/* Избранное (Фаза G): локально гостям, синк вошедшим */}
          <FavoriteButton id={video.id} />
        </div>
      </div>
    </article>
  );
}
