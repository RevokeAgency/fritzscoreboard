"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { KUNDENTYP_TOOLTIP } from "@/lib/types";

// Info-Icon mit den Kundentyp-Definitionen als Tooltip (Klick + Hover).
export function KundentypTooltip() {
  const [offen, setOffen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Definitionen der Kundentypen"
        className="text-grau-500 hover:text-schwarz"
        onClick={() => setOffen((o) => !o)}
        onBlur={() => setOffen(false)}
      >
        <Info size={16} />
      </button>
      {offen && (
        <div
          role="tooltip"
          className="absolute left-0 top-6 z-30 w-72 rounded-sm border border-schwarz bg-weiss p-3 text-xs text-schwarz shadow-none"
        >
          <dl className="flex flex-col gap-2">
            <div>
              <dt className="font-semibold">Influential</dt>
              <dd className="text-grau-500">{KUNDENTYP_TOOLTIP.influential}</dd>
            </div>
            <div>
              <dt className="font-semibold">Premium</dt>
              <dd className="text-grau-500">{KUNDENTYP_TOOLTIP.premium}</dd>
            </div>
            <div>
              <dt className="font-semibold">Mainstream</dt>
              <dd className="text-grau-500">{KUNDENTYP_TOOLTIP.mainstream}</dd>
            </div>
          </dl>
        </div>
      )}
    </span>
  );
}
