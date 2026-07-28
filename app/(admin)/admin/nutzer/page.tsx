import { createClient } from "@/lib/supabase/server";
import { Card, TextInput, Select, PrimaryButton } from "@/components/ui";
import { formatDatum } from "@/lib/format";
import { nutzerAktualisieren } from "@/app/(admin)/admin/actions";
import type { Profile } from "@/lib/types";

export default async function NutzerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("aktiv", { ascending: true })
    .order("full_name");
  const profile = (data ?? []) as Profile[];

  const wartend = profile.filter((p) => !p.aktiv);

  return (
    <div>
      <h1 className="font-brand text-[2.5rem] leading-[0.95]">Nutzerverwaltung</h1>
      <p className="mt-1 text-sm text-grau-500">
        Freischaltung, Rolle und Gebiet pflegen. Neu registrierte Nutzer sind
        zunächst gesperrt.
      </p>

      {wartend.length > 0 && (
        <p className="mt-4 inline-block bg-akzent px-3 py-1 text-sm font-semibold text-schwarz">
          {wartend.length} Nutzer warten auf Freischaltung
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {profile.map((p) => (
          <Card key={p.id} className="p-4">
            <form
              action={nutzerAktualisieren}
              className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto_auto_auto_auto]"
            >
              <input type="hidden" name="id" value={p.id} />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.full_name}</span>
                  {!p.aktiv && (
                    <span className="bg-akzent px-1.5 py-0.5 text-[10px] font-semibold uppercase text-schwarz">
                      gesperrt
                    </span>
                  )}
                </div>
                <div className="text-xs text-grau-500">
                  {p.email} · registriert {formatDatum(p.created_at)}
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-grau-500">
                  Rolle
                </span>
                <Select name="rolle" defaultValue={p.rolle} className="py-2">
                  <option value="asm">ASM</option>
                  <option value="admin">Admin</option>
                </Select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-grau-500">
                  Gebiet
                </span>
                <TextInput
                  name="gebiet"
                  defaultValue={p.gebiet ?? ""}
                  placeholder="z. B. Wien"
                  className="py-2"
                />
              </label>

              <label className="flex items-center gap-2 md:pb-2.5">
                <input
                  type="checkbox"
                  name="aktiv"
                  defaultChecked={p.aktiv}
                  className="h-5 w-5 accent-[var(--akzent)]"
                />
                <span className="text-sm font-medium">Freigeschaltet</span>
              </label>

              <PrimaryButton type="submit" className="py-2.5">
                Speichern
              </PrimaryButton>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
