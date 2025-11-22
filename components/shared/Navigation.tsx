'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              Tambalin
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors ${
                pathname === '/search'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Cari Bengkel
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              Tentang
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-red-600 focus:outline-none"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
