import { requireAdmin } from "@/lib/auth";
import { abmelden } from "@/app/(auth)/actions";
import { AppNav } from "@/components/AppNav";
import { AdminSubNav } from "@/components/AdminSubNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-weiss">
      <AppNav
        rolle={profile.rolle}
        name={profile.full_name}
        abmeldenAction={abmelden}
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <AdminSubNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
