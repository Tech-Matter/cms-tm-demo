'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit, Check, X, FolderOpen } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const fetchCategories = async () => {
    const res = await api.get('/categories')
    setCategories(res.data)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.post('/categories', { name, description })
      toast.success('Category created')
      setName(''); setDescription('')
      fetchCategories()
    } catch { toast.error('Failed to create') }
    finally { setLoading(false) }
  }

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/categories/${id}`, { name: editing.name, description: editing.description })
      toast.success('Category updated')
      setEditing(null)
      fetchCategories()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Deleted')
      fetchCategories()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-0.5">Organize your posts by category</p>
      </div>

      {/* Create */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Add New Category</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="Category name" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Optional description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button onClick={handleCreate} disabled={loading || !name.trim()} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No categories yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map(cat => (
              <div key={cat.id} className="px-5 py-4 flex items-center gap-3">
                {editing?.id === cat.id ? (
                  <div className="flex-1 flex gap-2">
                    <input className="input flex-1" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                    <input className="input flex-1" value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Description" />
                    <button onClick={() => handleUpdate(cat.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditing(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">{cat.slug}</span>
                    <button onClick={() => setEditing(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
