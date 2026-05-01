'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface PageForm {
  title: string
  content: string
  status: string
  featured_image: string
  meta_title: string
  meta_description: string
}

interface Props {
  pageId?: string
  onSuccess: () => void
}

export default function PageEditor({ pageId, onSuccess }: Props) {
  const isEdit = !!pageId
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PageForm>({ defaultValues: { status: 'draft' } })

  useEffect(() => {
    if (isEdit) {
      api.get(`/pages/${pageId}`).then(r => reset({
        title: r.data.title,
        content: r.data.content || '',
        status: r.data.status,
        featured_image: r.data.featured_image || '',
        meta_title: r.data.meta_title || '',
        meta_description: r.data.meta_description || '',
      })).catch(() => toast.error('Failed to load page')).finally(() => setFetching(false))
    }
  }, [pageId, isEdit, reset])

  const onSubmit = async (data: PageForm) => {
    setLoading(true)
    try {
      if (isEdit) await api.put(`/pages/${pageId}`, data)
      else await api.post('/pages', data)
      toast.success(isEdit ? 'Page updated!' : 'Page created!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setLoading(false) }
  }

  if (fetching) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/pages" className="btn-secondary py-2 px-3"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Page' : 'New Page'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-6">
          <div className="flex-1 space-y-5">
            <div className="card p-6 space-y-5">
              <div>
                <label className="label">Title *</label>
                <input className={`input text-lg font-medium ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Page title..." {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Content</label>
                <textarea className="input min-h-[500px] font-mono text-sm resize-y"
                  placeholder="Page content (Markdown supported)..." {...register('content')} />
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">SEO Settings</h3>
              <div>
                <label className="label">Meta Title</label>
                <input className="input" placeholder="SEO title..." {...register('meta_title')} />
              </div>
              <div>
                <label className="label">Meta Description</label>
                <textarea className="input resize-none" rows={2} placeholder="SEO description..." {...register('meta_description')} />
              </div>
            </div>
          </div>

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
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Page'}
              </button>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Featured Image</h3>
              <input className="input" placeholder="https://..." {...register('featured_image')} />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
