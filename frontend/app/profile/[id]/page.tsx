'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  _count: {
    posts: number;
    comments: number;
    likes: number;
  };
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

export default function ProfilePage() {
  const params = useParams();

  const userId = params.id;

  const [user, setUser] =
    useState<User | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);

        setError('');

        // ======================================
        // FETCH USER
        // ======================================

        const userResponse =
          await fetch(
            `http://localhost:3000/users/${userId}`,
          );

        if (!userResponse.ok) {
          throw new Error(
            'Failed to fetch user profile',
          );
        }

        const userData: User =
          await userResponse.json();

        setUser(userData);

        // ======================================
        // FETCH ALL POSTS
        // ======================================

        const postsResponse =
          await fetch(
            'http://localhost:3000/posts',
          );

        if (!postsResponse.ok) {
          throw new Error(
            'Failed to fetch posts',
          );
        }

        const postsData =
          await postsResponse.json();

        // ======================================
        // HANDLE PAGINATED RESPONSE
        // ======================================

        const allPosts =
          Array.isArray(postsData)
            ? postsData
            : postsData.data || [];

        // ======================================
        // FILTER USER POSTS
        // ======================================

        const userPosts =
          allPosts.filter(
            (post: Post) =>
              post.author?.id ===
              Number(userId),
          );

        setPosts(userPosts);
      } catch (error) {
        console.error(
          'Profile fetch error:',
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : 'Something went wrong',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700">
              Something went wrong
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // USER NOT FOUND
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              User not found
            </h2>

            <Link
              href="/"
              className="mt-5 inline-block text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================================== */}
      {/* PROFILE HEADER */}
      {/* ====================================== */}

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}

        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          ← Back to Feed
        </Link>

        {/* ==================================== */}
        {/* PROFILE CARD */}
        {/* ==================================== */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {/* Cover */}

          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          {/* Profile Info */}

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col items-start sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar */}

              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-600 shadow-md">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>

            {/* User Details */}

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {user.email}
              </p>
            </div>

            {/* ================================= */}
            {/* USER STATS */}
            {/* ================================= */}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* Posts */}

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {user._count.posts}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Posts
                </p>
              </div>

              {/* Comments */}

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {user._count.comments}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Comments
                </p>
              </div>

              {/* Likes */}

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {user._count.likes}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Likes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* USER POSTS */}
        {/* ====================================== */}

        <div className="mt-8">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            {user.name}'s Posts
          </h2>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-700">
                No posts yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                This user hasn't shared any
                posts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  {/* Post Header */}

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                      {post.author.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.author.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(
                          post.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}

                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-gray-900">
                      {post.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-gray-600">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Stats */}

                  <div className="mt-5 flex items-center gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span>
                      ❤️ {post._count.likes}{' '}
                      Likes
                    </span>

                    <span>
                      💬{' '}
                      {post._count.comments}{' '}
                      Comments
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}