"use client";

/** Кнопка избранного (Фаза G): сердце на карточке видео/статьи.
 *  Гости — localStorage, вошедшие — синк в users.favorites. */

import { HeartIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({ id }: { id: string }) {
  const t = useTranslations("favorites");
  const { ids, toggle } = useFavorites();
  const active = ids.includes(id);

  return (
    <button
      type="button"
      aria-label={active ? t("remove") : t("add")}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault(); // не триггерить ссылку-обёртку карточки
        event.stopPropagation();
        toggle(id);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition"
      style={
        active
          ? { borderColor: "var(--primary)", color: "var(--primary)" }
          : undefined
      }
    >
      <HeartIcon className={active ? "size-3.5 fill-current" : "size-3.5"} />
      {active ? t("added") : t("addShort")}
    </button>
  );
}
