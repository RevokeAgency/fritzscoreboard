"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Jahresauswahl oben rechts. Aktualisiert den ?jahr= Query-Parameter.
export function JahrAuswahl({
  jahr,
  jahre,
}: {
  jahr: number;
  jahre: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function waehle(neu: string) {
    const p = new URLSearchParams(params.toString());
    p.set("jahr", neu);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-grau-500">Jahr</span>
      <select
        value={jahr}
        onChange={(e) => waehle(e.target.value)}
        className="rounded-sm border border-schwarz bg-weiss px-3 py-1.5 font-semibold tabular outline-none"
      >
        {jahre.map((j) => (
          <option key={j} value={j}>
            {j}
          </option>
        ))}
      </select>
    </label>
  );
}
