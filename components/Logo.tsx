/* eslint-disable @next/next/no-img-element */

// Offizielles fritz-kola Logo (weiss, transparenter Hintergrund).
// Wird auf dunklem Grund verwendet (Landing, Auth, Navigation).
export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <img
      src="/brand/fritz-kola_weiss_.png"
      alt="fritz-kola"
      className={className}
      width={181}
      height={51}
    />
  );
}
