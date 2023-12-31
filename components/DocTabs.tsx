'use client';

import {
  Edit2Icon,
  HistoryIcon,
  MessageSquarePlusIcon,
  TextIcon,
  UserIcon,
} from 'lucide-react';
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
                ? 'flex items-center gap-2 rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'flex items-center gap-2 rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
          >
            <TextIcon className="inline h-5" />
            View
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/blame`}
            className={
              selectedSegment === 'blame'
                ? 'flex items-center gap-2 rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'flex items-center gap-2 rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            <UserIcon className="inline h-5" />
            Blame
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/changes`}
            className={
              selectedSegment === 'changes'
                ? 'flex items-center gap-2 rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'flex items-center gap-2 rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            <HistoryIcon className="inline h-5" />
            Changes
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/proposals`}
            className={
              selectedSegment === 'proposals'
                ? 'flex items-center gap-2 rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'flex items-center gap-2 rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            <MessageSquarePlusIcon className="inline h-5" />
            Proposals
          </Link>
        </li>
        <li className="mr-2">
          <Link
            href={`/docs/${docId}/edit`}
            className={
              selectedSegment === 'edit'
                ? 'flex items-center gap-2 rounded-t-lg border-b-2 border-primary p-4 text-primary'
                : 'flex items-center gap-2 rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
            }
            aria-current="page"
          >
            <Edit2Icon className="inline h-5" />
            Edit
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default DocTabs;
