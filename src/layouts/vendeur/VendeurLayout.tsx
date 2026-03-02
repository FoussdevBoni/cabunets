import { useState, useEffect, useRef } from 'react';
import {
    Home,
    FileText,
    ShoppingBag,
    User,
    Key,
    ChevronDown,
    LogOut
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';

interface NavItem {
    id: string;
    title: string;
    icon: React.ComponentType<any>;
    iconActive: React.ComponentType<any>;
    route: string;
}

interface UserParentLayoutProps {
    children: React.ReactNode;
}

const VendeurLayout = ({ children }: UserParentLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Fonction pour déterminer l'onglet actif basé sur l'URL
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/overview')) return 'overview';
        if (path.includes('/orders')) return 'orders';
        if (path.includes('/offres')) return 'offres';
        return 'dashboard';
    };

    const activeTab = getActiveTab();

    const navItems: NavItem[] = [
        {
            id: 'overview',
            title: 'Accueil',
            icon: Home,
            iconActive: Home,
            route: '/overview'
        },
        {
            id: 'orders',
            title: 'Commandes',
            icon: ShoppingBag,
            iconActive: ShoppingBag,
            route: '/orders'
        },
        {
            id: 'offres',
            title: 'Offres',
            icon: FileText,
            iconActive: FileText,
            route: '/offres'
        },
    ];

    // Détection améliorée de la taille d'écran
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('mobile');
            } else if (width >= 768 && width < 1024) {
                setScreenSize('tablet');
            } else {
                setScreenSize('desktop');
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavClick = (route: string) => {
        setIsMobileMenuOpen(false);
        navigate(`/vendeur${route}`);
    };

    const getInitials = (nom: string) => {
        return `${nom.charAt(0)}`.toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    // Header pour mobile
    const MobileHeader = () => (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                <Link to={"/"} className="flex items-center space-x-3">
                    <img className='h-15 w-auto' src="/logo.png" alt="" />
                </Link>

                <div className="flex items-center space-x-3">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                            <span className="text-white font-semibold text-sm">
                                {getInitials(user?.username || "")}
                            </span>
                        </button>
                        
                        {/* Dropdown Menu Mobile */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            navigate("/vendeur/profile");
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <User className="w-4 h-4 mr-3" />
                                        Modifier profil
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate("/forgot-password");
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <Key className="w-4 h-4 mr-3" />
                                        Changer mot de passe
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Se déconnecter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );

    // Bottom navigation pour mobile
    const BottomNavigation = () => (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComponent = isActive ? item.iconActive : item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.route)}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[60px] ${isActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <IconComponent className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium text-center">{item.title}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );

    // Navigation pour tablette (header + navigation latérale ou horizontale compacte)
    const TabletNavigation = () => (
        <nav className="hidden md:block lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={'/'} className="flex items-center space-x-3 flex-shrink-0">
                        <img className='h-12 w-12' src="/logo.png" alt="" />
                    </Link>

                    {/* Navigation compacte pour tablette */}
                    <div className="flex items-center space-x-1 flex-1 justify-center max-w-2xl">
                        {navItems.map((item) => {
                            const isActive = activeTab === item.id;
                            const IconComponent = isActive ? item.iconActive : item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.route)}
                                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[70px] ${isActive
                                            ? 'text-primary bg-primary/10'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <IconComponent className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium text-center">{item.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {getInitials(user?.username || "")}
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu Tablet */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="py-2">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {user?.username}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Vendeur connecté</p>
                                        </div>
                                        
                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    navigate("/vendeur/profile");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                Modifier profil
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/forgot-password");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Key className="w-4 h-4 mr-3" />
                                                Changer mot de passe
                                            </button>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 my-1"></div>
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Se déconnecter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );

    // Top navigation pour desktop
    const DesktopNavigation = () => (
        <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo et navigation */}
                    <div className="flex items-center space-x-8">
                        <Link to={'/'} className="flex items-center space-x-3 flex-shrink-0">
                            <img className='h-12 w-12' src="/logo.png" alt="" />
                        </Link>

                        {/* Navigation items avec espacement adaptatif */}
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => {
                                const isActive = activeTab === item.id;
                                const IconComponent = isActive ? item.iconActive : item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.route)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors font-medium ${isActive
                                                ? 'text-primary bg-primary/10'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        <span className="whitespace-nowrap">{item.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions desktop */}
                    <div className="flex items-center space-x-4">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {getInitials(user?.username || "")}
                                    </span>
                                </div>
                                <div className="text-left hidden xl:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500">Vendeur connecté</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu Desktop */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="py-2">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {user?.username}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">Vendeur</p>
                                        </div>
                                        
                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    navigate("/vendeur/profile");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md mx-1"
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                Modifier profil
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/forgot-password");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md mx-1"
                                            >
                                                <Key className="w-4 h-4 mr-3" />
                                                Changer mot de passe
                                            </button>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 my-1"></div>
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md mx-1"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Se déconnecter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );

    // Calcul du padding pour le contenu principal
    const getMainContentPadding = () => {
        switch (screenSize) {
            case 'mobile':
                return 'pt-16 pb-20'; // Header mobile + bottom nav
            case 'tablet':
                return 'pt-16'; // Header tablette
            case 'desktop':
                return 'pt-16'; // Header desktop
            default:
                return 'pt-16';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation selon le device */}
            {screenSize === 'mobile' && (
                <>
                    <MobileHeader />
                    <BottomNavigation />
                </>
            )}
            {screenSize === 'tablet' && <TabletNavigation />}
            {screenSize === 'desktop' && <DesktopNavigation />}

            {/* Contenu principal */}
            <main className={getMainContentPadding()}>
                {children}
            </main>

            {/* Overlay pour mobile menu si nécessaire */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default VendeurLayout;