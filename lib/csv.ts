// CSV-Erzeugung fuer den Export. Semikolon als Trenner (deutsches Excel),
// UTF-8 BOM, Komma als Dezimaltrennzeichen in Zahlenspalten.

function feld(wert: string | number | null | undefined): string {
  const s = wert === null || wert === undefined ? "" : String(wert);
  if (/[";\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function baueCSV(
  kopf: string[],
  zeilen: (string | number | null | undefined)[][],
): string {
  const bom = "﻿";
  const lines = [
    kopf.map(feld).join(";"),
    ...zeilen.map((z) => z.map(feld).join(";")),
  ];
  return bom + lines.join("\r\n");
}

// Loest im Browser einen Download der CSV-Datei aus.
export function ladeCSVHerunter(inhalt: string, dateiname: string) {
  const blob = new Blob([inhalt], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
