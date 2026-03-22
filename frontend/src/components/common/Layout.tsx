import { Outlet, NavLink } from 'react-router-dom'
import { FiHome, FiList, FiFolder, FiBarChart2 } from 'react-icons/fi'

const navItems = [
  { to: '/', icon: FiHome, label: 'Dashboard' },
  { to: '/tasks', icon: FiList, label: 'Tasks' },
  { to: '/files', icon: FiFolder, label: 'Files' },
  { to: '/stats', icon: FiBarChart2, label: 'Stats' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Mission Panel</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <aside className="w-16 md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <nav className="p-2 md:p-4">
            <ul className="space-y-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
