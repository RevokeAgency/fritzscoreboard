"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { bewegungAnlegen, type BewegungState } from "@/app/(app)/actions";
import {
  Feld,
  TextInput,
  Select,
  Textarea,
  PrimaryButton,
} from "@/components/ui";
import { PunkteVorschau } from "@/components/PunkteVorschau";
import { KundentypTooltip } from "@/components/KundentypTooltip";
import {
  bewerteBewegung,
  absatzstufeAusKisten,
  type ScoringConfig,
  type Bewegungstyp,
  type Kundentyp,
} from "@/lib/scoring";
import { BETRIEBSTYPEN, ABSATZSTUFE_LABEL } from "@/lib/types";
import { heuteISO } from "@/lib/format";
import { clsx } from "@/lib/clsx";

const initial: BewegungState = {};

export function NeukundeForm({ config }: { config: ScoringConfig }) {
  const [state, formAction, pending] = useActionState(bewegungAnlegen, initial);

  const [typ, setTyp] = useState<Extract<Bewegungstyp, "neulistung" | "exklusivdrehung">>(
    "neulistung",
  );
  const [kisten, setKisten] = useState<number>(0);
  const [kundentyp, setKundentyp] = useState<Kundentyp>("mainstream");
  const [exklusiv, setExklusiv] = useState(false);

  const ergebnis = useMemo(
    () =>
      bewerteBewegung(
        { typ, kisten_jahr: kisten, kundentyp, exklusiv },
        config,
      ),
    [typ, kisten, kundentyp, exklusiv, config],
  );

  const rohStufe = absatzstufeAusKisten(kisten, config);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="typ" value={typ} />

      <div className="flex flex-col gap-5">
        {/* Segmented Control Bewegungstyp */}
        <Feld label="Bewegungstyp">
          <div className="grid grid-cols-2 gap-0 rounded-sm border border-schwarz p-0.5">
            {(["neulistung", "exklusivdrehung"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTyp(t)}
                className={clsx(
                  "rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-wide",
                  typ === t ? "bg-schwarz text-weiss" : "text-schwarz",
                )}
                aria-pressed={typ === t}
              >
                {t === "neulistung" ? "Neulistung" : "Exklusivdrehung"}
              </button>
            ))}
          </div>
        </Feld>

        <Feld label="Kundenname" htmlFor="name" pflicht>
          <TextInput id="name" name="name" required autoComplete="off" />
        </Feld>

        <div className="grid grid-cols-2 gap-4">
          <Feld label="SAP-Kundennummer" htmlFor="sap_nummer">
            <TextInput id="sap_nummer" name="sap_nummer" autoComplete="off" />
          </Feld>
          <Feld label="Betriebstyp" htmlFor="betriebstyp">
            <Select id="betriebstyp" name="betriebstyp" defaultValue="">
              <option value="">– bitte wählen –</option>
              {BETRIEBSTYPEN.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Feld>
        </div>

        <Feld label="Straße" htmlFor="strasse">
          <TextInput id="strasse" name="strasse" autoComplete="off" />
        </Feld>
        <div className="grid grid-cols-[8rem_1fr] gap-4">
          <Feld label="PLZ" htmlFor="plz">
            <TextInput id="plz" name="plz" inputMode="numeric" autoComplete="off" />
          </Feld>
          <Feld label="Ort" htmlFor="ort">
            <TextInput id="ort" name="ort" autoComplete="off" />
          </Feld>
        </div>

        <Feld label="Datum der Listung" htmlFor="datum" pflicht>
          <TextInput
            id="datum"
            name="datum"
            type="date"
            defaultValue={heuteISO()}
            required
          />
        </Feld>

        <Feld
          label="Kisten pro Jahr"
          htmlFor="kisten_jahr"
          pflicht
          hinweis={
            <span>
              Abgeleitete Stufe:{" "}
              <strong className="text-schwarz">
                {rohStufe === "kam"
                  ? "über 1.000 – KAM-Kunde"
                  : ABSATZSTUFE_LABEL[rohStufe]}
              </strong>
            </span>
          }
        >
          <TextInput
            id="kisten_jahr"
            name="kisten_jahr"
            type="number"
            min={0}
            inputMode="numeric"
            value={kisten || ""}
            onChange={(e) => setKisten(Number(e.target.value) || 0)}
            required
          />
        </Feld>

        {typ === "neulistung" && (
          <>
            <Feld
              label={
                <span className="inline-flex items-center gap-2">
                  Kundentyp <KundentypTooltip />
                </span>
              }
              htmlFor="kundentyp"
            >
              <Select
                id="kundentyp"
                name="kundentyp"
                value={kundentyp}
                onChange={(e) => setKundentyp(e.target.value as Kundentyp)}
              >
                <option value="mainstream">Mainstream (+0)</option>
                <option value="premium">Premium (+1)</option>
                <option value="influential">Influential (+2)</option>
              </Select>
            </Feld>

            <label className="flex cursor-pointer items-center gap-3 border border-grau-200 px-3 py-3">
              <input
                type="checkbox"
                name="exklusiv"
                checked={exklusiv}
                onChange={(e) => setExklusiv(e.target.checked)}
                className="h-5 w-5 accent-[var(--akzent)]"
              />
              <span className="text-sm font-medium">
                Exklusivbelieferung{" "}
                <span className="text-grau-500">(+1 Punkt)</span>
              </span>
            </label>
          </>
        )}

        <Feld label="Notiz" htmlFor="notiz">
          <Textarea id="notiz" name="notiz" />
        </Feld>

        {state.fehler && (
          <p className="flex items-center gap-2 rounded-sm border border-minus px-3 py-2 text-sm text-minus">
            <AlertTriangle size={16} /> {state.fehler}
          </p>
        )}
        {state.erfolg && (
          <p className="flex items-center gap-2 rounded-sm border border-plus px-3 py-2 text-sm text-schwarz">
            <CheckCircle2 size={16} className="text-plus" /> {state.erfolg}
          </p>
        )}

        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Speichern…" : "Bewegung speichern"}
        </PrimaryButton>
      </div>

      {/* Live-Vorschau rechts (klebt am unteren Rand auf Mobil) */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <PunkteVorschau ergebnis={ergebnis} typ={typ} />
      </div>
    </form>
  );
}
