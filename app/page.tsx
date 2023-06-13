import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import db, { documents } from '@/lib/db';

export default async function Home() {
  const documentsData = await db.select().from(documents);

  return (
    <>
      <div className="flex justify-between">
        <h1 className="mb-6 text-2xl">Documents</h1>
        <Button asChild>
          <Link href="/docs/new">New Document</Link>
        </Button>
      </div>

      <div className="flex gap-6">
        {documentsData.map((doc) => (
          <Card key={doc.id} className="w-72">
            <CardHeader>
              <CardTitle>{doc.name}</CardTitle>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={`/docs/${doc.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {documentsData.length === 0 && (
          <p className="mt-16 flex-1 text-center">No documents yet.</p>
        )}
      </div>
    </>
  );
}
