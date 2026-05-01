'use client'
import { useRouter } from 'next/navigation'
import PostEditor from '@/components/PostEditor'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  return <PostEditor postId={params.id} onSuccess={() => router.push('/dashboard/posts')} />
}
