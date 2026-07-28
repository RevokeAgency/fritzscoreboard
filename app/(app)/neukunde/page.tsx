import { createClient } from "@/lib/supabase/server";
import { ladeScoringConfig } from "@/lib/scoring-config";
import { NeukundeForm } from "@/components/NeukundeForm";

export default async function NeukundePage() {
  const supabase = await createClient();
  const jahr = new Date().getFullYear();
  const { config } = await ladeScoringConfig(supabase, jahr);

  return (
    <div>
      <h1 className="font-brand text-3xl">Neulistung erfassen</h1>
      <p className="mt-1 text-sm text-grau-500">
        Neuer Gastro-Kunde oder Umstellung auf Exklusivbelieferung. Die
        Punktzahl siehst du live während der Eingabe.
      </p>
      <div className="mt-6">
        <NeukundeForm config={config} />
      </div>
    </div>
  );
}
