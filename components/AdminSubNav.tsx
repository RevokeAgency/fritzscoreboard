"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

const punkte = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/ziele", label: "Jahresziele" },
  { href: "/admin/nutzer", label: "Nutzer" },
  { href: "/admin/konfiguration", label: "Konfiguration" },
];

export function AdminSubNav() {
  const pathname = usePathname();
  const aktiv = (href: string) =>
    href === "/admin"
      ? pathname === "/admin" || pathname.startsWith("/admin/asm")
      : pathname.startsWith(href);

  return (
    <nav className="flex flex-wrap gap-1 border-b border-grau-200">
      {punkte.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className={clsx(
            "-mb-px border-b-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide",
            aktiv(p.href)
              ? "border-schwarz text-schwarz"
              : "border-transparent text-grau-500 hover:text-schwarz",
          )}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
