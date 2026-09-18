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
  // POST /comments
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
      localStorage.getItem(
        'accessToken',
      );

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
            content:
              replyContent.trim(),

            postId: postId,

            parentId: parentId,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to add reply',
        );
      }

      console.log(
        'Reply created:',
        data,
      );

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
  // UPDATE COMMENT / REPLY
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

      // Refetch because the deleted item
      // can be either a comment or a reply.
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
                  // COMMENT OWNER
                  // =================================

                  const isCommentOwner =
                    Number(
                      currentUserId,
                    ) ===
                    Number(
                      comment.userId,
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
                              {/* REPLY */}
                              {/* ================================= */}

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

                              {/* ================================= */}
                              {/* EDIT */}
                              {/* ================================= */}

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

                              {/* ================================= */}
                              {/* DELETE */}
                              {/* ================================= */}

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
                                className="mt-3 ml-3 flex gap-2"
                              >
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
                                  className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                                <button
                                  type="submit"
                                  disabled={
                                    replyLoading ||
                                    !replyContent.trim()
                                  }
                                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {replyLoading
                                    ? 'Replying...'
                                    : 'Reply'}
                                </button>
                              </form>
                            )}

                            {/* ================================= */}
                            {/* REPLIES */}
                            {/* ================================= */}

                            {comment.replies &&
                              comment.replies.length >
                                0 && (
                                <div className="mt-4 ml-8 space-y-4 border-l-2 border-gray-100 pl-4">
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
                                          className="flex gap-3"
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

                                          {/* Reply Body */}

                                          <div className="min-w-0 flex-1">
                                            {isReplyEditing ? (
                                              /* ===================== */
                                              /* EDIT REPLY */
                                              /* ===================== */

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
                                                      e
                                                        .target
                                                        .value,
                                                    )
                                                  }
                                                  rows={
                                                    2
                                                  }
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
                                              <>
                                                {/* Reply Bubble */}

                                                <div className="inline-block max-w-full rounded-2xl bg-gray-50 px-4 py-2.5">
                                                  <Link
                                                    href={`/profile/${reply.user.id}`}
                                                    className="text-xs font-semibold text-gray-900 transition hover:text-blue-600"
                                                  >
                                                    {
                                                      reply
                                                        .user
                                                        .name
                                                    }
                                                  </Link>

                                                  <p className="mt-1 break-words text-sm text-gray-600">
                                                    {
                                                      reply.content
                                                    }
                                                  </p>
                                                </div>

                                                {/* Reply Date + Actions */}

                                                <div className="mt-1 ml-3 flex items-center gap-3">
                                                  <p className="text-xs text-gray-400">
                                                    {new Date(
                                                      reply.createdAt,
                                                    ).toLocaleDateString()}
                                                  </p>

                                                  {/* Edit Reply */}

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

                                                  {/* Delete Reply */}

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
                },
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}