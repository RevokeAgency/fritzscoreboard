"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Card,
  Feld,
  TextInput,
  PrimaryButton,
} from "@/components/ui";
import {
  konfigurationSpeichern,
  type ConfigState,
} from "@/app/(admin)/admin/actions";
import type { ScoringConfigRow } from "@/lib/types";
import { STANDARD_CONFIG } from "@/lib/scoring";

const initial: ConfigState = {};

export function KonfigForm({
  jahr,
  config,
}: {
  jahr: number;
  config: ScoringConfigRow | null;
}) {
  const [state, formAction, pending] = useActionState(
    konfigurationSpeichern,
    initial,
  );

  const w = {
    schwelle_mittel: config?.schwelle_mittel ?? STANDARD_CONFIG.schwelle_mittel,
    schwelle_hoch: config?.schwelle_hoch ?? STANDARD_CONFIG.schwelle_hoch,
    schwelle_kam: config?.schwelle_kam ?? STANDARD_CONFIG.schwelle_kam,
    punkte_wenig: config?.punkte_wenig ?? STANDARD_CONFIG.punkte_wenig,
    punkte_mittel: config?.punkte_mittel ?? STANDARD_CONFIG.punkte_mittel,
    punkte_hoch: config?.punkte_hoch ?? STANDARD_CONFIG.punkte_hoch,
    punkte_mainstream:
      config?.punkte_mainstream ?? STANDARD_CONFIG.punkte_mainstream,
    punkte_premium: config?.punkte_premium ?? STANDARD_CONFIG.punkte_premium,
    punkte_influential:
      config?.punkte_influential ?? STANDARD_CONFIG.punkte_influential,
    punkte_exklusiv: config?.punkte_exklusiv ?? STANDARD_CONFIG.punkte_exklusiv,
    verlust_neutral_bei_schliessung:
      config?.verlust_neutral_bei_schliessung ??
      STANDARD_CONFIG.verlust_neutral_bei_schliessung,
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="jahr" value={jahr} />

      <Card className="p-5">
        <h3 className="font-display text-lg">Absatzstufen (Kisten / Jahr)</h3>
        <p className="mt-1 text-sm text-grau-500">
          Ab welcher Kistenzahl eine Stufe beginnt. Über der KAM-Schwelle zählt
          ein Kunde nicht auf das ASM-Ziel.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ZahlFeld name="schwelle_mittel" label="Schwelle mittel ab" value={w.schwelle_mittel} />
          <ZahlFeld name="schwelle_hoch" label="Schwelle hoch ab" value={w.schwelle_hoch} />
          <ZahlFeld name="schwelle_kam" label="KAM-Schwelle über" value={w.schwelle_kam} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-display text-lg">Punkte je Absatzstufe</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ZahlFeld name="punkte_wenig" label="wenig" value={w.punkte_wenig} step="0.1" />
          <ZahlFeld name="punkte_mittel" label="mittel" value={w.punkte_mittel} step="0.1" />
          <ZahlFeld name="punkte_hoch" label="hoch" value={w.punkte_hoch} step="0.1" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-display text-lg">Zusatzpunkte Kundentyp & Exklusivität</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <ZahlFeld name="punkte_mainstream" label="Mainstream" value={w.punkte_mainstream} step="0.1" />
          <ZahlFeld name="punkte_premium" label="Premium" value={w.punkte_premium} step="0.1" />
          <ZahlFeld name="punkte_influential" label="Influential" value={w.punkte_influential} step="0.1" />
          <ZahlFeld name="punkte_exklusiv" label="Exklusivität" value={w.punkte_exklusiv} step="0.1" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-display text-lg">Verluste</h3>
        <label className="mt-3 flex items-center gap-3">
          <input
            type="checkbox"
            name="verlust_neutral_bei_schliessung"
            defaultChecked={w.verlust_neutral_bei_schliessung}
            className="h-5 w-5 accent-[var(--akzent)]"
          />
          <span className="text-sm">
            Betriebsschließung und Insolvenz neutral stellen (0 Punkte statt
            Minuspunkte)
          </span>
        </label>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Speichern…" : "Konfiguration speichern"}
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

      <p className="text-xs text-grau-500">
        Hinweis: Änderungen gelten für neu erfasste Bewegungen. Bereits
        gespeicherte Punktwerte bleiben unverändert, damit sich die
        Bonusgrundlage nicht rückwirkend verschiebt.
      </p>
    </form>
  );
}

function ZahlFeld({
  name,
  label,
  value,
  step,
}: {
  name: string;
  label: string;
  value: number;
  step?: string;
}) {
  return (
    <Feld label={label} htmlFor={name}>
      <TextInput
        id={name}
        name={name}
        type="number"
        step={step ?? "1"}
        min={0}
        defaultValue={value}
        className="py-2"
      />
    </Feld>
  );
}
