import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isShiftsLocked,
  isWorkerLocked,
  isWerknemerPathExempt,
} from "@/lib/feature-flags";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Beschermde routes — vereist login
  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/werknemer") ||
    path.startsWith("/admin");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ============================================================
  // FEATURE LOCKS — strategische launch-fase
  // ============================================================

  // 1) Shifts-functionaliteit is 60 dagen gelockt. Werkgevers + werknemers
  //    worden weggehouden van shifts-pagina's. Vacatures blijven werken.
  if (isShiftsLocked()) {
    const shiftsRoutes = [
      "/dashboard/shifts",
      "/werknemer/shifts",
      "/werknemer/zoeken", // shifts zoeken
    ];
    // Exacte match of subpad — een los startsWith matcht ook
    // /dashboard/shifts-binnenkort zelf en geeft dan een redirect-loop.
    const hitsShiftsRoute = shiftsRoutes.some(
      (r) => path === r || path.startsWith(r + "/")
    );
    if (hitsShiftsRoute) {
      const url = request.nextUrl.clone();
      url.pathname = path.startsWith("/dashboard")
        ? "/dashboard/shifts-binnenkort"
        : "/werknemer/shifts-binnenkort";
      return NextResponse.redirect(url);
    }
  }

  // 2) Nieuwe werknemers krijgen 14 dagen wachtkamer voordat ze toegang
  //    krijgen tot vacatures + shifts. Profiel + CV mag wel.
  if (user && path.startsWith("/werknemer") && !isWerknemerPathExempt(path)) {
    // Profiel + CV + wachtkamer zelf zijn exempt — overige werknemer-routes checken
    if (path !== "/werknemer/wachtkamer") {
      const { data: profile } = await supabase
        .from("users")
        .select("user_type, created_at")
        .eq("id", user.id)
        .single();

      if (
        profile?.user_type === "employee" &&
        isWorkerLocked(profile.created_at)
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/werknemer/wachtkamer";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
