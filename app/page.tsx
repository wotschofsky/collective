import { formatDistance } from 'date-fns';
import MarkdownIt from 'markdown-it';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import db from '@/lib/db';

const md = new MarkdownIt();

export const runtime = 'edge';
export const preferredRegion = 'home';

export default async function Home() {
  const documents = await db.query.documents.findMany({
    with: {
      currentVersion: true,
    },
  });
  // TODO move to db query if possible
  const sortedDocuments = documents.sort((a, b) => {
    if (!a.currentVersion) return 1;
    if (!b.currentVersion) return -1;
    return (
      b.currentVersion.createdAt.getTime() -
      a.currentVersion.createdAt.getTime()
    );
  });

  return (
    <>
      <div className="flex justify-between">
        <h1 className="mb-6 text-2xl">Documents</h1>
        <Button asChild>
          <Link href="/docs/new">New Document</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-6">
        {sortedDocuments.map((doc) => (
          <div key={doc.id} className="w-72">
            <Link href={`/docs/${doc.id}`}>
              <Card className="p-4">
                <div className="aspect-[1/1.29] select-none overflow-hidden">
                  <div
                    className="prose w-[250%] origin-top-left scale-[0.4]"
                    dangerouslySetInnerHTML={{
                      __html: md.render(doc.currentVersion?.content ?? ''),
                    }}
                  ></div>
                </div>
              </Card>
            </Link>
            <h3 className="my-4 text-lg font-semibold">{doc.name}</h3>
            {doc.currentVersion && (
              <span className="text-gray-500">
                Last modified{' '}
                {formatDistance(doc.currentVersion.createdAt, new Date())} ago
              </span>
            )}
          </div>
        ))}
        {sortedDocuments.length === 0 && (
          <p className="mt-16 flex-1 text-center">No documents yet.</p>
        )}
      </div>
    </>
  );
}
