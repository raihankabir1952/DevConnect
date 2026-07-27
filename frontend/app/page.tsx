'use client';

import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';

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
  };

  _count: {
    comments: number;
    likes: number;
  };
}

interface PostsResponse {
  data: Post[];

  pagination: {
    currentPage: number;
    limit: number;
    totalPosts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function Home() {
  // ==========================================
  // POSTS STATE
  // ==========================================

  const [posts, setPosts] =
    useState<Post[]>([]);

  // ==========================================
  // PAGE LOADING STATE
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================

  const [authLoading, setAuthLoading] =
    useState(true);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  // ==========================================
  // ERROR STATE
  // ==========================================

  const [error, setError] =
    useState('');

  // ==========================================
  // CHECK AUTHENTICATION
  // ==========================================

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken');

    // ========================================
    // USER NOT LOGGED IN
    // ========================================

    if (!token) {
      window.location.href = '/login';

      return;
    }

    // ========================================
    // USER IS LOGGED IN
    // ========================================

    setIsAuthenticated(true);

    setAuthLoading(false);
  }, []);

  // ==========================================
  // FETCH ALL POSTS
  // ==========================================

  async function fetchPosts() {
    try {
      setLoading(true);

      setError('');

      const token =
        localStorage.getItem('accessToken');

      // ========================================
      // CHECK TOKEN
      // ========================================

      if (!token) {
        window.location.href = '/login';

        return;
      }

      // ========================================
      // FETCH POSTS
      // ========================================

      const response =
        await fetch(
          'http://localhost:3000/posts',
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      // ========================================
      // HANDLE UNAUTHORIZED
      // ========================================

      if (response.status === 401) {
        localStorage.removeItem(
          'accessToken',
        );

        localStorage.removeItem('user');

        window.location.href = '/login';

        return;
      }

      // ========================================
      // HANDLE OTHER ERRORS
      // ========================================

      if (!response.ok) {
        throw new Error(
          'Failed to fetch posts',
        );
      }

      // ========================================
      // RESPONSE DATA
      // ========================================

      const data: PostsResponse =
        await response.json();

      setPosts(data.data);
    } catch (error) {
      console.error(
        'Fetch posts error:',
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

  // ==========================================
  // FETCH POSTS AFTER AUTH CHECK
  // ==========================================

  useEffect(() => {
    // Authentication check এখনো শেষ হয়নি
    if (authLoading) {
      return;
    }

    // User authenticated না হলে
    if (!isAuthenticated) {
      return;
    }

    // User authenticated হলে posts fetch
    fetchPosts();
  }, [
    authLoading,
    isAuthenticated,
  ]);

  // ==========================================
  // AUTHENTICATION LOADING
  // ==========================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================

  if (!isAuthenticated) {
    return null;
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ====================================== */}
      {/* NAVBAR */}
      {/* ====================================== */}

      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">

        {/* ==================================== */}
        {/* PAGE HEADER */}
        {/* ==================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Developer Feed
          </h1>

          <p className="mt-1 text-gray-500">
            Share ideas, connect with developers,
            and grow together.
          </p>
        </div>

        {/* ==================================== */}
        {/* CREATE POST */}
        {/* ==================================== */}

        <CreatePost
          onPostCreated={fetchPosts}
        />

        {/* ==================================== */}
        {/* POSTS */}
        {/* ==================================== */}

        <div className="space-y-5">

          {/* ================================== */}
          {/* LOADING */}
          {/* ================================== */}

          {loading && (
            <div className="py-10 text-center text-gray-500">
              Loading posts...
            </div>
          )}

          {/* ================================== */}
          {/* ERROR */}
          {/* ================================== */}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          )}

          {/* ================================== */}
          {/* EMPTY STATE */}
          {/* ================================== */}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">

                <h2 className="text-lg font-semibold text-gray-900">
                  No posts yet
                </h2>

                <p className="mt-2 text-gray-500">
                  Be the first developer to
                  share something!
                </p>

              </div>
            )}

          {/* ================================== */}
          {/* POST LIST */}
          {/* ================================== */}

          {!loading &&
            !error &&
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}

                // ==============================
                // AFTER POST UPDATE
                // ==============================

                onPostUpdated={() => {
                  fetchPosts();
                }}

                // ==============================
                // AFTER POST DELETE
                // ==============================

                onPostDeleted={(postId) => {
                  setPosts(
                    (currentPosts) =>
                      currentPosts.filter(
                        (currentPost) =>
                          currentPost.id !==
                          postId,
                      ),
                  );
                }}
              />
            ))}

        </div>
      </main>
    </div>
  );
}