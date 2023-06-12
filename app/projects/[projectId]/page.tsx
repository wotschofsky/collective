import { eq } from 'drizzle-orm';
import Link from 'next/link';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import db, { projects } from '@/lib/db';

const paragraphs = [
  'In labore culpa id dolor tempor labore est magna ad nisi labore. Amet consequat esse ad laborum tempor proident pariatur. Qui sunt Lorem dolor aliqua in cillum nulla id occaecat aliqua amet elit quis nisi aliquip. Ea aute tempor consequat in. Culpa in nulla fugiat laborum amet culpa sunt anim occaecat officia.',
  'Esse voluptate culpa voluptate ea enim laboris fugiat enim. Id laboris duis adipisicing laboris ea id tempor Lorem quis nisi voluptate pariatur. Ut excepteur ex Lorem deserunt id. Non amet sint dolor nostrud Lorem quis fugiat tempor ad. Lorem quis sit consequat laborum adipisicing proident ut et irure reprehenderit adipisicing incididunt occaecat eu. Ullamco ut cillum et do exercitation ipsum non reprehenderit. Laboris ullamco culpa enim do duis occaecat consectetur. Adipisicing sunt proident ad do anim nisi officia pariatur.',
  'Ad qui labore laborum ea sit nisi pariatur officia est ea excepteur laboris voluptate est fugiat. Nostrud fugiat magna reprehenderit officia laboris. In qui enim sunt ipsum quis eiusmod ut sit ad nostrud. Labore commodo nulla sit eu aliqua laborum ut ex quis ullamco. Id et qui ipsum. Quis deserunt proident aute nulla ex deserunt nulla ea reprehenderit.',
  'Incididunt amet enim qui. Ipsum ea cupidatat tempor et Lorem voluptate est. Laborum aliquip exercitation magna in et non ex. Laboris elit commodo sint aliquip ad dolor ex Lorem ad proident consectetur sit anim consequat laboris. Ullamco velit aliqua ex voluptate sunt nostrud quis dolore. Proident proident proident sit in voluptate enim id in. Dolore consectetur ullamco dolore laborum aute aliquip deserunt ullamco ea amet qui. Quis velit eu occaecat velit duis enim tempor qui cillum ea ad in tempor.',
  'Et laborum velit est nisi occaecat pariatur velit aliqua anim reprehenderit exercitation do anim consectetur mollit. Qui elit non excepteur sit cupidatat non culpa ipsum velit Lorem. Exercitation proident aliquip velit occaecat nostrud tempor mollit. Proident magna ea non adipisicing sit eiusmod eu proident dolor officia non ullamco sunt laborum. Fugiat sit enim incididunt duis et incididunt dolore laboris eiusmod elit. Do nostrud id quis.',
];

type ProjectEditPageProps = {
  params: {
    projectId: string;
  };
};

const ProjectEditPage: FC<ProjectEditPageProps> = async ({
  params: { projectId },
}) => {
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(projectId)));

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button asChild>
          <Link href={`/projects/${projectId}/edit`}>Edit</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}/suggestions`}>Suggestions</Link>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <p className="mb-6 max-w-xl whitespace-pre-line">{project[0].state}</p>
      </div>
    </>
  );
};

export default ProjectEditPage;
