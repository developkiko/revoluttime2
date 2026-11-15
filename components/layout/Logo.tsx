import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pixel font size of the wordmark (template header default: 1.25rem). */
  size?: number;
  /** Gentle up-down float (source: hero logo on revoluttimenew). */
  float?: boolean;
  className?: string;
}

/**
 * Ultra template wordmark: single-layer shimmering gradient text
 * (styles verbatim from the template `.logo` rule in globals.css).
 */
export function Logo({ size, float = false, className }: LogoProps) {
  return (
    <span
      className={cn("rt-logo", float && "rt-logo-float", className)}
      style={size ? { ["--rt-logo-size" as string]: `${size}px` } : undefined}
      aria-label="RevolutTIME"
      role="img"
    >
      Revolut<b>TIME</b>
    </span>
  );
}
