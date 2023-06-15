import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import DocTabs from '@/components/DocTabs';
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
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!document) {
    return notFound();
  }

  return (
    <>
      <h1 className="mb-6 text-2xl">{document.name}</h1>
      <DocTabs docId={document.id.toString()} />
      {children}
    </>
  );
};

export default DocumentPageLayout;
