"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { Calculator, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Card,
  Feld,
  TextInput,
  PrimaryButton,
  GhostButton,
} from "@/components/ui";
import { zielSpeichern, type ZielState } from "@/app/(admin)/admin/actions";
import { formatZahl } from "@/lib/format";

const initial: ZielState = {};

export interface ZielRechnerProps {
  profileId: string;
  name: string;
  gebiet: string | null;
  jahr: number;
  ziel?: {
    neukunden_ziel: number | null;
    bestand_kunden: number | null;
    ziel_punkte: number;
  } | null;
}

export function ZielRechner({
  profileId,
  name,
  gebiet,
  jahr,
  ziel,
}: ZielRechnerProps) {
  const [state, formAction, pending] = useActionState(zielSpeichern, initial);

  const [neukunden, setNeukunden] = useState<number>(ziel?.neukunden_ziel ?? 0);
  const [bestand, setBestand] = useState<number>(ziel?.bestand_kunden ?? 0);
  const [oPunktwert, setOPunktwert] = useState<number>(2.0);
  const [lostRate, setLostRate] = useState<number>(7.5);
  const [oVerlust, setOVerlust] = useState<number>(1.5);
  const [zielPunkte, setZielPunkte] = useState<string>(
    ziel ? String(ziel.ziel_punkte).replace(".", ",") : "",
  );

  // Vorschlag = (Neukundenziel × Ø-Punktwert) − (Bestand × Lost-Rate × Ø-Verlustpunkte)
  const vorschlag = useMemo(() => {
    const gewinn = neukunden * oPunktwert;
    const verlust = bestand * (lostRate / 100) * oVerlust;
    return Math.round((gewinn - verlust) * 10) / 10;
  }, [neukunden, bestand, oPunktwert, lostRate, oVerlust]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg">{name}</h3>
          <p className="text-xs text-grau-500">
            {gebiet ? `Gebiet ${gebiet}` : "Kein Gebiet"} · Jahr {jahr}
          </p>
        </div>
        {ziel && (
          <span className="text-xs text-grau-500">
            aktuell {formatZahl(ziel.ziel_punkte)} Punkte
          </span>
        )}
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="profile_id" value={profileId} />
        <input type="hidden" name="jahr" value={jahr} />

        {/* Rechner-Eingaben */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Feld label="Neukundenziel" htmlFor={`nk-${profileId}`}>
            <TextInput
              id={`nk-${profileId}`}
              name="neukunden_ziel"
              type="number"
              min={0}
              value={neukunden || ""}
              onChange={(e) => setNeukunden(Number(e.target.value) || 0)}
              className="py-2"
            />
          </Feld>
          <Feld label="Bestand Kunden" htmlFor={`bk-${profileId}`}>
            <TextInput
              id={`bk-${profileId}`}
              name="bestand_kunden"
              type="number"
              min={0}
              value={bestand || ""}
              onChange={(e) => setBestand(Number(e.target.value) || 0)}
              className="py-2"
            />
          </Feld>
          <Feld label="Ø-Punktwert" htmlFor={`pw-${profileId}`}>
            <TextInput
              id={`pw-${profileId}`}
              type="number"
              step="0.1"
              min={0}
              value={oPunktwert}
              onChange={(e) => setOPunktwert(Number(e.target.value) || 0)}
              className="py-2"
            />
          </Feld>
          <Feld label="Lost-Rate %" htmlFor={`lr-${profileId}`}>
            <TextInput
              id={`lr-${profileId}`}
              type="number"
              step="0.1"
              min={0}
              value={lostRate}
              onChange={(e) => setLostRate(Number(e.target.value) || 0)}
              className="py-2"
            />
          </Feld>
          <Feld label="Ø-Verlustpunkte" htmlFor={`vp-${profileId}`}>
            <TextInput
              id={`vp-${profileId}`}
              type="number"
              step="0.1"
              min={0}
              value={oVerlust}
              onChange={(e) => setOVerlust(Number(e.target.value) || 0)}
              className="py-2"
            />
          </Feld>
        </div>

        {/* Vorschlag */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border border-grau-200 bg-grau-200/20 p-3">
          <Calculator size={18} className="text-grau-500" />
          <span className="text-sm text-grau-500">Vorschlag</span>
          <span className="font-display text-2xl tabular">
            {formatZahl(vorschlag)}
          </span>
          <span className="text-xs text-grau-500">
            = ({formatZahl(neukunden)} × {formatZahl(oPunktwert)}) − (
            {formatZahl(bestand)} × {formatZahl(lostRate)} % ×{" "}
            {formatZahl(oVerlust)})
          </span>
          <GhostButton
            type="button"
            onClick={() => setZielPunkte(String(vorschlag).replace(".", ","))}
            className="ml-auto py-2"
          >
            Übernehmen
          </GhostButton>
        </div>

        {/* Zielfeld + speichern */}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Feld label="Zielpunkte" htmlFor={`zp-${profileId}`} pflicht>
            <TextInput
              id={`zp-${profileId}`}
              name="ziel_punkte"
              inputMode="decimal"
              value={zielPunkte}
              onChange={(e) => setZielPunkte(e.target.value)}
              required
              className="w-40 py-2 text-lg font-semibold"
            />
          </Feld>
          <PrimaryButton type="submit" disabled={pending} className="py-2.5">
            {pending ? "Speichern…" : "Ziel speichern"}
          </PrimaryButton>

          {state.fehler && (
            <span className="flex items-center gap-1 text-sm text-minus">
              <AlertTriangle size={14} /> {state.fehler}
            </span>
          )}
          {state.erfolg && (
            <span className="flex items-center gap-1 text-sm text-plus">
              <CheckCircle2 size={14} /> {state.erfolg}
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
