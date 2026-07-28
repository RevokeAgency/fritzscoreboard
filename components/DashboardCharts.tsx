"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui";

const SCHWARZ = "#0A0A0A";
const PLUS = "#00A94F";

function ChartKarte({
  titel,
  daten,
  einfaerben,
}: {
  titel: string;
  daten: { label: string; anzahl: number }[];
  einfaerben?: boolean;
}) {
  const leer = daten.every((d) => d.anzahl === 0);
  return (
    <Card className="p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-grau-500">
        {titel}
      </h3>
      {leer ? (
        <p className="flex h-40 items-center justify-center text-sm text-grau-500">
          Noch keine Daten.
        </p>
      ) : (
        <div className="mt-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daten} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#E5E5E5" }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Bar dataKey="anzahl" radius={[2, 2, 0, 0]}>
                {daten.map((_, i) => (
                  <Cell key={i} fill={einfaerben ? PLUS : SCHWARZ} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="sr-only">
        {daten.map((d) => `${d.label}: ${d.anzahl}`).join(", ")}
      </p>
    </Card>
  );
}

export function NeulistungCharts({
  nachStufe,
  nachKundentyp,
}: {
  nachStufe: { stufe: string; anzahl: number }[];
  nachKundentyp: { kundentyp: string; anzahl: number }[];
}) {
  const stufenLabels: Record<string, string> = {
    wenig: "wenig",
    mittel: "mittel",
    hoch: "hoch",
  };
  const typLabels: Record<string, string> = {
    mainstream: "Mainstream",
    premium: "Premium",
    influential: "Influential",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartKarte
        titel="Neulistungen nach Absatzstufe"
        einfaerben
        daten={nachStufe.map((d) => ({
          label: stufenLabels[d.stufe] ?? d.stufe,
          anzahl: d.anzahl,
        }))}
      />
      <ChartKarte
        titel="Neulistungen nach Kundentyp"
        daten={nachKundentyp.map((d) => ({
          label: typLabels[d.kundentyp] ?? d.kundentyp,
          anzahl: d.anzahl,
        }))}
      />
    </div>
  );
}
