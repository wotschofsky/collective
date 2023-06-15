import * as Diff from 'diff';
import { diff_match_patch as DiffMainPatch } from 'diff-match-patch';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import db from '@/lib/db';
import { changeSuggestions, documents, documentVersion } from '@/lib/schema';

const dmp = new DiffMainPatch();

export const runtime = 'edge';
export const preferredRegion = 'iad1';

type DocumentEditPageProps = {
  params: {
    documentId: string;
    suggestionId: string;
  };
};

const DocumentEditPage: FC<DocumentEditPageProps> = async ({
  params: { suggestionId },
}: DocumentEditPageProps) => {
  const suggestion = await db.query.changeSuggestions.findFirst({
    where: eq(changeSuggestions.id, suggestionId),
    with: {
      baseVersion: true,
    },
  });

  if (!suggestion) {
    return notFound();
  }

  const changes = Diff.diffChars(
    suggestion.baseVersion.content,
    suggestion.content
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
      where: eq(changeSuggestions.id, suggestionId),
      with: {
        baseVersion: true,
        document: {
          with: {
            currentVersion: true,
          },
        },
      },
    });

    if (!suggestion || suggestion.status !== 'open') {
      throw new Error('Suggestion not found');
    }

    if (!suggestion.document.currentVersion) {
      throw new Error('Document version not found');
    }

    const diffs = dmp.diff_main(
      suggestion.baseVersion.content,
      suggestion.content
    );
    const patches = dmp.patch_make(suggestion.baseVersion.content, diffs);
    const [mergedContent, _] = dmp.patch_apply(
      patches,
      suggestion.document.currentVersion.content
    );

    await db.transaction(async (tx) => {
      const newVersion = await tx.insert(documentVersion).values({
        documentId: suggestion.documentId,
        description: suggestion.title,
        content: mergedContent,
        author: suggestion.author,
        previousVersionId: suggestion.document.currentVersionId,
        createdAt: new Date(),
      });
      await tx
        .update(documents)
        .set({
          currentVersionId: newVersion.insertId,
        })
        .where(eq(documents.id, suggestion.documentId));
      await tx
        .update(changeSuggestions)
        .set({
          status: 'approved',
        })
        .where(eq(changeSuggestions.id, suggestion.id));
    });

    revalidatePath(`/docs/${suggestion.documentId}`);
    revalidatePath(`/docs/${suggestion.documentId}/suggestions`);
    revalidatePath(
      `/docs/${suggestion.documentId}/suggestions/${suggestion.id}`
    );
  }

  async function handleReject() {
    'use server';

    const suggestion = await db.query.changeSuggestions.findFirst({
      where: eq(changeSuggestions.id, suggestionId),
    });

    if (!suggestion || suggestion.status !== 'open') {
      throw new Error('Suggestion not found');
    }

    await db
      .update(changeSuggestions)
      .set({
        status: 'closed',
      })
      .where(eq(changeSuggestions.id, suggestion.id));

    revalidatePath(`/docs/${suggestion.documentId}/suggestions`);
    revalidatePath(
      `/docs/${suggestion.documentId}/suggestions/${suggestion.id}`
    );
  }

  return (
    <>
      <div className="mb-4">
        <span className="mr-2 inline-block rounded-2xl bg-slate-800 px-3 py-1.5 text-sm text-white">
          {suggestion.status.toUpperCase()}
        </span>
        <h2 className="inline text-xl">{suggestion.title}</h2>
      </div>

      <div className="flex items-start gap-4">
        <p className="flex-1 whitespace-pre-wrap">{originalText}</p>
        <p className="flex-1 whitespace-pre-wrap">{newText}</p>
      </div>

      {suggestion.status === 'open' && (
        <form className="mt-8 flex gap-2">
          <Button formAction={handleApprove}>Approve</Button>
          <Button formAction={handleReject} variant="outline">
            Reject
          </Button>
        </form>
      )}
    </>
  );
};

export default DocumentEditPage;
