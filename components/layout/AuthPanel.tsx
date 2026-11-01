"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2Icon,
  LogOutIcon,
  MailIcon,
  SendIcon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { mockSignIn, mockSignOut, useAuthUser } from "@/lib/auth-store";
import { SITE } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FormValues = { email: string; password: string };

function LoginForm({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("auth");

  const schema = z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    password: z.string().min(6, t("passwordRequired")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    // TODO(auth API): replace mockSignIn with the real endpoint call.
    await mockSignIn(values.email);
    toast.success(t("welcomeToast"));
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <p className="font-semibold">{t("signInTitle")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("signInSubtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="auth-email" className="text-xs font-medium text-muted-foreground">
          {t("email")}
        </label>
        <Input
          id="auth-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="auth-password" className="text-xs font-medium text-muted-foreground">
          {t("password")}
        </label>
        <Input
          id="auth-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <MailIcon />
        )}
        {isSubmitting ? t("signingIn") : t("submit")}
      </Button>

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* TODO(auth API): wire to the Telegram login flow once the bot is ready. */}
      <Button variant="outline" asChild>
        <a href={SITE.telegram} target="_blank" rel="noopener noreferrer">
          <SendIcon className="text-[#229ED9]" />
          {t("telegramCta")}
        </a>
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {t("telegramHint")}
      </p>
    </form>
  );
}

function UserMenu({ email, onDone }: { email: string; onDone?: () => void }) {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold uppercase text-primary-foreground">
          {email.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{email.split("@")[0]}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <Button variant="outline" className="w-full justify-start" asChild>
        <Link href="/partner" onClick={onDone}>
          <UserRoundIcon />
          {t("cabinet")}
        </Link>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start text-destructive hover:text-destructive"
        onClick={() => {
          mockSignOut();
          toast.success(t("signedOutToast"));
          onDone?.();
        }}
      >
        <LogOutIcon />
        {t("logout")}
      </Button>
    </div>
  );
}

export function AuthPanel() {
  const t = useTranslations("auth");
  const user = useAuthUser();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("account")}
          className="relative"
        >
          {user ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold uppercase text-primary-foreground">
              {user.email.charAt(0)}
            </span>
          ) : (
            <UserIcon />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        {user ? (
          <UserMenu email={user.email} onDone={() => setOpen(false)} />
        ) : (
          <LoginForm onDone={() => setOpen(false)} />
        )}
      </PopoverContent>
    </Popover>
  );
}
