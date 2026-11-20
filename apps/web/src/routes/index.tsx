// Example page: talks to the API only through the generated client's query hooks.
import { createNoteMutation, listNotesOptions, listNotesQueryKey } from "@qlastakit/api-client";
import { Button, Input } from "@qlastakit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { protect } from "@/access";

export const Route = createFileRoute("/")({ ...protect("home"), component: Home });

function Home() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const notes = useQuery(listNotesOptions());
  const create = useMutation({
    ...createNoteMutation(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listNotesQueryKey() }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ body: { title, body: "" } });
    setTitle("");
  }

  const failed = notes.isError || create.isError;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("notes.title")}</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("notes.new.placeholder")}
        />
        <Button type="submit" disabled={create.isPending}>
          {t("notes.add")}
        </Button>
      </form>
      {failed && <p className="text-sm text-destructive">{t("notes.error")}</p>}
      <ul className="space-y-2">
        {(notes.data ?? []).map((n) => (
          <li key={n.id} className="rounded-md border border-border p-3">
            {n.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
