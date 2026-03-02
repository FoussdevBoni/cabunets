import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserPlus,
  Menu,
  X,
  User,
  Home,
  Package,
  Users,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Settings
} from 'lucide-react'
import { useAuth } from '../../hooks/auth/useAuth'

export default function Navbar() {
  const { user, logout  } = useAuth() 
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const menuItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Nos services', href: '/services' },
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  // Menu dropdown pour utilisateur connecté
  const userMenuItems = [
    {
      label: 'Tableau de bord',
      href: user?.role === 'admin' ? '/admin/overview' : '/vendeur/overview',
      icon: <Home className="h-4 w-4" />
    },
    {
      label: 'Commandes',
      href: user?.role === 'admin' ? '/admin/orders' : '/vendeur/orders',
      icon: <ShoppingBag className="h-4 w-4" />
    },
    {
      label: 'Offres',
      href: user?.role === 'admin' ? '/admin/offres' : '/vendeur/offres',
      icon: <Package className="h-4 w-4" />
    },
    ...(user?.role === 'admin' ? [{
      label: 'Vendeurs',
      href: '/admin/vendeurs',
      icon: <Users className="h-4 w-4" />
    }] : []),
    { type: 'separator' },
    {
      label: 'Mon profil',
      href: '/vendeur/profile',
      icon: <Settings className="h-4 w-4" />
    },
    {
      label: 'Se déconnecter',
      action: () => {
        logout()
        navigate('/')
        setIsDropdownOpen(false)
      },
      icon: <LogOut className="h-4 w-4" />
    }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions côté droit */}
          <div className="flex items-center gap-4">
            {user ? (
              // Dropdown utilisateur connecté
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors group"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium">{user.username || 'Profile'}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <>
                    {/* Overlay */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border shadow-lg z-50 py-2">
                      {/* En-tête */}
                      <div className="px-4 py-3 border-b">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      
                      {/* Items */}
                      <div className="py-2">
                        {userMenuItems.map((item, index) => {
                          if (item.type === 'separator') {
                            return <div key={index} className="border-t my-2" />
                          }
                          
                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                if (item.action) {
                                  item.action()
                                } else if (item.href) {
                                  navigate(item.href)
                                  setIsDropdownOpen(false)
                                }
                              }}
                              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition text-sm"
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Si utilisateur non connecté
              <button
                onClick={() => navigate('/vendeur/register')}
                className="hidden sm:inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200"
              >
                <UserPlus className="h-4 w-4" />
                Devenir vendeur
              </button>
            )}

            {/* Bouton mobile */}
            {!user && (
              <button
                onClick={() => navigate('/vendeur/register')}
                className="sm:hidden bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition"
              >
                <UserPlus className="h-5 w-5" />
              </button>
            )}

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 pt-4 pb-6">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-primary font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              
              {user ? (
                // Menu utilisateur mobile
                <>
                  <div className="border-t pt-4">
                    <div className="text-xs text-gray-500 font-medium px-4 mb-2">Mon compte</div>
                    {userMenuItems.map((item) => {
                      if (item.type === 'separator') {
                        return null // On cache les séparateurs en mobile
                      }
                      
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            if (item.action) {
                              item.action()
                            } else if (item.href) {
                              navigate(item.href)
                              setIsMenuOpen(false)
                            }
                          }}
                          className="flex items-center gap-3 w-full text-gray-700 hover:text-primary font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition text-left"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/vendeur/register')
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  <UserPlus className="h-5 w-5" />
                  Devenir vendeur
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}