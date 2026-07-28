// Minimaler Klassennamen-Helfer (keine externe Abhaengigkeit).
export function clsx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
