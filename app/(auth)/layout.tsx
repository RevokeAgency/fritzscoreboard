import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-weiss">
      <header className="border-b border-grau-200 px-6 py-5">
        <Link href="/">
          <div className="bg-schwarz inline-block px-2 py-1">
            <Logo />
          </div>
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
