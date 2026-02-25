import { ProjectSettingsPage } from "@/features/projects/components/project-settings-page";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ProjectSettingsPage projectId={id} />;
}

