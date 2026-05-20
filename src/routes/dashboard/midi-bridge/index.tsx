import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/dashboard/midi-bridge/')({
  component: MidiBridgePage,
})

function MidiBridgePage() {
  // TODO: implement MIDI bridge download + config page (post-MVP)
  return (
    <AuthGuard>
      <div className="p-6">
        <p className="font-mono text-sm text-gray-400">MIDI Bridge — coming soon</p>
      </div>
    </AuthGuard>
  )
}
