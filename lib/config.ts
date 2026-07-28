// Zentrale, clientseitig lesbare Konfiguration.

export const ERLAUBTE_DOMAIN =
  process.env.NEXT_PUBLIC_ERLAUBTE_DOMAIN?.trim().toLowerCase() ?? "";

// Prueft, ob eine E-Mail auf der erlaubten Firmendomain liegt.
export function domainErlaubt(email: string): boolean {
  if (!ERLAUBTE_DOMAIN) return true; // keine Domain konfiguriert -> keine Einschraenkung
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain === ERLAUBTE_DOMAIN;
}
