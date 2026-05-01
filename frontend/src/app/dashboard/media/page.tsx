'use client'
import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Upload, Trash2, Search, Image as ImageIcon, Copy, Check } from 'lucide-react'

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await api.get('/media', { params: { search } })
      setMedia(res.data.media)
      setTotal(res.data.total)
    } catch { toast.error('Failed to load media') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMedia() }, [search])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      try {
        await api.post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(`${file.name} uploaded`)
      } catch { toast.error(`Failed to upload ${file.name}`) }
    }
    setUploading(false)
    fetchMedia()
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/media/${id}`)
      toast.success('File deleted')
      fetchMedia()
    } catch { toast.error('Failed to delete') }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`${API_URL}${url}`)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} files</p>
        </div>
        <div>
          <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*,application/pdf" multiple className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary">
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      <div className="card p-4 mb-6 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="input flex-1" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Drop Zone hint */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 mb-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => fileRef.current?.click()}>
        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Click to upload images, PDFs (max 10MB each)</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No media files yet</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group card overflow-hidden">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {item.mime_type?.startsWith('image/') ? (
                  <img src={`${API_URL}${item.url}`} alt={item.alt_text || item.original_name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(item.url)}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                    {copied === item.url ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(item.id, item.original_name)}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-700 truncate font-medium">{item.original_name}</p>
                <p className="text-xs text-gray-400">{(item.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
