import { createClient, getUser } from "@/auth/server";
import AskAIButton from "@/components/AskAIButton";
import HomeToast from "@/components/HomeToast";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import ServerAuthWrapper from "@/components/ServerAuthWrapper";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function HomePage({ searchParams }: Props) {
  const noteIdParam = (await searchParams).noteId;

  const noteId = Array.isArray(noteIdParam)
    ? noteIdParam![0]
    : noteIdParam || "";

  // If no noteId provided, handle redirection logic
  if (!noteId) {
    try {
      const user = await getUser();
      if (user) {
        const supabase = await createClient();
        
        // Try to get the newest note
        const { data: newestNote, error } = await supabase
          .from("notes")
          .select("id")
          .eq("author_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && newestNote) {
          redirect(`/?noteId=${newestNote.id}`);
        } else {
          // Create a new note if none exist
          const { data: newNote, error: createError } = await supabase
            .from("notes")
            .insert({
              author_id: user.id,
              text: "",
            })
            .select("id")
            .single();

          if (!createError && newNote) {
            redirect(`/?noteId=${newNote.id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error handling note redirection:", error);
    }
  }

  return (
    <ServerAuthWrapper>
      {async (user) => {
        let noteText = "";
        
        if (user && noteId) {
          try {
            const supabase = await createClient();
            const { data, error } = await supabase
              .from("notes")
              .select("text")
              .eq("id", noteId)
              .eq("author_id", user.id)
              .single();

            if (!error && data) {
              noteText = data.text || "";
            }
          } catch (error) {
            console.error("Failed to fetch note:", error);
          }
        }

        return (
          <div className="flex h-full flex-col items-center gap-4">
            <div className="flex w-full max-w-4xl justify-end gap-2">
              <AskAIButton user={user} />
              <NewNoteButton user={user} />
            </div>

            <NoteTextInput noteId={noteId} startingNoteText={noteText} />

            <HomeToast />
          </div>
        );
      }}
    </ServerAuthWrapper>
  );
}

export default HomePage;