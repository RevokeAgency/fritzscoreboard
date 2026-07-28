import type {
  Absatzstufe,
  Bewegungstyp,
  Kundentyp,
  Verlustgrund,
} from "./scoring";

export type Rolle = "asm" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  rolle: Rolle;
  gebiet: string | null;
  aktiv: boolean;
  created_at: string;
}

export interface Jahresziel {
  id: string;
  profile_id: string;
  jahr: number;
  neukunden_ziel: number | null;
  bestand_kunden: number | null;
  ziel_punkte: number;
  created_at: string;
}

export interface Kunde {
  id: string;
  profile_id: string;
  sap_nummer: string | null;
  name: string;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  betriebstyp: string | null;
  created_at: string;
}

export interface Bewegung {
  id: string;
  kunde_id: string;
  profile_id: string;
  jahr: number;
  typ: Bewegungstyp;
  datum: string;
  kisten_jahr: number;
  absatzstufe: Absatzstufe;
  kundentyp: Kundentyp | null;
  exklusiv: boolean;
  verlustgrund: Verlustgrund | null;
  notiz: string | null;
  ist_kam: boolean;
  punkte: number;
  created_at: string;
  updated_at: string;
}

// Bewegung inkl. verknuepftem Kunden (fuer Listen).
export interface BewegungMitKunde extends Bewegung {
  kunde: Pick<Kunde, "name" | "sap_nummer" | "ort" | "betriebstyp"> | null;
}

export interface ScoringConfigRow {
  id: string;
  jahr: number;
  schwelle_mittel: number;
  schwelle_hoch: number;
  schwelle_kam: number;
  punkte_wenig: number;
  punkte_mittel: number;
  punkte_hoch: number;
  punkte_mainstream: number;
  punkte_premium: number;
  punkte_influential: number;
  punkte_exklusiv: number;
  verlust_neutral_bei_schliessung: boolean;
}

export const BETRIEBSTYPEN = [
  "Bar",
  "Club",
  "Café",
  "Restaurant",
  "Hotel",
  "Imbiss",
  "Kantine",
  "Sonstiges",
] as const;

export const VERLUSTGRUND_LABEL: Record<Verlustgrund, string> = {
  wettbewerb: "Wettbewerb",
  schliessung: "Betriebsschließung",
  insolvenz: "Insolvenz",
  sonstige: "Sonstiges",
};

export const KUNDENTYP_LABEL: Record<Kundentyp, string> = {
  mainstream: "Mainstream",
  premium: "Premium",
  influential: "Influential",
};

export const ABSATZSTUFE_LABEL: Record<Absatzstufe, string> = {
  wenig: "wenig",
  mittel: "mittel",
  hoch: "hoch",
};

export const TYP_LABEL: Record<Bewegungstyp, string> = {
  neulistung: "Neulistung",
  exklusivdrehung: "Exklusivdrehung",
  verlust: "Verlust",
};

export const KUNDENTYP_TOOLTIP: Record<Kundentyp, string> = {
  influential:
    "Szene- und Referenzbetrieb, echte Reichweite (Google-Bewertungen, Instagram), Guide- oder Award-Listung, wird von anderen Gastronomen kopiert",
  premium:
    "Gehobener Betrieb, gute Lage und Ausstattung, Markenfit, aber kein Multiplikator",
  mainstream: "Standardgastronomie, Imbiss, Kantine",
};
