import * as Diff from 'diff';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import db, { documentVersion } from '@/lib/db';

export const runtime = 'edge';
export const preferredRegion = 'home';

type ChangesDetailsPageProps = {
  params: {
    docId: string;
    changeId: string;
  };
};

const ChangesDetailsPage: FC<ChangesDetailsPageProps> = async ({
  params: { changeId },
}) => {
  if (Number.isNaN(Number(changeId))) {
    return notFound();
  }

  const version = await db.query.documentVersion.findFirst({
    where: eq(documentVersion.id, Number(changeId)),
    with: {
      previousVersion: true,
      document: {
        columns: {
          ownerId: true,
        },
      },
    },
  });

  if (!version) {
    return notFound();
  }

  if (!version.previousVersion) {
    return (
      <>
        <h2 className="mb-4 text-xl">{version.description}</h2>

        <div className="flex items-start gap-4">
          <p className="flex-1 whitespace-pre-wrap">{version.content}</p>
        </div>
      </>
    );
  }

  const changes = Diff.diffChars(
    version.previousVersion.content,
    version.content,
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

  return (
    <>
      <h2 className="mb-4 text-xl">{version.description}</h2>

      <div className="flex items-start gap-4">
        <p className="flex-1 whitespace-pre-wrap">{originalText}</p>
        <p className="flex-1 whitespace-pre-wrap">{newText}</p>
      </div>
    </>
  );
};

export default ChangesDetailsPage;
