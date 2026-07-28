import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Aktualisiert die Supabase-Session bei jeder Anfrage und schuetzt Routen.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fehlende Konfiguration darf die gesamte Domain nicht mit einem 500
  // (MIDDLEWARE_INVOCATION_FAILED) lahmlegen. Ohne Env-Variablen laesst die
  // Middleware die Anfrage durch; die Seiten selbst melden dann den Zustand.
  if (!url || !anonKey) {
    return response;
  }

  const pfad = request.nextUrl.pathname;
  const istOeffentlich =
    pfad === "/" ||
    pfad.startsWith("/login") ||
    pfad.startsWith("/registrieren") ||
    pfad.startsWith("/auth");

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Nicht angemeldet -> auf Login umleiten (ausser oeffentliche Seiten).
    if (!user && !istOeffentlich) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch {
    // Netzwerk- oder Konfigurationsfehler: Anfrage nicht global abbrechen.
    // Geschuetzte Seiten erzwingen die Anmeldung weiterhin serverseitig.
    return response;
  }
}
