import { createClient } from "@/lib/supabase/server";
import { AsmUebersicht, type AsmZeile } from "@/components/AsmUebersicht";
import { AdminUebersichtFilter } from "@/components/AdminUebersichtFilter";
import { BewegungenTabelle } from "@/components/BewegungenTabelle";
import { zuTabellenzeile } from "@/lib/tabelle";
import type { Profile } from "@/lib/types";

interface RohBewegung {
  id: string;
  profile_id: string;
  datum: string;
  jahr: number;
  typ: string;
  absatzstufe: string;
  kundentyp: string | null;
  exklusiv: boolean;
  verlustgrund: string | null;
  kisten_jahr: number;
  ist_kam: boolean;
  punkte: number | string;
  notiz: string | null;
  created_at: string;
  kunde: { name: string; sap_nummer: string | null; ort: string | null } | null;
}

export default async function AdminUebersichtPage({
  searchParams,
}: {
  searchParams: Promise<{ jahr?: string; gebiet?: string; asm?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const jahr = Number(sp.jahr) || new Date().getFullYear();
  const gebietFilter = sp.gebiet ?? "";
  const asmFilter = sp.asm ?? "";

  // Alle Profile (Admin liest alle).
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  const profile = (profileRaw ?? []) as Profile[];
  const asmProfile = profile.filter((p) => p.aktiv);

  // Ziele des Jahres.
  const { data: zieleRaw } = await supabase
    .from("jahresziele")
    .select("profile_id, ziel_punkte")
    .eq("jahr", jahr);
  const zielMap = new Map<string, number>();
  (zieleRaw ?? []).forEach((z) =>
    zielMap.set(z.profile_id, Number(z.ziel_punkte)),
  );

  // Alle Bewegungen des Jahres inkl. Kunde.
  const { data: bewRaw } = await supabase
    .from("bewegungen")
    .select("*, kunde:kunden(name, sap_nummer, ort)")
    .eq("jahr", jahr)
    .order("datum", { ascending: false })
    .order("created_at", { ascending: false });
  const bewegungen = (bewRaw ?? []) as unknown as RohBewegung[];

  const nameMap = new Map(profile.map((p) => [p.id, p.full_name]));
  const gebiete = Array.from(
    new Set(asmProfile.map((p) => p.gebiet).filter(Boolean) as string[]),
  ).sort();

  // Sichtbare ASM nach Gebiets-/ASM-Filter.
  const sichtbareAsm = asmProfile.filter((p) => {
    if (gebietFilter && p.gebiet !== gebietFilter) return false;
    if (asmFilter && p.id !== asmFilter) return false;
    return true;
  });
  const sichtbareIds = new Set(sichtbareAsm.map((p) => p.id));

  // Aggregation pro ASM.
  const zeilen: AsmZeile[] = sichtbareAsm.map((p) => {
    const eigene = bewegungen.filter(
      (b) => b.profile_id === p.id && !b.ist_kam,
    );
    const summe = (typ: string) =>
      eigene
        .filter((b) => b.typ === typ)
        .reduce((s, b) => s + Number(b.punkte), 0);
    const zaehle = (typ: string) =>
      eigene.filter((b) => b.typ === typ).length;
    const istNetto = summe("neulistung") + summe("exklusivdrehung") + summe("verlust");
    return {
      id: p.id,
      name: p.full_name,
      gebiet: p.gebiet,
      ziel: zielMap.get(p.id) ?? 0,
      istNetto,
      neulistungen: zaehle("neulistung"),
      exklusivdrehungen: zaehle("exklusivdrehung"),
      verluste: zaehle("verlust"),
    };
  });

  // Bewegungsliste (nach denselben ASM-Filtern).
  const zeilenTabelle = bewegungen
    .filter((b) => sichtbareIds.has(b.profile_id))
    .map((b) => zuTabellenzeile(b, nameMap.get(b.profile_id)));

  const jahre = Array.from(
    new Set<number>([new Date().getFullYear(), ...bewegungen.map((b) => b.jahr)]),
  ).sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-brand text-[2.5rem] leading-[0.95]">Gesamtübersicht</h1>
        <AdminUebersichtFilter
          jahr={jahr}
          jahre={jahre}
          gebiet={gebietFilter}
          gebiete={gebiete}
          asmId={asmFilter}
          asmListe={asmProfile.map((p) => ({ id: p.id, name: p.full_name }))}
        />
      </div>

      <AsmUebersicht zeilen={zeilen} jahr={jahr} />

      <div>
        <h2 className="mb-3 font-brand text-[1.75rem]">Bewegungen aller ASM</h2>
        <BewegungenTabelle zeilen={zeilenTabelle} zeigeAsm />
      </div>
    </div>
  );
}
