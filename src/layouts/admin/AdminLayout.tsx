import { ReactNode, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { 
  Home, 
  Package, 
  Users, 
  ShoppingBag,
  Menu,
  X,
  LogOut,
  ChevronRight
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

const menuItems = [
  { path: "overview", label: "Tableau de bord", icon: <Home className="h-5 w-5" /> },
  { path: "orders", label: "Commandes", icon: <ShoppingBag className="h-5 w-5" /> },
  { path: "offres", label: "Offres", icon: <Package className="h-5 w-5" /> },
  { path: "vendeurs", label: "Vendeurs", icon: <Users className="h-5 w-5" /> },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavigate = (path: string) => {
    navigate(`/admin/${path}`)
    setSidebarOpen(false)
  }

  const currentPath = location.pathname.replace('/admin/', '')

  const handleLogout = () => {
    // Logique de déconnexion
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pour mobile */}
      <header className="sticky top-0 z-50 bg-white border-b lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                  <span className="font-bold text-gray-900">Admin</span>
                </div>
              </div>

              {/* Menu */}
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition ${
                        currentPath === item.path
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {currentPath === item.path && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-white">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              <span className="font-bold text-gray-900">Admin</span>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition ${
                    currentPath === item.path
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {currentPath === item.path && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="lg:pl-64 flex-1">
          {/* Header desktop */}
          <header className="hidden lg:block bg-white border-b">
            <div className="px-8 py-4">
              <h1 className="text-xl font-bold text-gray-900">
                {menuItems.find(item => item.path === currentPath)?.label || "Tableau de bord"}
              </h1>
            </div>
          </header>

          {/* Contenu */}
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}