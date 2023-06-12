import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const projects = ['xyz', 'abc', '123'];

export default function Home() {
  return (
    <>
      <h1 className="mb-6 text-2xl">Projects</h1>

      <div className="flex gap-6">
        {projects.map((project) => (
          <Card key={project} className="w-72">
            <CardHeader>
              <CardTitle>Project {project.toUpperCase()}</CardTitle>
              <CardDescription>
                Project {project.toUpperCase()} Description
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={`/projects/${project}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
