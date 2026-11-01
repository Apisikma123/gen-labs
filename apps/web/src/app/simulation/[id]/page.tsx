import { SimulationWorkspace } from '@/components/simulation-workspace';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolved = await params;
  return <SimulationWorkspace slug={resolved.id} />;
}
