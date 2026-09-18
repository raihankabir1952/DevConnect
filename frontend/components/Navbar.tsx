'use client';

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bell,
  BellOff,
  Heart,
  MessageCircle,
  Reply,
} from 'lucide-react';

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
  // MOBILE MENU
  // ==========================================

  const [showMobileMenu, setShowMobileMenu] =
    useState(false);

  // ==========================================
  // REFS
  // ==========================================

  const desktopSearchRef =
    useRef<HTMLDivElement>(null);

  const mobileSearchRef =
    useRef<HTMLDivElement>(null);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const mobileMenuRef =
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

    if (
      profileImage.startsWith('http://') ||
      profileImage.startsWith('https://')
    ) {
      return profileImage;
    }

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

        setCurrentUser(parsedUser);

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

        setCurrentUser(updatedUser);

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
    const token =
      localStorage.getItem(
        'accessToken',
      );

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
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'Failed to fetch notifications:',
          response.status,
          errorText,
        );

        return;
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      console.error(
        'Notification fetch error:',
        error,
      );
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

    fetchNotifications();

    const interval =
      setInterval(() => {
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
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization:
              `Bearer ${token}`,
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
        previous.map(
          (notification) =>
            notification.id ===
            notificationId
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
      localStorage.getItem(
        'accessToken',
      );

    if (!token || unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3000/notifications/read-all',
        {
          method: 'PATCH',
          headers: {
            Authorization:
              `Bearer ${token}`,
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
        previous.map(
          (notification) => ({
            ...notification,
            isRead: true,
          }),
        ),
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
          throw new Error(
            data?.message ||
              'Failed to search users',
          );
        }

        if (!Array.isArray(data)) {
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
  // CLOSE DROPDOWNS
  // ==========================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(
          target,
        )
      ) {
        setShowResults(false);
      }

      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(
          target,
        )
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

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(
          target,
        )
      ) {
        setShowMobileMenu(false);
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

    setShowMobileMenu(false);
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

    if (notification.post) {
      window.location.href =
        `/?post=${notification.post.id}`;
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

    setShowMobileMenu(false);

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
      now.getTime() -
      date.getTime();

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

  // ==========================================
  // CLOSE MOBILE MENU
  // ==========================================

  function closeMobileMenu() {
    setShowMobileMenu(false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-xl">

      {/* ========================================== */}
      {/* MAIN NAVBAR */}
      {/* ========================================== */}

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">

        {/* ======================================== */}
        {/* LOGO */}
        {/* ======================================== */}

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm transition group-hover:scale-105 group-hover:bg-blue-700">
            D
          </div>

          <span className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            Dev<span className="text-blue-600">
              Connect
            </span>
          </span>
        </Link>

        {/* ======================================== */}
        {/* DESKTOP SEARCH */}
        {/* ======================================== */}

        <div
          ref={desktopSearchRef}
          className="relative ml-2 hidden w-full max-w-md md:block"
        >
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pl-11 pr-24 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            {searching && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-500">
                Searching...
              </span>
            )}
          </div>

          {/* Search Results */}

          {showResults && (
            <div className="absolute left-0 right-0 top-14 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
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
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-blue-50/60"
                      >
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

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
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
                  <div className="px-4 py-7 text-center">
                    <div className="text-2xl">
                      🔍
                    </div>

                    <p className="mt-2 text-sm font-semibold text-gray-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try another name.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ======================================== */}
        {/* RIGHT SIDE */}
        {/* ======================================== */}

        <div className="ml-auto flex items-center gap-2">

          {/* Desktop Home */}

          <Link
            href="/"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-blue-600 lg:block"
          >
            Home
          </Link>

          {/* ====================================== */}
          {/* NOTIFICATION */}
          {/* ====================================== */}

          {currentUser && (
            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (previous) =>
                      !previous,
                  )
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  showNotifications
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99
                      ? '99+'
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* ==================================== */}
              {/* NOTIFICATION DROPDOWN */}
              {/* ==================================== */}

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/40">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Notifications
                      </h3>

                      {unreadCount > 0 ? (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {unreadCount} unread notification
                          {unreadCount !== 1
                            ? 's'
                            : ''}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-gray-400">
                          You're all caught up
                        </p>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}

                  <div className="max-h-[430px] overflow-y-auto">
                    {notificationLoading &&
                    notifications.length === 0 ? (
                      <div className="space-y-4 px-4 py-5">
                        {[1, 2, 3].map(
                          (item) => (
                            <div
                              key={item}
                              className="flex animate-pulse gap-3"
                            >
                              <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" />

                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-3.5 w-3/4 rounded bg-gray-200" />

                                <div className="h-3 w-1/2 rounded bg-gray-100" />

                                <div className="h-2.5 w-1/4 rounded bg-gray-100" />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <BellOff className="h-6 w-6 text-gray-400" />
                        </div>

                        <p className="text-sm font-semibold text-gray-800">
                          No notifications yet
                        </p>

                        <p className="mt-1 max-w-[240px] text-xs leading-5 text-gray-400">
                          When someone likes,
                          comments, or replies to
                          your posts, you'll see it
                          here.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map(
                          (notification) => {
                            const actorImage =
                              getProfileImageUrl(
                                notification
                                  .actor
                                  ?.profileImage,
                              );

                            const actorName =
                              notification.actor
                                ?.name ||
                              'Someone';

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
                                className={`group flex w-full gap-3 px-4 py-3.5 text-left transition ${
                                  notification.isRead
                                    ? 'bg-white hover:bg-gray-50'
                                    : 'bg-blue-50/60 hover:bg-blue-50'
                                }`}
                              >
                                {/* Actor Avatar */}

                                <div className="relative shrink-0">
                                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-blue-600 ring-2 ring-white">
                                    {actorImage ? (
                                      <img
                                        src={
                                          actorImage
                                        }
                                        alt={
                                          actorName
                                        }
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      actorName
                                        .charAt(
                                          0,
                                        )
                                        .toUpperCase()
                                    )}
                                  </div>

                                  {/* Notification Type Icon */}

                                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                                    {notification.type
                                      .toUpperCase()
                                      .includes(
                                        'LIKE',
                                      ) ? (
                                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                                    ) : notification.type
                                        .toUpperCase()
                                        .includes(
                                          'REPLY',
                                        ) ? (
                                      <Reply className="h-3 w-3 text-purple-500" />
                                    ) : notification.type
                                        .toUpperCase()
                                        .includes(
                                          'COMMENT',
                                        ) ? (
                                      <MessageCircle className="h-3 w-3 text-blue-500" />
                                    ) : (
                                      <Bell className="h-3 w-3 text-gray-500" />
                                    )}
                                  </div>
                                </div>

                                {/* Notification Content */}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={`text-sm leading-5 ${
                                        notification.isRead
                                          ? 'text-gray-700'
                                          : 'font-medium text-gray-900'
                                      }`}
                                    >
                                      <span className="font-bold text-gray-900">
                                        {
                                          actorName
                                        }
                                      </span>{' '}
                                      {
                                        notification.message
                                      }
                                    </p>

                                    {/* Unread Dot */}

                                    {!notification.isRead && (
                                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                    )}
                                  </div>

                                  {/* Related Post */}

                                  {notification.post
                                    ?.title && (
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                      <span className="shrink-0 text-[10px] text-gray-400">
                                        Post
                                      </span>

                                      <p className="min-w-0 truncate rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                                        {
                                          notification
                                            .post
                                            .title
                                        }
                                      </p>
                                    </div>
                                  )}

                                  {/* Time */}

                                  <p className="mt-1 text-[11px] text-gray-400">
                                    {formatNotificationTime(
                                      notification.createdAt,
                                    )}
                                  </p>
                                </div>
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}

                  {notifications.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-2.5 text-center">
                      <p className="text-[11px] text-gray-400">
                        Click a notification to view
                        the related post
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====================================== */}
          {/* DESKTOP USER */}
          {/* ====================================== */}

          {currentUser ? (
            <>
              <Link
                href={`/profile/${currentUser.id}`}
                className="hidden items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:flex"
              >
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

                <span className="max-w-[100px] truncate">
                  {currentUser.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:block"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="hidden rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:block"
              >
                Register
              </Link>
            </>
          )}

          {/* ====================================== */}
          {/* MOBILE MENU BUTTON */}
          {/* ====================================== */}

          <button
            type="button"
            onClick={() =>
              setShowMobileMenu(
                (previous) =>
                  !previous,
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:hidden"
            aria-label="Open menu"
          >
            {showMobileMenu
              ? '✕'
              : '☰'}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE MENU */}
      {/* ========================================== */}

      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="border-t border-gray-100 bg-white px-4 pb-4 pt-3 shadow-sm sm:hidden"
        >
          {/* Mobile Navigation */}

          <div className="space-y-1">

            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <span>🏠</span>
              Home
            </Link>

            {currentUser ? (
              <>
                <Link
                  href={`/profile/${currentUser.id}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-600">
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

                  <span className="truncate">
                    {currentUser.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <span>↪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  <span>→</span>
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  <span>＋</span>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MOBILE SEARCH */}
      {/* ========================================== */}

      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 md:hidden">
        <div
          ref={mobileSearchRef}
          className="relative"
        >
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
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />

          {searching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-500">
              Searching...
            </span>
          )}

          {/* Mobile Search Results */}

          {showResults && (
            <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
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
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-blue-50"
                      >
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

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
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
                  <div className="p-6 text-center">
                    <div className="text-2xl">
                      🔍
                    </div>

                    <p className="mt-2 text-sm font-semibold text-gray-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try another name.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}