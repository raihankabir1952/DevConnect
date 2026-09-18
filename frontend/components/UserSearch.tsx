'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
}

export default function UserSearch() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // SEARCH USERS
  // ==========================================

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setUsers([]);
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:3000/users?search=${encodeURIComponent(
            search,
          )}`,
        );

        if (!response.ok) {
          throw new Error(
            'Failed to search users',
          );
        }

        const data: User[] =
          await response.json();

        setUsers(data);
        setShowResults(true);
      } catch (error) {
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // ==========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
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

  return (
    <div
      ref={searchRef}
      className="relative hidden w-80 md:block"
    >
      {/* ================================= */}
      {/* SEARCH INPUT */}
      {/* ================================= */}

      <div className="relative">
        {/* Search Icon */}

        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors">
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
          className="h-11 w-full rounded-full border border-gray-200 bg-gray-100/80 pl-11 pr-10 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
        />

        {/* Clear Button */}

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setUsers([]);
              setShowResults(false);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* ================================= */}
      {/* SEARCH RESULTS */}
      {/* ================================= */}

      {showResults && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Dropdown Header */}

          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Developers
            </p>
          </div>

          {/* Loading */}

          {loading && (
            <div className="flex items-center gap-3 px-4 py-5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          )}

          {/* No Results */}

          {!loading &&
            users.length === 0 && (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                  🔍
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-800">
                  No developers found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try searching with another name.
                </p>
              </div>
            )}

          {/* Results */}

          {!loading &&
            users.length > 0 && (
              <div className="max-h-80 overflow-y-auto py-2">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    onClick={() => {
                      setShowResults(false);
                      setSearch('');
                    }}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-blue-50/60"
                  >
                    {/* Avatar */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* User Info */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                        {user.name}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        View developer profile
                      </p>
                    </div>

                    {/* Arrow */}

                    <span className="text-sm text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-500">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}