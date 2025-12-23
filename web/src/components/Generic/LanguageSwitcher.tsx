"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { ChangeEvent, useTransition } from "react";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;

    // Remove the current locale from the path (e.g. /en/dashboard -> /dashboard)
    // Then prepend the new locale
    // TODO: use next-intl's Link or useRouter for cleaner handling
    const pathWithoutLocale = pathname.replace(`/${localActive}`, "");

    startTransition(() => {
      router.replace(`/${nextLocale}${pathWithoutLocale}`);
    });
  };

  return (
    <label className="rounded-lg bg-slate-100 p-2 flex items-center gap-2">
      <span className="text-xs font-bold text-slate-500 uppercase">Lang</span>
      <select
        defaultValue={localActive}
        className="bg-transparent py-1 text-sm font-semibold text-slate-700 outline-none cursor-pointer"
        onChange={onSelectChange}
        disabled={isPending}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </label>
  );
}
