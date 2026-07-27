'use client';

import Link from 'next/link';
import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  postId: number;

  user: {
    id: number;
    name: string;
  };
}

interface CommentSectionProps {
  postId: number;
  commentCount: number;
}

export default function CommentSection({
  postId,
  commentCount,
}: CommentSectionProps) {
  // ==========================================
  // STATES
  // ==========================================

  const [comments, setComments] = useState<
    Comment[]
  >([]);

  const [content, setContent] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showComments, setShowComments] =
    useState(false);

  const [error, setError] =
    useState('');

  // Edit comment
  const [editingCommentId, setEditingCommentId] =
    useState<number | null>(null);

  const [editContent, setEditContent] =
    useState('');

  // Delete comment
  const [deletingCommentId, setDeletingCommentId] =
    useState<number | null>(null);

  // Logged-in user ID
  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      console.log(
        'No logged-in user found',
      );

      return;
    }

    try {
      const user = JSON.parse(storedUser);

      console.log(
        'Logged-in user:',
        user,
      );

      setCurrentUserId(
        Number(user.id),
      );
    } catch (error) {
      console.error(
        'Failed to parse logged-in user:',
        error,
      );

      setCurrentUserId(null);
    }
  }, []);

  // ==========================================
  // FETCH COMMENTS
  // ==========================================

  async function fetchComments() {
    try {
      setError('');

      const response = await fetch(
        `http://localhost:3000/posts/${postId}`,
      );

      if (!response.ok) {
        throw new Error(
          'Failed to fetch comments',
        );
      }

      const data =
        await response.json();

      console.log(
        'Fetched post data:',
        data,
      );

      setComments(
        Array.isArray(data.comments)
          ? data.comments
          : [],
      );
    } catch (error) {
      console.error(
        'Fetch comments error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load comments',
      );
    }
  }

  // ==========================================
  // TOGGLE COMMENTS
  // ==========================================

  async function handleToggleComments() {
    const nextState =
      !showComments;

    setShowComments(nextState);

    if (nextState) {
      await fetchComments();
    }
  }

  // ==========================================
  // CREATE COMMENT
  // POST /comments
  // ==========================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      setError(
        'Please login to comment.',
      );

      return;
    }

    setLoading(true);

    setError('');

    try {
      const response = await fetch(
        'http://localhost:3000/comments',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            content:
              content.trim(),

            postId: postId,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to add comment',
        );
      }

      console.log(
        'Comment created:',
        data,
      );

      // Clear input
      setContent('');

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error(
        'Create comment error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to add comment',
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // START EDIT
  // ==========================================

  function handleStartEdit(
    comment: Comment,
  ) {
    setEditingCommentId(
      comment.id,
    );

    setEditContent(
      comment.content,
    );

    setError('');
  }

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  function handleCancelEdit() {
    setEditingCommentId(null);

    setEditContent('');

    setError('');
  }

  // ==========================================
  // UPDATE COMMENT
  // PATCH /comments/:id
  // ==========================================

  async function handleUpdateComment(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!editContent.trim()) {
      setError(
        'Comment cannot be empty.',
      );

      return;
    }

    if (
      editingCommentId === null
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      setError(
        'Please login to edit comment.',
      );

      return;
    }

    setLoading(true);

    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/comments/${editingCommentId}`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            content:
              editContent.trim(),
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to update comment',
        );
      }

      console.log(
        'Comment updated:',
        data,
      );

      // Close edit mode
      setEditingCommentId(null);

      setEditContent('');

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error(
        'Update comment error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update comment',
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // DELETE COMMENT
  // DELETE /comments/:id
  // ==========================================

  async function handleDeleteComment(
    commentId: number,
  ) {
    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      setError(
        'Please login to delete comment.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this comment?',
      );

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(
      commentId,
    );

    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/comments/${commentId}`,
        {
          method: 'DELETE',

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to delete comment',
        );
      }

      console.log(
        'Comment deleted:',
        data,
      );

      // Remove comment from UI
      setComments(
        (previousComments) =>
          previousComments.filter(
            (comment) =>
              comment.id !==
              commentId,
          ),
      );
    } catch (error) {
      console.error(
        'Delete comment error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to delete comment',
      );
    } finally {
      setDeletingCommentId(null);
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mt-0 w-full">
      {/* ===================================== */}
      {/* COMMENT BUTTON */}
      {/* ===================================== */}

      <button
        onClick={
          handleToggleComments
        }
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
      >
        <span>💬</span>

        <span>
          {commentCount}{' '}
          {commentCount === 1
            ? 'Comment'
            : 'Comments'}
        </span>
      </button>

      {/* ===================================== */}
      {/* COMMENTS AREA */}
      {/* ===================================== */}

      {showComments && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* ADD COMMENT FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleSubmit}
            className="mb-6 flex gap-3"
          >
            <input
              type="text"
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value,
                )
              }
              placeholder="Write a comment..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !content.trim()
              }
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Posting...'
                : 'Post'}
            </button>
          </form>

          {/* ================================= */}
          {/* COMMENTS LIST */}
          {/* ================================= */}

          <div className="space-y-5">
            {comments.length === 0 ? (
              <p className="py-3 text-center text-sm text-gray-500">
                No comments yet. Be
                the first to comment!
              </p>
            ) : (
              comments.map(
                (comment) => {
                  // =================================
                  // CHECK COMMENT OWNER
                  // =================================

                  const isCommentOwner =
                    Number(
                      currentUserId,
                    ) ===
                    Number(
                      comment.userId,
                    );

                  console.log(
                    'Comment ownership:',
                    {
                      currentUserId,
                      commentUserId:
                        comment.userId,
                      isCommentOwner,
                    },
                  );

                  const isEditing =
                    editingCommentId ===
                    comment.id;

                  return (
                    <div
                      key={comment.id}
                      className="flex gap-3"
                    >
                      {/* ========================= */}
                      {/* AVATAR */}
                      {/* ========================= */}

                      <Link
                        href={`/profile/${comment.user.id}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 transition hover:bg-blue-200"
                      >
                        {comment.user.name
                          .charAt(0)
                          .toUpperCase()}
                      </Link>

                      {/* ========================= */}
                      {/* COMMENT BODY */}
                      {/* ========================= */}

                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          /* ======================= */
                          /* EDIT MODE */
                          /* ======================= */

                          <form
                            onSubmit={
                              handleUpdateComment
                            }
                            className="space-y-2"
                          >
                            <textarea
                              value={
                                editContent
                              }
                              onChange={(
                                e,
                              ) =>
                                setEditContent(
                                  e.target
                                    .value,
                                )
                              }
                              rows={3}
                              autoFocus
                              className="w-full resize-none rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={
                                  loading ||
                                  !editContent.trim()
                                }
                                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {loading
                                  ? 'Saving...'
                                  : 'Save'}
                              </button>

                              <button
                                type="button"
                                onClick={
                                  handleCancelEdit
                                }
                                className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* ======================= */
                          /* NORMAL MODE */
                          /* ======================= */

                          <>
                            {/* Comment Bubble */}

                            <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-4 py-3">
                              {/* User Name */}

                              <Link
                                href={`/profile/${comment.user.id}`}
                                className="text-sm font-semibold text-gray-900 transition hover:text-blue-600"
                              >
                                {
                                  comment
                                    .user
                                    .name
                                }
                              </Link>

                              {/* Comment Text */}

                              <p className="mt-1 break-words text-sm text-gray-600">
                                {
                                  comment.content
                                }
                              </p>
                            </div>

                            {/* ================= */}
                            {/* DATE + ACTIONS */}
                            {/* ================= */}

                            <div className="mt-1 ml-3 flex items-center gap-3">
                              {/* Date */}

                              <p className="text-xs text-gray-400">
                                {new Date(
                                  comment.createdAt,
                                ).toLocaleDateString()}
                              </p>

                              {/* ================================= */}
                              {/* EDIT + DELETE */}
                              {/* ================================= */}

                              {isCommentOwner && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartEdit(
                                        comment,
                                      )
                                    }
                                    className="text-xs font-semibold text-gray-500 transition hover:text-blue-600"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteComment(
                                        comment.id,
                                      )
                                    }
                                    disabled={
                                      deletingCommentId ===
                                      comment.id
                                    }
                                    className="text-xs font-semibold text-gray-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingCommentId ===
                                    comment.id
                                      ? 'Deleting...'
                                      : 'Delete'}
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}