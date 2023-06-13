import { eq } from 'drizzle-orm';
import Link from 'next/link';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import db, { documents } from '@/lib/db';

type DocumentEditPageProps = {
  params: {
    documentId: string;
  };
};

const DocumentEditPage: FC<DocumentEditPageProps> = async ({
  params: { documentId },
}) => {
  const document = await db
    .select()
    .from(documents)
    .where(eq(documents.id, Number(documentId)));

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
        <p className="mb-6 max-w-xl whitespace-pre-line">{document[0].state}</p>
      </div>
    </>
  );
};

export default DocumentEditPage;
