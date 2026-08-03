import Link from "next/link";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import { BLOG_POSTS, formatBlogDate } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog over werk zoeken en personeel werven",
  description:
    "Praktische gidsen over werk vinden, personeel werven en wat een uitzendbureau je écht kost. Geschreven zonder wollige HR-taal.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      <MarketingNav active="/blog" />

      <section style={{ padding: "64px 0 48px", background: "var(--cream)" }}>
        <div className="mkt-container">
          <span className="eyebrow pill">— Kennis van de werkvloer</span>
          <h1
            className="display mt-2"
            style={{ fontSize: "clamp(40px, 6.5vw, 80px)" }}
          >
            Het KLOK <em style={{ color: "var(--stone-500)" }}>blog.</em>
          </h1>
          <p className="section-lead mt-2" style={{ maxWidth: "560px" }}>
            Praktische gidsen over werk vinden, personeel werven en eerlijk
            verdienen op de marktplaats. Zonder wollige HR-taal.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 0 72px" }}>
        <div className="mkt-container">
          <div className="blog-grid">
            <Link
              href={`/blog/${featured.slug}`}
              className="blog-card featured"
            >
              <div className={`bc-visual tint-${featured.tint}`}>
                <span className="bc-cat">{featured.category}</span>
                <span aria-hidden>{featured.emoji}</span>
              </div>
              <div className="bc-body">
                <h2 className="bc-title">{featured.title}</h2>
                <p className="bc-excerpt">{featured.excerpt}</p>
                <div className="bc-meta">
                  <span>{formatBlogDate(featured.date)}</span>
                  <span>{featured.readingMinutes} min lezen</span>
                </div>
              </div>
            </Link>

            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-card"
              >
                <div className={`bc-visual tint-${post.tint}`}>
                  <span className="bc-cat">{post.category}</span>
                  <span aria-hidden>{post.emoji}</span>
                </div>
                <div className="bc-body">
                  <h2 className="bc-title">{post.title}</h2>
                  <p className="bc-excerpt">{post.excerpt}</p>
                  <div className="bc-meta">
                    <span>{formatBlogDate(post.date)}</span>
                    <span>{post.readingMinutes} min lezen</span>
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
