import { createClient } from "@/lib/supabase/server";
import { ladeScoringConfig } from "@/lib/scoring-config";
import { VerlustForm } from "@/components/VerlustForm";

export default async function VerlustPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const jahr = new Date().getFullYear();
  const { config } = await ladeScoringConfig(supabase, jahr);

  const { data: kunden } = await supabase
    .from("kunden")
    .select("id, name, sap_nummer, ort")
    .eq("profile_id", user!.id)
    .order("name");

  return (
    <div>
      <h1 className="font-brand text-[2.5rem] leading-[0.95]">Kundenverlust erfassen</h1>
      <p className="mt-1 text-sm text-grau-500">
        Verlorenen Kunden dokumentieren. Betriebsschließung und Insolvenz werden
        neutral gestellt.
      </p>
      <div className="mt-6">
        <VerlustForm config={config} kunden={kunden ?? []} />
      </div>
    </div>
  );
}
