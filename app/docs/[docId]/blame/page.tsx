import clsx from 'clsx';
import { diffLines } from 'diff';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import db, { documents, DocumentVersion } from '@/lib/db';

export const runtime = 'edge';
export const preferredRegion = 'home';

type DocumentBlamePageProps = {
  params: {
    docId: string;
  };
};

const DocumentBlamePage: FC<DocumentBlamePageProps> = async ({
  params: { docId },
}) => {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, Number(docId)),
    with: {
      currentVersion: {
        with: {
          author: true,
        },
      },
      allVersions: {
        with: {
          author: true,
        },
        orderBy: (documents, { desc }) => [desc(documents.createdAt)],
      },
    },
  });

  if (!document?.currentVersion) {
    return notFound();
  }

  const versions: typeof document.allVersions = [document.currentVersion];
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

  let blame: typeof document.allVersions = new Array(
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

  const documentLines = document.currentVersion.content.split('\n');

  return (
    <table className="w-full">
      <tbody>
        {new Array(documentLines.length).fill(0).map((_, index) => {
          const isNewBlame = index === 0 || blame[index - 1] !== blame[index];

          return (
            <tr
              key={index}
              className={clsx({
                ['border-t-[1px] border-slate-500']: isNewBlame && index !== 0,
              })}
            >
              <td>{documentLines[index]}</td>
              <td className="box-border min-w-max align-top text-sm">
                {isNewBlame &&
                  `${blame[index].description} (${
                    blame[index].author.email
                  }, ${blame[index].createdAt.toDateString()})`}
              </td>
            </tr>
          );
        })}
        <tr></tr>
      </tbody>
    </table>
  );
};

export default DocumentBlamePage;
