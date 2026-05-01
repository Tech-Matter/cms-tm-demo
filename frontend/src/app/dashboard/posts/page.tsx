'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/posts', { params: { search, status, page, limit } })
      setPosts(res.data.posts)
      setTotal(res.data.total)
    } catch { toast.error('Failed to load posts') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [search, status, page])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await api.delete(`/posts/${id}`)
      toast.success('Post deleted')
      fetchPosts()
    } catch { toast.error('Failed to delete') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total posts</p>
        </div>
        <Link href="/dashboard/posts/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="input flex-1" placeholder="Search posts..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Author</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
            )}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No posts found</td></tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">/posts/{post.slug}</p>
                </td>
                <td className="px-6 py-4 text-gray-500">{post.author_name}</td>
                <td className="px-6 py-4">
                  <span className={post.status === 'published' ? 'badge-published' : post.status === 'archived' ? 'badge-archived' : 'badge-draft'}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/dashboard/posts/${post.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(post.id, post.title)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button className="btn-secondary py-1.5 px-3 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn-secondary py-1.5 px-3 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
