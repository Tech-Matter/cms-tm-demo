'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { FileText, File, Image, Users, Eye, Plus } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalPages: number
  totalMedia: number
  totalUsers: number
  totalCategories: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const user = getUser()

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats(res.data.stats)
      setRecentPosts(res.data.recentPosts)
    }).catch(console.error)
  }, [])

  const cards = stats ? [
    { label: 'Total Posts', value: stats.totalPosts, sub: `${stats.publishedPosts} published · ${stats.draftPosts} drafts`, icon: FileText, color: 'bg-blue-500', href: '/dashboard/posts' },
    { label: 'Pages', value: stats.totalPages, sub: 'Total pages', icon: File, color: 'bg-purple-500', href: '/dashboard/pages' },
    { label: 'Media Files', value: stats.totalMedia, sub: 'Uploaded files', icon: Image, color: 'bg-green-500', href: '/dashboard/media' },
    { label: 'Team Members', value: stats.totalUsers, sub: 'Active users', icon: Users, color: 'bg-orange-500', href: '/dashboard/users' },
  ] : []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your content today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats ? cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <Eye className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </Link>
          )
        }) : [1,2,3,4].map(i => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Posts</h2>
          <Link href="/dashboard/posts/new" className="btn-primary text-xs py-1.5">
            <Plus className="w-3.5 h-3.5" /> New Post
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentPosts.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No posts yet</div>
          )}
          {recentPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">By {post.author_name} · {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={post.status === 'published' ? 'badge-published' : 'badge-draft'}>
                  {post.status}
                </span>
                <Link href={`/dashboard/posts/${post.id}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
