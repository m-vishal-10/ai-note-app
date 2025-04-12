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

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up";

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAuthRoute && user) {
      return NextResponse.redirect(
        new URL("/", process.env.NEXT_PUBLIC_BASE_URL)
      );
    }

    const { searchParams, pathname } = new URL(request.url);

    if (!searchParams.get("noteId") && pathname === "/" && user) {
      try {
        const fetchNewest = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-newest-note?userId=${user.id}`
        );
        const { newestNoteId } = await fetchNewest.json();

        const url = request.nextUrl.clone();
        if (newestNoteId) {
          url.searchParams.set("noteId", newestNoteId);
        } else {
          const createNote = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-new-note?userId=${user.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const { noteId } = await createNote.json();
          url.searchParams.set("noteId", noteId);
        }

        return NextResponse.redirect(url);
      } catch (error) {
        console.error("Note redirection error:", error);
        return supabaseResponse;
      }
    }
  } catch (error) {
    console.error("Supabase auth error:", error);
    return supabaseResponse;
  }

  return supabaseResponse;
}
