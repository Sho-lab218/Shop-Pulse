'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-900">Name</label>
          <p className="text-lg text-gray-900">{session.user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900">Email</label>
          <p className="text-lg text-gray-900">{session.user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900">Role</label>
          <p className="text-lg capitalize">{session.user.role}</p>
        </div>
        <div className="pt-4 border-t">
          <Link
            href="/orders"
            className="text-blue-600 hover:underline font-medium"
          >
            View Order History →
          </Link>
        </div>
      </div>
    </div>
  )
}

