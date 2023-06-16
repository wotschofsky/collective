import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { authOptions } from '@/lib/auth';
import db, { changeSuggestions, documents } from '@/lib/db';

type DocumentPageProps = {
  params: {
    documentId: string;
  };
};

const DocumentPage: FC<DocumentPageProps> = async ({
  params: { documentId },
}) => {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, Number(documentId)),
    with: {
      currentVersion: true,
    },
  });

  if (!document) {
    return notFound();
  }

  async function save(data: FormData) {
    'use server';

    const title = data.get('title')?.toString();
    const description = data.get('description')?.toString();
    const content = data.get('content')?.toString();

    if (!title || !content) {
      return;
    }

    if (!document?.currentVersionId) {
      return;
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return;
    }

    const suggestion = await db.insert(changeSuggestions).values({
      title: title,
      documentId: document.id,
      description: description || '',
      content: content,
      authorId: session.user.id,
      baseVersionId: document.currentVersionId,
      createdAt: new Date(),
    });

    revalidatePath(`/docs/${document!.id}/suggestions`);
    redirect(`/docs/${document!.id}/suggestions/${suggestion.insertId}`);
  }

  return (
    <>
      <div className="flex justify-center">
        <form action={save} className="w-full max-w-xl">
          <p className="mb-8">
            Modify the selected document below and submit it as a suggestion for
            changes
          </p>

          <Input name="title" className="mb-4" placeholder="Title" required />
          <Input
            name="description"
            className="mb-4"
            placeholder="Description (explanation or reasoning)"
          />
          <Textarea
            name="content"
            className="mb-4"
            placeholder="Document Contents"
            rows={20}
            defaultValue={document.currentVersion?.content ?? ''}
            required
          ></Textarea>
          <Button type="submit">Suggest Changes</Button>
        </form>
      </div>
    </>
  );
};

export default DocumentPage;
