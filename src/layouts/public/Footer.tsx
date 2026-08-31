export default function Footer() {
  // Menu items
  const menuItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Nos services', href: '/services' },
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  // Liens légaux
  const legalItems = [
    { label: 'Conditions d\'utilisation', href: '/terms' },
    { label: 'Politique de confidentialité', href: '/privacy' },
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

        {/* Séparateur */}
        <div className="border-t border-gray-100 mt-6 pt-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
            {legalItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-400 hover:text-primary text-xs transition-colors"
              >
                {item.label}
              </a>
            ))}
            <span className="text-gray-300 text-xs hidden sm:inline">•</span>
            <p className="text-gray-400 text-xs">
              Propulsé par <span className="font-medium">Cabukaka</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}