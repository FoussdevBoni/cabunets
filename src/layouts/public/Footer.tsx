

export default function Footer() {


  // Menu items
  const menuItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Nos services', href: '/services' },
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]




  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto opacity-80"
            />
          </div>

          {/* Liens footer */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-primary text-sm transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}