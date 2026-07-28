import { createClient } from "@/lib/supabase/server";
import { ZielRechner } from "@/components/ZielRechner";
import { JahrAuswahl } from "@/components/JahrAuswahl";
import type { Profile } from "@/lib/types";

export default async function ZielePage({
  searchParams,
}: {
  searchParams: Promise<{ jahr?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const jahr = Number(sp.jahr) || new Date().getFullYear();

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("aktiv", true)
    .order("full_name");
  const profile = (profileRaw ?? []) as Profile[];

  const { data: zieleRaw } = await supabase
    .from("jahresziele")
    .select("profile_id, neukunden_ziel, bestand_kunden, ziel_punkte")
    .eq("jahr", jahr);
  const zielMap = new Map(
    (zieleRaw ?? []).map((z) => [z.profile_id, z]),
  );

  const jetzt = new Date().getFullYear();
  const jahre = Array.from(
    new Set<number>([jetzt - 1, jetzt, jetzt + 1]),
  ).sort((a, b) => b - a);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-brand text-3xl">Jahresziele</h1>
        <JahrAuswahl jahr={jahr} jahre={jahre} />
      </div>
      <p className="mb-6 text-sm text-grau-500">
        Individuelles Punkteziel pro ASM. Der Rechner liefert einen Vorschlag,
        den du übernehmen oder überschreiben kannst.
      </p>

      {profile.length === 0 ? (
        <p className="text-grau-500">Keine aktiven ASM vorhanden.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {profile.map((p) => {
            const z = zielMap.get(p.id);
            return (
              <ZielRechner
                key={p.id}
                profileId={p.id}
                name={p.full_name}
                gebiet={p.gebiet}
                jahr={jahr}
                ziel={
                  z
                    ? {
                        neukunden_ziel: z.neukunden_ziel,
                        bestand_kunden: z.bestand_kunden,
                        ziel_punkte: Number(z.ziel_punkte),
                      }
                    : null
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
