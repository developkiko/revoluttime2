/** Видеомодуль (Фаза B): лимиты Vercel Blob и валидация файлов загрузчика.
 *
 *  Стандартные лимиты Vercel Blob (docs/vercel-blob/usage-and-pricing, 2026):
 *  - максимум один файл: 5 TB (multipart рекомендован для >100 MB);
 *  - кеш CDN: 512 MB на блоб — крупнее всегда cache MISS (платно);
 *  - TTL: 1–730 дней (нам не нужен — видео постоянные);
 *  - лимиты операций (Simple/Advanced ops в минуту) — несущественны для
 *    загрузчика админа.
 *
 *  Наши надстройки над платформой:
 *  - тип: белым списком только video/* MIME (Blob сам тип не ограничивает);
 *  - вес: 512 MB — по границе кеша (всё ниже кешируется, multipart включён);
 *  - имя: путь всегда под `videos/` со случайным суффиксом.
 *
 *  Файл общий для серверных роутов и клиентского компонента загрузчика,
 *  поэтому без "server-only" и без node-зависимостей.
 */

/** App-лимит веса файла: 512 MB — совпадает с границей кеша Blob
 *  (крупнее — гарантированный cache MISS при каждом просмотре). */
export const MAX_VIDEO_SIZE_BYTES = 512 * 1024 * 1024;

/** Платформенный максимум Blob (для справки в ответах API). */
export const BLOB_MAX_FILE_SIZE_BYTES = 5 * 1000 * 1000 * 1000 * 1000;

/** Граница multipart (Blob автоматически разбивает) — для прогресса UI. */
export const MULTIPART_THRESHOLD_BYTES = 100 * 1024 * 1024;

/** Префикс в Blob-сторе, куда попадают все видео админа. */
export const VIDEO_PATH_PREFIX = "videos/";

/** Белый список MIME. Video/* как есть + конкретные для нестандартных
 *  контейнеров (mov/quicktime, mkv/matroska, avi/msvideo). */
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/mpeg",
  "video/ogg",
  "video/x-msvideo",
  "video/3gpp",
] as const;

/** Допустимые расширения (fallback, если браузер не отдал MIME). */
export const VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "mov",
  "mkv",
  "mpeg",
  "mpg",
  "ogv",
  "avi",
  "3gp",
] as const;

/** Расширение → канонический MIME для fallback-валидации. */
const EXT_TO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  ogv: "video/ogg",
  avi: "video/x-msvideo",
  "3gp": "video/3gpp",
};

export interface VideoFileCheck {
  ok: boolean;
  /** Машиночитаемый код ошибки для UI (или null при успехе). */
  error:
    | "no_file"
    | "bad_type"
    | "too_large"
    | "too_small"
    | "bad_extension"
    | "bad_filename"
    | null;
  /** Человеческое сообщение по коду — берётся на клиенте из i18n. */
  filename: string;
  contentType: string;
  sizeBytes: number;
}

/**
 * Единая проверка файла загрузчика: тип → расширение → вес.
 * Порядок намеренный: сначала самое частое (тип), потом вес.
 */
export function checkVideoFile(file: {
  name?: string | null;
  type?: string | null;
  size?: number | null;
}): VideoFileCheck {
  const filename = (file.name ?? "").trim();
  const contentType = (file.type ?? "").toLowerCase();
  const sizeBytes = file.size ?? 0;

  if (!filename || !sizeBytes) {
    return {
      ok: false,
      error: "no_file",
      filename,
      contentType,
      sizeBytes,
    };
  }

  // Расширение из имени — валидируется всегда (MIME можно подделать).
  const ext = filename.includes(".")
    ? filename.split(".").pop()?.toLowerCase() ?? ""
    : "";
  const mimeFromExt = EXT_TO_MIME[ext];

  if (!mimeFromExt) {
    return {
      ok: false,
      error: "bad_extension",
      filename,
      contentType,
      sizeBytes,
    };
  }

  // MIME браузера должен совпадать с расширением (защита от подмены типа).
  if (contentType && !VIDEO_MIME_TYPES.includes(contentType as (typeof VIDEO_MIME_TYPES)[number])) {
    return {
      ok: false,
      error: "bad_type",
      filename,
      contentType,
      sizeBytes,
    };
  }

  if (sizeBytes > MAX_VIDEO_SIZE_BYTES) {
    return {
      ok: false,
      error: "too_large",
      filename,
      contentType,
      sizeBytes,
    };
  }
  if (sizeBytes < 1024) {
    return {
      ok: false,
      error: "too_small",
      filename,
      contentType,
      sizeBytes,
    };
  }

  return {
    ok: true,
    error: null,
    filename,
    contentType: contentType || mimeFromExt,
    sizeBytes,
  };
}

/** Паттерн YouTube: watch?v=, youtu.be/, shorts/, embed/. */
const YT_URL_RE =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i;

/** Вытащить 11-символьный YouTube ID из любой формы ссылки (null — не YT). */
export function youtubeIdFromUrl(url: string): string | null {
  const match = YT_URL_RE.exec(url.trim());
  return match ? match[1] : null;
}

/** Форматирование веса для UI (512 MB, 1.2 GB…). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const idx = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** idx;
  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[idx]}`;
}

/** Человекочитаемый лимит веса (для текстов подсказок). */
export const MAX_VIDEO_SIZE_LABEL = formatBytes(MAX_VIDEO_SIZE_BYTES);
