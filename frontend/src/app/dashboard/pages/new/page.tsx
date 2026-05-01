'use client'
import { useRouter } from 'next/navigation'
import PageEditor from '@/components/PageEditor'

export default function NewPagePage() {
  const router = useRouter()
  return <PageEditor onSuccess={() => router.push('/dashboard/pages')} />
}
