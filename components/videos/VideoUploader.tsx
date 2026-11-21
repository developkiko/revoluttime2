"use client";

/** Простой загрузчик видео (Фаза B) — переиспользуемый компонент.
 *  Логируется в adm-rt: передать {handleUploadUrl} абсолютным URL сайта
 *  и {authToken} — adm_api-токен бриджа /api/admin/ticket.
 *
 *  Проверки на ограничения (клиент + сервер, см. lib/videos.ts):
 *  - тип: белый список video/* (расширение и MIME сверяются друг с другом);
 *  - вес: ≤ 512 MB (граница кеша Vercel Blob; сам Blob жёстко ограничивает
 *    по maximumSizeInBytes в client-токене — обход UI не помогает);
 *  - большие файлы (>100 MB) идут multipart автоматически.
 */

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useTranslations } from "next-intl";
import {
  CheckCircleIcon,
  FileVideoIcon,
  LoaderCircleIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MAX_VIDEO_SIZE_BYTES,
  VIDEO_MIME_TYPES,
  checkVideoFile,
  formatBytes,
  type VideoFileCheck,
} from "@/lib/videos";

export interface VideoUploaderProps {
  /** Роут выдачи client-токена (по умолчанию на этом сайте). */
  handleUploadUrl?: string;
  /** Bearer-токен админ-API (adm_api.v1…); без него — сессия сайта. */
  authToken?: string;
  /** Колбэк после успешной загрузки (запись в site_videos создаётся сервером). */
  onUploaded?: (blob: { url: string; pathname: string }) => void;
}

/** Убираем из имени файла всё, что не хочется видеть в pathname Blob. */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-120);
}

export function VideoUploader({
  handleUploadUrl = "/api/admin/videos/upload",
  authToken,
  onUploaded,
}: VideoUploaderProps) {
  const t = useTranslations("videos.upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [checkError, setCheckError] = useState<VideoFileCheck["error"]>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  function pickFile(next: File | null) {
    setFile(next);
    setUploadedUrl(null);
    setApiError(null);
    setCheckError(null);
    if (!next) return;
    const check = checkVideoFile({
      name: next.name,
      type: next.type,
      size: next.size,
    });
    setCheckError(check.error);
  }

  async function startUpload() {
    if (!file || checkError) return;
    setApiError(null);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const blob = await upload(`videos/${sanitizeFilename(file.name)}`, file, {
        access: "public",
        handleUploadUrl,
        multipart: true, // >100 MB Blob режет сам; мелкие идут одной частью
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        onUploadProgress: ({ percentage }) => setProgress(percentage ?? null),
        abortSignal: controller.signal,
      });
      setUploadedUrl(blob.url);
      onUploaded?.({ url: blob.url, pathname: blob.pathname });
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") {
        setApiError(null);
      } else {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  }

  function cancelUpload() {
    abortRef.current?.abort();
  }

  const uploading = progress !== null;
  const ready = file && !checkError && !uploading && !uploadedUrl;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
      />

      {!file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5"
        >
          <UploadIcon className="size-6" />
          {t("pick")}
          <span className="text-xs">
            {t("limits", {
              size: formatBytes(MAX_VIDEO_SIZE_BYTES),
              formats: "MP4, WebM, MOV, MKV, MPEG, OGV, AVI",
            })}
          </span>
        </button>
      )}

      {file && (
        <div className="flex items-center gap-3">
          <FileVideoIcon className="size-8 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
          {!uploading && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("clear")}
              onClick={() => pickFile(null)}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      )}

      {checkError && (
        <p className="text-sm text-destructive">{t(`errors.${checkError}`)}</p>
      )}

      {uploading && (
        <div className="flex flex-col gap-1.5">
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress ?? 0)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.round(progress ?? 0)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("progress", { percent: Math.round(progress ?? 0) })}
          </p>
        </div>
      )}

      {apiError && (
        <p className="text-sm text-destructive">{t("apiError", { message: apiError })}</p>
      )}

      {uploadedUrl && (
        <p className="flex items-start gap-2 text-sm text-primary">
          <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
          <span className="break-all">{t("done", { url: uploadedUrl })}</span>
        </p>
      )}

      <div className="flex gap-2">
        {ready && (
          <Button onClick={startUpload}>
            <UploadIcon className="size-4" />
            {t("start")}
          </Button>
        )}
        {uploading && (
          <Button variant="outline" onClick={cancelUpload}>
            {t("cancel")}
          </Button>
        )}
        {uploading && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            {t("working")}
          </span>
        )}
      </div>
    </div>
  );
}
