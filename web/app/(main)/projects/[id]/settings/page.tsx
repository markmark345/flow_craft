import { ProjectSettingsPage } from "@/features/projects/components/project-settings-page";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return <ProjectSettingsPage projectId={params.id} />;
}

