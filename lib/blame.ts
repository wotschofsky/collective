import { diffLines } from 'diff';

import type { DocumentVersion, User } from '@/lib/schema';

export const computeBlameMap = (
  allVersions: Array<
    DocumentVersion & {
      author: User;
    }
  >,
  targetVersionId: number
) => {
  const targetVersion = allVersions.find((v) => v.id === targetVersionId);

  if (!targetVersion) {
    throw new Error('Failed to find target version in version array');
  }

  const orderedVersions: typeof allVersions = [targetVersion];
  let activeVersion = targetVersion;
  while (true) {
    const previousVersion = allVersions.find(
      (v) => v.id === activeVersion.previousVersionId
    );

    if (!previousVersion) {
      if (activeVersion.previousVersionId) {
        throw new Error(
          'Failed to find previous version in version array, but previous version ID was set'
        );
      }

      break;
    }

    orderedVersions.unshift(previousVersion);
    activeVersion = previousVersion;
  }

  let blame: typeof allVersions = new Array(
    orderedVersions[0].content.split('\n').length
  ).fill(orderedVersions[0]);
  for (let i = 1; i < orderedVersions.length; i++) {
    const changes = diffLines(
      orderedVersions[i - 1].content,
      orderedVersions[i].content
    );

    let position = 0;
    for (const change of changes) {
      if (change.removed) {
        blame.splice(position, change.count);
        continue;
      }

      if (change.added) {
        const newLines = new Array(change.count).fill(orderedVersions[i]);
        blame.splice(position, 0, ...newLines);
        position += change.count!;
        continue;
      }

      position += change.count!;
    }
  }

  return blame;
};
