/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  // Die oeffentliche Startseite prueft nur optional, ob bereits eine Session
  // besteht. Ein Konfigurations-/Netzwerkfehler darf sie nicht crashen lassen.
  let angemeldet = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    angemeldet = Boolean(user);
  } catch {
    angemeldet = false;
  }

  // redirect() ausserhalb des try/catch, da es intern eine Ausnahme wirft.
  if (angemeldet) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-schwarz text-weiss">
      <header className="flex items-center justify-between border-b border-grau-900 px-6 py-5">
        {/* Offizielles fritz-kola Logo (weiss). Datei: public/brand/logo.svg */}
        <Logo className="h-8 w-auto" />
      </header>

      <section className="flex flex-1 items-center px-6 py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-akzent">
              Außendienst Österreich
            </p>
            <h1 className="font-brand mt-4 text-6xl leading-[0.95] sm:text-7xl">
              Jede Listung
              <br />
              zählt.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-weiss">
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

          {/* Marken-Grafik als Design-Element (schwarzer Hintergrund fliesst in
              die Seite; Datei: public/brand/images.png) */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/brand/images.png"
              alt="wachlevel: jenseits."
              className="w-full max-w-sm select-none"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-grau-900 px-6 py-4 text-xs text-weiss">
        Interner Zugang – Registrierung nur mit Firmen-E-Mail-Adresse.
      </footer>
    </main>
  );
}
