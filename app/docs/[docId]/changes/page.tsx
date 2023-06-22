import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import type { FC } from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import db, { documentVersion } from '@/lib/db';
import { getAvatarUrl } from '@/lib/utils';

export const runtime = 'edge';
export const preferredRegion = 'home';

type ChangesListPageProps = {
  params: {
    docId: string;
  };
};

const ChangesListPage: FC<ChangesListPageProps> = async ({
  params: { docId },
}) => {
  if (Number.isNaN(Number(docId))) {
    return null;
  }

  const versions = await db.query.documentVersion.findMany({
    where: eq(documentVersion.documentId, Number(docId)),
    with: {
      author: {
        columns: {
          email: true,
        },
      },
    },
    orderBy: desc(documentVersion.createdAt),
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        {versions.map((version) => (
          <Link key={version.id} href={`/docs/${docId}/changes/${version.id}`}>
            <Card className="px-4 py-2 transition-colors hover:bg-slate-50">
              <p>{version.description}</p>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="h-5 w-5 cursor-pointer">
                  <AvatarImage src={getAvatarUrl(version.author.email)} />
                </Avatar>
                <span className="text-sm text-gray-500">
                  {version.createdAt.toDateString()}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
};

export default ChangesListPage;
