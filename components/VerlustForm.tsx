"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { bewegungAnlegen, type BewegungState } from "@/app/(app)/actions";
import {
  Feld,
  TextInput,
  Select,
  Textarea,
  PrimaryButton,
} from "@/components/ui";
import { PunkteVorschau } from "@/components/PunkteVorschau";
import {
  bewerteBewegung,
  absatzstufeAusKisten,
  type ScoringConfig,
  type Verlustgrund,
} from "@/lib/scoring";
import { BETRIEBSTYPEN, ABSATZSTUFE_LABEL, VERLUSTGRUND_LABEL } from "@/lib/types";
import { heuteISO } from "@/lib/format";
import { clsx } from "@/lib/clsx";

const initial: BewegungState = {};

interface KundeOption {
  id: string;
  name: string;
  sap_nummer: string | null;
  ort: string | null;
}

export function VerlustForm({
  config,
  kunden,
}: {
  config: ScoringConfig;
  kunden: KundeOption[];
}) {
  const [state, formAction, pending] = useActionState(bewegungAnlegen, initial);

  const [modus, setModus] = useState<"bestehend" | "neu">(
    kunden.length > 0 ? "bestehend" : "neu",
  );
  const [suche, setSuche] = useState("");
  const [kundeId, setKundeId] = useState("");
  const [kisten, setKisten] = useState<number>(0);
  const [verlustgrund, setVerlustgrund] = useState<Verlustgrund | "">("");

  const ergebnis = useMemo(
    () =>
      bewerteBewegung(
        {
          typ: "verlust",
          kisten_jahr: kisten,
          verlustgrund: verlustgrund || null,
        },
        config,
      ),
    [kisten, verlustgrund, config],
  );

  const rohStufe = absatzstufeAusKisten(kisten, config);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return kunden.slice(0, 20);
    return kunden
      .filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          (k.sap_nummer ?? "").toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [suche, kunden]);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="typ" value="verlust" />
      {modus === "bestehend" && (
        <input type="hidden" name="kunde_id" value={kundeId} />
      )}

      <div className="flex flex-col gap-5">
        {/* Modusauswahl */}
        <Feld label="Kunde">
          <div className="grid grid-cols-2 gap-0 rounded-sm border border-schwarz p-0.5">
            {(
              [
                ["bestehend", "Im Tool erfasst"],
                ["neu", "Bestandskunde neu anlegen"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setModus(m)}
                className={clsx(
                  "rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-wide",
                  modus === m ? "bg-schwarz text-weiss" : "text-schwarz",
                )}
                aria-pressed={modus === m}
              >
                {label}
              </button>
            ))}
          </div>
        </Feld>

        {modus === "bestehend" ? (
          <Feld label="Kunde suchen (Name / SAP-Nummer)" pflicht>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-3.5 text-grau-500"
              />
              <TextInput
                className="pl-9"
                placeholder="Name oder SAP-Nummer…"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
              />
            </div>
            <div className="mt-2 max-h-56 overflow-auto border border-grau-200">
              {gefiltert.length === 0 ? (
                <p className="px-3 py-3 text-sm text-grau-500">
                  Kein Kunde gefunden.
                </p>
              ) : (
                gefiltert.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKundeId(k.id)}
                    className={clsx(
                      "flex w-full items-center justify-between border-b border-grau-200 px-3 py-2 text-left text-sm last:border-b-0",
                      kundeId === k.id ? "bg-schwarz text-weiss" : "hover:bg-grau-200/40",
                    )}
                  >
                    <span className="font-medium">{k.name}</span>
                    <span
                      className={clsx(
                        "text-xs",
                        kundeId === k.id ? "text-grau-200" : "text-grau-500",
                      )}
                    >
                      {k.sap_nummer ?? ""} {k.ort ? `· ${k.ort}` : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Feld>
        ) : (
          <>
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
          </>
        )}

        <Feld label="Datum des Verlusts" htmlFor="datum" pflicht>
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

        <Feld label="Verlustgrund" htmlFor="verlustgrund" pflicht>
          <Select
            id="verlustgrund"
            name="verlustgrund"
            value={verlustgrund}
            onChange={(e) => setVerlustgrund(e.target.value as Verlustgrund)}
            required
          >
            <option value="">– bitte wählen –</option>
            {(Object.keys(VERLUSTGRUND_LABEL) as Verlustgrund[]).map((g) => (
              <option key={g} value={g}>
                {VERLUSTGRUND_LABEL[g]}
              </option>
            ))}
          </Select>
        </Feld>

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

        <PrimaryButton
          type="submit"
          disabled={pending || (modus === "bestehend" && !kundeId)}
        >
          {pending ? "Speichern…" : "Verlust speichern"}
        </PrimaryButton>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <PunkteVorschau ergebnis={ergebnis} typ="verlust" />
      </div>
    </form>
  );
}
