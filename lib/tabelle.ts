import type { TabellenZeile } from "@/components/BewegungenTabelle";

// DB-Zeile (Bewegung + eingebetteter Kunde) -> Tabellenzeile.
interface RohBewegung {
  id: string;
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
  kunde?: { name: string; sap_nummer: string | null; ort: string | null } | null;
}

export function zuTabellenzeile(
  b: RohBewegung,
  asmName?: string,
): TabellenZeile {
  return {
    id: b.id,
    datum: b.datum,
    jahr: b.jahr,
    typ: b.typ as TabellenZeile["typ"],
    kundenname: b.kunde?.name ?? "—",
    sap_nummer: b.kunde?.sap_nummer ?? null,
    ort: b.kunde?.ort ?? null,
    absatzstufe: b.absatzstufe as TabellenZeile["absatzstufe"],
    kundentyp: b.kundentyp as TabellenZeile["kundentyp"],
    exklusiv: b.exklusiv,
    verlustgrund: b.verlustgrund,
    kisten_jahr: b.kisten_jahr,
    ist_kam: b.ist_kam,
    punkte: Number(b.punkte),
    notiz: b.notiz,
    asm_name: asmName,
    created_at: b.created_at,
  };
}
