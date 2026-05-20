import { type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

const DOC_LINKS = [
  { to: '/docs/getting-started', label: 'Getting Started' },
  { to: '/docs/cloud-save', label: 'Cloud Save' },
  { to: '/docs/tutorials/first-track', label: 'Your First Track' },
]

interface DocLayoutProps {
  children: ReactNode
}

export function DocLayout({ children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Doc sidebar */}
      <aside
        style={{ borderRight: '0.5px solid var(--border)', width: 220 }}
        className="flex-shrink-0 py-8 px-5"
      >
        <Link
          to="/dashboard/projects"
          className="font-vt323 text-[22px] leading-none text-[#111]"
          style={{ fontFamily: 'var(--font-vt323)' }}
        >
          modecat_
        </Link>
        <p style={{ fontSize: 11, color: '#aaa', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          docs
        </p>

        <nav className="mt-6 flex flex-col gap-0.5">
          {DOC_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded px-2 py-1.5 text-[13px] text-[#555] hover:bg-[#f5f5f5] hover:text-[#111]"
              activeProps={{ className: 'bg-[#f0f0f0] text-[#111] font-medium' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Doc content */}
      <main className="flex-1 px-12 py-10">
        <div
          className="prose max-w-2xl"
          style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.7, color: '#222' }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
