import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { berechneKennzahlen } from "@/lib/aggregate";
import { DashboardAnsicht } from "@/components/DashboardAnsicht";
import { JahrAuswahl } from "@/components/JahrAuswahl";
import type { Bewegung, BewegungMitKunde, Profile } from "@/lib/types";

export default async function AsmDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jahr?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const jahr = Number(sp.jahr) || new Date().getFullYear();

  const supabase = await createClient();

  const { data: profil } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!profil) notFound();
  const asm = profil as Profile;

  const { data: bewegungenRaw } = await supabase
    .from("bewegungen")
    .select("*")
    .eq("profile_id", id)
    .eq("jahr", jahr);
  const bewegungen = (bewegungenRaw ?? []) as Bewegung[];

  const { data: letzteRaw } = await supabase
    .from("bewegungen")
    .select("*, kunde:kunden(name, sap_nummer, ort, betriebstyp)")
    .eq("profile_id", id)
    .eq("jahr", jahr)
    .order("datum", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: ziel } = await supabase
    .from("jahresziele")
    .select("ziel_punkte")
    .eq("profile_id", id)
    .eq("jahr", jahr)
    .maybeSingle();

  const { data: jahreRaw } = await supabase
    .from("bewegungen")
    .select("jahr")
    .eq("profile_id", id);
  const jahre = Array.from(
    new Set<number>([
      new Date().getFullYear(),
      ...(jahreRaw ?? []).map((r) => r.jahr),
    ]),
  ).sort((a, b) => b - a);

  const kennzahlen = berechneKennzahlen(bewegungen);

  return (
    <div>
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-grau-500 hover:text-schwarz"
      >
        <ArrowLeft size={16} /> Zurück zur Übersicht
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-brand text-3xl">{asm.full_name}</h1>
          <p className="text-sm text-grau-500">
            {asm.gebiet ? `Gebiet ${asm.gebiet}` : "Kein Gebiet"} · {asm.email}
          </p>
        </div>
        <JahrAuswahl jahr={jahr} jahre={jahre} />
      </div>

      <DashboardAnsicht
        kennzahlen={kennzahlen}
        ziel={Number(ziel?.ziel_punkte ?? 0)}
        letzteBewegungen={(letzteRaw ?? []) as unknown as BewegungMitKunde[]}
      />
    </div>
  );
}
