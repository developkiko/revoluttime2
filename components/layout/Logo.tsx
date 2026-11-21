import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pixel font size of the wordmark (template header default: 1.25rem). */
  size?: number;
  /** Gentle up-down float (owner request — dummy «Вариант шапки»). */
  float?: boolean;
  className?: string;
}

/**
 * Wordmark from the dummy's «Вариант шапки (градиент + шиммер как в
 * Header)»: two overlapped layers (.bg — brand repeating gradient with a
 * drop shadow, .fg — brand shimmer gradient) at the old .rt-logo size.
 * Styles: .src8-logo-wrap/.src8-logo-header in globals.css.
 */
export function Logo({ size, float = false, className }: LogoProps) {
  return (
    <span
      className={cn("src8-logo-wrap src8-logo-header", float && "src8-float", className)}
      style={size ? { fontSize: `${size}px` } : undefined}
      aria-label="RevolutTIME"
      role="img"
    >
      <span className="bg" aria-hidden>
        Revolut<b>TIME</b>
      </span>
      <span className="fg">Revolut<b>TIME</b></span>
    </span>
  );
}
