"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui";

export function AdminUebersichtFilter({
  jahr,
  jahre,
  gebiet,
  gebiete,
  asmId,
  asmListe,
}: {
  jahr: number;
  jahre: number[];
  gebiet: string;
  gebiete: string[];
  asmId: string;
  asmListe: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setze(key: string, wert: string) {
    const p = new URLSearchParams(params.toString());
    if (wert) p.set(key, wert);
    else p.delete(key);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-grau-500">
          Jahr
        </span>
        <Select
          value={jahr}
          onChange={(e) => setze("jahr", e.target.value)}
          className="py-2"
        >
          {jahre.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-grau-500">
          Gebiet
        </span>
        <Select
          value={gebiet}
          onChange={(e) => setze("gebiet", e.target.value)}
          className="py-2"
        >
          <option value="">Alle Gebiete</option>
          {gebiete.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-grau-500">
          ASM
        </span>
        <Select
          value={asmId}
          onChange={(e) => setze("asm", e.target.value)}
          className="py-2"
        >
          <option value="">Alle ASM</option>
          {asmListe.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
