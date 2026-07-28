import type { SupabaseClient } from "@supabase/supabase-js";
import { STANDARD_CONFIG, type ScoringConfig } from "@/lib/scoring";
import type { ScoringConfigRow } from "@/lib/types";

// Laedt die scoring_config eines Jahres. Faellt auf die Standardwerte zurueck,
// wenn fuer das Jahr noch keine Zeile existiert.
export async function ladeScoringConfig(
  supabase: SupabaseClient,
  jahr: number,
): Promise<{ config: ScoringConfig; row: ScoringConfigRow | null }> {
  const { data } = await supabase
    .from("scoring_config")
    .select("*")
    .eq("jahr", jahr)
    .maybeSingle();

  if (!data) return { config: STANDARD_CONFIG, row: null };

  const row = data as ScoringConfigRow;
  const config: ScoringConfig = {
    schwelle_mittel: Number(row.schwelle_mittel),
    schwelle_hoch: Number(row.schwelle_hoch),
    schwelle_kam: Number(row.schwelle_kam),
    punkte_wenig: Number(row.punkte_wenig),
    punkte_mittel: Number(row.punkte_mittel),
    punkte_hoch: Number(row.punkte_hoch),
    punkte_mainstream: Number(row.punkte_mainstream),
    punkte_premium: Number(row.punkte_premium),
    punkte_influential: Number(row.punkte_influential),
    punkte_exklusiv: Number(row.punkte_exklusiv),
    verlust_neutral_bei_schliessung: row.verlust_neutral_bei_schliessung,
  };
  return { config, row };
}
