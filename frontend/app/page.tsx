'use client';

import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import ProtectedRoute from '@/components/ProtectedRoute';
// import WebSocketTest from '@/components/WebSocketTest';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchPosts() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:3000/posts',
      );

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: PostsResponse =
        await response.json();

      setPosts(data.data);
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

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        

        <main className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Developer Feed
            </h1>

            <p className="mt-1 text-gray-500">
              Share ideas, connect with developers,
              and grow together.
            </p>
          </div>

          <CreatePost
            onPostCreated={fetchPosts}
          />

          <div className="space-y-5">
            {loading && (
              <div className="py-10 text-center text-gray-500">
                Loading posts...
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
                {error}
              </div>
            )}

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

            {!loading &&
              !error &&
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={fetchPosts}
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
    </ProtectedRoute>
  );
}