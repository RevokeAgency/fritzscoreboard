"use client";

import { clsx } from "@/lib/clsx";
import { formatPunkteVorzeichen } from "@/lib/format";
import type { ScoringErgebnis, Bewegungstyp } from "@/lib/scoring";
import { ABSATZSTUFE_LABEL } from "@/lib/types";

// Grosse, permanent sichtbare Live-Vorschau der resultierenden Punktzahl.
// Das wichtigste Element der Formulare.
export function PunkteVorschau({
  ergebnis,
  typ,
}: {
  ergebnis: ScoringErgebnis;
  typ: Bewegungstyp;
}) {
  const negativ = ergebnis.punkte < 0;
  const farbe = ergebnis.ist_kam
    ? "text-grau-500"
    : negativ
      ? "text-minus"
      : ergebnis.punkte === 0
        ? "text-weiss"
        : "text-plus";

  const caption = ergebnis.ist_kam
    ? "zählt nicht auf das Ziel"
    : typ === "neulistung"
      ? "von maximal 6 Punkten"
      : typ === "verlust"
        ? "Verlust: bis −3 Punkte"
        : "von maximal 3 Punkten";

  return (
    <div className="sticky bottom-0 border border-schwarz bg-schwarz p-5 text-weiss lg:bottom-auto">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-grau-500">
          Punktevorschau
        </span>
        {ergebnis.ist_kam && (
          <span className="bg-akzent px-2 py-0.5 text-[11px] font-semibold uppercase text-schwarz">
            KAM-Kunde
          </span>
        )}
      </div>

      <div
        className={clsx(
          "font-display mt-1 text-[5.5rem] leading-none tabular transition-colors duration-200",
          farbe,
        )}
        aria-live="polite"
      >
        {formatPunkteVorzeichen(ergebnis.punkte)}
      </div>
      <div className="mt-1.5 text-xs text-grau-500">{caption}</div>

      {/* Aufschluesselung als Ledger */}
      <dl className="mt-4 border-t border-grau-900 text-sm">
        <Zeile
          label={`Absatz (${ABSATZSTUFE_LABEL[ergebnis.absatzstufe]})`}
          wert={ergebnis.punkte_absatz}
          durchgestrichen={ergebnis.ist_kam}
        />
        {typ === "neulistung" && (
          <>
            <Zeile
              label="Kundentyp"
              wert={ergebnis.punkte_typ}
              durchgestrichen={ergebnis.ist_kam}
            />
            <Zeile
              label="Exklusivität"
              wert={ergebnis.punkte_exklusiv}
              durchgestrichen={ergebnis.ist_kam}
            />
          </>
        )}
      </dl>

      {typ === "verlust" && ergebnis.neutral && (
        <p className="mt-3 text-sm text-akzent">
          Grund neutral gestellt – keine Minuspunkte.
        </p>
      )}

      {ergebnis.ist_kam && (
        <p className="mt-3 text-sm leading-relaxed text-akzent">
          Über 1.000 Kisten: Kunde fällt in die KAM-Betreuung und zählt nicht
          auf dein ASM-Ziel. Speichern ist möglich, die Bewegung wird als KAM
          markiert.
        </p>
      )}
    </div>
  );
}

function Zeile({
  label,
  wert,
  durchgestrichen,
}: {
  label: string;
  wert: number;
  durchgestrichen?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between border-b border-grau-900 py-2.5",
        durchgestrichen ? "text-grau-500 line-through" : "text-grau-200",
      )}
    >
      <dt>{label}</dt>
      <dd className="font-semibold text-weiss tabular">
        {wert > 0 ? `+${wert}` : wert}
      </dd>
    </div>
  );
}
