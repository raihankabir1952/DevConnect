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
          throw new Error('Failed to search users');
        }

        const data: User[] = await response.json();

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

  // Close dropdown when clicking outside
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
          className="w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
        />
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {loading && (
            <div className="px-4 py-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}

          {!loading &&
            users.length === 0 && (
              <div className="px-4 py-4 text-center text-sm text-gray-500">
                No users found
              </div>
            )}

          {!loading &&
            users.length > 0 && (
              <div className="max-h-72 overflow-y-auto py-2">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    onClick={() => {
                      setShowResults(false);
                      setSearch('');
                    }}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Name */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        View profile
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}