import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

const projects = ['xyz', 'abc', '123'];

const SuggestionsPage = () => {
  return (
    <>
      <h1 className="mb-6 text-xl">Change Suggestions</h1>

      <div className="flex flex-col gap-6">
        {projects.map((project) => (
          <Card key={project} className="w-full">
            <CardHeader>
              <CardDescription>Do this and that</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={`/projects/${project}/suggestions/${project}`}>
                  View
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default SuggestionsPage;
