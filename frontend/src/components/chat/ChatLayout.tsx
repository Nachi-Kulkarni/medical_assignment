import { ReactNode } from 'react'

interface ChatLayoutProps {
  children: ReactNode
  header?: ReactNode
  sidebar?: ReactNode
}

export function ChatLayout({ children, header, sidebar }: ChatLayoutProps) {
  return (
    <div className="flex h-screen bg-nao-light">
      {/* Sidebar */}
      {sidebar && (
        <aside className="w-64 bg-white border-r flex-shrink-0 hidden md:block">
          {sidebar}
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {header && (
          <header className="bg-white border-b flex-shrink-0">
            {header}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
