'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await api.get('/pages', { params: { search } })
      setPages(res.data.pages)
      setTotal(res.data.total)
    } catch { toast.error('Failed to load pages') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPages() }, [search])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await api.delete(`/pages/${id}`)
      toast.success('Page deleted')
      fetchPages()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total pages</p>
        </div>
        <Link href="/dashboard/pages/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Page
        </Link>
      </div>

      <div className="card p-4 mb-6 flex gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="input flex-1" placeholder="Search pages..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>}
            {!loading && pages.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No pages found</td></tr>}
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{page.title}</p>
                  <p className="text-xs text-gray-400">/{page.slug}</p>
                </td>
                <td className="px-6 py-4 text-gray-500">{page.author_name}</td>
                <td className="px-6 py-4">
                  <span className={page.status === 'published' ? 'badge-published' : 'badge-draft'}>{page.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(page.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/dashboard/pages/${page.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => handleDelete(page.id, page.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
