# One-off: center section headers + Ultra buttons on home sections.
import io

H2 = 'text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem]'
P = 'text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto'

def patch(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    missed = []
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new, 1)
        else:
            missed.append(old[:70])
    io.open(path, 'w', encoding='utf-8', newline='').write(s)
    print(path, 'applied', len(pairs) - len(missed), 'missed', missed)

# ── DirectionsSection ──
patch('components/home/DirectionsSection.tsx', [
    ('<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">\n          {t("title")}\n        </h2>',
     '<h2 className="' + H2 + ' text-center mb-3">\n          {t("title")}\n        </h2>'),
    ('<p className="mt-2 max-w-2xl text-muted-foreground">\n          {t.rich("subtitle", {',
     '<p className="mt-2 ' + P + '">\n          {t.rich("subtitle", {'),
    ('mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
     'mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3'),
])

# ── UsageSection ──
patch('components/home/UsageSection.tsx', [
    ('<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">\n          {t("title")}\n        </h2>',
     '<h2 className="' + H2 + ' text-center mb-3">\n          {t("title")}\n        </h2>'),
    ('<p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>',
     '<p className="mt-2 ' + P + '">{t("subtitle")}</p>'),
    ('mt-8 grid gap-4 md:grid-cols-3', 'mt-8 grid gap-4 text-left md:grid-cols-3'),
])

# ── EncyclopediaSection ──
patch('components/home/EncyclopediaSection.tsx', [
    ('''<div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <BookOpenIcon className="size-3.5 text-primary" />
              {t("badge")}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/encyclopedia">
              {t("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>''',
     '''<div className="flex flex-col items-center gap-4">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpenIcon className="size-3.5 text-primary" />
            {t("badge")}
          </p>
          <h2 className="''' + H2 + ''' text-center">
            {t("title")}
          </h2>
          <p className="mt-2 ''' + P + '''">{t("subtitle")}</p>
          <Button
            asChild
            variant="outline"
            className="rounded-[10px] border-primary/25 bg-primary/12 px-8 py-[0.7rem] text-primary hover:bg-primary/20"
          >
            <Link href="/encyclopedia">
              {t("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>'''),
    ('mt-8 grid gap-4 md:grid-cols-3', 'mt-8 grid gap-4 text-left md:grid-cols-3'),
])

# ── PartnerSection (home teaser) ──
patch('components/home/PartnerSection.tsx', [
    ('''<div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {tTeaser("title")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {tTeaser("text")}
            </p>
          </div>
          <Button size="lg" className="shrink-0" asChild>
            <Link href="/partner">
              {tTeaser("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>''',
     '''<div className="flex flex-col items-center gap-4">
          <h2 className="''' + H2 + ''' text-center">
            {tTeaser("title")}
          </h2>
          <p className="mt-2 ''' + P + '''">
            {tTeaser("text")}
          </p>
          <Button
            size="lg"
            className="shrink-0 rounded-[10px] px-8 py-[0.7rem]"
            asChild
          >
            <Link href="/partner">
              {tTeaser("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>'''),
    ('mt-10 grid items-center gap-10 lg:grid-cols-2',
     'mt-10 grid items-center gap-10 text-left lg:grid-cols-2'),
])
