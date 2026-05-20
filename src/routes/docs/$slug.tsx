import { createFileRoute } from '@tanstack/react-router'
import { DocLayout } from '@/components/docs/DocLayout'

export const Route = createFileRoute('/docs/$slug')({
  component: DocPage,
})

function DocPage() {
  const { slug } = Route.useParams()
  // TODO: dynamically import docs-content/${slug}.mdx and render through DocLayout
  return (
    <DocLayout>
      <p className="font-mono text-sm text-gray-400">Doc: {slug} — coming soon</p>
    </DocLayout>
  )
}
