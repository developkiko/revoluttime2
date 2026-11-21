import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Прокси аватара Telegram: /api/tg-avatar/<user_id>.
 * URL файла в Bot API содержит токен бота, поэтому фото отдаётся ТОЛЬКО
 * через этот роут (токен остаётся на сервере). Ответ кешируется на сутки.
 */
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!/^\d{3,20}$/.test(id) || !BOT_TOKEN) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const photosRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${id}&limit=1`,
      { cache: "no-store" }
    );
    const photos = (await photosRes.json()) as {
      ok?: boolean;
      result?: { photos?: Array<Array<{ file_id: string }>> };
    };
    const sizes = photos.result?.photos?.[0];
    const fileId = sizes?.[sizes.length - 1]?.file_id;
    if (!fileId) {
      return new NextResponse("Not found", { status: 404 });
    }

    const fileRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
      { cache: "no-store" }
    );
    const file = (await fileRes.json()) as {
      ok?: boolean;
      result?: { file_path?: string };
    };
    const filePath = file.result?.file_path;
    if (!filePath) {
      return new NextResponse("Not found", { status: 404 });
    }

    const image = await fetch(
      `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
      { cache: "no-store" }
    );
    if (!image.ok || !image.body) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(image.body, {
      status: 200,
      headers: {
        "Content-Type": image.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
