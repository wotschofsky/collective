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
import { documents, documentVersion, proposals } from '@/lib/schema';

const dmp = new DiffMainPatch();

type DocumentEditPageProps = {
  params: {
    docId: string;
    proposalId: string;
  };
};

const DocumentEditPage: FC<DocumentEditPageProps> = async ({
  params: { proposalId },
}: DocumentEditPageProps) => {
  if (Number.isNaN(Number(proposalId))) {
    return notFound();
  }

  const session = await getServerSession(authOptions);

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, Number(proposalId)),
    with: {
      baseVersion: true,
      document: {
        columns: {
          ownerId: true,
        },
      },
    },
  });

  if (!proposal) {
    return notFound();
  }

  const changes = Diff.diffChars(
    proposal.baseVersion.content,
    proposal.content,
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

    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, Number(proposalId)),
      with: {
        baseVersion: true,
        document: {
          with: {
            currentVersion: true,
          },
        },
      },
    });

    if (!proposal || proposal.status !== 'open') {
      throw new Error('Proposal not found');
    }

    if (!proposal.document.currentVersion) {
      throw new Error('Document version not found');
    }

    const session = await getServerSession(authOptions);
    if (session?.user?.id !== proposal.document.ownerId) {
      throw new Error('Unauthorized');
    }

    const diffs = dmp.diff_main(proposal.baseVersion.content, proposal.content);
    const patches = dmp.patch_make(proposal.baseVersion.content, diffs);
    const [mergedContent, _] = dmp.patch_apply(
      patches,
      proposal.document.currentVersion.content,
    );

    await db.transaction(async (tx) => {
      const newVersion = await tx.insert(documentVersion).values({
        documentId: proposal.documentId,
        description: proposal.title,
        content: mergedContent,
        authorId: proposal.authorId,
        previousVersionId: proposal.document.currentVersionId,
        createdAt: new Date(),
      });
      await tx
        .update(documents)
        .set({
          currentVersionId: Number(newVersion.insertId),
        })
        .where(eq(documents.id, proposal.documentId));
      await tx
        .update(proposals)
        .set({
          status: 'approved',
        })
        .where(eq(proposals.id, proposal.id));
    });

    revalidatePath(`/docs/${proposal.documentId}`);
    revalidatePath(`/docs/${proposal.documentId}/proposals`);
    revalidatePath(`/docs/${proposal.documentId}/proposals/${proposal.id}`);
  }

  async function handleReject() {
    'use server';

    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, Number(proposalId)),
      with: {
        document: {
          columns: {
            ownerId: true,
          },
        },
      },
    });

    if (!proposal || proposal.status !== 'open') {
      throw new Error('Proposal not found');
    }

    const session = await getServerSession(authOptions);
    if (session?.user?.id !== proposal.document.ownerId) {
      throw new Error('Unauthorized');
    }

    await db
      .update(proposals)
      .set({
        status: 'closed',
      })
      .where(eq(proposals.id, proposal.id));

    revalidatePath(`/docs/${proposal.documentId}/proposals`);
    revalidatePath(`/docs/${proposal.documentId}/proposals/${proposal.id}`);
  }

  return (
    <>
      <div className="mb-4">
        <span className="mr-2 inline-block rounded-2xl bg-slate-800 px-3 py-1.5 text-sm text-white">
          {proposal.status.toUpperCase()}
        </span>
        <h2 className="inline text-xl">{proposal.title}</h2>
      </div>

      <div className="flex items-start gap-4">
        <p className="flex-1 whitespace-pre-wrap">{originalText}</p>
        <p className="flex-1 whitespace-pre-wrap">{newText}</p>
      </div>
      {proposal.status === 'open' &&
        session?.user?.id === proposal.document.ownerId && (
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
