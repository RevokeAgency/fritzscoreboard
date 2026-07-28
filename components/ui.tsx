import { clsx } from "@/lib/clsx";

// ---------------------------------------------------------------------------
// Wiederverwendbare, monochrome UI-Bausteine.
// Border-Radius 2px, keine Schatten, Trennung ueber Linien.
// ---------------------------------------------------------------------------

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("border border-grau-200 bg-weiss", className)}>
      {children}
    </div>
  );
}

export function Feld({
  label,
  htmlFor,
  children,
  hinweis,
  pflicht,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  hinweis?: React.ReactNode;
  pflicht?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wide text-grau-500"
      >
        {label}
        {pflicht && <span className="text-minus"> *</span>}
      </label>
      {children}
      {hinweis && <div className="text-sm text-grau-500">{hinweis}</div>}
    </div>
  );
}

const inputBasis =
  "w-full rounded-sm border border-grau-200 bg-weiss px-3 py-2.5 text-base text-schwarz outline-none focus:border-schwarz placeholder:text-grau-500";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...rest } = props;
  return <input {...rest} className={clsx(inputBasis, className)} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={clsx(inputBasis, "appearance-none", className)}>
      {children}
    </select>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return (
    <textarea {...rest} className={clsx(inputBasis, "min-h-[80px]", className)} />
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm bg-schwarz px-5 py-3 text-sm font-semibold uppercase tracking-wide text-weiss transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm border border-schwarz bg-weiss px-5 py-3 text-sm font-semibold uppercase tracking-wide text-schwarz transition-colors hover:bg-schwarz hover:text-weiss disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

// Kleines Kennzahl-Kaestchen fuer Dashboards.
export function Kennzahl({
  label,
  wert,
  farbe,
  sub,
}: {
  label: string;
  wert: React.ReactNode;
  farbe?: "plus" | "minus" | "schwarz";
  sub?: string;
}) {
  const farbeClass =
    farbe === "plus"
      ? "text-plus"
      : farbe === "minus"
        ? "text-minus"
        : "text-schwarz";
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-grau-500">
        {label}
      </div>
      <div className={clsx("font-display mt-2 text-3xl tabular", farbeClass)}>
        {wert}
      </div>
      {sub && <div className="mt-1 text-xs text-grau-500">{sub}</div>}
    </Card>
  );
}

// Farbige Text-Markierung fuer Bewegungstypen.
export function TypBadge({ typ }: { typ: string }) {
  const map: Record<string, string> = {
    neulistung: "text-plus",
    exklusivdrehung: "text-schwarz",
    verlust: "text-minus",
  };
  const label: Record<string, string> = {
    neulistung: "Neulistung",
    exklusivdrehung: "Exklusivdrehung",
    verlust: "Verlust",
  };
  return (
    <span className={clsx("text-xs font-semibold uppercase", map[typ])}>
      {label[typ] ?? typ}
    </span>
  );
}
