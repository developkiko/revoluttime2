import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, UsersIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function PartnerTeaser() {
  const t = await getTranslations("home.partnerTeaser");

  return (
    <section className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 sm:flex">
            <UsersIcon className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {t("title")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
              {t("text")}
            </p>
          </div>
        </div>
        <Button
          size="lg"
          variant="secondary"
          className="shrink-0"
          asChild
        >
          <Link href="/partner">
            {t("cta")}
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
