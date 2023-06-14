import { diffLines } from 'diff';
import { eq } from 'drizzle-orm';
import MarkdownIt from 'markdown-it';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import db, { documents, DocumentVersion } from '@/lib/db';

type DocumentBlamePageProps = {
  params: {
    documentId: string;
  };
};

const DocumentBlamePage: FC<DocumentBlamePageProps> = async ({
  params: { documentId },
}) => {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, Number(documentId)),
    with: {
      currentVersion: true,
      allVersions: {
        with: {
          previousVersion: true,
        },
        orderBy: (documents, { desc }) => [desc(documents.createdAt)],
      },
    },
  });

  if (!document?.currentVersion) {
    return notFound();
  }

  const versions: DocumentVersion[] = [document.currentVersion];
  let version = document.currentVersion;
  while (true) {
    const previousVersion = document.allVersions.find(
      (v) => v.id === version.previousVersionId
    );

    if (!previousVersion) {
      break;
    }

    versions.unshift(previousVersion);
    version = previousVersion;
  }

  let blame: DocumentVersion[] = new Array(
    versions[0].content.split('\n').length
  ).fill(versions[0]);

  for (let i = 1; i < versions.length; i++) {
    console.log(versions[i - 1].description, versions[i].description);

    const changes = diffLines(versions[i - 1].content, versions[i].content);

    let position = 0;
    for (const change of changes) {
      if (change.removed) {
        blame.splice(position, change.count);
        continue;
      }

      if (change.added) {
        const newLines = new Array(change.count).fill(versions[i]);
        blame.splice(position, 0, ...newLines);
        position += change.count!;
        continue;
      }

      position += change.count!;
    }
  }

  return (
    <div className="flex items-center gap-6">
      <code className="whitespace-pre">{document.currentVersion.content}</code>
      <div>
        {blame.map((line, index, allLines) => {
          const previousLine = allLines[index - 1];

          if (previousLine && previousLine.id === line.id) {
            // eslint-disable-next-line react/jsx-key
            return <span className="block whitespace-pre"> </span>;
          }

          return (
            // eslint-disable-next-line react/jsx-key
            <span className="block whitespace-pre border-t-[1px] border-slate-500">
              {line.description} ({line.author}, {line.createdAt.toDateString()}
              )
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentBlamePage;
