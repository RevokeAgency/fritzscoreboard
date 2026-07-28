// Deutsche Formatierung: Datum TT.MM.JJJJ, Dezimaltrennzeichen Komma.

export function formatDatum(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const tag = String(d.getDate()).padStart(2, "0");
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  const jahr = d.getFullYear();
  return `${tag}.${monat}.${jahr}`;
}

// Zahl mit Komma als Dezimaltrennzeichen; Ganzzahlen ohne Nachkommastellen.
export function formatZahl(wert: number, nachkomma = 1): string {
  if (Number.isInteger(wert)) {
    return new Intl.NumberFormat("de-AT").format(wert);
  }
  return new Intl.NumberFormat("de-AT", {
    minimumFractionDigits: nachkomma,
    maximumFractionDigits: nachkomma,
  }).format(wert);
}

// Punktwert mit Vorzeichen (+/-) fuer Datenzustaende.
export function formatPunkteVorzeichen(wert: number): string {
  const gerundet = Math.round(wert * 10) / 10;
  if (gerundet > 0) return `+${formatZahl(gerundet)}`;
  return formatZahl(gerundet);
}

export function formatProzent(wert: number): string {
  return `${new Intl.NumberFormat("de-AT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(wert)} %`;
}

// ISO-Datum (yyyy-mm-dd) fuer date-Inputs, heute als Vorbelegung.
export function heuteISO(): string {
  const d = new Date();
  const tag = String(d.getDate()).padStart(2, "0");
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${monat}-${tag}`;
}

export function jahrAusISO(iso: string): number {
  return Number(iso.slice(0, 4));
}
