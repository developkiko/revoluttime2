// ══════════════════════════════════════════════════════════════
// Upload avatar to Vercel Blob Storage
// Вызывается из админки Cloudflare Worker → POST на Vercel API
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { corsHeaders } from '@/lib/ultra/cors';

const ADMIN_WORKER_TOKEN = process.env.ADMIN_WORKER_TOKEN || '';
const WORKER_VERIFY_URL =
  process.env.ADMIN_WORKER_VERIFY_URL ||
  'https://ultra-proxy-admin.pornorage.workers.dev/auth/verify';

/**
 * Валидация токена:
 * 1) фиксированный ADMIN_WORKER_TOKEN (server-to-server)
 * 2) session-токен админки — проверка через CF Worker /auth/verify
 */
async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  // 1. Статический токен
  if (ADMIN_WORKER_TOKEN && token === ADMIN_WORKER_TOKEN) {
    return true;
  }

  // 2. Session-токен из админ-панели
  try {
    const res = await fetch(`${WORKER_VERIFY_URL}?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { valid?: boolean };
    return !!data.valid;
  } catch (e) {
    console.error('[upload-avatar] verify failed:', e);
    return false;
  }
}

// CORS headers для запросов с админки (origin allowlist через lib/cors)
export async function OPTIONS(req: NextRequest) {
  const headers = corsHeaders(req);
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
  return new NextResponse(null, { status: 200, headers });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders(req) });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: corsHeaders(req) });
    }

    if (file.size > 1048576) {
      return NextResponse.json(
        { error: 'Файл слишком большой (макс. 1MB)' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Неподдерживаемый формат. Используйте JPG, PNG, WebP, GIF, BMP' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const ext =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : file.type === 'image/gif'
            ? 'gif'
            : 'jpg';
    const filename = `reviews/ava_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json(
      {
        success: true,
        avatarUrl: blob.url,
      },
      { headers: corsHeaders(req) }
    );
  } catch (e) {
    console.error('Upload avatar error:', e);
    return NextResponse.json({ error: 'Ошибка загрузки аватарки' }, { status: 500, headers: corsHeaders(req) });
  }
}
