import { createClient } from "@/lib/supabase/server";
import { BewegungenTabelle } from "@/components/BewegungenTabelle";
import { JahrAuswahl } from "@/components/JahrAuswahl";
import { zuTabellenzeile } from "@/lib/tabelle";
import { bewegungLoeschen } from "@/app/(app)/actions";

function verfuegbareJahre(daten: number[]): number[] {
  const jetzt = new Date().getFullYear();
  return Array.from(new Set<number>([jetzt, ...daten])).sort((a, b) => b - a);
}

export default async function BewegungenPage({
  searchParams,
}: {
  searchParams: Promise<{ jahr?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sp = await searchParams;
  const jahr = Number(sp.jahr) || new Date().getFullYear();

  const { data: rows } = await supabase
    .from("bewegungen")
    .select("*, kunde:kunden(name, sap_nummer, ort)")
    .eq("profile_id", user!.id)
    .eq("jahr", jahr)
    .order("datum", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: jahreRaw } = await supabase
    .from("bewegungen")
    .select("jahr")
    .eq("profile_id", user!.id);
  const jahre = verfuegbareJahre((jahreRaw ?? []).map((r) => r.jahr));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zeilen = (rows ?? []).map((r) => zuTabellenzeile(r as any));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-brand text-3xl">Meine Bewegungen</h1>
        <JahrAuswahl jahr={jahr} jahre={jahre} />
      </div>
      <p className="mb-4 text-sm text-grau-500">
        Löschen ist nur bis 24 Stunden nach Anlage möglich. Danach bitte eine
        Korrekturbuchung erfassen.
      </p>
      <BewegungenTabelle zeilen={zeilen} loeschenAction={bewegungLoeschen} />
    </div>
  );
}
