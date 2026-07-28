"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  List,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { clsx } from "@/lib/clsx";
import type { Rolle } from "@/lib/types";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function AppNav({
  rolle,
  name,
  abmeldenAction,
}: {
  rolle: Rolle;
  name: string;
  abmeldenAction: () => void;
}) {
  const pathname = usePathname();
  const [offen, setOffen] = useState(false);

  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/neukunde", label: "Neulistung", icon: <PlusCircle size={18} /> },
    { href: "/verlust", label: "Verlust", icon: <MinusCircle size={18} /> },
    { href: "/bewegungen", label: "Bewegungen", icon: <List size={18} /> },
  ];

  if (rolle === "admin") {
    links.push({ href: "/admin", label: "Admin", icon: <Shield size={18} /> });
  }

  const istAktiv = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-20 border-b border-grau-200 bg-weiss">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="bg-schwarz px-2 py-1">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium",
                  istAktiv(l.href)
                    ? "bg-schwarz text-weiss"
                    : "text-grau-500 hover:text-schwarz",
                )}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-grau-500 sm:inline">{name}</span>
          <form action={abmeldenAction} className="hidden md:block">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-sm border border-grau-200 px-3 py-2 text-sm text-grau-500 hover:border-schwarz hover:text-schwarz"
              aria-label="Abmelden"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </form>
          <button
            type="button"
            className="rounded-sm border border-grau-200 p-2 md:hidden"
            aria-label="Menü"
            aria-expanded={offen}
            onClick={() => setOffen((o) => !o)}
          >
            {offen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {offen && (
        <nav className="border-t border-grau-200 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOffen(false)}
              className={clsx(
                "flex items-center gap-3 border-b border-grau-200 px-4 py-3 text-sm font-medium",
                istAktiv(l.href) ? "bg-schwarz text-weiss" : "text-schwarz",
              )}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          <form action={abmeldenAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-grau-500"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
