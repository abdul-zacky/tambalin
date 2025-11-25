'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { useState, useEffect, useRef } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileMenu]);

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-[#274b76]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Tambalin Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="text-2xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent">
                Tambalin
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-all duration-300 ${
                pathname === '/'
                  ? 'text-[#274b76] font-semibold'
                  : 'text-[#274b76]/70 hover:text-[#274b76]'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-all duration-300 ${
                pathname === '/search'
                  ? 'text-[#274b76] font-semibold'
                  : 'text-[#274b76]/70 hover:text-[#274b76]'
              }`}
            >
              Cari Bengkel
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-[#274b76]/70 hover:text-[#274b76] transition-all duration-300"
            >
              Tentang
            </Link>

            {/* Auth Section */}
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#274b76]/70 hover:text-[#274b76] transition-all duration-300"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-linear-to-r from-[#274b76] to-[#3d6ba8] text-white text-sm font-medium rounded-xl hover:from-[#1e3a5f] hover:to-[#274b76] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Daftar
                </Link>
              </div>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#274b76]/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-[#274b76] to-[#3d6ba8] rounded-full flex items-center justify-center text-white font-semibold">
                    {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-[#274b76]">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#274b76] transition-transform duration-200 ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-[#274b76]/10 py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#274b76]/10">
                      <p className="text-sm font-medium text-[#274b76]">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-[#274b76]/60 mt-1">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-[#274b76]/70 hover:bg-[#274b76]/5 hover:text-[#274b76] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-[#274b76]/70 hover:bg-[#274b76]/5 hover:text-[#274b76] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Pengaturan
                    </Link>
                    <div className="border-t border-[#274b76]/10 mt-2 pt-2">
                      <button
                        onClick={() => {
                          signOut();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-[#274b76]/70 hover:text-[#274b76] focus:outline-none transition-colors"
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
