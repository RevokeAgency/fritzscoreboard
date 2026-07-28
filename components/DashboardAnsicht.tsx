import { Punktekonto } from "@/components/Punktekonto";
import { NeulistungCharts } from "@/components/DashboardCharts";
import { BewegungListe } from "@/components/BewegungListe";
import { Kennzahl } from "@/components/ui";
import { formatZahl } from "@/lib/format";
import type { DashboardKennzahlen } from "@/lib/aggregate";
import type { BewegungMitKunde } from "@/lib/types";

// Gemeinsamer Aufbau fuer ASM-Dashboard und Admin-Detailansicht.
export function DashboardAnsicht({
  kennzahlen,
  ziel,
  letzteBewegungen,
  jahr,
}: {
  kennzahlen: DashboardKennzahlen;
  ziel: number;
  letzteBewegungen: BewegungMitKunde[];
  jahr?: number;
}) {
  const brutto =
    kennzahlen.punkteNeulistung + kennzahlen.punkteExklusivdrehung;

  return (
    <div className="flex flex-col gap-6">
      <Punktekonto
        istNetto={kennzahlen.istNetto}
        ziel={ziel}
        brutto={brutto}
        verlust={kennzahlen.punkteVerlust}
        jahr={jahr}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kennzahl
          label="Neulistungen (brutto)"
          wert={`+${formatZahl(kennzahlen.punkteNeulistung)}`}
          farbe="plus"
          sub={`Punkte aus ${formatZahl(kennzahlen.anzahlNeulistung)} Listungen`}
        />
        <Kennzahl
          label="Exklusivdrehungen"
          wert={`+${formatZahl(kennzahlen.punkteExklusivdrehung)}`}
          farbe="schwarz"
          sub={`Punkte aus ${formatZahl(kennzahlen.anzahlExklusivdrehung)} Drehungen`}
        />
        <Kennzahl
          label="Verluste"
          wert={formatZahl(kennzahlen.punkteVerlust)}
          farbe="minus"
          sub={`Punkte aus ${formatZahl(kennzahlen.anzahlVerlust)} Verlusten`}
        />
        <Kennzahl
          label="Bewegungen gesamt"
          wert={formatZahl(kennzahlen.anzahlBewegungen)}
          farbe="schwarz"
          sub={jahr ? `im Jahr ${jahr}` : undefined}
        />
      </div>

      <NeulistungCharts
        nachStufe={kennzahlen.neulistungNachStufe}
        nachKundentyp={kennzahlen.neulistungNachKundentyp}
      />

      <BewegungListe bewegungen={letzteBewegungen} titel="Letzte 10 Bewegungen" />
    </div>
  );
}
