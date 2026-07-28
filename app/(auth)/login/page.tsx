"use client";

import Link from "next/link";
import { useActionState } from "react";
import { anmelden, type AuthState } from "../actions";
import { Feld, TextInput, PrimaryButton } from "@/components/ui";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(anmelden, initial);

  return (
    <div>
      <h1 className="font-display text-4xl">Anmelden</h1>
      <p className="mt-2 text-sm text-grau-500">
        Zugang zum fritz-kola Scoreboard.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <Feld label="E-Mail" htmlFor="email" pflicht>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </Feld>
        <Feld label="Passwort" htmlFor="passwort" pflicht>
          <TextInput
            id="passwort"
            name="passwort"
            type="password"
            autoComplete="current-password"
            required
          />
        </Feld>

        {state.fehler && (
          <p className="rounded-sm border border-minus px-3 py-2 text-sm text-minus">
            {state.fehler}
          </p>
        )}

        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Anmelden…" : "Anmelden"}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-sm text-grau-500">
        Noch kein Zugang?{" "}
        <Link href="/registrieren" className="font-semibold text-schwarz underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
