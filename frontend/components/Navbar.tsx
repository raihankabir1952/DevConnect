'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface User {
  id: number;
  name: string;
  profileImage?: string | null;
}

interface LoggedInUser {
  id: number;
  name: string;
  email: string;
  profileImage?: string | null;
}

interface NotificationActor {
  id: number;
  name: string;
  profileImage?: string | null;
}

interface NotificationPost {
  id: number;
  title: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor?: NotificationActor | null;
  post?: NotificationPost | null;
}

export default function Navbar() {
  // ==========================================
  // SEARCH STATES
  // ==========================================

  const [search, setSearch] = useState('');

  const [users, setUsers] =
    useState<User[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [showResults, setShowResults] =
    useState(false);

  // ==========================================
  // CURRENT USER
  // ==========================================

  const [currentUser, setCurrentUser] =
    useState<LoggedInUser | null>(null);

  // ==========================================
  // NOTIFICATION STATES
  // ==========================================

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  // ==========================================
  // REFS
  // ==========================================

  const searchRef =
    useRef<HTMLDivElement>(null);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  // ==========================================
  // PROFILE IMAGE URL
  // ==========================================

  function getProfileImageUrl(
    profileImage?: string | null,
  ) {
    if (!profileImage) {
      return null;
    }

    // যদি already full URL হয়
    if (
      profileImage.startsWith('http://') ||
      profileImage.startsWith('https://')
    ) {
      return profileImage;
    }

    // Backend থেকে পাওয়া path
    return `http://localhost:3000${profileImage}`;
  }

  // ==========================================
  // LOAD LOGGED-IN USER
  // ==========================================

  useEffect(() => {
    async function loadCurrentUser() {
      const storedUser =
        localStorage.getItem('user');

      if (!storedUser) {
        setCurrentUser(null);
        return;
      }

      try {
        const parsedUser: LoggedInUser =
          JSON.parse(storedUser);

        // প্রথমে localStorage-এর user দেখাবে
        setCurrentUser(parsedUser);

        // ======================================
        // FETCH LATEST USER PROFILE
        // ======================================

        const response = await fetch(
          `http://localhost:3000/users/${parsedUser.id}`,
        );

        if (!response.ok) {
          return;
        }

        const latestUser =
          await response.json();

        const updatedUser: LoggedInUser = {
          id: latestUser.id,
          name: latestUser.name,
          email: latestUser.email,
          profileImage:
            latestUser.profileImage || null,
        };

        // Update state
        setCurrentUser(updatedUser);

        // Update localStorage
        localStorage.setItem(
          'user',
          JSON.stringify(updatedUser),
        );
      } catch (error) {
        console.error(
          'Failed to load user:',
          error,
        );

        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  async function fetchNotifications() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setNotifications([]);
    return;
  }

  try {
    setNotificationLoading(true);

    const response = await fetch(
      'http://localhost:3000/notifications',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Failed to fetch notifications:',
        response.status,
        errorText,
      );

      return;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      setNotifications(data);
    }
  } catch (error) {
    console.error('Notification fetch error:', error);
  } finally {
    setNotificationLoading(false);
  }
}

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser]);

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  // ==========================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================

  async function markNotificationAsRead(
    notificationId: number,
  ) {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        console.error(
          'Failed to mark notification as read',
        );

        return;
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        'Mark notification read error:',
        error,
      );
    }
  }

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  async function markAllNotificationsAsRead() {
    const token =
      localStorage.getItem('accessToken');

    if (!token || unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3000/notifications/read-all',
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        console.error(
          'Failed to mark all notifications as read',
        );

        return;
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error(
        'Mark all notifications read error:',
        error,
      );
    }
  }

  // ==========================================
  // SEARCH USERS
  // ==========================================

  useEffect(() => {
    const searchUsers = async () => {
      const trimmedSearch =
        search.trim();

      // Empty search
      if (!trimmedSearch) {
        setUsers([]);
        setShowResults(false);
        return;
      }

      try {
        setSearching(true);

        const response = await fetch(
          `http://localhost:3000/users/search?name=${encodeURIComponent(
            trimmedSearch,
          )}`,
        );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            'Backend search error:',
            data,
          );

          throw new Error(
            data?.message ||
              'Failed to search users',
          );
        }

        if (!Array.isArray(data)) {
          console.error(
            'Unexpected search response:',
            data,
          );

          throw new Error(
            'Invalid response from server',
          );
        }

        setUsers(data);

        setShowResults(true);
      } catch (error) {
        console.error(
          'User search error:',
          error,
        );

        setUsers([]);

        setShowResults(false);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(
      searchUsers,
      400,
    );

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // ==========================================
  // CLOSE SEARCH + NOTIFICATION
  // CLICK OUTSIDE
  // ==========================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setShowResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target,
        )
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  // ==========================================
  // HANDLE USER PROFILE CLICK
  // ==========================================

  function handleUserClick() {
    setSearch('');

    setShowResults(false);
  }

  // ==========================================
  // HANDLE NOTIFICATION CLICK
  // ==========================================

  async function handleNotificationClick(
    notification: Notification,
  ) {
    if (!notification.isRead) {
      await markNotificationAsRead(
        notification.id,
      );
    }

    setShowNotifications(false);

    // Related post থাকলে home page-এ যাবে
    if (notification.post) {
      window.location.href = `/?post=${notification.post.id}`;
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  function handleLogout() {
    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem('user');

    setCurrentUser(null);

    setNotifications([]);

    window.location.href = '/login';
  }

  // ==========================================
  // FORMAT NOTIFICATION TIME
  // ==========================================

  function formatNotificationTime(
    dateString: string,
  ) {
    const date =
      new Date(dateString);

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const seconds = Math.floor(
      difference / 1000,
    );

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes = Math.floor(
      seconds / 60,
    );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60,
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24,
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      {/* ========================================== */}
      {/* MAIN NAVBAR */}
      {/* ========================================== */}

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">

        {/* ========================================== */}
        {/* LOGO */}
        {/* ========================================== */}

        <Link
          href="/"
          className="shrink-0 text-xl font-bold text-blue-600"
        >
          DevConnect
        </Link>

        {/* ========================================== */}
        {/* DESKTOP SEARCH */}
        {/* ========================================== */}

        <div
          ref={searchRef}
          className="relative hidden w-full max-w-md md:block"
        >
          {/* Search Input */}

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onFocus={() => {
                if (users.length > 0) {
                  setShowResults(true);
                }
              }}
              placeholder="Search developers..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-24 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            {/* Loading */}

            {searching && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                Searching...
              </span>
            )}
          </div>

          {/* ========================================== */}
          {/* DESKTOP SEARCH RESULTS */}
          {/* ========================================== */}

          {showResults && (
            <div className="absolute left-0 right-0 top-14 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              {users.length > 0 ? (
                <div className="py-2">
                  {users.map((user) => {
                    const imageUrl =
                      getProfileImageUrl(
                        user.profileImage,
                      );

                    return (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={
                          handleUserClick
                        }
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                      >
                        {/* Avatar */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        {/* User Info */}

                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            View profile
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                !searching && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try searching with another
                      name.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* RIGHT SIDE */}
        {/* ========================================== */}

        <div className="flex items-center gap-2">

          {/* Home */}

          <Link
            href="/"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-blue-600 sm:block"
          >
            Home
          </Link>

          {/* ========================================== */}
          {/* NOTIFICATION */}
          {/* ========================================== */}

          {currentUser && (
            <div
              ref={notificationRef}
              className="relative"
            >
              {/* Bell Button */}

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (previous) =>
                      !previous,
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg transition hover:border-blue-200 hover:bg-blue-50"
                aria-label="Notifications"
              >
                🔔

                {/* Unread Badge */}

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount > 99
                      ? '99+'
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* ====================================== */}
              {/* NOTIFICATION DROPDOWN */}
              {/* ====================================== */}

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[350px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {notificationLoading &&
                    notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

                        <p className="mt-3 text-sm text-gray-500">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="px-4 py-10 text-center">
                        <div className="text-3xl">
                          🔔
                        </div>

                        <p className="mt-3 text-sm font-medium text-gray-700">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          When someone interacts
                          with you, it will appear
                          here.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => {
                          const actorImage =
                            getProfileImageUrl(
                              notification
                                .actor
                                ?.profileImage,
                            );

                          return (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                handleNotificationClick(
                                  notification,
                                )
                              }
                              className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                                !notification.isRead
                                  ? 'bg-blue-50/60'
                                  : 'bg-white'
                              }`}
                            >
                              {/* Actor Avatar */}

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">
                                {actorImage ? (
                                  <img
                                    src={
                                      actorImage
                                    }
                                    alt={
                                      notification
                                        .actor
                                        ?.name ||
                                      'User'
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  notification.actor?.name
                                    ?.charAt(
                                      0,
                                    )
                                    .toUpperCase() ||
                                  'U'
                                )}
                              </div>

                              {/* Notification Content */}

                              <div className="min-w-0 flex-1">
                                <p className="text-sm leading-5 text-gray-700">
                                  <span className="font-semibold text-gray-900">
                                    {
                                      notification
                                        .actor
                                        ?.name
                                    }
                                  </span>{' '}
                                  {
                                    notification.message
                                  }
                                </p>

                                {notification.post && (
                                  <p className="mt-1 truncate text-xs font-medium text-blue-600">
                                    {
                                      notification
                                        .post
                                        .title
                                    }
                                  </p>
                                )}

                                <p className="mt-1 text-[11px] text-gray-400">
                                  {formatNotificationTime(
                                    notification.createdAt,
                                  )}
                                </p>
                              </div>

                              {/* Unread Dot */}

                              {!notification.isRead && (
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                              )}
                            </button>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* LOGGED IN USER */}
          {/* ========================================== */}

          {currentUser ? (
            <>
              {/* Profile */}

              <Link
                href={`/profile/${currentUser.id}`}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                {/* Profile Avatar */}

                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-blue-600">
                  {getProfileImageUrl(
                    currentUser.profileImage,
                  ) ? (
                    <img
                      src={getProfileImageUrl(
                        currentUser.profileImage,
                      )!}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    currentUser.name
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                {/* User Name */}

                <span className="hidden sm:inline">
                  {currentUser.name}
                </span>
              </Link>

              {/* Logout */}

              <button
                onClick={handleLogout}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}

              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Login
              </Link>

              {/* Register */}

              <Link
                href="/register"
                className="hidden rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:block"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE SEARCH */}
      {/* ========================================== */}

      <div className="border-t border-gray-100 px-4 py-3 md:hidden">
        <div className="relative">

          {/* Input */}

          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onFocus={() => {
              if (users.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Search developers..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          {/* Mobile Results */}

          {showResults && (
            <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              {users.length > 0 ? (
                <div className="py-2">
                  {users.map((user) => {
                    const imageUrl =
                      getProfileImageUrl(
                        user.profileImage,
                      );

                    return (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={
                          handleUserClick
                        }
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                      >
                        {/* Avatar */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        {/* User Info */}

                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            View profile
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                !searching && (
                  <p className="p-5 text-center text-sm text-gray-500">
                    No users found
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
