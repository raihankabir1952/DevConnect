'use client';

import Link from 'next/link';
import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import CommentSection from './CommentSection';

import { getImageUrl } from '@/lib/api';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

interface Post {
  id: number;
  title: string;
  content: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: number;

  author: {
    id: number;
    name: string;
    profileImage: string | null;
  };

  _count: {
    comments: number;
    likes: number;
  };
}

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
  onPostDeleted?: (postId: number) => void;
}

export default function PostCard({
  post,
  onPostUpdated,
  onPostDeleted,
}: PostCardProps) {
  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(false);

  const [likeLoading, setLikeLoading] =
    useState(false);

  const [likeStatusLoading, setLikeStatusLoading] =
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

  // ==========================================
  // LIKE STATES
  // ==========================================

  const [liked, setLiked] = useState(false);

  const [likeCount, setLikeCount] = useState(
    post._count.likes,
  );

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<number | null>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(
          storedUser,
        );

        setCurrentUserId(user.id);
      } catch (error) {
        console.error(
          'Failed to parse user:',
          error,
        );

        setCurrentUserId(null);
      }
    }
  }, []);

  // ==========================================
  // UPDATE LIKE COUNT WHEN POST CHANGES
  // ==========================================

  useEffect(() => {
    setLikeCount(post._count.likes);
  }, [post._count.likes]);

  // ==========================================
  // CHECK CURRENT USER LIKE STATUS
  // ==========================================

  useEffect(() => {
    async function checkLikeStatus() {
      const token =
        localStorage.getItem(
          'accessToken',
        );

      if (!token) {
        setLiked(false);
        return;
      }

      setLikeStatusLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/posts/${post.id}/like-status`,
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to check like status',
          );
        }

        setLiked(data.liked);
      } catch (error) {
        console.error(
          'Failed to check like status:',
          error,
        );
      } finally {
        setLikeStatusLoading(false);
      }
    }

    checkLikeStatus();
  }, [post.id]);

  // ==========================================
  // CHECK POST OWNER
  // ==========================================

  const isOwner =
    currentUserId === post.authorId;

  // ==========================================
  // LIKE / UNLIKE POST
  // ==========================================

  async function handleLike() {
    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      setError(
        'Please login to like a post.',
      );

      return;
    }

    if (likeLoading) {
      return;
    }

    setLikeLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/posts/${post.id}/like`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to like post',
        );
      }

      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to like post',
      );
    } finally {
      setLikeLoading(false);
    }
  }

  // ==========================================
  // UPDATE POST
  // ==========================================

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
      localStorage.getItem(
        'accessToken',
      );

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
        `${API_URL}/posts/${post.id}`,
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update post',
        );
      }

      setShowEditModal(false);
      setShowMenu(false);

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

  // ==========================================
  // DELETE POST
  // ==========================================

  async function handleDelete() {
    const token =
      localStorage.getItem(
        'accessToken',
      );

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
        `${API_URL}/posts/${post.id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete post',
        );
      }

      if (onPostDeleted) {
        onPostDeleted(post.id);
      }

      setShowDeleteModal(false);
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

      <article className="group relative overflow-visible rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg">
        {/* ================================= */}
        {/* AUTHOR HEADER */}
        {/* ================================= */}

        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          {/* Author */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar */}
            <Link
              href={`/profile/${post.author.id}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white ring-2 ring-blue-50 transition-all duration-200 hover:scale-105 hover:ring-blue-100 sm:h-12 sm:w-12"
            >
              {post.author.profileImage ? (
                <img
                  src={getImageUrl(post.author.profileImage)}
                  alt={post.author.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                post.author.name
                  .charAt(0)
                  .toUpperCase()
              )}
            </Link>

            {/* Name + Date */}
            <div className="min-w-0">
              <Link
                href={`/profile/${post.author.id}`}
                className="block truncate text-sm font-bold text-gray-900 transition hover:text-blue-600 sm:text-base"
              >
                {post.author.name}
              </Link>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                <span>
                  {new Date(
                    post.createdAt,
                  ).toLocaleDateString()}
                </span>

                <span>•</span>

                <span>Developer</span>
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* MORE MENU */}
          {/* ================================= */}

          {isOwner && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setShowMenu(
                    !showMenu,
                  )
                }
                aria-label="Post options"
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700"
              >
                ⋮
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(
                        true,
                      );

                      setShowMenu(false);
                      setError('');

                      setTitle(
                        post.title,
                      );

                      setContent(
                        post.content,
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <span className="text-base">
                      ✏️
                    </span>

                    <span>Edit post</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(
                        true,
                      );

                      setShowMenu(false);
                      setError('');
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <span className="text-base">
                      🗑️
                    </span>

                    <span>Delete post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* POST CONTENT */}
        {/* ================================= */}

        <div className="px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          {/* Title */}
          <Link
            href={`/posts/${post.id}`}
            className="group/title block"
          >
            <h2 className="break-words text-lg font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover/title:text-blue-600 sm:text-xl">
              {post.title}
            </h2>
          </Link>

          {/* Content */}
          <p className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600 sm:text-[15px] sm:leading-7">
            {post.content}
          </p>

          {/* ================================= */}
          {/* POST IMAGE */}
          {/* ================================= */}

          {post.image && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <img
                src={getImageUrl(post.image)}
                alt={post.title}
                className="max-h-[520px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="mx-4 mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-6">
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* ACTION BAR */}
        {/* ================================= */}

        <div className="mx-4 border-t border-gray-100 py-3 sm:mx-6">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* LIKE */}

            <button
              type="button"
              onClick={handleLike}
              disabled={
                likeLoading ||
                likeStatusLoading
              }
              aria-label={
                liked
                  ? 'Unlike post'
                  : 'Like post'
              }
              className={`group/like flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-semibold transition-all duration-200 sm:px-3 ${
                liked
                  ? 'bg-red-50 text-red-500'
                  : 'text-gray-500 hover:bg-red-50 hover:text-red-500'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`text-base transition-transform duration-200 sm:text-lg ${
                  liked
                    ? 'scale-110'
                    : 'group-hover/like:scale-110'
                }`}
              >
                {liked ? '❤️' : '🤍'}
              </span>

              <span>
                {likeStatusLoading
                  ? '...'
                  : likeCount}
              </span>

              <span className="hidden xs:inline sm:inline">
                {likeCount === 1
                  ? 'Like'
                  : 'Likes'}
              </span>
            </button>

            {/* COMMENTS */}

            <CommentSection
              postId={post.id}
              commentCount={
                post._count.comments
              }
            />
          </div>
        </div>
      </article>

      {/* ================================= */}
      {/* EDIT MODAL */}
      {/* ================================= */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6">
            {/* Modal Header */}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Post editor
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Edit Post
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(
                    false,
                  );

                  setError('');
                }}
                aria-label="Close edit modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={handleUpdate}
              className="mt-6 space-y-5"
            >
              {/* Title */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Enter post title"
                />
              </div>

              {/* Content */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value,
                    )
                  }
                  rows={6}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Write your post..."
                />
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(
                      false,
                    );

                    setError('');
                  }}
                  className="w-full rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
      {/* DELETE MODAL */}
      {/* ================================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6">
            {/* Icon */}

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
              🗑️
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Delete Post?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to
              delete this post? This action
              cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(
                    false,
                  );

                  setError('');
                }}
                className="w-full rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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