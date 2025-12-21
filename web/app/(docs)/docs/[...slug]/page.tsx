import { DocsApp } from "@/features/docs/components/docs-app";

export default function Page({ params }: { params: { slug: string[] } }) {
  const href = `/docs/${params.slug.join("/")}`;
  return <DocsApp href={href} />;
}

