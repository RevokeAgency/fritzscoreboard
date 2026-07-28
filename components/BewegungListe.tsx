import { Card, TypBadge } from "@/components/ui";
import { formatDatum, formatPunkteVorzeichen } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { BewegungMitKunde } from "@/lib/types";

// Kompakte Liste der letzten Bewegungen (Dashboard).
export function BewegungListe({
  bewegungen,
  titel = "Letzte Bewegungen",
}: {
  bewegungen: BewegungMitKunde[];
  titel?: string;
}) {
  return (
    <Card>
      <h3 className="border-b border-grau-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-grau-500">
        {titel}
      </h3>
      {bewegungen.length === 0 ? (
        <p className="px-4 py-6 text-sm text-grau-500">
          Noch keine Bewegungen erfasst.
        </p>
      ) : (
        <ul>
          {bewegungen.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 border-b border-grau-200 px-4 py-3 transition-colors last:border-b-0 hover:bg-grau-200/40"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">
                    {b.kunde?.name ?? "—"}
                  </span>
                  {b.ist_kam && (
                    <span className="bg-akzent px-1.5 py-0.5 text-[10px] font-semibold uppercase text-schwarz">
                      KAM
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-grau-500">
                  <TypBadge typ={b.typ} />
                  <span>·</span>
                  <span className="tabular">{formatDatum(b.datum)}</span>
                </div>
              </div>
              <span
                className={clsx(
                  "font-display text-xl tabular",
                  b.punkte > 0
                    ? "text-plus"
                    : b.punkte < 0
                      ? "text-minus"
                      : "text-grau-500",
                )}
              >
                {formatPunkteVorzeichen(b.punkte)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
