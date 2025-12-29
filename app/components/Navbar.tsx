'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ShopPulse
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/shop" className="text-gray-900 hover:text-blue-600 px-3 py-2 font-medium">
                Shop
              </Link>
              {session?.user?.role === 'admin' && (
                <Link href="/admin" className="text-gray-900 hover:text-blue-600 px-3 py-2 font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="text-gray-900 hover:text-blue-600">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            {session ? (
              <>
                <Link href="/account" className="text-gray-900 hover:text-blue-600">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-900 hover:text-blue-600"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="text-gray-900 hover:text-blue-600 px-4 py-2 font-medium">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

