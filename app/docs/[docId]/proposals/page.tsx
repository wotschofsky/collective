import { eq } from 'drizzle-orm';
import Link from 'next/link';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import db, { proposals } from '@/lib/db';

export const runtime = 'edge';
export const preferredRegion = 'home';

type ProposalsPageProps = {
  params: {
    docId: string;
  };
};

const ProposalsPage: FC<ProposalsPageProps> = async ({ params: { docId } }) => {
  if (Number.isNaN(Number(docId))) {
    return null;
  }

  const shownProposals = await db
    .select()
    .from(proposals)
    .where(eq(proposals.documentId, Number(docId)));

  return (
    <>
      <div className="flex flex-col gap-6">
        {shownProposals.map((proposal) => (
          <Card key={proposal.id} className="flex w-full items-center p-4">
            <div className="flex-1">
              <span className="mr-2 inline-block rounded-2xl bg-slate-800 px-3 py-1.5 text-sm text-white">
                {proposal.status.toUpperCase()}
              </span>
              <span>{proposal.title}</span>
            </div>
            <Button asChild>
              <Link href={`/docs/${docId}/proposals/${proposal.id}`}>View</Link>
            </Button>
          </Card>
        ))}

        {shownProposals.length === 0 && (
          <p className="mt-16 text-center">No proposals yet.</p>
        )}
      </div>
    </>
  );
};

export default ProposalsPage;
