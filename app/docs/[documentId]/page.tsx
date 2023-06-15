import { eq } from 'drizzle-orm';
import MarkdownIt from 'markdown-it';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import db, { documents } from '@/lib/db';

const md = new MarkdownIt();

export const runtime = 'edge';
export const preferredRegion = 'iad1';

type DocumentPageProps = {
  params: {
    documentId: string;
  };
};

const DocumentPage: FC<DocumentPageProps> = async ({
  params: { documentId },
}) => {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, Number(documentId)),
    with: {
      currentVersion: true,
    },
  });

  if (!document?.currentVersion) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="prose mb-6 max-w-xl"
        dangerouslySetInnerHTML={{
          __html: md.render(document.currentVersion.content),
        }}
      ></div>
    </div>
  );
};

export default DocumentPage;
