import type { Bewegung } from "@/lib/types";

export interface DashboardKennzahlen {
  istNetto: number;
  punkteNeulistung: number; // brutto (nur neulistung)
  punkteExklusivdrehung: number;
  punkteVerlust: number; // negativ
  anzahlBewegungen: number;
  anzahlNeulistung: number;
  anzahlExklusivdrehung: number;
  anzahlVerlust: number;
  neulistungNachStufe: { stufe: string; anzahl: number }[];
  neulistungNachKundentyp: { kundentyp: string; anzahl: number }[];
}

// Berechnet alle Dashboard-Kennzahlen aus einer Liste bereits persistierter
// Bewegungen. KAM-Bewegungen sind aus allen Punktsummen ausgeschlossen.
export function berechneKennzahlen(bewegungen: Bewegung[]): DashboardKennzahlen {
  const gewertet = bewegungen.filter((b) => !b.ist_kam);

  const punkteNeulistung = gewertet
    .filter((b) => b.typ === "neulistung")
    .reduce((s, b) => s + Number(b.punkte), 0);

  const punkteExklusivdrehung = gewertet
    .filter((b) => b.typ === "exklusivdrehung")
    .reduce((s, b) => s + Number(b.punkte), 0);

  const punkteVerlust = gewertet
    .filter((b) => b.typ === "verlust")
    .reduce((s, b) => s + Number(b.punkte), 0);

  const istNetto = punkteNeulistung + punkteExklusivdrehung + punkteVerlust;

  const stufen: Record<string, number> = { wenig: 0, mittel: 0, hoch: 0 };
  const typen: Record<string, number> = {
    mainstream: 0,
    premium: 0,
    influential: 0,
  };
  for (const b of gewertet) {
    if (b.typ !== "neulistung") continue;
    stufen[b.absatzstufe] = (stufen[b.absatzstufe] ?? 0) + 1;
    if (b.kundentyp) typen[b.kundentyp] = (typen[b.kundentyp] ?? 0) + 1;
  }

  return {
    istNetto,
    punkteNeulistung,
    punkteExklusivdrehung,
    punkteVerlust,
    anzahlBewegungen: bewegungen.length,
    anzahlNeulistung: gewertet.filter((b) => b.typ === "neulistung").length,
    anzahlExklusivdrehung: gewertet.filter((b) => b.typ === "exklusivdrehung")
      .length,
    anzahlVerlust: gewertet.filter((b) => b.typ === "verlust").length,
    neulistungNachStufe: [
      { stufe: "wenig", anzahl: stufen.wenig },
      { stufe: "mittel", anzahl: stufen.mittel },
      { stufe: "hoch", anzahl: stufen.hoch },
    ],
    neulistungNachKundentyp: [
      { kundentyp: "mainstream", anzahl: typen.mainstream },
      { kundentyp: "premium", anzahl: typen.premium },
      { kundentyp: "influential", anzahl: typen.influential },
    ],
  };
}

// Anzahl je Bewegungstyp (fuer Admin-Uebersicht).
export function zaehleTypen(bewegungen: Bewegung[]) {
  const gewertet = bewegungen.filter((b) => !b.ist_kam);
  return {
    neulistungen: gewertet.filter((b) => b.typ === "neulistung").length,
    exklusivdrehungen: gewertet.filter((b) => b.typ === "exklusivdrehung").length,
    verluste: gewertet.filter((b) => b.typ === "verlust").length,
  };
}
