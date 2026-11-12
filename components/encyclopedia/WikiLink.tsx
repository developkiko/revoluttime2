import { Link } from "@/i18n/navigation";

/**
 * Wikipedia-style inline link to an encyclopedia article. Used inside
 * translated copy via next-intl rich text (t.rich with named handlers):
 *   { mgh2: (chunks) => <WikiLink slug="magnesium-h2-synergy">{chunks}</WikiLink> }
 * Works in server and client components (no hooks).
 */
export function WikiLink({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/encyclopedia/${slug}`}
      className="font-medium text-primary underline decoration-dotted underline-offset-2 transition-colors hover:decoration-solid"
    >
      {children}
    </Link>
  );
}
