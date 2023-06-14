'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import type { FC } from 'react';

type DocTabsProps = {
  docId: string;
};

const DocTabs: FC<DocTabsProps> = ({ docId }) => {
  const selectedSegment = useSelectedLayoutSegment();

  return (
    <div className="mb-6 mt-6 border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <ul className="-mb-px flex flex-wrap">
        <li className="mr-2">
          <Link
            href={`/docs/${docId}`}
            className={
              selectedSegment === null
                ? 'inline-block rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
          >
            View
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/blame`}
            className={
              selectedSegment === 'blame'
                ? 'inline-block rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            Blame
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/suggestions`}
            className={
              selectedSegment === 'suggestions'
                ? 'inline-block rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            Suggestions
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/edit`}
            className={
              selectedSegment === 'edit'
                ? 'inline-block rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            Edit
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default DocTabs;
