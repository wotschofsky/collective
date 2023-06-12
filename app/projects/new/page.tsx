import { redirect } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import db, { projects } from '@/lib/db';

const NewProjectPage: FC<Record<never, never>> = () => {
  async function save(data: FormData) {
    'use server';

    const name = data.get('name')?.toString();
    const description = data.get('description')?.toString();
    const content = data.get('content')?.toString();

    if (!name || !content) {
      return;
    }

    await db.insert(projects).values({
      name: name,
      description: description,
      state: content,
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
            placeholder="Project Name"
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
          <Button type="submit">Create Project</Button>
        </form>
      </div>
    </>
  );
};

export default NewProjectPage;
