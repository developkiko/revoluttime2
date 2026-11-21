import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { PartnerNetworkLazy } from "@/components/partner/PartnerNetworkLazy";
import { SITE } from "@/lib/products";
import { anonymizeLedgerEmail, demoPartner } from "@/lib/earnings";
import { readOwnerSettings } from "@/lib/owner-settings";
import { db, dbConfigured } from "@/lib/ultra/db";

type NetworkPerson = {
  id: string;
  name: string;
  joined: string;
  badge?: string;
  avatar?: string;
};

/** Демо-цепочка 10 партнёров (владелец 21.11): «Вы» + 5 прямых (матрица
 *  5×5) + 5 второго уровня, аватары из пула отзывов, имена — маски. */
function buildDemoChain(): Record<string, NetworkPerson[]> {
  const direct = Array.from({ length: 5 }, (_, i) => {
    const { maskedName, avatar } = demoPartner(i);
    return {
      id: `demo-d${i + 1}`,
      name: maskedName,
      joined: "2026-10-15",
      avatar,
    } satisfies NetworkPerson;
  });
  // Второй уровень: 5 партнёров под прямыми (2 + 1 + 1 + 1 + 0).
  const subPlan: Array<[number, number]> = [
    [0, 2],
    [1, 1],
    [2, 1],
    [3, 1],
  ];
  const childrenByNode: Record<string, NetworkPerson[]> = {
    you: direct,
  };
  let subIndex = 0;
  for (const [directIdx, count] of subPlan) {
    const parent = direct[directIdx];
    const subs = Array.from({ length: count }, () => {
      const { maskedName, avatar } = demoPartner(5 + subIndex);
      subIndex += 1;
      return {
        id: `demo-s${subIndex}`,
        name: maskedName,
        joined: "2026-11-10",
        avatar,
      } satisfies NetworkPerson;
    });
    childrenByNode[parent.id] = subs;
  }
  return childrenByNode;
}

/** Реальная структура (mode=real): вошедшие по партнёрским ссылкам
 *  (auth_links.ref_code ≠ NULL, кроме админа), анонимно. */
async function buildRealChain(): Promise<Record<string, NetworkPerson[]>> {
  if (!dbConfigured()) return { you: [] };
  // Админ (владелец) — не «партнёр» в собственной сети (как в isAdminEmail).
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  try {
    const rows = await db<{ email: string }>(
      `SELECT email FROM auth_links
       WHERE ref_code IS NOT NULL AND lower(email) <> ALL($1::text[])
       ORDER BY email
       LIMIT 5`,
      [adminEmails]
    );
    const partners = rows.map((row, i) => {
      const { maskedName, avatar } = anonymizeLedgerEmail(row.email);
      return {
        id: `real-${i}`,
        name: maskedName,
        joined: "—",
        avatar,
      } satisfies NetworkPerson;
    });
    return { you: partners };
  } catch (error) {
    console.error("[partner-network] real chain read failed", error);
    return { you: [] };
  }
}

/**
 * Схема партнёрской сети на главной (Фаза C). Режим — adm-rt
 * (owner_settings.partner_network, default demo). Рантайм-данные
 * (cacheComponents): `await connection()` внутри Suspense.
 */
async function NetworkBlock() {
  await connection();
  const t = await getTranslations("home.diagram");
  const tPartner = await getTranslations("partner");

  const settings = await readOwnerSettings();
  const mode = settings.partner_network?.mode ?? "demo";
  const tPartnerTeaser = await getTranslations("home.partnerTeaser");
  const childrenByNode =
    mode === "real" ? await buildRealChain() : buildDemoChain();

  return (
    <div className="flex flex-col gap-3">
      {mode === "demo" && (
        <p className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            {t("demoBadge")}
          </span>
        </p>
      )}
      <PartnerNetworkLazy
        me={{ id: "you", name: t("you"), joined: "2026-09-01" }}
        childrenByNode={childrenByNode}
        colored
        profileHref="/partner"
        youActions={[
          { label: tPartner("cta.button"), href: SITE.whatsapp },
          { label: tPartnerTeaser("cta"), href: "/partner" },
        ]}
      />
      {mode === "real" && childrenByNode.you.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">{t("beFirst")}</p>
      )}
    </div>
  );
}

/** Скелет на время стриминга рантайм-части (PPR). */
function NetworkSkeleton() {
  return (
    <div className="flex h-[320px] items-center justify-center" aria-hidden>
      <div className="h-24 w-3/4 max-w-md animate-pulse rounded-2xl bg-muted/50" />
    </div>
  );
}

export function PartnerNetworkBlock() {
  return (
    <Suspense fallback={<NetworkSkeleton />}>
      <NetworkBlock />
    </Suspense>
  );
}
