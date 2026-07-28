"use client";

import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Card, Select, TextInput, TypBadge, GhostButton } from "@/components/ui";
import { formatDatum, formatPunkteVorzeichen } from "@/lib/format";
import { baueCSV, ladeCSVHerunter } from "@/lib/csv";
import { clsx } from "@/lib/clsx";
import {
  TYP_LABEL,
  ABSATZSTUFE_LABEL,
  KUNDENTYP_LABEL,
  VERLUSTGRUND_LABEL,
} from "@/lib/types";
import type { Bewegungstyp, Absatzstufe, Kundentyp } from "@/lib/scoring";

export interface TabellenZeile {
  id: string;
  datum: string;
  jahr: number;
  typ: Bewegungstyp;
  kundenname: string;
  sap_nummer: string | null;
  ort: string | null;
  absatzstufe: Absatzstufe;
  kundentyp: Kundentyp | null;
  exklusiv: boolean;
  verlustgrund: string | null;
  kisten_jahr: number;
  ist_kam: boolean;
  punkte: number;
  notiz: string | null;
  asm_name?: string;
  created_at: string;
}

const VIERUNDZWANZIG_H = 24 * 60 * 60 * 1000;

export function BewegungenTabelle({
  zeilen,
  zeigeAsm = false,
  loeschenAction,
}: {
  zeilen: TabellenZeile[];
  zeigeAsm?: boolean;
  loeschenAction?: (formData: FormData) => void;
}) {
  const [typ, setTyp] = useState<string>("");
  const [stufe, setStufe] = useState<string>("");
  const [kundentyp, setKundentyp] = useState<string>("");
  const [von, setVon] = useState<string>("");
  const [bis, setBis] = useState<string>("");
  const [suche, setSuche] = useState<string>("");

  const gefiltert = useMemo(() => {
    return zeilen.filter((z) => {
      if (typ && z.typ !== typ) return false;
      if (stufe && z.absatzstufe !== stufe) return false;
      if (kundentyp && z.kundentyp !== kundentyp) return false;
      if (von && z.datum < von) return false;
      if (bis && z.datum > bis) return false;
      if (suche) {
        const q = suche.toLowerCase();
        const treffer =
          z.kundenname.toLowerCase().includes(q) ||
          (z.sap_nummer ?? "").toLowerCase().includes(q) ||
          (z.asm_name ?? "").toLowerCase().includes(q);
        if (!treffer) return false;
      }
      return true;
    });
  }, [zeilen, typ, stufe, kundentyp, von, bis, suche]);

  function exportiere() {
    const kopf = [
      "Datum",
      ...(zeigeAsm ? ["ASM"] : []),
      "Kunde",
      "SAP-Nummer",
      "Ort",
      "Typ",
      "Absatzstufe",
      "Kisten/Jahr",
      "Kundentyp",
      "Exklusiv",
      "Verlustgrund",
      "KAM",
      "Punkte",
      "Notiz",
    ];
    const zeilenCSV = gefiltert.map((z) => [
      formatDatum(z.datum),
      ...(zeigeAsm ? [z.asm_name ?? ""] : []),
      z.kundenname,
      z.sap_nummer ?? "",
      z.ort ?? "",
      TYP_LABEL[z.typ],
      ABSATZSTUFE_LABEL[z.absatzstufe],
      z.kisten_jahr,
      z.kundentyp ? KUNDENTYP_LABEL[z.kundentyp] : "",
      z.exklusiv ? "ja" : "nein",
      z.verlustgrund
        ? (VERLUSTGRUND_LABEL[z.verlustgrund as keyof typeof VERLUSTGRUND_LABEL] ??
          z.verlustgrund)
        : "",
      z.ist_kam ? "ja" : "nein",
      String(z.punkte).replace(".", ","),
      z.notiz ?? "",
    ]);
    ladeCSVHerunter(
      baueCSV(kopf, zeilenCSV),
      `bewegungen-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  const loeschbar = (z: TabellenZeile) =>
    Date.now() - new Date(z.created_at).getTime() < VIERUNDZWANZIG_H;

  return (
    <Card>
      {/* Filterleiste */}
      <div className="flex flex-wrap items-end gap-3 border-b border-grau-200 p-4">
        <FilterFeld label="Suche">
          <TextInput
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Kunde / SAP…"
            className="py-2"
          />
        </FilterFeld>
        <FilterFeld label="Typ">
          <Select value={typ} onChange={(e) => setTyp(e.target.value)} className="py-2">
            <option value="">Alle</option>
            {(Object.keys(TYP_LABEL) as Bewegungstyp[]).map((t) => (
              <option key={t} value={t}>
                {TYP_LABEL[t]}
              </option>
            ))}
          </Select>
        </FilterFeld>
        <FilterFeld label="Absatzstufe">
          <Select value={stufe} onChange={(e) => setStufe(e.target.value)} className="py-2">
            <option value="">Alle</option>
            <option value="wenig">wenig</option>
            <option value="mittel">mittel</option>
            <option value="hoch">hoch</option>
          </Select>
        </FilterFeld>
        <FilterFeld label="Kundentyp">
          <Select
            value={kundentyp}
            onChange={(e) => setKundentyp(e.target.value)}
            className="py-2"
          >
            <option value="">Alle</option>
            {(Object.keys(KUNDENTYP_LABEL) as Kundentyp[]).map((t) => (
              <option key={t} value={t}>
                {KUNDENTYP_LABEL[t]}
              </option>
            ))}
          </Select>
        </FilterFeld>
        <FilterFeld label="Von">
          <TextInput
            type="date"
            value={von}
            onChange={(e) => setVon(e.target.value)}
            className="py-2"
          />
        </FilterFeld>
        <FilterFeld label="Bis">
          <TextInput
            type="date"
            value={bis}
            onChange={(e) => setBis(e.target.value)}
            className="py-2"
          />
        </FilterFeld>
        <div className="ml-auto">
          <GhostButton type="button" onClick={exportiere} className="py-2.5">
            <Download size={16} /> CSV-Export
          </GhostButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-grau-200 text-left text-xs uppercase tracking-wide text-grau-500">
              <th className="px-4 py-2 font-semibold">Datum</th>
              {zeigeAsm && <th className="px-4 py-2 font-semibold">ASM</th>}
              <th className="px-4 py-2 font-semibold">Kunde</th>
              <th className="px-4 py-2 font-semibold">Typ</th>
              <th className="px-4 py-2 font-semibold">Stufe</th>
              <th className="px-4 py-2 text-right font-semibold">Kisten</th>
              <th className="px-4 py-2 font-semibold">Detail</th>
              <th className="px-4 py-2 text-right font-semibold">Punkte</th>
              {loeschenAction && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {gefiltert.length === 0 ? (
              <tr>
                <td
                  colSpan={zeigeAsm ? 9 : 8}
                  className="px-4 py-8 text-center text-grau-500"
                >
                  Keine Bewegungen für die gewählten Filter.
                </td>
              </tr>
            ) : (
              gefiltert.map((z) => (
                <tr key={z.id} className="border-b border-grau-200 align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 tabular">
                    {formatDatum(z.datum)}
                  </td>
                  {zeigeAsm && (
                    <td className="px-4 py-2.5">{z.asm_name ?? "—"}</td>
                  )}
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{z.kundenname}</div>
                    <div className="text-xs text-grau-500">
                      {z.sap_nummer ? `${z.sap_nummer} ` : ""}
                      {z.ort ?? ""}
                      {z.ist_kam && (
                        <span className="ml-1 bg-akzent px-1 text-[10px] font-semibold uppercase text-schwarz">
                          KAM
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <TypBadge typ={z.typ} />
                  </td>
                  <td className="px-4 py-2.5">{ABSATZSTUFE_LABEL[z.absatzstufe]}</td>
                  <td className="px-4 py-2.5 text-right tabular">{z.kisten_jahr}</td>
                  <td className="px-4 py-2.5 text-xs text-grau-500">
                    {z.typ === "neulistung" && (
                      <>
                        {z.kundentyp ? KUNDENTYP_LABEL[z.kundentyp] : ""}
                        {z.exklusiv ? " · exklusiv" : ""}
                      </>
                    )}
                    {z.typ === "verlust" && z.verlustgrund
                      ? (VERLUSTGRUND_LABEL[
                          z.verlustgrund as keyof typeof VERLUSTGRUND_LABEL
                        ] ?? z.verlustgrund)
                      : ""}
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-2.5 text-right font-display text-base tabular",
                      z.punkte > 0
                        ? "text-plus"
                        : z.punkte < 0
                          ? "text-minus"
                          : "text-grau-500",
                    )}
                  >
                    {formatPunkteVorzeichen(z.punkte)}
                  </td>
                  {loeschenAction && (
                    <td className="px-4 py-2.5 text-right">
                      {loeschbar(z) ? (
                        <form action={loeschenAction}>
                          <input type="hidden" name="id" value={z.id} />
                          <button
                            type="submit"
                            aria-label="Bewegung löschen"
                            title="Löschen (nur bis 24 h nach Anlage)"
                            className="text-grau-500 hover:text-minus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      ) : (
                        <span
                          title="Löschfrist abgelaufen – bitte Korrekturbuchung erfassen"
                          className="text-xs text-grau-200"
                        >
                          —
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-grau-200 px-4 py-2 text-xs text-grau-500">
        {gefiltert.length} von {zeilen.length} Bewegungen
      </div>
    </Card>
  );
}

function FilterFeld({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-grau-500">
        {label}
      </span>
      {children}
    </label>
  );
}
