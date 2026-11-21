// ══════════════════════════════════════════════════════════════
// Загрузка видео в Vercel Blob (Фаза B): client-upload по официальному
// паттерну handleUpload — браузер грузит файл НАПРЯМУЮ в Blob под
// ограничениями, вшитыми в client-токен (тип + вес), поэтому лимиты
// платформы соблюдаются даже при обходе UI.
//
// Два входящих сценария одного POST:
//  1) generate-client-token (админ-панель adm-rt или этот сайт) —
//     требует админ-авторизацию;
//  2) upload-completed (колбэк от сервиса Blob) — без заголовков админа,
//     но payload подписан токеном, который выдали сами; вставляем строку
//     в site_videos, атрибуция админа через tokenPayload.
//
// Лимиты: см. lib/videos.ts (тип — video/* белый список, вес — 512 MB
// = граница кеша Blob, путь — только videos/).
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import type { HandleUploadBody } from "@vercel/blob/client";

import { requireAdmin } from "@/lib/admin-auth";
import { corsHeaders } from "@/lib/ultra/cors";
import { db, dbConfigured } from "@/lib/ultra/db";
import {
  MAX_VIDEO_SIZE_BYTES,
  VIDEO_MIME_TYPES,
  VIDEO_PATH_PREFIX,
  checkVideoFile,
} from "@/lib/videos";

/** Срок жизни client-токена на одну загрузку (мс) — 30 минут. */
const TOKEN_TTL_MS = 30 * 60 * 1000;

/** videos/<name><suffix> → читаемое название из имени файла. */
function titleFromPathname(pathname: string): string {
  const base = pathname.slice(VIDEO_PATH_PREFIX.length);
  const withoutExt = base.replace(/\.[a-z0-9]+$/i, "");
  return withoutExt.slice(0, 120) || "Без названия";
}

export async function OPTIONS(request: NextRequest) {
  const headers = corsHeaders(request);
  headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
  return new NextResponse(null, { status: 200, headers });
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request);

  // Body приходит всегда JSON: токен-запрос или колбэк завершения.
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { error: "bad_request" },
      { status: 400, headers }
    );
  }

  const isTokenRequest = body.type === "blob.generate-client-token";

  // Сценарий 1: выдача токена — только админ (Bearer adm_api-токен бриджа
  // /api/admin/ticket или админ-сессия сайта).
  if (isTokenRequest) {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403, headers }
      );
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "blob_unconfigured" },
        { status: 503, headers }
      );
    }
  }

  // Код отказа из onBeforeGenerateToken — пробрасываем наружу, чтобы UI
  // показывал конкретную причину (bad_extension / bad_type / …).
  let rejection: string | null = null;

  const result = await handleUpload({
    request,
    body,
    onBeforeGenerateToken: async (pathname) => {
      // Проверка пути: только под префиксом videos/ и с видео-расширением.
      // MIME/вес уйдут в client-токен — сервис Blob отклонит нарушителя
      // независимо от того, каким UI его отправили.
      const check = checkVideoFile({
        name: pathname,
        size: MAX_VIDEO_SIZE_BYTES, // вес проверяется самим Blob по лимиту токена
      });
      if (!check.ok) {
        throw new Error(`upload_rejected_${check.error}`);
      }

      return {
        // Жёсткие ограничения в токене: белый список MIME + вес 512 MB.
        allowedContentTypes: [...VIDEO_MIME_TYPES],
        maximumSizeInBytes: MAX_VIDEO_SIZE_BYTES,
        addRandomSuffix: true,
        validUntil: Date.now() + TOKEN_TTL_MS,
        // Атрибуция админа в колбэке завершения.
        tokenPayload: JSON.stringify({ via: "admin_videos_upload" }),
      };
    },
    onUploadCompleted: async (completed) => {
      // Сценарий 2: файл загружен — создаём запись в site_videos.
      // Ошибку БД не пробрасываем в ответ колбэку (Blob должен получить ok),
      // но логируем: запись всегда можно добавить вручную через CRUD.
      try {
        if (!dbConfigured()) {
          console.error("[admin/videos/upload] db_unconfigured on completion");
          return;
        }
        const blob = completed.blob;
        const title = titleFromPathname(blob.pathname);
        // size у PutBlobResult нет (в 2.9 колбэк завершения не несёт вес) —
        // вес остаётся null, значение можно проставить через CRUD PATCH.
        await db(
          `INSERT INTO site_videos (title, provider, url, size_bytes, content_type)
           VALUES ($1, 'blob', $2, $3, $4)`,
          [title, blob.url, null, blob.contentType ?? null]
        );
      } catch (error) {
        console.error("[admin/videos/upload] completion insert failed", error);
      }
    },
  }).catch((error: unknown) => {
    console.error("[admin/videos/upload] handleUpload failed", error);
    const message = error instanceof Error ? error.message : "";
    return message.startsWith("upload_rejected_")
      ? { rejected: message }
      : null;
  });

  if (!result) {
    return NextResponse.json(
      { error: "upload_rejected" },
      { status: 400, headers }
    );
  }

  if ("rejected" in result) {
    return NextResponse.json(
      { error: result.rejected },
      { status: 400, headers }
    );
  }

  return NextResponse.json(result, { headers });
}
