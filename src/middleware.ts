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
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  const { searchParams, pathname } = new URL(request.url);

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
      console.error("Failed to fetch newest note:", err);
    }

    try {
      const res = await fetch(`${baseUrl}/api/create-new-note?userId=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { noteId } = await res.json();

      const url = request.nextUrl.clone();
      url.searchParams.set("noteId", noteId);
      return NextResponse.redirect(url);
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  }

  return supabaseResponse;
}
