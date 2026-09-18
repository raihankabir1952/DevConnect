'use client';

import {
  FormEvent,
  useState,
} from 'react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({
  onPostCreated,
}: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Post image
  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      setImage(null);
      setImagePreview('');
      return;
    }

    setImage(file);

    // Create preview
    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // ==========================================
  // CREATE POST
  // ==========================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError('');

    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      setError(
        'Please login first.',
      );
      return;
    }

    setLoading(true);

    try {
      // ========================================
      // FORM DATA
      // ========================================

      const formData =
        new FormData();

      formData.append(
        'title',
        title,
      );

      formData.append(
        'content',
        content,
      );

      // Image is optional
      if (image) {
        formData.append(
          'image',
          image,
        );
      }

      // ========================================
      // API REQUEST
      // ========================================

      const response =
        await fetch(
          'http://localhost:3000/posts',
          {
            method: 'POST',

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to create post',
        );
      }

      // ========================================
      // RESET FORM
      // ========================================

      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview('');

      // ========================================
      // REFRESH POSTS
      // ========================================

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

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Title */}
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

        {/* Content */}
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

        {/* Image Upload */}
        <div>
          <label
            htmlFor="post-image"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Add Image{' '}
            <span className="font-normal text-gray-400">
              (Optional)
            </span>
          </label>

          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-600"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative overflow-hidden rounded-xl border border-gray-200">
            <img
              src={imagePreview}
              alt="Post preview"
              className="max-h-80 w-full object-cover"
            />

            <button
              type="button"
              onClick={() => {
                setImage(null);
                setImagePreview('');
              }}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-sm text-white transition hover:bg-black"
            >
              Remove
            </button>
          </div>
        )}

        {/* Submit */}
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
