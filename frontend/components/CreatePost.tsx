'use client';

import { FormEvent, useState } from 'react';

import { apiRequest } from '@/lib/api';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({
  onPostCreated,
}: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError('');

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError('Please login first.');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      setTitle('');
      setContent('');

      onPostCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create post',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Create a Post
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
          required
        />

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
          required
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Posting...'
              : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}