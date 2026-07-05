import { notFound } from "next/navigation";
import { Switcher } from "@/components/lab/switcher";
import { OPTIONS, getOption } from "@/components/lab/registry";

/**
 * Lab option route. Static params over the registry. Renders the sticky
 * switcher + the chosen hero on a clean field. Review-only.
 */
export function generateStaticParams() {
  return OPTIONS.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const option = getOption(slug);
  return {
    title: option ? `Notes lab · ${option.name}` : "Notes lab",
    robots: { index: false, follow: false },
  };
}

export default async function LabOptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const option = getOption(slug);
  if (!option) notFound();

  const { Component } = option;
  return (
    <>
      <Switcher current={slug} />
      <Component />
    </>
  );
}
