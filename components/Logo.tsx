/* eslint-disable @next/next/no-img-element */

// Bindet den Marken-Platzhalter ein. Die offizielle Datei liegt unter
// /public/brand/ und wird manuell ersetzt.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/logo.svg"
      alt="fritz-kola"
      className={className}
      width={140}
      height={28}
    />
  );
}
