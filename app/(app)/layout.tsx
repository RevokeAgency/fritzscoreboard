import { requireAktivesProfil } from "@/lib/auth";
import { abmelden } from "@/app/(auth)/actions";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAktivesProfil();

  return (
    <div className="min-h-screen bg-weiss">
      <AppNav
        rolle={profile.rolle}
        name={profile.full_name}
        abmeldenAction={abmelden}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
