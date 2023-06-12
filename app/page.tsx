import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import db, { projects } from '@/lib/db';

export default async function Home() {
  const projectsData = await db.select().from(projects);

  return (
    <>
      <div className="flex justify-between">
        <h1 className="mb-6 text-2xl">Projects</h1>
        <Button asChild>
          <Link href="/projects/new">New Project</Link>
        </Button>
      </div>

      <div className="flex gap-6">
        {projectsData.map((project) => (
          <Card key={project.id} className="w-72">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={`/projects/${project.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {projectsData.length === 0 && (
          <p className="mt-16 flex-1 text-center">No projects yet.</p>
        )}
      </div>
    </>
  );
}
