import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import db, { changeSuggestions } from '@/lib/db';

type SuggestionsPageProps = {
  params: {
    documentId: string;
  };
};

const SuggestionsPage: FC<SuggestionsPageProps> = async ({
  params: { documentId },
}) => {
  if (Number.isNaN(Number(documentId))) {
    return null;
  }

  const suggestions = await db
    .select()
    .from(changeSuggestions)
    .where(eq(changeSuggestions.documentId, Number(documentId)));

  return (
    <>
      <h1 className="mb-6 text-xl">Change Suggestions</h1>

      <div className="flex flex-col gap-6">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="flex w-full items-center p-4">
            <div className="flex-1">
              <span className="mr-2 inline-block rounded-2xl bg-slate-800 px-3 py-1.5 text-sm text-white">
                {suggestion.status.toUpperCase()}
              </span>
              <span>{suggestion.title}</span>
            </div>
            <Button asChild>
              <Link href={`/docs/${documentId}/suggestions/${suggestion.id}`}>
                View
              </Link>
            </Button>
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
