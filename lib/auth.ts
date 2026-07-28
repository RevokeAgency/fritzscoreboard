import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Liefert das Profil des angemeldeten Nutzers oder leitet passend um.
// - nicht angemeldet   -> /login
// - kein Profil        -> /login (Datenfehler)
// - nicht freigeschaltet -> /warten
export async function requireAktivesProfil(): Promise<Profile> {
  let user = null;
  let profile: Profile | null = null;

  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = (data as Profile) ?? null;
    }
  } catch {
    // Konfigurations-/Netzwerkfehler: wie "nicht angemeldet" behandeln.
    user = null;
  }

  // redirect() ausserhalb des try/catch (wirft intern eine Ausnahme).
  if (!user || !profile) redirect("/login");
  if (!profile.aktiv) redirect("/warten");

  return profile;
}

// Wie requireAktivesProfil, verlangt zusaetzlich die Admin-Rolle.
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireAktivesProfil();
  if (profile.rolle !== "admin") redirect("/dashboard");
  return profile;
}
