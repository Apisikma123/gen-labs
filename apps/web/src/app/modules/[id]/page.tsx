import { Suspense } from 'react';
import { ModuleWorkspace } from '@/components/module/module-workspace';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const resolved = await params;
  return <ModuleWorkspace moduleSlugOrId={resolved.id} />;
}
