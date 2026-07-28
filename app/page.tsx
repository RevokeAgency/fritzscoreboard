import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-schwarz text-weiss">
      <header className="flex items-center justify-between border-b border-grau-900 px-6 py-5">
        <Logo />
      </header>

      <section className="flex flex-1 flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-akzent">
            Außendienst Österreich
          </p>
          <h1 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">
            Jede Listung
            <br />
            zählt.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-grau-500">
            Das Scoreboard bewertet Neulistungen, Exklusivdrehungen und
            Kundenverluste im Gastro-Bereich und misst sie gegen dein
            persönliches Jahresziel. Ergänzung zum SAP&nbsp;CRM, kein Ersatz.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-sm bg-weiss px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-schwarz transition-opacity hover:opacity-80"
            >
              Anmelden
            </Link>
            <Link
              href="/registrieren"
              className="rounded-sm border border-weiss px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-weiss transition-colors hover:bg-weiss hover:text-schwarz"
            >
              Registrieren
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-grau-900 px-6 py-4 text-xs text-grau-500">
        Interner Zugang – Registrierung nur mit Firmen-E-Mail-Adresse.
      </footer>
    </main>
  );
}
