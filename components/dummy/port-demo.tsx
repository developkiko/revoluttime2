"use client";

import { useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";

import { PopoverSelect } from "@/components/ui/popover-select";
import { ReceiptPrint } from "@/components/checkout/ReceiptPrint";

/**
 * Демо порт-модулей со старого дамми: кастомный селект (Popover API,
 * тень-«хлопок» с анимацией закрытия), результаты QR-проверки заказа,
 * карточка-посредник /left и «печать чека». Контент на русском намеренно —
 * внутренняя площадка (как fx-demo).
 */
const PACKS = [
  { value: "60", label: "60 таблеток" },
  { value: "90", label: "90 таблеток" },
  { value: "120", label: "120 таблеток" },
  { value: "180", label: "180 таблеток" },
] as const;

const STATUS = [
  { value: "created", label: "Создан" },
  { value: "paid", label: "Оплачен" },
  { value: "sent", label: "Отправлен" },
  { value: "done", label: "Выполнен" },
] as const;

export function PortDemo() {
  const [pack, setPack] = useState("90");
  const [status, setStatus] = useState("paid");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12" data-spotlight>
      <h2 className="text-xl font-bold tracking-tight">Порт с демо старого сайта</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Кастомный селект (Popover API, тень-«хлопок» — открывается и закрывается
        анимированно), результаты QR-проверки заказа, карточка-посредник /left и
        печать чека (наш стиль). Рабочие версии: /checkout/success, /left,
        страницы status/*, вкладки кабинета, карточки слотов на /recreation.
      </p>

      {/* Кастомный селект */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <PopoverSelect label="Фасовка:" options={PACKS} value={pack} onChange={setPack} />
        <PopoverSelect label="Статус:" options={STATUS} value={status} onChange={setStatus} />
      </div>

      {/* QR-проверка: три исхода */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="check-result check-result--ok">
          <span className="check-ico">
            <CheckCircle2Icon className="text-green-600" aria-hidden="true" />
          </span>
          <p className="check-title check-title--ok">Заказ оплачен — код действителен</p>
          <p className="check-sub">RT-7K2QX9</p>
          <div className="kv-list">
            <p>Пт, 16.10 · отправка DHL · Wasserstoff Tabs</p>
            <p>2 чел. · 20.00 € · Stripe</p>
          </div>
        </div>
        <div className="check-result check-result--err">
          <span className="check-ico">
            <XCircleIcon className="text-red-500" aria-hidden="true" />
          </span>
          <p className="check-title check-title--err">Заказ не найден</p>
          <p className="check-sub check-sub--plain">Код есть, но не в этой базе</p>
        </div>
        <div className="check-result check-result--warn">
          <span className="check-ico">
            <AlertTriangleIcon className="text-amber-500" aria-hidden="true" />
          </span>
          <p className="check-title check-title--warn">Уже использован</p>
          <p className="check-sub check-sub--plain">Отмечен входом вчера в 10:04</p>
        </div>
      </div>

      {/* Посредник внешних ссылок (/left) — превью */}
      <div className="mt-10 grid justify-items-center">
        <div className="left-card max-w-sm">
          <span className="left-ico left-ico--warn">
            <ClockIcon className="size-7" aria-hidden="true" />
          </span>
          <h3 className="left-title">Сейчас перейдём</h3>
          <p className="left-text">
            Через <b>5</b> секунд откроется <b>t.me</b>
          </p>
          <div className="left-actions">
            <span className="timer-ring timer-ring--primary">5</span>
            <p className="left-note">Адресная строка во время отсчёта — чистая</p>
          </div>
        </div>
      </div>

      {/* Печать чека — наш стиль */}
      <div className="mt-12 flex justify-center">
        <ReceiptPrint
          code="RT-DEMO42"
          total="20.00 €"
          sub={["RevolutTIME · H₂ + Mg", "17.10.2026"]}
          lines={[
            { label: "Тренировка · Пн 20.10", value: "18:00–20:00" },
            { label: "Ryzenheimer Halle", value: "×2" },
            { label: "Скидка группы", value: "−25%" },
          ]}
          thanks="Bis bald auf dem Court!"
          qrPayload="https://revoluttime.de/ru/checkout/success?order=RT-DEMO42"
        />
      </div>
    </div>
  );
}
