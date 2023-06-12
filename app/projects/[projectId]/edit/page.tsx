import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import db, { changeSuggestions, projects } from '@/lib/db';

type ProjectPageProps = {
  params: {
    projectId: string;
  };
};

const ProjectPage: FC<ProjectPageProps> = async ({ params: { projectId } }) => {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(projectId)));

  async function save(data: FormData) {
    'use server';

    const title = data.get('title')?.toString();
    const comment = data.get('comment')?.toString();
    const content = data.get('content')?.toString();

    if (!title || !content) {
      return;
    }

    await db.insert(changeSuggestions).values({
      title: title,
      projectId: project.id,
      comment: comment,
      state: content,
    });

    revalidatePath(`/projects/${project.id}/suggestions`);
    redirect(`/projects/${project.id}`);
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
            name="comment"
            className="mb-4"
            placeholder="Comment (explanation or reasoning)"
          />
          <Textarea
            name="content"
            className="mb-4"
            placeholder="Document Contents"
            rows={20}
            defaultValue={project.state || ''}
            required
          ></Textarea>
          <Button type="submit">Suggest Changes</Button>
        </form>
      </div>
    </>
  );
};

export default ProjectPage;
