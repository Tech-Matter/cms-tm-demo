'use client'
import { useRouter } from 'next/navigation'
import PostEditor from '@/components/PostEditor'

export default function NewPostPage() {
  const router = useRouter()
  return <PostEditor onSuccess={() => router.push('/dashboard/posts')} />
}
