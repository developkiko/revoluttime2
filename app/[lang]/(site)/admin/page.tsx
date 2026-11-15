import type { Metadata } from "next";
import { ShieldAlertIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { getSessionUser } from "@/lib/auth-session";

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ??
  // Default: demo admin + the owner's Telegram account (id from /start).
  "admin@revoluttime.de,5157746090@telegram.revoluttime"
)
  .split(",")
  .map((email) => email.trim().toLowerCase());

export async function generateMetadata(
  props: PageProps<"/[lang]/admin">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "admin.meta" });
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminPage({
  params,
}: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("admin");
  const user = await getSessionUser();
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email.toLowerCase());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>

      {!isAdmin ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border bg-card px-6 py-16 text-center">
          <ShieldAlertIcon className="size-10 text-muted-foreground/40" />
          <p className="font-semibold">{t("noAccess")}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("noAccessHint")}
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
