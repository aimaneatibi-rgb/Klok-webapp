import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import { BLOG_POSTS, formatBlogDate, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artikel niet gevonden — KLOK Works" };
  return {
    title: `${post.title} — KLOK Works Blog`,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <MarketingNav active="/blog" />

      <section className="article-hero">
        <div className="mkt-container" style={{ maxWidth: "880px" }}>
          <div className="flex gap-2" style={{ flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/blog" className="eyebrow pill">
              ← Blog
            </Link>
            <span className={`eyebrow pill tint-lime`} style={{ background: `var(--tint-${post.tint})` }}>
              {post.emoji} {post.category}
            </span>
          </div>
          <h1
            className="display mt-3"
            style={{ fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.02 }}
          >
            {post.title}
          </h1>
          <div
            className="mono mt-3"
            style={{
              fontSize: "12px",
              color: "var(--stone-500)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span>{formatBlogDate(post.date)}</span>
            <span>{post.readingMinutes} min lezen</span>
            <span>{post.author}</span>
          </div>
        </div>
      </section>

      <article className="article-body">
        {post.blocks.map((block, i) => {
          if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
          if (block.type === "quote")
            return <blockquote key={i}>{block.text}</blockquote>;
          if (block.type === "list")
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          return <p key={i}>{block.text}</p>;
        })}
      </article>

      <section style={{ padding: "16px 0 64px" }}>
        <div className="mkt-container" style={{ maxWidth: "760px" }}>
          <div className="cta-banner" style={{ padding: "40px 32px" }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}>
              Klaar om het in de praktijk te brengen?
            </h2>
            <p style={{ fontSize: "15.5px" }}>
              Maak een gratis profiel aan of plaats je eerste vacature — de
              marktplaats staat open.
            </p>
            <div
              className="flex gap-2"
              style={{ justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/signup" className="btn btn-primary">
                Gratis account →
              </Link>
              <Link href="/vacatures" className="btn btn-ghost">
                Bekijk vacatures
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 96px" }}>
        <div className="mkt-container">
          <span className="eyebrow">— Lees verder</span>
          <div className="blog-grid mt-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                <div className={`bc-visual tint-${p.tint}`}>
                  <span className="bc-cat">{p.category}</span>
                  <span aria-hidden>{p.emoji}</span>
                </div>
                <div className="bc-body">
                  <h2 className="bc-title">{p.title}</h2>
                  <div className="bc-meta">
                    <span>{formatBlogDate(p.date)}</span>
                    <span>{p.readingMinutes} min lezen</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
