import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pixel font size of the wordmark. */
  size?: number;
  /** Gentle up-down float (source: hero logo on revoluttimenew). */
  float?: boolean;
  className?: string;
}

/**
 * Two-layer striped wordmark carried over verbatim from revoluttimenew:
 * a 105° repeating gradient "bg" layer (scaleY 1.05, drop shadow) under a
 * 5° gradient "fg" layer, both clipped to the text.
 */
export function Logo({ size = 24, float = false, className }: LogoProps) {
  return (
    <span
      className={cn("rt-logo", float && "rt-logo-float", className)}
      style={{ ["--rt-logo-size" as string]: `${size}px` }}
      aria-label="RevolutTIME"
      role="img"
    >
      <span aria-hidden className="rt-logo-bg">
        Revolut<b>TIME</b>
      </span>
      <span aria-hidden className="rt-logo-fg">
        Revolut<b>TIME</b>
      </span>
    </span>
  );
}
