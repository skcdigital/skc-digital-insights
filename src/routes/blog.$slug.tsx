import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";
import { getPost, POSTS, type BlogPost } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Post not found" }] };
    const title = `${post.title} | SKC Digital Blog`;
    return {
      meta: [
        { title },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: post.excerpt },
        { property: "og:url", content: `${SITE.url}/blog/${post.slug}` },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: post.excerpt },
      ],
    };
  },
  notFoundComponent: () => (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Post not found</h1>
      <p className="mt-3 text-muted-foreground">That article doesn&apos;t exist.</p>
      <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>
    </section>
  ),
  errorComponent: ({ error }) => (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </section>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData() as { post: BlogPost };
  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <PageHero
        eyebrow={post.tag}
        title={<>{post.title}</>}
        description={post.excerpt}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
          <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> {post.date}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {post.readTime}
          </span>
        </div>

        <div className="prose prose-invert mt-8 max-w-none">
          {post.body.map((block, i) => (
            <div key={i} className="mb-6">
              {block.heading && (
                <h2 className="mb-3 font-display text-2xl font-semibold">
                  {block.heading}
                </h2>
              )}
              {block.paragraphs.map((p, j) => (
                <p key={j} className="mb-3 text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">Want help putting this into practice?</p>
          <a
            href={waLink(`Hi ${SITE.name}, I read your article "${post.title}" and want to chat.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>

        {others.length > 0 && (
          <div className="mt-14">
            <p className="font-mono text-xs uppercase tracking-wider text-primary">Keep reading</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-xl border border-border bg-surface/40 p-5 transition-colors hover:border-primary/40"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                    {p.tag}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all articles
          </Link>
        </div>
      </article>
    </>
  );
}