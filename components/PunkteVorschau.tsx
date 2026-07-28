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
        ? "text-schwarz"
        : "text-plus";

  return (
    <div className="sticky bottom-0 border border-schwarz bg-schwarz p-4 text-weiss">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-grau-500">
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
          "font-display mt-1 text-6xl tabular transition-all duration-200",
          farbe,
        )}
        aria-live="polite"
      >
        {formatPunkteVorzeichen(ergebnis.punkte)}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-grau-200">
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
        {typ === "verlust" && ergebnis.neutral && (
          <span className="text-akzent">
            Grund neutral gestellt – keine Minuspunkte.
          </span>
        )}
      </div>

      {ergebnis.ist_kam && (
        <p className="mt-3 text-sm text-akzent">
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
    <span className={clsx(durchgestrichen && "line-through opacity-50")}>
      {label}:{" "}
      <span className="font-semibold text-weiss tabular">
        {wert > 0 ? `+${wert}` : wert}
      </span>
    </span>
  );
}
