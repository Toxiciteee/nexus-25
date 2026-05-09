import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

const PUBLIC_PATHS = ["/login", "/auth"];
const PUBLIC_EXACT = ["/"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est authentifié et arrive sur /login SANS query (cas
  // normal), on le renvoie vers le dashboard. En revanche, si /login porte
  // un paramètre `reason` ou `error` (ex: ?reason=inactive), on laisse passer
  // la page de login afin qu'elle affiche le message — sinon on créerait une
  // boucle de redirections quand le compte est désactivé.
  if (
    user &&
    pathname === "/login" &&
    !request.nextUrl.searchParams.has("reason") &&
    !request.nextUrl.searchParams.has("error")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
