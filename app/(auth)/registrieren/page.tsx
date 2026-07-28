"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registrieren, type AuthState } from "../actions";
import { Feld, TextInput, PrimaryButton } from "@/components/ui";
import { ERLAUBTE_DOMAIN } from "@/lib/config";

const initial: AuthState = {};

export default function RegistrierenPage() {
  const [state, formAction, pending] = useActionState(registrieren, initial);

  return (
    <div>
      <h1 className="font-brand text-4xl">Registrieren</h1>
      <p className="mt-2 text-sm text-grau-500">
        Nur mit deiner Firmen-E-Mail-Adresse
        {ERLAUBTE_DOMAIN ? (
          <>
            {" "}
            (<span className="text-schwarz">@{ERLAUBTE_DOMAIN}</span>)
          </>
        ) : null}
        . Nach der Registrierung schaltet die Administration deinen Zugang frei.
      </p>

      {state.hinweis ? (
        <p className="mt-8 rounded-sm border border-plus px-4 py-3 text-sm text-schwarz">
          {state.hinweis}
        </p>
      ) : (
        <form action={formAction} className="mt-8 flex flex-col gap-5">
          <Feld label="Vollständiger Name" htmlFor="full_name" pflicht>
            <TextInput
              id="full_name"
              name="full_name"
              autoComplete="name"
              required
            />
          </Feld>
          <Feld label="E-Mail" htmlFor="email" pflicht>
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={ERLAUBTE_DOMAIN ? `name@${ERLAUBTE_DOMAIN}` : undefined}
              required
            />
          </Feld>
          <Feld
            label="Passwort"
            htmlFor="passwort"
            pflicht
            hinweis="Mindestens 8 Zeichen."
          >
            <TextInput
              id="passwort"
              name="passwort"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Feld>

          {state.fehler && (
            <p className="rounded-sm border border-minus px-3 py-2 text-sm text-minus">
              {state.fehler}
            </p>
          )}

          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Registrieren…" : "Registrieren"}
          </PrimaryButton>
        </form>
      )}

      <p className="mt-6 text-sm text-grau-500">
        Bereits registriert?{" "}
        <Link href="/login" className="font-semibold text-schwarz underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
