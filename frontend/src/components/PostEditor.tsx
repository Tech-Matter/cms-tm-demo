'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

interface PostForm {
  title: string
  content: string
  excerpt: string
  status: string
  featured_image: string
  meta_title: string
  meta_description: string
  category_id: string
}

interface Props {
  postId?: string
  onSuccess: () => void
}

export default function PostEditor({ postId, onSuccess }: Props) {
  const isEdit = !!postId
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [categories, setCategories] = useState<any[]>([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostForm>({
    defaultValues: { status: 'draft' }
  })

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    if (isEdit) {
      api.get(`/posts/${postId}`).then(r => {
        reset({
          title: r.data.title,
          content: r.data.content || '',
          excerpt: r.data.excerpt || '',
          status: r.data.status,
          featured_image: r.data.featured_image || '',
          meta_title: r.data.meta_title || '',
          meta_description: r.data.meta_description || '',
          category_id: r.data.category_id || '',
        })
      }).catch(() => toast.error('Failed to load post')).finally(() => setFetching(false))
    }
  }, [postId, isEdit, reset])

  const onSubmit = async (data: PostForm) => {
    setLoading(true)
    try {
      if (isEdit) await api.put(`/posts/${postId}`, data)
      else await api.post('/posts', data)
      toast.success(isEdit ? 'Post updated!' : 'Post created!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setLoading(false) }
  }

  if (fetching) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/posts" className="btn-secondary py-2 px-3">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-6">
          {/* Main */}
          <div className="flex-1 space-y-5">
            <div className="card p-6 space-y-5">
              <div>
                <label className="label">Title *</label>
                <input className={`input text-lg font-medium ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter post title..." {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Content</label>
                <textarea className="input min-h-[400px] font-mono text-sm resize-y"
                  placeholder="Write your post content here (Markdown supported)..."
                  {...register('content')} />
              </div>
              <div>
                <label className="label">Excerpt</label>
                <textarea className="input min-h-[80px] resize-y" placeholder="Brief summary of the post..."
                  {...register('excerpt')} />
              </div>
            </div>

            {/* SEO */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">SEO Settings</h3>
              <div>
                <label className="label">Meta Title</label>
                <input className="input" placeholder="SEO title (defaults to post title)" {...register('meta_title')} />
              </div>
              <div>
                <label className="label">Meta Description</label>
                <textarea className="input resize-none" rows={2} placeholder="SEO description..." {...register('meta_description')} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 space-y-5">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Publish</h3>
              <div>
                <label className="label">Status</label>
                <select className="input" {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" {...register('category_id')}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Featured Image</h3>
              <div>
                <label className="label">Image URL</label>
                <input className="input" placeholder="https://..." {...register('featured_image')} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
