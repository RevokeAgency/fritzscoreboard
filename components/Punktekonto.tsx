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
  jahr,
}: {
  istNetto: number;
  ziel: number;
  brutto: number; // positive Punkte (Neulistung + Exklusivdrehung)
  verlust: number; // negativer Wert
  jahr?: number;
}) {
  const prozent = ziel > 0 ? (istNetto / ziel) * 100 : 0;
  const prozentBegrenzt = Math.max(0, Math.min(100, prozent));

  const verlustBetrag = Math.abs(verlust);
  const gesamt = brutto + verlustBetrag || 1;
  const plusAnteil = (brutto / gesamt) * 100;
  const minusAnteil = (verlustBetrag / gesamt) * 100;

  return (
    <section className="border border-schwarz bg-schwarz p-6 text-weiss sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-grau-500">
            Punktekonto netto{jahr ? ` · ${jahr}` : ""}
          </p>
          <div className="mt-2.5 flex items-baseline gap-4">
            <span
              className={clsx(
                "font-display leading-none tabular text-[clamp(4.5rem,15vw,8.25rem)]",
                istNetto < 0 ? "text-minus" : "text-weiss",
              )}
            >
              {formatZahl(istNetto)}
            </span>
            <span className="font-display text-2xl text-grau-500 tabular sm:text-3xl">
              / {formatZahl(ziel)}
            </span>
            <span className="mb-2 self-end text-[11px] uppercase tracking-[0.12em] text-grau-500">
              Punkte
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-grau-500">
            Zielerreichung
          </p>
          <p
            className={clsx(
              "font-display tabular text-[clamp(2.5rem,8vw,4rem)]",
              prozent >= 100 ? "text-plus" : "text-akzent",
            )}
          >
            {formatProzent(prozent)}
          </p>
        </div>
      </div>

      {/* Fortschrittsbalken gegen das Ziel */}
      <div className="mt-8">
        <div className="h-3.5 w-full overflow-hidden border border-grau-900 bg-black">
          <div
            className="h-full bg-akzent transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${prozentBegrenzt}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] tracking-wide text-grau-500 tabular">
          <span>0</span>
          <span>Ziel {formatZahl(ziel)}</span>
        </div>
      </div>

      {/* Plus/Minus-Balken (Kontoauszug-Metapher) */}
      <div className="mt-6">
        <div className="flex h-6 w-full overflow-hidden rounded-sm">
          <div
            className="flex items-center justify-start bg-plus pl-2.5 text-xs font-semibold text-schwarz transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${plusAnteil}%` }}
          >
            {brutto > 0 && plusAnteil > 12 ? `+${formatZahl(brutto)}` : ""}
          </div>
          <div
            className="flex items-center justify-end bg-minus pr-2.5 text-xs font-semibold text-weiss transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${minusAnteil}%` }}
          >
            {verlustBetrag > 0 && minusAnteil > 12
              ? `−${formatZahl(verlustBetrag)}`
              : ""}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-grau-500">
          <span>Gewonnen +{formatZahl(brutto)}</span>
          <span>Verloren −{formatZahl(verlustBetrag)}</span>
        </div>
      </div>
    </section>
  );
}
