import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Liefert das Profil des angemeldeten Nutzers oder leitet passend um.
// - nicht angemeldet   -> /login
// - kein Profil        -> /login (Datenfehler)
// - nicht freigeschaltet -> /warten
export async function requireAktivesProfil(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");
  if (!profile.aktiv) redirect("/warten");

  return profile as Profile;
}

// Wie requireAktivesProfil, verlangt zusaetzlich die Admin-Rolle.
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireAktivesProfil();
  if (profile.rolle !== "admin") redirect("/dashboard");
  return profile;
}
