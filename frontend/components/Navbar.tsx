"use client";

import Link from "next/link";
import {
  Bell,
  BellOff,
  Heart,
  MessageCircle,
  Reply,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

import { getImageUrl } from "@/lib/api";

// ==========================================
// API URL
// ==========================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

// ==========================================
// TYPES
// ==========================================

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

// ==========================================
// NAVBAR
// ==========================================

export default function Navbar() {
  // ========================================
  // USER
  // ========================================

  const [currentUser, setCurrentUser] =
    useState<LoggedInUser | null>(null);

  // ========================================
  // SEARCH
  // ========================================

  const [search, setSearch] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<User[]>([]);

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  // ========================================
  // NOTIFICATIONS
  // ========================================

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  // ========================================
  // WEBSOCKET
  // ========================================

  const [socketConnected, setSocketConnected] =
    useState(false);

  // ========================================
  // MOBILE MENU
  // ========================================

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ========================================
  // REFS
  // ========================================

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const searchRef =
    useRef<HTMLDivElement>(null);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      setCurrentUser(null);
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

      setCurrentUser(parsedUser);

      // ======================================
      // REFRESH USER DATA
      // ======================================

      fetch(
        `${API_URL}/users/${parsedUser.id}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Failed to fetch user",
            );
          }

          return response.json();
        })
        .then((user) => {
          setCurrentUser(user);

          localStorage.setItem(
            "user",
            JSON.stringify(user),
          );
        })
        .catch((error) => {
          console.error(
            "Failed to refresh user:",
            error,
          );
        });
    } catch (error) {
      console.error(
        "Invalid user data:",
        error,
      );

      localStorage.removeItem("user");
      setCurrentUser(null);
    }
  }, []);

  // ==========================================
  // WEBSOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    if (!currentUser) {
      setSocketConnected(false);
      return;
    }

    // ========================================
    // CREATE SOCKET CONNECTION
    // ========================================

    const socket = io(API_URL);

    // ========================================
    // SOCKET CONNECTED
    // ========================================

    socket.on("connect", () => {
      console.log(
        "WebSocket connected:",
        socket.id,
      );

      setSocketConnected(true);

      // ======================================
      // REGISTER CURRENT USER
      // ======================================

      socket.emit("register", {
        userId: currentUser.id,
      });

      console.log(
        "User registered:",
        currentUser.id,
      );
    });

    // ========================================
    // REGISTRATION CONFIRMATION
    // ========================================

    socket.on(
      "registered",
      (data) => {
        console.log(
          "WebSocket registration:",
          data,
        );
      },
    );

    // ========================================
    // NEW REAL-TIME NOTIFICATION
    // ========================================

    socket.on(
      "newNotification",
      (notification: Notification) => {
        console.log(
          "New notification received:",
          notification,
        );

        setNotifications(
          (previousNotifications) => [
            notification,
            ...previousNotifications,
          ],
        );
      },
    );

    // ========================================
    // SOCKET DISCONNECTED
    // ========================================

    socket.on("disconnect", () => {
      console.log(
        "WebSocket disconnected",
      );

      setSocketConnected(false);
    });

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      socket.disconnect();

      setSocketConnected(false);
    };
  }, [currentUser]);

  // ==========================================
  // FETCH NOTIFICATIONS
  // INITIAL LOAD ONLY
  // ==========================================

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchNotifications =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/notifications`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken",
                  )}`,
                },
              },
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          setNotifications(data);
        } catch (error) {
          console.error(
            "Failed to fetch notifications:",
            error,
          );
        }
      };

    // ========================================
    // LOAD EXISTING NOTIFICATIONS
    // ========================================

    fetchNotifications();
  }, [currentUser]);

  // ==========================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target,
        )
      ) {
        setShowNotifications(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          target,
        )
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // ==========================================
  // SEARCH USERS
  // ==========================================

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeout =
      setTimeout(async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/users/search?q=${encodeURIComponent(
                search,
              )}`,
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          setSearchResults(data);
          setShowSearchResults(true);
        } catch (error) {
          console.error(
            "Search failed:",
            error,
          );
        }
      }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  // ==========================================
  // MARK NOTIFICATION AS READ
  // ==========================================

  const markNotificationAsRead =
    async (
      notificationId: number,
    ) => {
      try {
        const response =
          await fetch(
            `${API_URL}/notifications/${notificationId}/read`,
            {
              method: "PATCH",

              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "accessToken",
                )}`,
              },
            },
          );

        if (!response.ok) {
          return;
        }

        setNotifications(
          (previousNotifications) =>
            previousNotifications.map(
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
          "Failed to mark notification as read:",
          error,
        );
      }
    };

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  const markAllAsRead =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/notifications/read-all`,
            {
              method: "PATCH",

              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "accessToken",
                )}`,
              },
            },
          );

        if (!response.ok) {
          return;
        }

        setNotifications(
          (previousNotifications) =>
            previousNotifications.map(
              (notification) => ({
                ...notification,
                isRead: true,
              }),
            ),
        );
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error,
        );
      }
    };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("user");

    localStorage.removeItem(
      "accessToken",
    );

    window.location.href = "/login";
  };

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================

  const getNotificationIcon = (
    type: string,
  ) => {
    if (type === "LIKE") {
      return (
        <Heart
          size={18}
          className="text-red-500"
          fill="currentColor"
        />
      );
    }

    if (type === "COMMENT") {
      return (
        <MessageCircle
          size={18}
          className="text-blue-500"
        />
      );
    }

    if (type === "REPLY") {
      return (
        <Reply
          size={18}
          className="text-green-500"
        />
      );
    }

    return (
      <Bell
        size={18}
        className="text-gray-500"
      />
    );
  };

  // ==========================================
  // RELATIVE TIME
  // ==========================================

  const getRelativeTime = (
    date: string,
  ) => {
    const now =
      new Date().getTime();

    const created =
      new Date(date).getTime();

    const difference =
      Math.floor(
        (now - created) / 1000,
      );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      return `${Math.floor(
        difference / 60,
      )}m ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(
        difference / 3600,
      )}h ago`;
    }

    return `${Math.floor(
      difference / 86400,
    )}d ago`;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* ================================== */}
        {/* LOGO */}
        {/* ================================== */}

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            D
          </div>

          <span className="text-xl font-bold text-gray-900">
            DevConnect
          </span>
        </Link>

        {/* ================================== */}
        {/* DESKTOP SEARCH */}
        {/* ================================== */}

        <div
          ref={searchRef}
          className="relative hidden w-full max-w-md md:block"
        >
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search users..."
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />

          {showSearchResults && (
            <div className="absolute left-0 right-0 top-12 rounded-lg border border-gray-200 bg-white shadow-lg">

              {searchResults.length ===
              0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No users found
                </div>
              ) : (
                searchResults.map(
                  (user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      onClick={() => {
                        setShowSearchResults(
                          false,
                        );

                        setSearch("");
                      }}
                      className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
                    >
                      {getImageUrl(
                        user.profileImage,
                      ) ? (
                        <img
                          src={
                            getImageUrl(
                              user.profileImage,
                            )
                          }
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                          {user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <span className="font-medium text-gray-800">
                        {user.name}
                      </span>
                    </Link>
                  ),
                )
              )}
            </div>
          )}
        </div>

        {/* ================================== */}
        {/* RIGHT SIDE */}
        {/* ================================== */}

        <div className="flex items-center gap-3">

          {/* ================================= */}
          {/* WEBSOCKET STATUS */}
          {/* ================================= */}

          {currentUser && (
            <div
              className={`hidden items-center gap-1 text-xs sm:flex ${
                socketConnected
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />

              {socketConnected
                ? "Online"
                : "Offline"}
            </div>
          )}

          {/* ================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================= */}

          {currentUser && (
            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                onClick={() =>
                  setShowNotifications(
                    (previous) =>
                      !previous,
                  )
                }
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
              >
                <Bell size={21} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <button
                        onClick={
                          markAllAsRead
                        }
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* NOTIFICATIONS */}

                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length ===
                    0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                        <BellOff
                          size={32}
                          className="mb-2 text-gray-300"
                        />

                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (
                          notification,
                        ) => (
                          <button
                            key={
                              notification.id
                            }
                            onClick={() =>
                              markNotificationAsRead(
                                notification.id,
                              )
                            }
                            className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                              !notification.isRead
                                ? "bg-blue-50"
                                : "bg-white"
                            }`}
                          >

                            {/* ACTOR IMAGE */}

                            {getImageUrl(
                              notification
                                .actor
                                ?.profileImage,
                            ) ? (
                              <img
                                src={
                                  getImageUrl(
                                    notification
                                      .actor
                                      ?.profileImage,
                                  )
                                }
                                alt={
                                  notification
                                    .actor
                                    ?.name ||
                                  "User"
                                }
                                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                                {getNotificationIcon(
                                  notification.type,
                                )}
                              </div>
                            )}

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-gray-800">
                                  {notification.message}
                                </p>

                                {!notification.isRead && (
                                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                                )}
                              </div>

                              {notification.post && (
                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {notification
                                    .post
                                    .title}
                                </p>
                              )}

                              <p className="mt-1 text-[11px] text-gray-400">
                                {getRelativeTime(
                                  notification.createdAt,
                                )}
                              </p>
                            </div>
                          </button>
                        ),
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================= */}
          {/* PROFILE */}
          {/* ================================= */}

          {currentUser && (
            <Link
              href={`/profile/${currentUser.id}`}
              className="hidden items-center gap-2 md:flex"
            >
              {getImageUrl(
                currentUser.profileImage,
              ) ? (
                <img
                  src={
                    getImageUrl(
                      currentUser.profileImage,
                    )
                  }
                  alt={currentUser.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                  {currentUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <span className="font-medium text-gray-800">
                {currentUser.name}
              </span>
            </Link>
          )}

          {/* ================================= */}
          {/* LOGOUT */}
          {/* ================================= */}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="hidden rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 md:block"
            >
              Logout
            </button>
          )}

          {/* ================================= */}
          {/* MOBILE MENU */}
          {/* ================================= */}

          <button
            onClick={() =>
              setMobileMenuOpen(
                (previous) =>
                  !previous,
              )
            }
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ==================================== */}
      {/* MOBILE MENU */}
      {/* ==================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">

          {/* MOBILE SEARCH */}

          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search users..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {currentUser && (
            <div className="flex flex-col gap-2">

              <Link
                href={`/profile/${currentUser.id}`}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}