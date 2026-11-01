import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface CtaBannerProps {
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
  external?: boolean;
}

export function CtaBanner({
  title,
  text,
  buttonLabel,
  href,
  external,
}: CtaBannerProps) {
  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {text}
          </p>
        </div>
        <Button size="lg" className="shrink-0" asChild>
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {buttonLabel}
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          ) : (
            <Link href={href}>
              {buttonLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          )}
        </Button>
      </div>
    </section>
  );
}
