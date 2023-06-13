import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

    await db.transaction(async (tx) => {
      const document = await tx.insert(documents).values({
        name: name,
        description: description ?? '',
      });

      const version = await tx.insert(documentVersion).values({
        description: 'Initial Version',
        content: content,
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
