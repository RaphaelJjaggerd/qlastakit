// Example page: talks to the API only through the generated client.
import { createNote, listNotes } from "@kit/api-client";
import { Button, Input } from "@kit/ui";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { data, error } = await listNotes();
    return { notes: data ?? [], error: error ? "Could not load notes. Is the API running?" : null };
  },
  component: Home,
});

function Home() {
  const { notes, error } = Route.useLoaderData();
  const router = useRouter();
  const [title, setTitle] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createNote({ body: { title, body: "" } });
    setTitle("");
    await router.invalidate();
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Notes</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New note" />
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-md border border-neutral-200 p-3">
            {n.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
