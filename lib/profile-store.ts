"use client";

import * as React from "react";

/**
 * Per-user profile overlay stored client-side (display name + custom avatar
 * as a compact data URL). TODO(profile API): move to Supabase `profiles`
 * with Vercel Blob for uploads once the accounts API arrives.
 */

export interface ProfileOverlay {
  /** Overrides the provider/session name when set. */
  displayName?: string;
  /** Uploaded avatar (resized 256px JPEG data URL) — beats provider photo. */
  avatarDataUrl?: string;
}

const keyFor = (email: string) => `revoluttime-profile-v1:${email.toLowerCase()}`;

function read(email: string): ProfileOverlay | null {
  try {
    const raw = window.localStorage.getItem(keyFor(email));
    return raw ? (JSON.parse(raw) as ProfileOverlay) : null;
  } catch {
    return null;
  }
}

function write(email: string, profile: ProfileOverlay) {
  try {
    window.localStorage.setItem(keyFor(email), JSON.stringify(profile));
  } catch {
    // quota (avatar too large) — surface to caller via throw
    throw new Error("quota");
  }
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();

export function useProfileOverlay(email: string | undefined): ProfileOverlay | null {
  const [overlay, setOverlay] = React.useState<ProfileOverlay | null>(null);

  React.useEffect(() => {
    if (!email) return;
    const update = () => setOverlay(read(email));
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, [email]);

  return overlay;
}

export function saveProfileOverlay(email: string, profile: ProfileOverlay): void {
  write(email, profile);
}

/** Downscale an uploaded image to a 256×256 JPEG data URL (client-side). */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read_error"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode_error"));
    image.src = dataUrl;
  });

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}
