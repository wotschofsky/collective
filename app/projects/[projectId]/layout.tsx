import type { FC, ReactNode } from 'react';

type ProjectPageLayoutProps = {
  params: {
    projectId: string;
  };
  children: ReactNode;
};

const ProjectPageLayout: FC<ProjectPageLayoutProps> = ({
  params: { projectId },
  children,
}) => (
  <>
    <h1 className="mb-6 text-2xl">Project {projectId.toUpperCase()}</h1>
    {children}
  </>
);

export default ProjectPageLayout;
