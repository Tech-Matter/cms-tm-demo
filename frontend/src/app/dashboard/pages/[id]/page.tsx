'use client'
import { useRouter } from 'next/navigation'
import PageEditor from '@/components/PageEditor'

export default function EditPagePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  return <PageEditor pageId={params.id} onSuccess={() => router.push('/dashboard/pages')} />
}
