import * as Diff from 'diff';
import { diff_match_patch as DiffMainPatch } from 'diff-match-patch';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { changeSuggestions, documents, documentVersion } from '@/lib/schema';

const dmp = new DiffMainPatch();

type DocumentEditPageProps = {
  params: {
    docId: string;
    suggestionId: string;
  };
};

const DocumentEditPage: FC<DocumentEditPageProps> = async ({
  params: { suggestionId },
}: DocumentEditPageProps) => {
  if (Number.isNaN(Number(suggestionId))) {
    return notFound();
  }

  const session = await getServerSession(authOptions);

  const suggestion = await db.query.changeSuggestions.findFirst({
    where: eq(changeSuggestions.id, Number(suggestionId)),
    with: {
      baseVersion: true,
      document: {
        columns: {
          ownerId: true,
        },
      },
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
      where: eq(changeSuggestions.id, Number(suggestionId)),
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

    const session = await getServerSession(authOptions);
    if (session?.user?.id !== suggestion.document.ownerId) {
      throw new Error('Unauthorized');
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
        authorId: suggestion.authorId,
        previousVersionId: suggestion.document.currentVersionId,
        createdAt: new Date(),
      });
      await tx
        .update(documents)
        .set({
          currentVersionId: Number(newVersion.insertId),
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
      where: eq(changeSuggestions.id, Number(suggestionId)),
      with: {
        document: {
          columns: {
            ownerId: true,
          },
        },
      },
    });

    if (!suggestion || suggestion.status !== 'open') {
      throw new Error('Suggestion not found');
    }

    const session = await getServerSession(authOptions);
    if (session?.user?.id !== suggestion.document.ownerId) {
      throw new Error('Unauthorized');
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
      {suggestion.status === 'open' &&
        session?.user?.id === suggestion.document.ownerId && (
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