"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { domainErlaubt } from "@/lib/config";

export interface AuthState {
  fehler?: string;
  hinweis?: string;
}

export async function anmelden(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const passwort = String(formData.get("passwort") ?? "");

  if (!email || !passwort) {
    return { fehler: "Bitte E-Mail und Passwort eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: passwort,
  });

  if (error) {
    return { fehler: "Anmeldung fehlgeschlagen. Bitte Daten prüfen." };
  }

  redirect("/dashboard");
}

export async function registrieren(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const passwort = String(formData.get("passwort") ?? "");

  if (!name || !email || !passwort) {
    return { fehler: "Bitte alle Felder ausfüllen." };
  }
  if (passwort.length < 8) {
    return { fehler: "Das Passwort muss mindestens 8 Zeichen haben." };
  }
  if (!domainErlaubt(email)) {
    return {
      fehler:
        "Registrierung nur mit einer Firmen-E-Mail-Adresse möglich.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: passwort,
    options: {
      data: { full_name: name },
    },
  });

  if (error) {
    return {
      fehler:
        error.message.includes("@") || error.message.includes("domain")
          ? "Registrierung nur mit einer Firmen-E-Mail-Adresse möglich."
          : "Registrierung fehlgeschlagen. " + error.message,
    };
  }

  // Wenn die Session direkt besteht (E-Mail-Bestätigung deaktiviert),
  // geht es weiter zur Wartesseite. Sonst Hinweis auf Bestätigungsmail.
  if (data.session) {
    redirect("/warten");
  }

  return {
    hinweis:
      "Registrierung eingegangen. Bitte bestätige deine E-Mail-Adresse. Danach wird dein Zugang von der Administration freigeschaltet.",
  };
}

export async function abmelden() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
