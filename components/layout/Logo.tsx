import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pixel font size of the wordmark (template header default: 1.25rem). */
  size?: number;
  /** Gentle up-down float (footer variant). */
  float?: boolean;
  className?: string;
}

/**
 * Simple wordmark (owner 22.11 — вместо двухслойного дамми-варианта):
 * одна надпись «RevolutTIME» основным шрифтом Poppins, брендовый
 * градиент с шиммер-анимацией. Styles: .src8-logo-text in globals.css.
 */
export function Logo({ size, float = false, className }: LogoProps) {
  return (
    <span
      className={cn("src8-logo-text", float && "src8-float", className)}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      Revolut<b>TIME</b>
    </span>
  );
}
