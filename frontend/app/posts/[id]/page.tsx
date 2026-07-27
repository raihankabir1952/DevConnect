'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import CommentSection from '@/components/CommentSection';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface PostDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostDetailsPage({
  params,
}: PostDetailsPageProps) {
  const [post, setPost] =
    useState<Post | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState('');

  // Fetch single post
  useEffect(() => {
    async function fetchPost() {
      try {
        const { id } = await params;

        const response = await fetch(
          `http://localhost:3000/posts/${id}`,
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch post',
          );
        }

        const data: Post =
          await response.json();

        setPost(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : 'Something went wrong',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Loading post...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Error / Post Not Found
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              Post Not Found
            </h1>

            <p className="mt-2 text-gray-500">
              {error ||
                'The post you are looking for does not exist.'}
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Back to Feed
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          ← Back to Feed
        </Link>

        {/* Post Card */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Author */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
              {post.author.name
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* Author Info */}
            <div>
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold text-gray-900 transition hover:text-blue-600"
              >
                {post.author.name}
              </Link>

              <p className="text-xs text-gray-500">
                {new Date(
                  post.createdAt,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {post.title}
            </h1>

            <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-600">
              {post.content}
            </p>
          </div>

          {/* Like Stats */}
          <div className="mt-8 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              ❤️

              <span>
                {post._count.likes} Likes
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-5">
            <CommentSection
              postId={post.id}
              commentCount={
                post._count.comments
              }
            />
          </div>
        </article>
      </main>
    </div>
  );
}