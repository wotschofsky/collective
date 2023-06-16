import { eq, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { authOptions } from '@/lib/auth';
import db, { documents, documentVersion } from '@/lib/db';

const NewDocumentPage: FC<Record<never, never>> = () => {
  async function save(data: FormData) {
    'use server';

    const name = data.get('name')?.toString();
    const description = data.get('description')?.toString();
    const content = data.get('content')?.toString();

    if (!name || !content) {
      return;
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return;
    }

    await db.transaction(async (tx) => {
      if (!session?.user?.name) {
        return;
      }

      const document = await tx.insert(documents).values({
        name: name,
        description: description ?? '',
        ownerId: session.user.id,
      });

      const version = await tx.insert(documentVersion).values({
        description: 'Initial Version',
        content: content,
        authorId: session.user.id,
        documentId: Number(document.insertId),
        createdAt: new Date(),
      });

      await tx
        .update(documents)
        .set({
          currentVersionId: Number(version.insertId),
        })
        .where(eq(documents.id, Number(document.insertId)));
    });

    redirect('/');
  }

  return (
    <>
      <div className="flex justify-center">
        <form action={save} className="w-full max-w-xl">
          <Input
            name="name"
            className="mb-4"
            placeholder="Document Name"
            required
          />
          <Input
            name="description"
            className="mb-4"
            placeholder="Description"
          />
          <Textarea
            name="content"
            className="mb-4"
            placeholder="Document Contents"
            rows={20}
            required
          ></Textarea>
          <Button type="submit">Create Document</Button>
        </form>
      </div>
    </>
  );
};

export default NewDocumentPage;
