import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase env vars");
    return supabaseResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  const { pathname, searchParams } = request.nextUrl;

  if ((pathname === "/login" || pathname === "/sign-up") && user) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  if (!searchParams.get("noteId") && pathname === "/" && user) {
    try {
      const res = await fetch(`${baseUrl}/api/fetch-newest-note?userId=${user.id}`);
      const { newestNoteId } = await res.json();

      if (newestNoteId) {
        const url = request.nextUrl.clone();
        url.searchParams.set("noteId", newestNoteId);
        return NextResponse.redirect(url);
      }
    } catch (err) {
      console.error("fetch-newest-note failed:", err);
    }

    try {
      const res = await fetch(`${baseUrl}/api/create-new-note?userId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const { noteId } = await res.json();

      const url = request.nextUrl.clone();
      url.searchParams.set("noteId", noteId);
      return NextResponse.redirect(url);
    } catch (err) {
      console.error("create-new-note failed:", err);
    }
  }

  return supabaseResponse;
}
