import { createClient } from "@/lib/supabase/server";
import { KonfigForm } from "@/components/KonfigForm";
import { JahrAuswahl } from "@/components/JahrAuswahl";
import type { ScoringConfigRow } from "@/lib/types";

export default async function KonfigurationPage({
  searchParams,
}: {
  searchParams: Promise<{ jahr?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const jahr = Number(sp.jahr) || new Date().getFullYear();

  const { data } = await supabase
    .from("scoring_config")
    .select("*")
    .eq("jahr", jahr)
    .maybeSingle();

  const jetzt = new Date().getFullYear();
  const jahre = Array.from(
    new Set<number>([jetzt - 1, jetzt, jetzt + 1]),
  ).sort((a, b) => b - a);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-brand text-[2.5rem] leading-[0.95]">Konfiguration</h1>
        <JahrAuswahl jahr={jahr} jahre={jahre} />
      </div>
      <p className="mb-6 text-sm text-grau-500">
        Punktwerte und Schwellen pro Jahr. Ohne gespeicherte Zeile gelten die
        Standardwerte.
      </p>

      <KonfigForm jahr={jahr} config={(data as ScoringConfigRow) ?? null} />
    </div>
  );
}
