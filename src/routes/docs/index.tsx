import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/')({
  component: DocsIndexPage,
})

function DocsIndexPage() {
  // TODO: render docs landing page / table of contents
  return (
    <div className="p-6">
      <p className="font-mono text-sm text-gray-400">Docs index — coming soon</p>
    </div>
  )
}
