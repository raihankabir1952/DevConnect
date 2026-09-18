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
  // CURRENT LOGGED-IN USER
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
        // FETCH USER PROFILE
        // ======================================

        const userResponse =
          await fetch(
            `http://localhost:3000/users/${userId}`,
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
        // FETCH ALL POSTS
        // ======================================

        const postsResponse =
          await fetch(
            'http://localhost:3000/posts',
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

        // ======================================
        // HANDLE PAGINATED RESPONSE
        // ======================================

        const allPosts: Post[] =
          Array.isArray(postsData)
            ? postsData
            : postsData?.data || [];

        // ======================================
        // FILTER USER POSTS
        // ======================================

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

    // ========================================
    // VALIDATE NAME
    // ========================================

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

    // ========================================
    // VALIDATE BIO
    // ========================================

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
          'http://localhost:3000/users/profile',
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

      // ========================================
      // UPDATE PROFILE UI
      // ========================================

      if (data?.user) {
        setUser(
          (previousUser) => {
            if (!previousUser) {
              return previousUser;
            }

            return {
              ...previousUser,

              name:
                data.user.name,

              bio:
                data.user.bio || null,
            };
          },
        );

        // ======================================
        // UPDATE LOCAL STORAGE USER
        // ======================================

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

      // ========================================
      // CLOSE MODAL
      // ========================================

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

      formData.append(
        'file',
        file,
      );

      const response =
        await fetch(
          'http://localhost:3000/users/profile-image',
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

      formData.append(
        'file',
        file,
      );

      const response =
        await fetch(
          'http://localhost:3000/users/cover-image',
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
  // FOLLOW USER
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
          `http://localhost:3000/users/${userId}/follow`,
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
  // UNFOLLOW USER
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
          `http://localhost:3000/users/${userId}/follow`,
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
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700">
              Something went wrong
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // USER NOT FOUND
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              User not found
            </h2>

            <Link
              href="/"
              className="mt-5 inline-block text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CHECK OWN PROFILE
  // ==========================================

  const isOwnProfile =
    currentUserId === user.id;

  // ==========================================
  // IMAGE URL
  // ==========================================

  const profileImageUrl =
    user.profileImage
      ? `http://localhost:3000${user.profileImage}`
      : null;

  const coverImageUrl =
    user.coverImage
      ? `http://localhost:3000${user.coverImage}`
      : null;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* BACK BUTTON */}

        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          ← Back to Feed
        </Link>

        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* COVER PHOTO */}

          <div
            className={`relative h-48 sm:h-56 ${
              coverImageUrl
                ? 'bg-gray-200'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
            }`}
          >
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt={`${user.name}'s cover`}
                className="h-full w-full object-cover"
              />
            )}

            {/* CHANGE COVER */}

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
                  className="absolute right-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {coverImageLoading
                    ? 'Uploading...'
                    : coverImageUrl
                      ? 'Change Cover'
                      : 'Add Cover'}
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

          {/* PROFILE INFO */}

          <div className="px-6 pb-6">

            <div className="-mt-12 flex flex-col items-start sm:flex-row sm:items-end sm:justify-between">

              {/* PROFILE IMAGE */}

              <div className="relative">

                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user.name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-600 shadow-md">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* CHANGE PROFILE IMAGE */}

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
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-sm text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                      title="Change profile picture"
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

              {/* FOLLOW / EDIT BUTTON */}

              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={
                    handleOpenEditProfile
                  }
                  className="mt-4 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:mt-0"
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
                  className={`mt-4 rounded-full px-6 py-2.5 text-sm font-semibold transition sm:mt-0 ${
                    isFollowing
                      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {followLoading
                    ? 'Please wait...'
                    : isFollowing
                      ? 'Following'
                      : 'Follow'}
                </button>
              )}
            </div>

            {/* USER DETAILS */}

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {user.email}
              </p>

              {/* BIO */}

              {user.bio && (
                <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {user.bio}
                </p>
              )}
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* USER STATS */}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {Number(
                    user._count.posts,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Posts
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {Number(
                    user._count.followers,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Followers
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {Number(
                    user._count.following,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Following
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {Number(
                    user._count.comments,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Comments
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">
                  {Number(
                    user._count.likes,
                  ) || 0}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Likes
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* USER POSTS */}

        <div className="mt-8">

          <h2 className="mb-5 text-xl font-bold text-gray-900">
            {user.name}'s Posts
          </h2>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-700">
                No posts yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                This user hasn't shared any posts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >

                  {/* POST HEADER */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">

                      {post.author.profileImage ? (
                        <img
                          src={`http://localhost:3000${post.author.profileImage}`}
                          alt={post.author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        post.author.name
                          .charAt(0)
                          .toUpperCase()
                      )}

                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.author.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(
                          post.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>

                  {/* POST CONTENT */}

                  <div className="mt-5">

                    <h3 className="text-lg font-bold text-gray-900">
                      {post.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-gray-600">
                      {post.content}
                    </p>

                  </div>

                  {/* POST STATS */}

                  <div className="mt-5 flex items-center gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">

                    <span>
                      ❤️{' '}
                      {Number(
                        post._count.likes,
                      ) || 0}{' '}
                      Likes
                    </span>

                    <span>
                      💬{' '}
                      {Number(
                        post._count.comments,
                      ) || 0}{' '}
                      Comments
                    </span>

                  </div>

                </article>
              ))}

            </div>
          )}

        </div>

      </main>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {editProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onMouseDown={
            handleCloseEditProfile
          }
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
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
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleUpdateProfile
              }
              className="mt-6 space-y-5"
            >

              {/* NAME */}

              <div>
                <div className="flex items-center justify-between">
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
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  placeholder="Enter your name"
                />
              </div>

              {/* BIO */}

              <div>
                <div className="flex items-center justify-between">
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
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  placeholder="Tell people a little about yourself..."
                />
              </div>

              {/* MODAL ERROR */}

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={
                    handleCloseEditProfile
                  }
                  disabled={
                    editProfileLoading
                  }
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    editProfileLoading
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editProfileLoading
                    ? 'Saving...'
                    : 'Save Changes'}
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
