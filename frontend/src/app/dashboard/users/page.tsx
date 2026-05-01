'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, UserCircle, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface UserForm { name: string; email: string; password: string; role: string }

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({ defaultValues: { role: 'editor' } })

  const fetchUsers = async () => {
    const res = await api.get('/users')
    setUsers(res.data)
  }

  useEffect(() => { fetchUsers() }, [])

  const onSubmit = async (data: UserForm) => {
    setLoading(true)
    try {
      await api.post('/users', data)
      toast.success('User created')
      reset(); setShowForm(false)
      fetchUsers()
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to create user') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted')
      fetchUsers()
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to delete') }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} users</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">New User</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="John Doe" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="john@example.com" {...register('email', { required: true })} />
            </div>
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" placeholder="Min 8 characters" {...register('password', { required: true })} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" {...register('role')}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role === 'admin' && <Shield className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(user.id, user.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
