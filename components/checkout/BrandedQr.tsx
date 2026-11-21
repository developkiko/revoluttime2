"use client";

/** Брендированный QR (Фаза G, владелец: «QR чека с атомом в центре»).
 *  qrcode с errorCorrectionLevel H (терпит закрытие до ~30 % модулей) —
 *  в центре спокойно живёт атом-лого размером ~26 % стороны. */

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { AtomLoader } from "@/components/videos/AtomLoader";

export function BrandedQr({
  payload,
  size = 132,
}: {
  payload: string;
  size?: number;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: size * 4,
      color: { dark: "#0f172aff", light: "#ffffffff" },
    }).then(setQr);
  }, [payload, size]);

  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL из qrcode
        <img src={qr} alt="QR" className="size-full" />
      ) : (
        <span className="block size-full" />
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-[26%] place-items-center rounded-md bg-white">
          <AtomLoader size={Math.round(size * 0.2)} spinSeconds={4} />
        </span>
      </span>
    </span>
  );
}
