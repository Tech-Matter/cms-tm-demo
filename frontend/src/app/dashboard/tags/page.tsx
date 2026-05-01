'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Tag } from 'lucide-react'

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTags = async () => {
    const res = await api.get('/tags')
    setTags(res.data)
  }

  useEffect(() => { fetchTags() }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.post('/tags', { name })
      toast.success('Tag created')
      setName('')
      fetchTags()
    } catch { toast.error('Failed to create tag') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return
    try {
      await api.delete(`/tags/${id}`)
      toast.success('Tag deleted')
      fetchTags()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tag your posts for better discoverability</p>
      </div>

      {/* Create */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Add New Tag</h3>
        <div className="flex gap-3">
          <input className="input flex-1" placeholder="Tag name" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <button onClick={handleCreate} disabled={loading || !name.trim()} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Tag
          </button>
        </div>
      </div>

      {/* Tags cloud */}
      <div className="card p-5">
        {tags.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No tags yet
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div key={tag.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium group hover:bg-red-50 transition-colors">
                <Tag className="w-3 h-3" />
                {tag.name}
                <button onClick={() => handleDelete(tag.id, tag.name)}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {tags.length > 0 && (
          <p className="text-xs text-gray-400 mt-4">{tags.length} tag{tags.length !== 1 ? 's' : ''} total</p>
        )}
      </div>
    </div>
  )
}
