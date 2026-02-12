import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { Metadata } from "next";
import { BlogPostContent } from "@/components/public/BlogPostContent";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchQuery(api.posts.getBySlug, { slug });

    if (!post) {
        return {
            title: "Thought Not Found",
        };
    }

    return {
        title: post.title,
        description: post.excerpt || post.title,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            images: post.coverImage
                ? [
                    {
                        url: `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${post.coverImage}`,
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    },
                ]
                : [],
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // We can pre-fetch here if we want to pass initial data to Client Component, 
    // but the Client Component using useQuery handles loading states well.
    // However, since we are doing SSR for performance/SEO, let's just render the Client Component 
    // which will hydrate.

    return <BlogPostContent slug={slug} />;
}
