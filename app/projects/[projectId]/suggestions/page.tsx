import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import db, { changeSuggestions } from '@/lib/db';

type SuggestionsPageProps = {
  params: {
    projectId: string;
  };
};

const SuggestionsPage: FC<SuggestionsPageProps> = async ({
  params: { projectId },
}) => {
  if (Number.isNaN(Number(projectId))) {
    return null;
  }

  const suggestions = await db
    .select()
    .from(changeSuggestions)
    .where(eq(changeSuggestions.projectId, Number(projectId)));

  return (
    <>
      <h1 className="mb-6 text-xl">Change Suggestions</h1>

      <div className="flex flex-col gap-6">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="w-full">
            <CardHeader>
              <CardTitle>{suggestion.title}</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link
                  href={`/projects/${projectId}/suggestions/${suggestion.id}`}
                >
                  View
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {suggestions.length === 0 && (
          <p className="mt-16 text-center">No suggestions yet.</p>
        )}
      </div>
    </>
  );
};

export default SuggestionsPage;
