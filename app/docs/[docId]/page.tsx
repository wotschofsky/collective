import { eq } from 'drizzle-orm';
import MarkdownIt from 'markdown-it';
import markdownItSourceMap from 'markdown-it-source-map';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import { computeBlameMap } from '@/lib/blame';
import db, { documents } from '@/lib/db';
import { getAvatarUrl } from '@/lib/utils';

const md = new MarkdownIt();
md.use(markdownItSourceMap);

export const runtime = 'edge';
export const preferredRegion = 'home';

type DocumentPageProps = {
  params: {
    docId: string;
  };
};

const DocumentPage: FC<DocumentPageProps> = async ({ params: { docId } }) => {
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
    document.currentVersionId,
  );

  const lineStyles = Object.entries(blame)
    .map(([index, version]) => {
      const line = Number(index) + 1;
      return `
        [data-source-line="${line}"]::after {
          background-image: url('${getAvatarUrl(version.author.email)}');
        }
      `;
    })
    .join('\n');

  return (
    <>
      <style>{`
        [data-source-line] {
          position: relative;
        }

        [data-source-line]:hover::after {
          content: ''
        }

        [data-source-line]::after {
          position: absolute;
          top: 0;
          right: -2.5rem;
          width: 2rem;
          height: 2rem;
          background-size: cover;
          background-position: center;
          border-radius: 50%;
        }

        ${lineStyles}
      `}</style>
      <div
        className="prose mb-6 w-full max-w-[calc(100%-2.5rem)]"
        dangerouslySetInnerHTML={{
          __html: md.render(document.currentVersion.content),
        }}
      ></div>
    </>
  );
};

export default DocumentPage;
