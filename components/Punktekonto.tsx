"use client";

import { formatZahl, formatProzent } from "@/lib/format";
import { clsx } from "@/lib/clsx";

// Signature-Element: das Punktekonto als Kontoauszug.
// Sehr grosse Zahl in Display-Schrift, darunter ein Balken, der Plus- und
// Minusanteil gegeneinanderstellt. Die eine Stelle, an der es laut sein darf.
export function Punktekonto({
  istNetto,
  ziel,
  brutto,
  verlust,
}: {
  istNetto: number;
  ziel: number;
  brutto: number; // positive Punkte (Neulistung + Exklusivdrehung)
  verlust: number; // negativer Wert
}) {
  const prozent = ziel > 0 ? (istNetto / ziel) * 100 : 0;
  const prozentBegrenzt = Math.max(0, Math.min(100, prozent));

  const verlustBetrag = Math.abs(verlust);
  const gesamt = brutto + verlustBetrag || 1;
  const plusAnteil = (brutto / gesamt) * 100;
  const minusAnteil = (verlustBetrag / gesamt) * 100;

  return (
    <section className="border border-schwarz bg-schwarz p-6 text-weiss sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-grau-500">
            Punktekonto netto
          </p>
          <div className="mt-1 flex items-baseline gap-4">
            <span
              className={clsx(
                "font-display text-7xl leading-none tabular sm:text-8xl",
                istNetto < 0 ? "text-minus" : "text-weiss",
              )}
            >
              {formatZahl(istNetto)}
            </span>
            <span className="font-display text-2xl text-grau-500 tabular">
              / {formatZahl(ziel)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-grau-500">
            Zielerreichung
          </p>
          <p
            className={clsx(
              "font-display text-5xl tabular",
              prozent >= 100 ? "text-plus" : "text-akzent",
            )}
          >
            {formatProzent(prozent)}
          </p>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="mt-6">
        <div className="h-3 w-full overflow-hidden bg-grau-900">
          <div
            className="h-full bg-akzent transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${prozentBegrenzt}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-grau-500 tabular">
          <span>0</span>
          <span>Ziel {formatZahl(ziel)}</span>
        </div>
      </div>

      {/* Plus/Minus-Balken (Kontoauszug-Metapher) */}
      <div className="mt-6">
        <div className="flex h-6 w-full overflow-hidden rounded-sm">
          <div
            className="flex items-center justify-start bg-plus pl-2 text-xs font-semibold text-schwarz transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${plusAnteil}%` }}
          >
            {brutto > 0 && plusAnteil > 12 ? `+${formatZahl(brutto)}` : ""}
          </div>
          <div
            className="flex items-center justify-end bg-minus pr-2 text-xs font-semibold text-weiss transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${minusAnteil}%` }}
          >
            {verlustBetrag > 0 && minusAnteil > 12
              ? `−${formatZahl(verlustBetrag)}`
              : ""}
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-grau-500">
          <span>Gewonnen +{formatZahl(brutto)}</span>
          <span>Verloren −{formatZahl(verlustBetrag)}</span>
        </div>
      </div>
    </section>
  );
}
