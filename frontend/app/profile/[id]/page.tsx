'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { getImageUrl } from '@/lib/api';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

interface User {
  id: number;
  name: string;
  email: string;

  bio?: string | null;

  profileImage?: string | null;
  coverImage?: string | null;

  _count: {
    posts: number;
    comments: number;
    likes: number;
    followers: number;
    following: number;
  };
}

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string;

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

/*
|--------------------------------------------------------------------------
| PROFILE PAGE CONTENT
|--------------------------------------------------------------------------
*/

function ProfilePageContent() {
  const params = useParams();

  const userId = Number(params.id);

  // ==========================================
  // USER STATE
  // ==========================================

  const [user, setUser] =
    useState<User | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  // ==========================================
  // FOLLOW STATE
  // ==========================================

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  // ==========================================
  // PROFILE IMAGE STATE
  // ==========================================

  const [
    profileImageLoading,
    setProfileImageLoading,
  ] = useState(false);

  const profileImageInputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // COVER IMAGE STATE
  // ==========================================

  const [
    coverImageLoading,
    setCoverImageLoading,
  ] = useState(false);

  const coverImageInputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // EDIT PROFILE STATE
  // ==========================================

  const [
    editProfileOpen,
    setEditProfileOpen,
  ] = useState(false);

  const [editName, setEditName] =
    useState('');

  const [editBio, setEditBio] =
    useState('');

  const [
    editProfileLoading,
    setEditProfileLoading,
  ] = useState(false);

  // ==========================================
  // PAGE STATE
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // ==========================================
  // CURRENT USER
  // ==========================================

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      setCurrentUserId(null);
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

      setCurrentUserId(
        Number(parsedUser.id),
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
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    if (!userId || Number.isNaN(userId)) {
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');

        // ======================================
        // FETCH USER
        // ======================================

        const userResponse =
          await fetch(
            `${API_URL}/users/${userId}`,
          );

        const userData =
          await userResponse.json().catch(
            () => null,
          );

        if (!userResponse.ok) {
          throw new Error(
            userData?.message ||
              'Failed to fetch user profile',
          );
        }

        // ======================================
        // NORMALIZE USER
        // ======================================

        const normalizedUser: User = {
          ...userData,

          bio:
            userData?.bio || null,

          profileImage:
            userData?.profileImage || null,

          coverImage:
            userData?.coverImage || null,

          _count: {
            posts:
              Number(
                userData?._count?.posts,
              ) || 0,

            comments:
              Number(
                userData?._count?.comments,
              ) || 0,

            likes:
              Number(
                userData?._count?.likes,
              ) || 0,

            followers:
              Number(
                userData?._count?.followers,
              ) || 0,

            following:
              Number(
                userData?._count?.following,
              ) || 0,
          },
        };

        setUser(normalizedUser);

        // ======================================
        // FETCH POSTS
        // ======================================

        const postsResponse =
          await fetch(
            `${API_URL}/posts`,
          );

        const postsData =
          await postsResponse.json().catch(
            () => null,
          );

        if (!postsResponse.ok) {
          throw new Error(
            postsData?.message ||
              'Failed to fetch posts',
          );
        }

        const allPosts: Post[] =
          Array.isArray(postsData)
            ? postsData
            : postsData?.data || [];

        const userPosts =
          allPosts.filter(
            (post: Post) =>
              post.author?.id === userId,
          );

        setPosts(userPosts);
      } catch (error) {
        console.error(
          'Profile fetch error:',
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

    fetchProfile();
  }, [userId]);

  // ==========================================
  // OPEN EDIT PROFILE
  // ==========================================

  function handleOpenEditProfile() {
    if (!user) {
      return;
    }

    setEditName(user.name);
    setEditBio(user.bio || '');
    setError('');
    setEditProfileOpen(true);
  }

  // ==========================================
  // CLOSE EDIT PROFILE
  // ==========================================

  function handleCloseEditProfile() {
    if (editProfileLoading) {
      return;
    }

    setEditProfileOpen(false);
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  async function handleUpdateProfile(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to update your profile.',
      );

      return;
    }

    const trimmedName =
      editName.trim();

    const trimmedBio =
      editBio.trim();

    if (!trimmedName) {
      setError(
        'Name cannot be empty.',
      );

      return;
    }

    if (trimmedName.length > 50) {
      setError(
        'Name cannot be more than 50 characters.',
      );

      return;
    }

    if (trimmedBio.length > 160) {
      setError(
        'Bio cannot be more than 160 characters.',
      );

      return;
    }

    setEditProfileLoading(true);
    setError('');

    try {
      const response =
        await fetch(
          `${API_URL}/users/profile`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: trimmedName,
              bio: trimmedBio,
            }),
          },
        );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to update profile',
        );
      }

      if (data?.user) {
        setUser(
          (previousUser) => {
            if (!previousUser) {
              return previousUser;
            }

            return {
              ...previousUser,
              name: data.user.name,
              bio:
                data.user.bio || null,
            };
          },
        );

        const storedUser =
          localStorage.getItem('user');

        if (storedUser) {
          try {
            const parsedUser =
              JSON.parse(storedUser);

            localStorage.setItem(
              'user',
              JSON.stringify({
                ...parsedUser,
                name:
                  data.user.name,
                bio:
                  data.user.bio || null,
              }),
            );
          } catch (error) {
            console.error(
              'Failed to update local storage user:',
              error,
            );
          }
        }
      }

      setEditProfileOpen(false);
    } catch (error) {
      console.error(
        'Update profile error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update profile',
      );
    } finally {
      setEditProfileLoading(false);
    }
  }

  // ==========================================
  // PROFILE IMAGE UPLOAD
  // ==========================================

  async function handleProfileImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to change your profile image.',
      );

      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(
        'Only image files are allowed.',
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Image size must be less than 5 MB.',
      );

      return;
    }

    setProfileImageLoading(true);
    setError('');

    try {
      const formData =
        new FormData();

      formData.append('file', file);

      const response =
        await fetch(
          `${API_URL}/users/profile-image`,
          {
            method: 'PATCH',

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          },
        );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to upload profile image',
        );
      }

      if (data?.user) {
        setUser(
          (previousUser) => {
            if (!previousUser) {
              return previousUser;
            }

            return {
              ...previousUser,

              profileImage:
                data.user.profileImage ||
                null,
            };
          },
        );
      }

      const storedUser =
        localStorage.getItem('user');

      if (storedUser && data?.user) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          localStorage.setItem(
            'user',
            JSON.stringify({
              ...parsedUser,

              profileImage:
                data.user.profileImage,
            }),
          );
        } catch (error) {
          console.error(
            'Failed to update local storage user:',
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        'Profile image upload error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to upload profile image',
      );
    } finally {
      setProfileImageLoading(false);

      if (
        profileImageInputRef.current
      ) {
        profileImageInputRef.current.value =
          '';
      }
    }
  }

  // ==========================================
  // COVER IMAGE UPLOAD
  // ==========================================

  async function handleCoverImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to change your cover image.',
      );

      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(
        'Only image files are allowed.',
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Cover image size must be less than 5 MB.',
      );

      return;
    }

    setCoverImageLoading(true);
    setError('');

    try {
      const formData =
        new FormData();

      formData.append('file', file);

      const response =
        await fetch(
          `${API_URL}/users/cover-image`,
          {
            method: 'PATCH',

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          },
        );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to upload cover image',
        );
      }

      if (data?.user) {
        setUser(
          (previousUser) => {
            if (!previousUser) {
              return previousUser;
            }

            return {
              ...previousUser,

              coverImage:
                data.user.coverImage ||
                null,
            };
          },
        );
      }
    } catch (error) {
      console.error(
        'Cover image upload error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to upload cover image',
      );
    } finally {
      setCoverImageLoading(false);

      if (
        coverImageInputRef.current
      ) {
        coverImageInputRef.current.value =
          '';
      }
    }
  }

  // ==========================================
  // FOLLOW
  // ==========================================

  async function handleFollow() {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to follow this user.',
      );

      return;
    }

    setFollowLoading(true);
    setError('');

    try {
      const response =
        await fetch(
          `${API_URL}/users/${userId}/follow`,
          {
            method: 'POST',

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to follow user',
        );
      }

      setIsFollowing(true);

      setUser(
        (previousUser) => {
          if (!previousUser) {
            return previousUser;
          }

          return {
            ...previousUser,

            _count: {
              ...previousUser._count,

              followers:
                Number(
                  previousUser._count
                    .followers,
                ) + 1,
            },
          };
        },
      );
    } catch (error) {
      console.error(
        'Follow error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to follow user',
      );
    } finally {
      setFollowLoading(false);
    }
  }

  // ==========================================
  // UNFOLLOW
  // ==========================================

  async function handleUnfollow() {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Please login to unfollow this user.',
      );

      return;
    }

    setFollowLoading(true);
    setError('');

    try {
      const response =
        await fetch(
          `${API_URL}/users/${userId}/follow`,
          {
            method: 'DELETE',

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to unfollow user',
        );
      }

      setIsFollowing(false);

      setUser(
        (previousUser) => {
          if (!previousUser) {
            return previousUser;
          }

          return {
            ...previousUser,

            _count: {
              ...previousUser._count,

              followers: Math.max(
                0,
                Number(
                  previousUser._count
                    .followers,
                ) - 1,
              ),
            },
          };
        },
      );
    } catch (error) {
      console.error(
        'Unfollow error:',
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to unfollow user',
      );
    } finally {
      setFollowLoading(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-10">
          <div className="mb-5 h-8 w-28 animate-pulse rounded-full bg-gray-200" />

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="h-48 animate-pulse bg-gray-200 sm:h-64" />

            <div className="px-4 pb-7 sm:px-7">
              <div className="-mt-12 sm:-mt-14">
                <div className="h-24 w-24 animate-pulse rounded-full border-4 border-white bg-gray-200 shadow sm:h-28 sm:w-28" />
              </div>

              <div className="mt-5 h-7 w-44 animate-pulse rounded-lg bg-gray-200" />

              <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />

              <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-gray-100" />

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 h-6 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-5 space-y-4">
            {Array.from({
              length: 2,
            }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {error}
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // USER NOT FOUND
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              👤
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              User not found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              The profile you are looking for
              does not exist.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // PROFILE CHECK
  // ==========================================

  const isOwnProfile =
    currentUserId === user.id;

  // ==========================================
  // IMAGE URLS
  // ==========================================

  const profileImageUrl =
    getImageUrl(user.profileImage);

  const coverImageUrl =
    getImageUrl(user.coverImage);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-3 py-5 sm:px-4 sm:py-8">

        {/* ======================================
            BACK BUTTON
        ====================================== */}

        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-blue-600 sm:mb-6"
        >
          <span className="text-base">
            ←
          </span>

          <span>
            Back to Feed
          </span>
        </Link>

        {/* ======================================
            PROFILE CARD
        ====================================== */}

        <section className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm">

          {/* ====================================
              COVER
          ==================================== */}

          <div
            className={`relative h-44 overflow-hidden sm:h-64 ${
              coverImageUrl
                ? 'bg-gray-200'
                : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
            }`}
          >
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={`${user.name}'s cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
              </>
            )}

            {coverImageUrl && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
            )}

            {/* COVER BUTTON */}

            {isOwnProfile && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    coverImageInputRef.current?.click()
                  }
                  disabled={
                    coverImageLoading
                  }
                  className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-50 sm:right-5 sm:top-5 sm:px-4 sm:text-sm"
                >
                  {coverImageLoading
                    ? 'Uploading...'
                    : coverImageUrl
                      ? '📷 Change Cover'
                      : '📷 Add Cover'}
                </button>

                <input
                  ref={
                    coverImageInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleCoverImageChange
                  }
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* ====================================
              PROFILE DETAILS
          ==================================== */}

          <div className="px-4 pb-7 sm:px-7 sm:pb-8">

            {/* PROFILE IMAGE + ACTION */}

            <div className="-mt-12 flex flex-col items-start sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">

              {/* PROFILE IMAGE */}

              <div className="relative">

                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user.name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl ring-1 ring-gray-100 sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-indigo-100 text-3xl font-bold text-blue-600 shadow-xl ring-1 ring-gray-100 sm:h-28 sm:w-28 sm:text-4xl">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* PROFILE IMAGE BUTTON */}

                {isOwnProfile && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        profileImageInputRef.current?.click()
                      }
                      disabled={
                        profileImageLoading
                      }
                      title="Change profile picture"
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-sm text-white shadow-md transition hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {profileImageLoading
                        ? '...'
                        : '📷'}
                    </button>

                    <input
                      ref={
                        profileImageInputRef
                      }
                      type="file"
                      accept="image/*"
                      onChange={
                        handleProfileImageChange
                      }
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* ACTION BUTTON */}

              <div className="mt-4 w-full sm:mt-0 sm:w-auto">

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={
                      handleOpenEditProfile
                    }
                    className="w-full rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:shadow sm:w-auto"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      isFollowing
                        ? handleUnfollow
                        : handleFollow
                    }
                    disabled={
                      followLoading
                    }
                    className={`w-full rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition sm:w-auto ${
                      isFollowing
                        ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {followLoading
                      ? 'Please wait...'
                      : isFollowing
                        ? '✓ Following'
                        : '+ Follow'}
                  </button>
                )}

              </div>
            </div>

            {/* ==================================
                USER INFO
            ================================== */}

            <div className="mt-5">

              <div className="flex flex-col gap-1">

                <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {user.name}
                </h1>

                <p className="break-all text-sm text-gray-400">
                  {user.email}
                </p>

              </div>

              {user.bio ? (
                <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words text-sm leading-6 text-gray-600 sm:text-[15px]">
                  {user.bio}
                </p>
              ) : (
                isOwnProfile && (
                  <button
                    type="button"
                    onClick={
                      handleOpenEditProfile
                    }
                    className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                  >
                    + Add a bio
                  </button>
                )
              )}
            </div>

            {/* ==================================
                ERROR
            ================================== */}

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span>
                  ⚠️
                </span>

                <p>
                  {error}
                </p>
              </div>
            )}

            {/* ==================================
                STATS
            ================================== */}

            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">

              {/* POSTS */}

              <div className="group rounded-2xl border border-gray-100 bg-gray-50 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <p className="text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                  {Number(
                    user._count.posts,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Posts
                </p>
              </div>

              {/* FOLLOWERS */}

              <div className="group rounded-2xl border border-gray-100 bg-gray-50 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <p className="text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                  {Number(
                    user._count.followers,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Followers
                </p>
              </div>

              {/* FOLLOWING */}

              <div className="group rounded-2xl border border-gray-100 bg-gray-50 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <p className="text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                  {Number(
                    user._count.following,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Following
                </p>
              </div>

              {/* COMMENTS */}

              <div className="group rounded-2xl border border-gray-100 bg-gray-50 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <p className="text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                  {Number(
                    user._count.comments,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Comments
                </p>
              </div>

              {/* LIKES */}

              <div className="group rounded-2xl border border-gray-100 bg-gray-50 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <p className="text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                  {Number(
                    user._count.likes,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Likes
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================
            USER POSTS
        ====================================== */}

        <section className="mt-8">

          {/* SECTION HEADER */}

          <div className="mb-5 flex items-end justify-between gap-3">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {user.name}'s Posts
              </h2>
            </div>

            <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm">
              {posts.length}{' '}
              {posts.length === 1
                ? 'post'
                : 'posts'}
            </span>

          </div>

          {/* EMPTY STATE */}

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                📝
              </div>

              <p className="mt-5 text-base font-bold text-gray-800">
                No posts yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
                {isOwnProfile
                  ? 'Share your first post with the developer community.'
                  : "This user hasn't shared any posts yet."}
              </p>

              {isOwnProfile && (
                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Create a Post
                </Link>
              )}

            </div>
          ) : (
            <div className="space-y-5">

              {posts.map((post) => {

                const postAuthorImage =
                  getImageUrl(
                    post.author.profileImage,
                  );

                return (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
                  >

                    {/* POST HEADER */}

                    <div className="flex items-center gap-3 px-4 pt-5 sm:px-6">

                      <Link
                        href={`/profile/${post.author.id}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-600 ring-1 ring-gray-100"
                      >
                        {postAuthorImage ? (
                          <img
                            src={
                              postAuthorImage
                            }
                            alt={
                              post.author.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          post.author.name
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="block truncate text-sm font-bold text-gray-900 transition hover:text-blue-600"
                        >
                          {
                            post.author.name
                          }
                        </Link>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {new Date(
                            post.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                    </div>

                    {/* POST CONTENT */}

                    <Link
                      href={`/posts/${post.id}`}
                      className="block px-4 pb-5 pt-4 sm:px-6 sm:pb-6"
                    >

                      <h3 className="break-words text-lg font-bold leading-snug text-gray-900 transition group-hover:text-blue-600 sm:text-xl">
                        {post.title}
                      </h3>

                      <p className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600 sm:text-[15px] sm:leading-7">
                        {post.content}
                      </p>

                      {/* POST IMAGE */}

                      {post.image && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                          <img
                            src={
                              getImageUrl(
                                post.image,
                              ) || ''
                            }
                            alt={post.title}
                            className="max-h-[520px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                          />
                        </div>
                      )}

                    </Link>

                    {/* POST STATS */}

                    <div className="mx-4 border-t border-gray-100 py-3.5 sm:mx-6">
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 sm:gap-6 sm:text-sm">

                        <span className="transition hover:text-red-500">
                          ❤️{' '}
                          {Number(
                            post._count.likes,
                          ) || 0}{' '}
                          Likes
                        </span>

                        <span className="transition hover:text-blue-500">
                          💬{' '}
                          {Number(
                            post._count.comments,
                          ) || 0}{' '}
                          Comments
                        </span>

                      </div>
                    </div>

                  </article>
                );
              })}

            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {editProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={
            handleCloseEditProfile
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL TOP */}

            <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-5 sm:px-6">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    Profile settings
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update your name and bio.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseEditProfile
                  }
                  disabled={
                    editProfileLoading
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                >
                  ✕
                </button>

              </div>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleUpdateProfile
              }
              className="space-y-5 px-5 py-6 sm:px-6"
            >

              {/* NAME */}

              <div>
                <div className="flex items-center justify-between gap-3">

                  <label
                    htmlFor="profile-name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Name
                  </label>

                  <span className="text-xs text-gray-400">
                    {editName.length}/50
                  </span>

                </div>

                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(
                      event.target.value,
                    )
                  }
                  maxLength={50}
                  disabled={
                    editProfileLoading
                  }
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:bg-gray-100"
                  placeholder="Enter your name"
                />
              </div>

              {/* BIO */}

              <div>
                <div className="flex items-center justify-between gap-3">

                  <label
                    htmlFor="profile-bio"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Bio
                  </label>

                  <span className="text-xs text-gray-400">
                    {editBio.length}/160
                  </span>

                </div>

                <textarea
                  id="profile-bio"
                  value={editBio}
                  onChange={(event) =>
                    setEditBio(
                      event.target.value,
                    )
                  }
                  maxLength={160}
                  rows={4}
                  disabled={
                    editProfileLoading
                  }
                  className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:bg-gray-100"
                  placeholder="Tell people a little about yourself..."
                />
              </div>

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span>
                    ⚠️
                  </span>

                  <p>
                    {error}
                  </p>
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    handleCloseEditProfile
                  }
                  disabled={
                    editProfileLoading
                  }
                  className="w-full rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    editProfileLoading
                  }
                  className="w-full rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {editProfileLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROTECTED PROFILE PAGE
|--------------------------------------------------------------------------
*/

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}