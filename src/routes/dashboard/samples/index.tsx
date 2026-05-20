import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/dashboard/samples/')({
  component: SamplesPage,
})

function SamplesPage() {
  // TODO: implement sample library (post-MVP)
  return (
    <AuthGuard>
      <div className="p-6">
        <p className="font-mono text-sm text-gray-400">Sample library — coming soon</p>
      </div>
    </AuthGuard>
  )
}
