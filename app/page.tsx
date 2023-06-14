import { formatDistance } from 'date-fns';
import MarkdownIt from 'markdown-it';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import db from '@/lib/db';

const md = new MarkdownIt();

export default async function Home() {
  const documents = await db.query.documents.findMany({
    with: {
      currentVersion: true,
    },
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
        {documents.map((doc) => (
          <div key={doc.id} className="w-72">
            <h3 className="text-lg font-semibold">{doc.name}</h3>
            <Link href={`/docs/${doc.id}`}>
              <Card className="my-4 p-4">
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
            {doc.currentVersion && (
              <span className="text-gray-500">
                Last modified{' '}
                {formatDistance(doc.currentVersion.createdAt, new Date())}
              </span>
            )}
          </div>
        ))}
        {documents.length === 0 && (
          <p className="mt-16 flex-1 text-center">No documents yet.</p>
        )}
      </div>
    </>
  );
}
