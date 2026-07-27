'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import CommentSection from './CommentSection';

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

interface PostCardProps {
  post: Post;

  onPostUpdated?: () => void;

  onPostDeleted?: (
    postId: number,
  ) => void;
}

export default function PostCard({
  post,
  onPostUpdated,
  onPostDeleted,
}: PostCardProps) {
  const [loading, setLoading] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [title, setTitle] = useState(
    post.title,
  );

  const [content, setContent] = useState(
    post.content,
  );

  const [error, setError] = useState('');

  // Get current logged-in user
  const storedUser =
    typeof window !== 'undefined'
      ? localStorage.getItem('user')
      : null;

  let currentUserId: number | null = null;

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      currentUserId = user.id;
    } catch (error) {
      console.error(
        'Failed to parse user:',
        error,
      );
    }
  }

  // Check if current user is post owner
  const isOwner =
    currentUserId === post.authorId;

  // ================================
  // LIKE POST
  // ================================

  async function handleLike() {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to like a post.',
      );

      return;
    }

    setLoading(true);

    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${post.id}/like`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            'Failed to like post',
        );
      }

      // Refresh post data
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to like post',
      );
    } finally {
      setLoading(false);
    }
  }

  // ================================
  // UPDATE POST
  // ================================

  async function handleUpdate(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (
      !title.trim() ||
      !content.trim()
    ) {
      setError(
        'Title and content are required.',
      );

      return;
    }

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to update the post.',
      );

      return;
    }

    setLoading(true);

    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${post.id}`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        },
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            'Failed to update post',
        );
      }

      // Close modal
      setShowEditModal(false);

      // Close menu
      setShowMenu(false);

      // Refresh posts
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update post',
      );
    } finally {
      setLoading(false);
    }
  }

  // ================================
  // DELETE POST
  // ================================

  async function handleDelete() {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to delete the post.',
      );

      return;
    }

    setLoading(true);

    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${post.id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            'Failed to delete post',
        );
      }

      // Remove post from feed
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }

      // Close modal
      setShowDeleteModal(false);

      // Close menu
      setShowMenu(false);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to delete post',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ================================= */}
      {/* POST CARD */}
      {/* ================================= */}

      <article className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
        {/* ================================ */}
        {/* AUTHOR HEADER */}
        {/* ================================ */}

        <div className="flex items-start justify-between">
          {/* Author Information */}
          <div className="flex items-center gap-3">
            {/* Clickable Avatar */}
            <Link
              href={`/profile/${post.author.id}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 transition hover:bg-blue-200"
            >
              {post.author.name
                .charAt(0)
                .toUpperCase()}
            </Link>

            {/* Name + Date */}
            <div>
              {/* Clickable Name */}
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

          {/* ================================ */}
          {/* MORE MENU */}
          {/* ================================ */}

          {isOwner && (
            <div className="relative">
              <button
                onClick={() =>
                  setShowMenu(!showMenu)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100"
              >
                ⋮
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {/* Edit */}
                  <button
                    onClick={() => {
                      setShowEditModal(true);

                      setShowMenu(false);

                      setError('');

                      setTitle(post.title);

                      setContent(
                        post.content,
                      );
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    ✏️ Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      setShowDeleteModal(
                        true,
                      );

                      setShowMenu(false);

                      setError('');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================ */}
        {/* POST CONTENT */}
        {/* ================================ */}

        <div className="mt-5">
          {/* Clickable Post Title */}
          <Link
            href={`/posts/${post.id}`}
            className="block"
          >
            <h2 className="text-xl font-bold text-gray-900 transition hover:text-blue-600">
              {post.title}
            </h2>
          </Link>

          {/* Post Content */}
          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-600">
            {post.content}
          </p>
        </div>

        {/* ================================ */}
        {/* ERROR MESSAGE */}
        {/* ================================ */}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ================================ */}
        {/* ACTIONS */}
        {/* ================================ */}

        <div className="mt-6 flex items-center gap-6 border-t border-gray-100 pt-4">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ❤️

            <span>
              {post._count.likes} Likes
            </span>
          </button>

          {/* Comments */}
          <CommentSection
            postId={post.id}
            commentCount={
              post._count.comments
            }
          />
        </div>
      </article>

      {/* ================================= */}
      {/* EDIT MODAL */}
      {/* ================================= */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Post
              </h2>

              <button
                onClick={() => {
                  setShowEditModal(
                    false,
                  );

                  setError('');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Edit Form */}
            <form
              onSubmit={handleUpdate}
              className="mt-6 space-y-5"
            >
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Enter post title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value,
                    )
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Write your post..."
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(
                      false,
                    );

                    setError('');
                  }}
                  className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>

                {/* Update */}
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Updating...'
                    : 'Update Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ================================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900">
              Delete Post?
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to
              delete this post? This action
              cannot be undone.
            </p>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel */}
              <button
                onClick={() => {
                  setShowDeleteModal(
                    false,
                  );

                  setError('');
                }}
                className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Deleting...'
                  : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}