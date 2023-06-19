import clsx from 'clsx';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import { computeBlameMap } from '@/lib/blame';
import db, { documents } from '@/lib/db';

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
        columns: {
          content: true,
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

  if (!document?.currentVersionId || !document.currentVersion) {
    return notFound();
  }

  const blame = computeBlameMap(
    document.allVersions,
    document.currentVersionId
  );
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
