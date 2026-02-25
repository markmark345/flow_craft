import { DocsApp } from "@/features/docs/components/docs-app";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const href = `/docs/${slug.join("/")}`;
  return <DocsApp href={href} />;
}

