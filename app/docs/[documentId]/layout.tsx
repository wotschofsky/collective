import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import db, { documents } from '@/lib/db';

type DocumentPageLayoutProps = {
  params: {
    documentId: string;
  };
  children: ReactNode;
};

const DocumentPageLayout: FC<DocumentPageLayoutProps> = async ({
  params: { documentId },
  children,
}) => {
  if (Number.isNaN(Number(documentId))) {
    return notFound();
  }

  const document = await db
    .select()
    .from(documents)
    .where(eq(documents.id, Number(documentId)));

  if (document.length === 0) {
    return notFound();
  }

  return (
    <>
      <h1 className="mb-6 text-2xl">{document[0].name}</h1>
      {children}
    </>
  );
};

export default DocumentPageLayout;
