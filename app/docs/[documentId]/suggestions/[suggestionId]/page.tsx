import * as Diff from 'diff';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import db from '@/lib/db';
import { changeSuggestions, documents } from '@/lib/schema';

type DocumentEditPageProps = {
  params: {
    documentId: string;
    suggestionId: string;
  };
};

const DocumentEditPage: FC<DocumentEditPageProps> = async ({
  params: { suggestionId },
}: DocumentEditPageProps) => {
  if (Number.isNaN(Number(suggestionId))) {
    return notFound();
  }

  const suggestion = await db.query.changeSuggestions.findFirst({
    where: eq(changeSuggestions.id, Number(suggestionId)),
    with: {
      document: true,
    },
  });

  if (!suggestion) {
    return notFound();
  }

  const changes = Diff.diffWords(
    suggestion.document?.state || '',
    suggestion.state
  );

  let originalText: ReactNode[] = [];
  let newText: ReactNode[] = [];

  for (const change of changes) {
    if (change.removed) {
      originalText.push(<span className="bg-red-300">{change.value}</span>);
      continue;
    }

    if (change.added) {
      newText.push(<span className="bg-green-300">{change.value}</span>);
      continue;
    }

    originalText.push(change.value);
    newText.push(change.value);
  }

  async function handleApprove() {
    'use server';

    const suggestion = await db.query.changeSuggestions.findFirst({
      where: eq(changeSuggestions.id, Number(suggestionId)),
    });

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    await db.transaction(async (tx) => {
      await tx
        .update(documents)
        .set({
          state: suggestion?.state,
        })
        .where(eq(documents.id, suggestion!.documentId));
      await tx
        .update(changeSuggestions)
        .set({
          status: 'approved',
        })
        .where(eq(changeSuggestions.id, suggestion!.documentId));
    });

    revalidatePath(
      `/docs/${suggestion.documentId}/suggestions/${suggestion.id}`
    );
  }

  async function handleReject() {
    'use server';

    const suggestion = await db.query.changeSuggestions.findFirst({
      where: eq(changeSuggestions.id, Number(suggestionId)),
    });

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    await db
      .update(changeSuggestions)
      .set({
        status: 'closed',
      })
      .where(eq(changeSuggestions.id, suggestion!.documentId));

    revalidatePath(
      `/docs/${suggestion.documentId}/suggestions/${suggestion.id}`
    );
  }

  return (
    <>
      <div className="mb-4">
        <span className="mr-2 inline-block rounded-2xl bg-slate-800 p-2 text-white">
          {suggestion.status}
        </span>
        <h2 className="inline text-xl">{suggestion.title}</h2>
      </div>

      <div className="flex items-start gap-4">
        <p className="flex-1 whitespace-pre-wrap">{originalText}</p>
        <p className="flex-1 whitespace-pre-wrap">{newText}</p>
      </div>

      <form className="mt-8 flex gap-2">
        <Button formAction={handleApprove}>Approve</Button>
        <Button formAction={handleReject} variant="outline">
          Reject
        </Button>
      </form>
    </>
  );
};

export default DocumentEditPage;
