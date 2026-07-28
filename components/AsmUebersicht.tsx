import Link from "next/link";
import { Card } from "@/components/ui";
import { formatZahl, formatProzent } from "@/lib/format";
import { clsx } from "@/lib/clsx";

export interface AsmZeile {
  id: string;
  name: string;
  gebiet: string | null;
  ziel: number;
  istNetto: number;
  neulistungen: number;
  exklusivdrehungen: number;
  verluste: number;
}

export function AsmUebersicht({
  zeilen,
  jahr,
}: {
  zeilen: AsmZeile[];
  jahr: number;
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-grau-200 text-left text-xs uppercase tracking-wide text-grau-500">
            <th className="px-4 py-3 font-semibold">ASM</th>
            <th className="px-4 py-3 font-semibold">Gebiet</th>
            <th className="px-4 py-3 text-right font-semibold">Ziel</th>
            <th className="px-4 py-3 text-right font-semibold">Ist netto</th>
            <th className="px-4 py-3 text-right font-semibold">Erreichung</th>
            <th className="px-4 py-3 text-right font-semibold">Neu</th>
            <th className="px-4 py-3 text-right font-semibold">Exkl.</th>
            <th className="px-4 py-3 text-right font-semibold">Verl.</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-grau-500">
                Keine aktiven ASM für die Auswahl.
              </td>
            </tr>
          ) : (
            zeilen.map((z) => {
              const prozent = z.ziel > 0 ? (z.istNetto / z.ziel) * 100 : 0;
              return (
                <tr
                  key={z.id}
                  className="border-b border-grau-200 hover:bg-grau-200/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/asm/${z.id}?jahr=${jahr}`}
                      className="font-semibold underline decoration-grau-200 underline-offset-2 hover:decoration-schwarz"
                    >
                      {z.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-grau-500">{z.gebiet ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular">
                    {formatZahl(z.ziel)}
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-3 text-right font-semibold tabular",
                      z.istNetto < 0 ? "text-minus" : "text-schwarz",
                    )}
                  >
                    {formatZahl(z.istNetto)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden h-2 w-20 overflow-hidden bg-grau-200 sm:block">
                        <div
                          className={clsx(
                            "h-full",
                            prozent >= 100 ? "bg-plus" : "bg-schwarz",
                          )}
                          style={{
                            width: `${Math.max(0, Math.min(100, prozent))}%`,
                          }}
                        />
                      </div>
                      <span
                        className={clsx(
                          "tabular",
                          prozent >= 100 ? "text-plus" : "text-schwarz",
                        )}
                      >
                        {formatProzent(prozent)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-plus">
                    {z.neulistungen}
                  </td>
                  <td className="px-4 py-3 text-right tabular">
                    {z.exklusivdrehungen}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-minus">
                    {z.verluste}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Card>
  );
}
