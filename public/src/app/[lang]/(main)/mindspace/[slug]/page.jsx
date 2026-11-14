import SpaceView from "@/components/mindspace/SpaceView";
import { getPublicSpace } from "@/lib/mindspace-public";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const label = (n) => n.title || n.book_slug || (n.body ? n.body.slice(0, 60) : "") || n.url || "Untitled";

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const pub = await getPublicSpace(slug);
  // Private / unknown spaces are never indexed (and nothing about them is revealed).
  if (!pub) return { title: "MindSpace", robots: { index: false, follow: false } };
  const { space, graph } = pub;
  const description = space.description || `${graph.nodes.length} connected ideas, books and notes on ${space.title}.`;
  return {
    title: space.title,
    description,
    alternates: { canonical: `/${lang}/mindspace/${encodeURIComponent(space.slug)}` },
    openGraph: { title: space.title, description, type: "article" },
  };
}

// Public spaces are server-rendered (crawlable); private ones render a shell and load client-side
// with the owner's token.
export default async function MindSpaceSlugPage({ params }) {
  const { slug, lang } = await params;
  const pub = await getPublicSpace(slug);
  const jsonLd = pub && {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pub.space.title,
    description: pub.space.description || undefined,
    url: `${SITE_URL}/${lang}/mindspace/${encodeURIComponent(pub.space.slug)}`,
    author: pub.space.owner_name ? { "@type": "Person", name: pub.space.owner_name } : undefined,
    dateModified: pub.space.updated_at || undefined,
    hasPart: pub.graph.nodes.slice(0, 25).map((n) => ({ "@type": "CreativeWork", name: label(n) })),
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />}
      <SpaceView slug={slug} initial={pub ? { space: pub.space, graph: pub.graph } : null} />
    </>
  );
}
