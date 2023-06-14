import { eq } from 'drizzle-orm';
import MarkdownIt from 'markdown-it';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import db, { documents } from '@/lib/db';

const md = new MarkdownIt();

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
    <>
      <div className="mb-4 flex gap-2">
        <Button asChild>
          <Link href={`/docs/${documentId}/edit`}>Edit</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/docs/${documentId}/suggestions`}>Suggestions</Link>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <div
          className="prose mb-6 max-w-xl"
          dangerouslySetInnerHTML={{
            __html: md.render(document.currentVersion.content),
          }}
        ></div>
      </div>
    </>
  );
};

export default DocumentPage;
