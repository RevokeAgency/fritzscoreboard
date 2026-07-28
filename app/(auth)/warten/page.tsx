import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { abmelden } from "../actions";
import { GhostButton } from "@/components/ui";

export default async function WartenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("aktiv, full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Bereits freigeschaltet -> direkt ins Dashboard.
  if (profile?.aktiv) redirect("/dashboard");

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 inline-block bg-akzent px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-schwarz">
          Freischaltung ausstehend
        </span>
      </div>
      <h1 className="font-display text-3xl">Fast geschafft</h1>
      <p className="mt-4 text-grau-500">
        {profile?.full_name ? `${profile.full_name}, dein` : "Dein"} Zugang ist
        registriert, aber noch nicht freigeschaltet. Die Administration prüft
        deine Anmeldung und weist dir ein Gebiet zu. Du erhältst Zugriff, sobald
        das erledigt ist.
      </p>
      <form action={abmelden} className="mt-8">
        <GhostButton type="submit">Abmelden</GhostButton>
      </form>
    </div>
  );
}
