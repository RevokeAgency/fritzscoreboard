import { createClient } from "@/lib/supabase/server";
import { berechneKennzahlen } from "@/lib/aggregate";
import { DashboardAnsicht } from "@/components/DashboardAnsicht";
import { JahrAuswahl } from "@/components/JahrAuswahl";
import type { Bewegung, BewegungMitKunde } from "@/lib/types";

function verfuegbareJahre(daten: number[]): number[] {
  const jetzt = new Date().getFullYear();
  const set = new Set<number>([jetzt, ...daten]);
  return Array.from(set).sort((a, b) => b - a);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ jahr?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sp = await searchParams;
  const jahr = Number(sp.jahr) || new Date().getFullYear();

  // Alle Bewegungen des Jahres (RLS liefert nur die eigenen).
  const { data: bewegungenRaw } = await supabase
    .from("bewegungen")
    .select("*")
    .eq("profile_id", user!.id)
    .eq("jahr", jahr);

  const bewegungen = (bewegungenRaw ?? []) as Bewegung[];

  // Letzte 10 inkl. Kundennamen.
  const { data: letzteRaw } = await supabase
    .from("bewegungen")
    .select("*, kunde:kunden(name, sap_nummer, ort, betriebstyp)")
    .eq("profile_id", user!.id)
    .eq("jahr", jahr)
    .order("datum", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  // Jahresziel des Nutzers.
  const { data: ziel } = await supabase
    .from("jahresziele")
    .select("ziel_punkte")
    .eq("profile_id", user!.id)
    .eq("jahr", jahr)
    .maybeSingle();

  // Jahre fuer die Auswahl.
  const { data: jahreRaw } = await supabase
    .from("bewegungen")
    .select("jahr")
    .eq("profile_id", user!.id);
  const jahre = verfuegbareJahre((jahreRaw ?? []).map((r) => r.jahr));

  const kennzahlen = berechneKennzahlen(bewegungen);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-brand text-[2.5rem] leading-[0.95]">Dashboard</h1>
        <JahrAuswahl jahr={jahr} jahre={jahre} />
      </div>

      {!ziel && (
        <p className="mb-4 rounded-sm border border-akzent bg-akzent/10 px-4 py-3 text-sm">
          Für {jahr} ist noch kein Jahresziel hinterlegt. Wende dich an die
          Administration.
        </p>
      )}

      <DashboardAnsicht
        kennzahlen={kennzahlen}
        ziel={Number(ziel?.ziel_punkte ?? 0)}
        letzteBewegungen={(letzteRaw ?? []) as unknown as BewegungMitKunde[]}
        jahr={jahr}
      />
    </div>
  );
}
