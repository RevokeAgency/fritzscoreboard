// ===========================================================================
// Punkteberechnung – reine, testbare Funktionen.
// Diese Datei ist die einzige Quelle der Wahrheit fuer die Bewertungslogik
// und laeuft im Client (Live-Vorschau) wie im Server (Persistierung) identisch.
// ===========================================================================

export type Bewegungstyp = "neulistung" | "exklusivdrehung" | "verlust";
export type Absatzstufe = "wenig" | "mittel" | "hoch";
export type Kundentyp = "mainstream" | "premium" | "influential";
export type Verlustgrund = "wettbewerb" | "schliessung" | "insolvenz" | "sonstige";

// Konfiguration der Punktwerte und Schwellen (entspricht Tabelle scoring_config).
export interface ScoringConfig {
  schwelle_mittel: number; // ab dieser Kistenzahl -> Stufe "mittel"
  schwelle_hoch: number; // ab dieser Kistenzahl -> Stufe "hoch"
  schwelle_kam: number; // ueber dieser Kistenzahl -> KAM-Kunde
  punkte_wenig: number;
  punkte_mittel: number;
  punkte_hoch: number;
  punkte_mainstream: number;
  punkte_premium: number;
  punkte_influential: number;
  punkte_exklusiv: number;
  verlust_neutral_bei_schliessung: boolean;
}

// Standardkonfiguration – identisch zu den DEFAULT-Werten der Migration.
export const STANDARD_CONFIG: ScoringConfig = {
  schwelle_mittel: 250,
  schwelle_hoch: 500,
  schwelle_kam: 1000,
  punkte_wenig: 1,
  punkte_mittel: 2,
  punkte_hoch: 3,
  punkte_mainstream: 0,
  punkte_premium: 1,
  punkte_influential: 2,
  punkte_exklusiv: 1,
  verlust_neutral_bei_schliessung: true,
};

export interface BewegungEingabe {
  typ: Bewegungstyp;
  kisten_jahr: number;
  kundentyp?: Kundentyp | null;
  exklusiv?: boolean;
  verlustgrund?: Verlustgrund | null;
}

export interface ScoringErgebnis {
  ist_kam: boolean;
  absatzstufe: Absatzstufe;
  punkte_absatz: number;
  punkte_typ: number; // Zusatzpunkte aus Kundentyp (nur neulistung)
  punkte_exklusiv: number; // Punkte aus Exklusivitaet (nur neulistung)
  neutral: boolean; // true, wenn Verlust neutral gestellt wurde
  punkte: number; // finaler, zu persistierender Punktwert
}

// ---------------------------------------------------------------------------
// Ableitung der Absatzstufe aus der Kistenzahl pro Jahr.
// Gibt "kam" zurueck, wenn die Menge in die KAM-Betreuung faellt.
// ---------------------------------------------------------------------------
export function absatzstufeAusKisten(
  kisten: number,
  config: ScoringConfig = STANDARD_CONFIG,
): Absatzstufe | "kam" {
  if (kisten > config.schwelle_kam) return "kam";
  if (kisten >= config.schwelle_hoch) return "hoch";
  if (kisten >= config.schwelle_mittel) return "mittel";
  return "wenig";
}

// ---------------------------------------------------------------------------
// Punkte fuer eine Absatzstufe.
// ---------------------------------------------------------------------------
export function punkteFuerAbsatzstufe(
  stufe: Absatzstufe,
  config: ScoringConfig = STANDARD_CONFIG,
): number {
  switch (stufe) {
    case "wenig":
      return config.punkte_wenig;
    case "mittel":
      return config.punkte_mittel;
    case "hoch":
      return config.punkte_hoch;
  }
}

// ---------------------------------------------------------------------------
// Zusatzpunkte aus dem Kundentyp (nur bei neulistung relevant).
// ---------------------------------------------------------------------------
export function punkteFuerKundentyp(
  kundentyp: Kundentyp | null | undefined,
  config: ScoringConfig = STANDARD_CONFIG,
): number {
  switch (kundentyp) {
    case "premium":
      return config.punkte_premium;
    case "influential":
      return config.punkte_influential;
    case "mainstream":
    default:
      return config.punkte_mainstream;
  }
}

// ---------------------------------------------------------------------------
// Zentrale Bewertung einer Bewegung.
//
// neulistung:      punkte_absatz + punkte_typ + (exklusiv ? +1 : 0)  -> 1..6
// exklusivdrehung: punkte_absatz                                     -> 1..3
// verlust:         punkte_absatz * -1                                -> -1..-3
//   Sonderregel: bei verlustgrund schliessung/insolvenz -> 0 Punkte,
//   sofern verlust_neutral_bei_schliessung aktiv ist.
//
// KAM-Kunden (ueber schwelle_kam Kisten) zaehlen nicht: punkte = 0, ist_kam = true.
// ---------------------------------------------------------------------------
export function bewerteBewegung(
  eingabe: BewegungEingabe,
  config: ScoringConfig = STANDARD_CONFIG,
): ScoringErgebnis {
  const rohStufe = absatzstufeAusKisten(eingabe.kisten_jahr, config);
  const ist_kam = rohStufe === "kam";
  // Fuer KAM-Kunden ist die Stufe fachlich irrelevant; wir setzen "hoch"
  // als naechstliegende Stufe fuer die (nicht gewertete) Anzeige.
  const absatzstufe: Absatzstufe = ist_kam ? "hoch" : rohStufe;

  const punkte_absatz = punkteFuerAbsatzstufe(absatzstufe, config);

  const basis: ScoringErgebnis = {
    ist_kam,
    absatzstufe,
    punkte_absatz,
    punkte_typ: 0,
    punkte_exklusiv: 0,
    neutral: false,
    punkte: 0,
  };

  if (ist_kam) {
    // KAM-Kunden werden aus allen Punktsummen ausgeschlossen.
    return basis;
  }

  switch (eingabe.typ) {
    case "neulistung": {
      const punkte_typ = punkteFuerKundentyp(eingabe.kundentyp, config);
      const punkte_exklusiv = eingabe.exklusiv ? config.punkte_exklusiv : 0;
      return {
        ...basis,
        punkte_typ,
        punkte_exklusiv,
        punkte: punkte_absatz + punkte_typ + punkte_exklusiv,
      };
    }

    case "exklusivdrehung": {
      return {
        ...basis,
        punkte: punkte_absatz,
      };
    }

    case "verlust": {
      const neutral =
        config.verlust_neutral_bei_schliessung &&
        (eingabe.verlustgrund === "schliessung" ||
          eingabe.verlustgrund === "insolvenz");
      return {
        ...basis,
        neutral,
        punkte: neutral ? 0 : punkte_absatz * -1,
      };
    }
  }
}
