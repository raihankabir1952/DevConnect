'use client';

import {
  FormEvent,
  useEffect,
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
  // CLEANUP IMAGE PREVIEW URL
  // ==========================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  function handleRemoveImage() {
    setImage(null);
    setImagePreview('');

    const input =
      document.getElementById(
        'post-image',
      ) as HTMLInputElement | null;

    if (input) {
      input.value = '';
    }
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
        title.trim(),
      );

      formData.append(
        'content',
        content.trim(),
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

      const input =
        document.getElementById(
          'post-image',
        ) as HTMLInputElement | null;

      if (input) {
        input.value = '';
      }

      // ========================================
      // REFRESH POSTS
      // ========================================

      onPostCreated();
    } catch (error) {
      console.error(error);

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
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Icon */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg">
            ✍️
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              Create a Post
            </h2>

            <p className="text-xs text-gray-400 sm:text-sm">
              Share something with the developer
              community
            </p>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* FORM */}
      {/* ================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 sm:p-6"
      >
        {/* Error */}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>⚠️</span>

            <p>{error}</p>
          </div>
        )}

        {/* ================================= */}
        {/* TITLE */}
        {/* ================================= */}

        <div>
          <label
            htmlFor="post-title"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Title
          </label>

          <input
            id="post-title"
            type="text"
            placeholder="Give your post a title..."
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            required
          />
        </div>

        {/* ================================= */}
        {/* CONTENT */}
        {/* ================================= */}

        <div>
          <label
            htmlFor="post-content"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Content
          </label>

          <textarea
            id="post-content"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            required
          />
        </div>

        {/* ================================= */}
        {/* IMAGE UPLOAD */}
        {/* ================================= */}

        <div>
          <label
            htmlFor="post-image"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Add Image
            <span className="ml-1 font-normal text-gray-400">
              (Optional)
            </span>
          </label>

          <label
            htmlFor="post-image"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
              🖼️
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700">
                Choose an image
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                JPG, PNG, GIF or other image formats
              </p>
            </div>
          </label>

          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* ================================= */}
        {/* IMAGE PREVIEW */}
        {/* ================================= */}

        {imagePreview && (
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img
              src={imagePreview}
              alt="Post preview"
              className="max-h-80 w-full object-cover"
            />

            {/* Preview overlay */}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">
                    {image?.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-white/70">
                    Image preview
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            Share your thoughts, projects or ideas.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Posting...
              </span>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}