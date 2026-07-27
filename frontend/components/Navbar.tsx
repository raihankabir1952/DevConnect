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
  // SEARCH REF
  // ==========================================

  const searchRef =
    useRef<HTMLDivElement>(null);

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
        // This gets latest profileImage
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
  // CLOSE SEARCH RESULT
  // CLICK OUTSIDE
  // ==========================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node,
        )
      ) {
        setShowResults(false);
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
  // LOGOUT
  // ==========================================

  function handleLogout() {
    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem('user');

    setCurrentUser(null);

    window.location.href = '/login';
  }

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

        <div className="flex items-center gap-3">

          {/* Home */}

          <Link
            href="/"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-blue-600 sm:block"
          >
            Home
          </Link>

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