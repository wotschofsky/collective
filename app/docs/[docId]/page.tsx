import { eq } from 'drizzle-orm';
import MarkdownIt from 'markdown-it';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import db, { documents } from '@/lib/db';

const md = new MarkdownIt();

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
