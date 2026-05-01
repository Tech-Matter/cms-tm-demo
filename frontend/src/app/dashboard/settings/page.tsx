'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Save, Globe, FileText, Users } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {}).finally(() => setFetching(false))
  }, [])

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.put('/settings', settings)
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save settings') }
    finally { setLoading(false) }
  }

  if (fetching) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your site configuration</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900">General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Site Name</label>
              <input className="input" value={settings.site_name || ''} onChange={e => set('site_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Site Description</label>
              <textarea className="input resize-none" rows={2} value={settings.site_description || ''} onChange={e => set('site_description', e.target.value)} />
            </div>
            <div>
              <label className="label">Site URL</label>
              <input className="input" type="url" value={settings.site_url || ''} onChange={e => set('site_url', e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Content</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Posts per page</label>
              <input className="input w-32" type="number" min={1} max={100} value={settings.posts_per_page || '10'}
                onChange={e => set('posts_per_page', e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Allow Comments</p>
                <p className="text-xs text-gray-500 mt-0.5">Enable comments on posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer"
                  checked={settings.allow_comments === 'true'}
                  onChange={e => set('allow_comments', e.target.checked ? 'true' : 'false')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
