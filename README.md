# fritz-kola Scoreboard

Webapplikation für den Außendienst (ASM) von fritz-kola in Österreich. Das Tool
bewertet **Neulistungen**, **Exklusivdrehungen** und **Kundenverluste** im
Gastro-Bereich mit einem Punktesystem und misst sie gegen ein individuelles
Jahresziel pro ASM.

> Zusatz zum bestehenden SAP CRM, **kein Ersatz** – keine Stammdaten-Importe,
> keine Schnittstellen. Das Tool startet mit leerer Datenbank.

## Tech-Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (monochromes Poster-Design)
- **Supabase** – Auth, Postgres, Row Level Security
- **lucide-react** (Icons), **recharts** (Diagramme)
- Deployment-Ziel **Vercel**

## Fachliche Logik

Die gesamte Punkteberechnung liegt als reine Funktion in
[`lib/scoring.ts`](lib/scoring.ts) und ist über Unit-Tests abgedeckt
([`lib/scoring.test.ts`](lib/scoring.test.ts)).

| Bewegungstyp      | Punkte                                                     |
| ----------------- | ---------------------------------------------------------- |
| `neulistung`      | `punkte_absatz + punkte_typ + (exklusiv ? 1 : 0)` → 1..6   |
| `exklusivdrehung` | `punkte_absatz` → 1..3                                      |
| `verlust`         | `punkte_absatz × -1` → -1..-3                               |

Die **Absatzstufe** wird aus der Kistenzahl/Jahr abgeleitet (wenig / mittel /
hoch); über 1.000 Kisten ist es ein **KAM-Kunde** (`ist_kam = true`, 0 Punkte,
aus allen Summen ausgeschlossen). Bei Verlustgrund *Schließung* oder *Insolvenz*
werden 0 Punkte vergeben (abschaltbar über
`scoring_config.verlust_neutral_bei_schliessung`).

Der berechnete Punktwert wird beim Speichern in `bewegungen.punkte`
**persistiert** – so bleibt die Bonusgrundlage stabil, auch wenn die
Konfiguration später angepasst wird.

## Einrichtung

### 1. Environment-Variablen

`.env.example` nach `.env.local` kopieren und ausfüllen:

```bash
cp .env.example .env.local
```

| Variable                       | Bedeutung                                             |
| ------------------------------ | ----------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Projekt-URL (`https://<ref>.supabase.co`)             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Anon public Key aus Supabase → Project Settings → API |
| `NEXT_PUBLIC_ERLAUBTE_DOMAIN`  | Erlaubte Firmendomain für die Registrierung           |

### 2. Migration einspielen

Die Migration [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
legt Tabellen, Trigger, RLS-Policies und einen Seed für `scoring_config` an.

Per Supabase SQL-Editor (Inhalt einfügen und ausführen) **oder** per psql:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.<ref>.supabase.co:5432/postgres" \
  -f supabase/migrations/0001_init.sql
```

### 3. Domainprüfung in der Datenbank aktivieren

Die Registrierungs-Trigger (`handle_new_user`, `profile_domain_pruefung`) lesen
die erlaubte Domain aus einem Datenbank-Setting. Einmalig setzen (gleiche Domain
wie `NEXT_PUBLIC_ERLAUBTE_DOMAIN`):

```sql
alter database postgres set app.erlaubte_domain = 'fritz-kola.com';
```

> Ohne dieses Setting greift ausschließlich die Domainprüfung im Formular; der
> zusätzliche Schutz auf DB-Ebene ist dann inaktiv.

### 4. Erster Nutzer = Admin

Der **erste** registrierte Nutzer wird automatisch `admin` und `aktiv = true`.
Alle weiteren Registrierungen sind zunächst gesperrt und müssen unter
`/admin/nutzer` freigeschaltet werden.

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Unit-Tests (Punkteberechnung)
npm run build        # Production-Build
```

## Deployment (Vercel)

1. Repository in Vercel importieren.
2. Environment-Variablen aus `.env.example` hinterlegen.
3. Deploy – der Build läuft ohne weitere Konfiguration.

Supabase Auth: Unter *Authentication → URL Configuration* die Vercel-Domain als
Site-URL/Redirect eintragen.

## Seitenstruktur

| Route                        | Zweck                                            |
| ---------------------------- | ------------------------------------------------ |
| `/`                          | Landing mit Login / Registrierung                |
| `/login`, `/registrieren`    | Auth                                             |
| `/warten`                    | Hinweis „Freischaltung ausstehend"               |
| `/dashboard`                 | ASM-Dashboard (Punktekonto, Kennzahlen, Charts)  |
| `/neukunde`                  | Formular Neulistung / Exklusivdrehung            |
| `/verlust`                   | Formular Kundenverlust                           |
| `/bewegungen`                | Eigene Liste mit Filter und CSV-Export           |
| `/admin`                     | Gesamtübersicht aller ASM                        |
| `/admin/asm/[id]`            | ASM-Detailansicht                                |
| `/admin/ziele`               | Jahresziele inkl. Vorschlagsrechner              |
| `/admin/nutzer`              | Freischaltung, Rolle, Gebiet                     |
| `/admin/konfiguration`       | Punktwerte und Schwellen                         |

## Marke / Assets

Platzhalter liegen unter [`public/brand/`](public/brand/). Die offiziellen
fritz-kola Dateien werden manuell ersetzt (Dateinamen beibehalten).
