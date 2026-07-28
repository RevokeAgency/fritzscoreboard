"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ladeScoringConfig } from "@/lib/scoring-config";
import {
  bewerteBewegung,
  absatzstufeAusKisten,
  type Bewegungstyp,
  type Kundentyp,
  type Verlustgrund,
} from "@/lib/scoring";
import { jahrAusISO } from "@/lib/format";

export interface BewegungState {
  fehler?: string;
  erfolg?: string;
}

// Legt eine Bewegung an. Wird von /neukunde und /verlust verwendet.
export async function bewegungAnlegen(
  _prev: BewegungState,
  formData: FormData,
): Promise<BewegungState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: "Nicht angemeldet." };

  const typ = String(formData.get("typ") ?? "") as Bewegungstyp;
  if (!["neulistung", "exklusivdrehung", "verlust"].includes(typ)) {
    return { fehler: "Ungültiger Bewegungstyp." };
  }

  const datum = String(formData.get("datum") ?? "");
  if (!datum) return { fehler: "Bitte ein Datum angeben." };
  const jahr = jahrAusISO(datum);

  const kistenRaw = String(formData.get("kisten_jahr") ?? "").trim();
  const kisten_jahr = Number(kistenRaw);
  if (!kistenRaw || Number.isNaN(kisten_jahr) || kisten_jahr < 0) {
    return { fehler: "Bitte eine gültige Kistenzahl angeben." };
  }

  const exklusiv = formData.get("exklusiv") === "on";
  const kundentypRaw = String(formData.get("kundentyp") ?? "");
  const kundentyp = (kundentypRaw || null) as Kundentyp | null;
  const verlustgrundRaw = String(formData.get("verlustgrund") ?? "");
  const verlustgrund = (verlustgrundRaw || null) as Verlustgrund | null;
  const notiz = String(formData.get("notiz") ?? "").trim() || null;

  if (typ === "verlust" && !verlustgrund) {
    return { fehler: "Bitte einen Verlustgrund auswählen." };
  }

  // Bewertung mit der Jahres-Konfiguration (server-autoritativ).
  const { config } = await ladeScoringConfig(supabase, jahr);
  const ergebnis = bewerteBewegung(
    { typ, kisten_jahr, kundentyp, exklusiv, verlustgrund },
    config,
  );
  const absatzstufe =
    absatzstufeAusKisten(kisten_jahr, config) === "kam"
      ? "hoch"
      : (absatzstufeAusKisten(kisten_jahr, config) as
          | "wenig"
          | "mittel"
          | "hoch");

  // Kunde ermitteln oder anlegen.
  let kunde_id = String(formData.get("kunde_id") ?? "").trim();
  if (!kunde_id) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { fehler: "Bitte einen Kundennamen angeben." };

    const { data: kunde, error: kundeError } = await supabase
      .from("kunden")
      .insert({
        profile_id: user.id,
        name,
        sap_nummer: String(formData.get("sap_nummer") ?? "").trim() || null,
        strasse: String(formData.get("strasse") ?? "").trim() || null,
        plz: String(formData.get("plz") ?? "").trim() || null,
        ort: String(formData.get("ort") ?? "").trim() || null,
        betriebstyp: String(formData.get("betriebstyp") ?? "").trim() || null,
      })
      .select("id")
      .single();

    if (kundeError || !kunde) {
      return { fehler: "Kunde konnte nicht angelegt werden." };
    }
    kunde_id = kunde.id;
  }

  const { error } = await supabase.from("bewegungen").insert({
    kunde_id,
    profile_id: user.id,
    jahr, // wird serverseitig ohnehin aus datum abgeleitet (Trigger)
    typ,
    datum,
    kisten_jahr,
    absatzstufe,
    kundentyp: typ === "neulistung" ? kundentyp : null,
    exklusiv: typ === "neulistung" ? exklusiv : false,
    verlustgrund: typ === "verlust" ? verlustgrund : null,
    notiz,
    ist_kam: ergebnis.ist_kam,
    punkte: ergebnis.punkte,
  });

  if (error) {
    return { fehler: "Bewegung konnte nicht gespeichert werden." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/bewegungen");

  const kamHinweis = ergebnis.ist_kam
    ? " Hinweis: Kunde fällt in die KAM-Betreuung und zählt nicht auf dein Ziel."
    : "";
  return {
    erfolg: `Bewegung gespeichert (${ergebnis.punkte > 0 ? "+" : ""}${ergebnis.punkte} Punkte).${kamHinweis}`,
  };
}

// Bewegung loeschen (RLS erlaubt nur innerhalb 24h nach Anlage).
export async function bewegungLoeschen(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("bewegungen").delete().eq("id", id);
  revalidatePath("/bewegungen");
  revalidatePath("/dashboard");
}
