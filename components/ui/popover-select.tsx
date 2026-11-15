"use client";

import { useId, type CSSProperties } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Кастомный селект на Popover API — порт jhey.dev «shadow-popover-transition»:
 * поповер раскрывается 3D-«страницей» (rotate x), под ним тень «хлопает» вниз
 * (slam). Позиция — CSS Anchor Positioning; без него поповер по центру
 * (@supports-фолбэк). Открытие И закрытие анимированы (transitions +
 * display/overlay allow-discrete в app/styles/port.css): закрытие — тот же
 * эффект в обратную сторону. Клик по опции нативно закрывает поповер
 * (кнопка с тем же popovertarget), Esc/light-dismiss — тоже нативно.
 */

export interface PopoverSelectOption {
  value: string;
  label: string;
}

export function PopoverSelect({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly PopoverSelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Постоянная подпись слева в кнопке (например «Фасовка:») */
  label?: string;
  className?: string;
}) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const popId = `ps-pop-${reactId}`;
  // dashed-ident якоря: уникален на инстанс, поповер прилипает к кнопке
  const anchorName = `--ps-${reactId}`;
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <span className={cn("popover-select", className)}>
      <button
        type="button"
        popoverTarget={popId}
        className="popover-select__trigger"
        style={{ anchorName } as CSSProperties}
      >
        {label && <span className="popover-select__label">{label}</span>}
        <span className="popover-select__value">{selected?.label}</span>
        <ChevronDown aria-hidden="true" className="popover-select__chevron" />
      </button>
      <div
        id={popId}
        popover="auto"
        role="menu"
        className="popover-select__popover"
        style={{ positionAnchor: anchorName } as CSSProperties}
      >
        <div className="popover-select__content">
          <ul>
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  popoverTarget={popId}
                  role="menuitemradio"
                  aria-checked={o.value === value}
                  data-selected={o.value === value ? "true" : undefined}
                  onClick={() => onChange(o.value)}
                  className="popover-select__option"
                >
                  <span>{o.label}</span>
                  <Check aria-hidden="true" className="popover-select__check" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </span>
  );
}
