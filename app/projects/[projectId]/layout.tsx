import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import db, { projects } from '@/lib/db';

type ProjectPageLayoutProps = {
  params: {
    projectId: string;
  };
  children: ReactNode;
};

const ProjectPageLayout: FC<ProjectPageLayoutProps> = async ({
  params: { projectId },
  children,
}) => {
  if (Number.isNaN(Number(projectId))) {
    return notFound();
  }

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(projectId)));

  if (project.length === 0) {
    return notFound();
  }

  return (
    <>
      <h1 className="mb-6 text-2xl">{project[0].name}</h1>
      {children}
    </>
  );
};

export default ProjectPageLayout;
