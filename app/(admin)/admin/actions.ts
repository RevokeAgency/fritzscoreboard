"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("rolle, aktiv")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.rolle !== "admin" || !profile?.aktiv) {
    throw new Error("Keine Berechtigung.");
  }
  return supabase;
}

// --- Nutzerverwaltung -------------------------------------------------------
export async function nutzerAktualisieren(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") ?? "");
  const aktiv = formData.get("aktiv") === "on";
  const rolle = String(formData.get("rolle") ?? "asm");
  const gebiet = String(formData.get("gebiet") ?? "").trim() || null;

  await supabase
    .from("profiles")
    .update({
      aktiv,
      rolle: rolle === "admin" ? "admin" : "asm",
      gebiet,
    })
    .eq("id", id);

  revalidatePath("/admin/nutzer");
  revalidatePath("/admin");
}

// --- Jahresziele ------------------------------------------------------------
export interface ZielState {
  fehler?: string;
  erfolg?: string;
}

export async function zielSpeichern(
  _prev: ZielState,
  formData: FormData,
): Promise<ZielState> {
  const supabase = await adminClient();
  const profile_id = String(formData.get("profile_id") ?? "");
  const jahr = Number(formData.get("jahr"));
  const ziel_punkte = Number(
    String(formData.get("ziel_punkte") ?? "").replace(",", "."),
  );
  const neukunden_ziel = formData.get("neukunden_ziel")
    ? Number(formData.get("neukunden_ziel"))
    : null;
  const bestand_kunden = formData.get("bestand_kunden")
    ? Number(formData.get("bestand_kunden"))
    : null;

  if (!profile_id || !jahr) return { fehler: "Ungültige Eingabe." };
  if (Number.isNaN(ziel_punkte)) return { fehler: "Zielpunkte ungültig." };

  const { error } = await supabase.from("jahresziele").upsert(
    {
      profile_id,
      jahr,
      ziel_punkte,
      neukunden_ziel,
      bestand_kunden,
    },
    { onConflict: "profile_id,jahr" },
  );

  if (error) return { fehler: "Speichern fehlgeschlagen: " + error.message };

  revalidatePath("/admin/ziele");
  revalidatePath("/admin");
  return { erfolg: "Ziel gespeichert." };
}

// --- Scoring-Konfiguration --------------------------------------------------
export interface ConfigState {
  fehler?: string;
  erfolg?: string;
}

export async function konfigurationSpeichern(
  _prev: ConfigState,
  formData: FormData,
): Promise<ConfigState> {
  const supabase = await adminClient();
  const jahr = Number(formData.get("jahr"));
  if (!jahr) return { fehler: "Jahr fehlt." };

  const num = (k: string) =>
    Number(String(formData.get(k) ?? "").replace(",", "."));

  const daten = {
    jahr,
    schwelle_mittel: num("schwelle_mittel"),
    schwelle_hoch: num("schwelle_hoch"),
    schwelle_kam: num("schwelle_kam"),
    punkte_wenig: num("punkte_wenig"),
    punkte_mittel: num("punkte_mittel"),
    punkte_hoch: num("punkte_hoch"),
    punkte_mainstream: num("punkte_mainstream"),
    punkte_premium: num("punkte_premium"),
    punkte_influential: num("punkte_influential"),
    punkte_exklusiv: num("punkte_exklusiv"),
    verlust_neutral_bei_schliessung:
      formData.get("verlust_neutral_bei_schliessung") === "on",
  };

  if (daten.schwelle_mittel >= daten.schwelle_hoch) {
    return { fehler: "Schwelle mittel muss kleiner als Schwelle hoch sein." };
  }
  if (daten.schwelle_hoch >= daten.schwelle_kam) {
    return { fehler: "Schwelle hoch muss kleiner als Schwelle KAM sein." };
  }

  const { error } = await supabase
    .from("scoring_config")
    .upsert(daten, { onConflict: "jahr" });

  if (error) return { fehler: "Speichern fehlgeschlagen: " + error.message };

  revalidatePath("/admin/konfiguration");
  return { erfolg: "Konfiguration gespeichert." };
}
