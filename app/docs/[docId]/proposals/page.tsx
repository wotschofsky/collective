import { eq } from 'drizzle-orm';
import { CheckCircle2Icon, CircleDotIcon, XCircleIcon } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import db, { proposals } from '@/lib/db';
import { getAvatarUrl } from '@/lib/utils';

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

  const shownProposals = await db.query.proposals.findMany({
    where: eq(proposals.documentId, Number(docId)),
    with: {
      author: {
        columns: {
          email: true,
        },
      },
    },
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        {shownProposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/docs/${docId}/proposals/${proposal.id}`}
          >
            <Card className="flex gap-2 px-4 py-2 transition-colors hover:bg-slate-50">
              {proposal.status === 'approved' && (
                <CheckCircle2Icon className="w-5 text-purple-600" />
              )}
              {proposal.status === 'closed' && (
                <XCircleIcon className="w-5 text-gray-500" />
              )}
              {proposal.status === 'open' && (
                <CircleDotIcon className="w-5 text-green-600" />
              )}
              <div>
                <p>{proposal.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-5 w-5 cursor-pointer">
                    <AvatarImage src={getAvatarUrl(proposal.author.email)} />
                  </Avatar>
                  <span className="text-sm text-gray-500">
                    {proposal.createdAt.toDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {shownProposals.length === 0 && (
          <p className="mt-16 text-center">No proposals yet.</p>
        )}
      </div>
    </>
  );
};

export default ProposalsPage;
