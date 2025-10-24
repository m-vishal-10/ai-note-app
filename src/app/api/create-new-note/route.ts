// src/app/api/create-new-note/route.ts
import { createClient } from "@/auth/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use auth user presence instead of custom users table
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create new note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        author_id: userId,
        text: "",
      })
      .select('id')
      .single();

    if (noteError) {
      throw noteError;
    }

    return NextResponse.json({ noteId: note.id });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}