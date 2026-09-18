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
  parentId: number | null;

  user: {
    id: number;
    name: string;
  };

  replies: Comment[];
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

  const [comments, setComments] = useState<Comment[]>(
    [],
  );

  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(false);

  const [showComments, setShowComments] =
    useState(false);

  const [error, setError] = useState('');

  // ==========================================
  // EDIT COMMENT / REPLY
  // ==========================================

  const [editingCommentId, setEditingCommentId] =
    useState<number | null>(null);

  const [editContent, setEditContent] =
    useState('');

  // ==========================================
  // DELETE COMMENT / REPLY
  // ==========================================

  const [deletingCommentId, setDeletingCommentId] =
    useState<number | null>(null);

  // ==========================================
  // REPLY
  // ==========================================

  const [replyingCommentId, setReplyingCommentId] =
    useState<number | null>(null);

  const [replyContent, setReplyContent] =
    useState('');

  const [replyLoading, setReplyLoading] =
    useState(false);

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      setCurrentUserId(Number(user.id));
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

      const data = await response.json();

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
    const nextState = !showComments;

    setShowComments(nextState);

    if (nextState) {
      await fetchComments();
    }
  }

  // ==========================================
  // CREATE COMMENT
  // ==========================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    const token =
      localStorage.getItem('accessToken');

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
            content: content.trim(),
            postId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to add comment',
        );
      }

      setContent('');

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
  // CREATE REPLY
  // ==========================================

  async function handleReply(
    e: FormEvent<HTMLFormElement>,
    parentId: number,
  ) {
    e.preventDefault();

    if (!replyContent.trim()) {
      return;
    }

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to reply.',
      );

      return;
    }

    setReplyLoading(true);
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
            content: replyContent.trim(),
            postId,
            parentId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to add reply',
        );
      }

      setReplyContent('');
      setReplyingCommentId(null);

      await fetchComments();
    } catch (error) {
      console.error(
        'Create reply error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to add reply',
      );
    } finally {
      setReplyLoading(false);
    }
  }

  // ==========================================
  // START EDIT
  // ==========================================

  function handleStartEdit(
    comment: Comment,
  ) {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
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
  // UPDATE COMMENT / REPLY
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

    if (editingCommentId === null) {
      return;
    }

    const token =
      localStorage.getItem('accessToken');

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
            content: editContent.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to update comment',
        );
      }

      setEditingCommentId(null);
      setEditContent('');

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
  // DELETE COMMENT / REPLY
  // ==========================================

  async function handleDeleteComment(
    commentId: number,
  ) {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to delete comment.',
      );

      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?',
    );

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(commentId);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to delete comment',
        );
      }

      await fetchComments();
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
    <div className="w-full">
      {/* ===================================== */}
      {/* COMMENT BUTTON */}
      {/* ===================================== */}

      <button
        type="button"
        onClick={handleToggleComments}
        className={`group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${
          showComments
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
        }`}
      >
        <span
          className="text-base transition-transform duration-200 group-hover:scale-110"
        >
          💬
        </span>

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
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* ADD COMMENT */}
          {/* ================================= */}

          <form
            onSubmit={handleSubmit}
            className="mb-7"
          >
            <div className="flex items-start gap-3">
              {/* Current User Avatar */}

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                {currentUserId
                  ? 'U'
                  : '?'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={content}
                    onChange={(e) =>
                      setContent(
                        e.target.value,
                      )
                    }
                    placeholder="Write a comment..."
                    className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !content.trim()
                    }
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? 'Posting...'
                      : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* ================================= */}
          {/* COMMENTS LIST */}
          {/* ================================= */}

          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                <div className="text-2xl">
                  💬
                </div>

                <p className="mt-2 text-sm font-medium text-gray-700">
                  No comments yet
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Be the first developer to
                  join the conversation.
                </p>
              </div>
            ) : (
              comments.map((comment) => {
                const isCommentOwner =
                  Number(currentUserId) ===
                  Number(comment.userId);

                const isEditing =
                  editingCommentId ===
                  comment.id;

                return (
                  <div
                    key={comment.id}
                    className="group flex gap-3"
                  >
                    {/* ================================= */}
                    {/* COMMENT AVATAR */}
                    {/* ================================= */}

                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-600 transition hover:scale-105 hover:from-blue-200 hover:to-indigo-200"
                    >
                      {comment.user.name
                        .charAt(0)
                        .toUpperCase()}
                    </Link>

                    {/* ================================= */}
                    {/* COMMENT CONTENT */}
                    {/* ================================= */}

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        /* =============================== */
                        /* EDIT COMMENT */
                        /* =============================== */

                        <form
                          onSubmit={
                            handleUpdateComment
                          }
                          className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3"
                        >
                          <textarea
                            value={
                              editContent
                            }
                            onChange={(e) =>
                              setEditContent(
                                e.target.value,
                              )
                            }
                            rows={3}
                            autoFocus
                            className="w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                          />

                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={
                                loading ||
                                !editContent.trim()
                              }
                              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {loading
                                ? 'Saving...'
                                : 'Save Changes'}
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleCancelEdit
                              }
                              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {/* ================================= */}
                          {/* COMMENT BUBBLE */}
                          {/* ================================= */}

                          <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3">
                            <Link
                              href={`/profile/${comment.user.id}`}
                              className="text-sm font-bold text-gray-900 transition hover:text-blue-600"
                            >
                              {
                                comment.user
                                  .name
                              }
                            </Link>

                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                              {
                                comment.content
                              }
                            </p>
                          </div>

                          {/* ================================= */}
                          {/* COMMENT ACTIONS */}
                          {/* ================================= */}

                          <div className="mt-1.5 ml-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-[11px] text-gray-400">
                              {new Date(
                                comment.createdAt,
                              ).toLocaleDateString()}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setReplyingCommentId(
                                  replyingCommentId ===
                                    comment.id
                                    ? null
                                    : comment.id,
                                );

                                setReplyContent(
                                  '',
                                );

                                setError('');
                              }}
                              className="text-xs font-semibold text-gray-500 transition hover:text-blue-600"
                            >
                              Reply
                            </button>

                            {isCommentOwner && (
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
                            )}

                            {isCommentOwner && (
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
                            )}
                          </div>

                          {/* ================================= */}
                          {/* REPLY FORM */}
                          {/* ================================= */}

                          {replyingCommentId ===
                            comment.id && (
                            <form
                              onSubmit={(e) =>
                                handleReply(
                                  e,
                                  comment.id,
                                )
                              }
                              className="mt-3 ml-2 flex items-start gap-2 sm:ml-3"
                            >
                              <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 sm:flex">
                                ↳
                              </div>

                              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                                <input
                                  type="text"
                                  value={
                                    replyContent
                                  }
                                  onChange={(
                                    e,
                                  ) =>
                                    setReplyContent(
                                      e.target
                                        .value,
                                    )
                                  }
                                  placeholder="Write a reply..."
                                  autoFocus
                                  className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                />

                                <button
                                  type="submit"
                                  disabled={
                                    replyLoading ||
                                    !replyContent.trim()
                                  }
                                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {replyLoading
                                    ? 'Replying...'
                                    : 'Reply'}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* ================================= */}
                          {/* REPLIES */}
                          {/* ================================= */}

                          {comment.replies &&
                            comment.replies.length >
                              0 && (
                              <div className="mt-4 ml-2 space-y-4 border-l-2 border-blue-50 pl-3 sm:ml-5 sm:pl-4">
                                {comment.replies.map(
                                  (reply) => {
                                    const isReplyOwner =
                                      Number(
                                        currentUserId,
                                      ) ===
                                      Number(
                                        reply.userId,
                                      );

                                    const isReplyEditing =
                                      editingCommentId ===
                                      reply.id;

                                    return (
                                      <div
                                        key={
                                          reply.id
                                        }
                                        className="flex gap-2.5"
                                      >
                                        {/* Reply Avatar */}

                                        <Link
                                          href={`/profile/${reply.user.id}`}
                                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                                        >
                                          {reply.user.name
                                            .charAt(
                                              0,
                                            )
                                            .toUpperCase()}
                                        </Link>

                                        {/* Reply Content */}

                                        <div className="min-w-0 flex-1">
                                          {isReplyEditing ? (
                                            <form
                                              onSubmit={
                                                handleUpdateComment
                                              }
                                              className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3"
                                            >
                                              <textarea
                                                value={
                                                  editContent
                                                }
                                                onChange={(
                                                  e,
                                                ) =>
                                                  setEditContent(
                                                    e
                                                      .target
                                                      .value,
                                                  )
                                                }
                                                rows={
                                                  2
                                                }
                                                autoFocus
                                                className="w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                              />

                                              <div className="mt-2 flex flex-wrap gap-2">
                                                <button
                                                  type="submit"
                                                  disabled={
                                                    loading ||
                                                    !editContent.trim()
                                                  }
                                                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            <>
                                              {/* Reply Bubble */}

                                              <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-gray-50 px-3.5 py-2.5 ring-1 ring-gray-100">
                                                <Link
                                                  href={`/profile/${reply.user.id}`}
                                                  className="text-xs font-bold text-gray-900 transition hover:text-blue-600"
                                                >
                                                  {
                                                    reply
                                                      .user
                                                      .name
                                                  }
                                                </Link>

                                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                                  {
                                                    reply.content
                                                  }
                                                </p>
                                              </div>

                                              {/* Reply Actions */}

                                              <div className="mt-1.5 ml-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span className="text-[11px] text-gray-400">
                                                  {new Date(
                                                    reply.createdAt,
                                                  ).toLocaleDateString()}
                                                </span>

                                                {isReplyOwner && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleStartEdit(
                                                        reply,
                                                      )
                                                    }
                                                    className="text-xs font-semibold text-gray-500 transition hover:text-blue-600"
                                                  >
                                                    Edit
                                                  </button>
                                                )}

                                                {isReplyOwner && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleDeleteComment(
                                                        reply.id,
                                                      )
                                                    }
                                                    disabled={
                                                      deletingCommentId ===
                                                      reply.id
                                                    }
                                                    className="text-xs font-semibold text-gray-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                  >
                                                    {deletingCommentId ===
                                                    reply.id
                                                      ? 'Deleting...'
                                                      : 'Delete'}
                                                  </button>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}