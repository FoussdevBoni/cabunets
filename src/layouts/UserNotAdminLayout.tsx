// layouts/UserNotAdminLayout.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Key, ChevronDown, LogOut, Bell } from "lucide-react";
import { useAuth } from "../hooks/auth/useAuth";
import useToken from "../hooks/auth/useToken";
import ImpersonationBanner from "../components/features/admin/ImpersonationBanner";

export interface NavItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  iconActive: React.ComponentType<any>;
  route: string;
}

export interface UserNotAdminLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  basePath: string;
  roleLabel: string;
  profileRoute: string;
  getActiveTab: (pathname: string) => string;
  notificationCount?: number;
  notificationsRoute?: string;
  logoRoute?: string;
}

const UserNotAdminLayout = ({
  children,
  navItems,
  basePath,
  roleLabel,
  profileRoute,
  getActiveTab,
  notificationCount = 0,
  notificationsRoute,
  logoRoute = "/",
}: UserNotAdminLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = getActiveTab(location.pathname);

  // Détection impersonation
  const isImpersonating = !!user?.impersonatedBy;
  const navTopClass = isImpersonating ? "top-10" : "top-0";

  // Détection de la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize("mobile");
      else if (width < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (route: string) => {
    setIsMobileMenuOpen(false);
    navigate(`${basePath}${route}`);
  };

  const getInitials = (nom: string) => nom.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
  };

  // =============== MOBILE HEADER ===============
  const MobileHeader = () => (
    <header className={`lg:hidden fixed ${navTopClass} left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3`}>
      <div className="flex items-center justify-between">
        <Link to={logoRoute} className="flex items-center space-x-3">
          <img className="h-15 w-auto" src="/logo.png" alt="" />
        </Link>

        <div className="flex items-center space-x-3">
          {notificationsRoute && (
            <button
              onClick={() => navigate(notificationsRoute)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <span className="text-white font-semibold text-sm">
                {getInitials(user?.username || "")}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => { navigate(profileRoute); setIsDropdownOpen(false); }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Modifier profil
                  </button>
                  <button
                    onClick={() => { navigate("/forgot-password"); setIsDropdownOpen(false); }}
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

  // =============== BOTTOM NAV ===============
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
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[60px] ${
                isActive ? "text-primary bg-primary/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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

  // =============== TABLET NAV ===============
  const TabletNavigation = () => (
    <nav className={`hidden md:block lg:hidden fixed ${navTopClass} left-0 right-0 z-50 bg-white border-b border-gray-200`}>
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={logoRoute} className="flex items-center space-x-3 flex-shrink-0">
            <img className="h-12 w-12" src="/logo.png" alt="" />
          </Link>

          <div className="flex items-center space-x-1 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComponent = isActive ? item.iconActive : item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[70px] ${
                    isActive ? "text-primary bg-primary/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium text-center">{item.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {notificationsRoute && (
              <button
                onClick={() => navigate(notificationsRoute)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}

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
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 mt-1">{roleLabel} connecté</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => { navigate(profileRoute); setIsDropdownOpen(false); }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Modifier profil
                      </button>
                      <button
                        onClick={() => { navigate("/forgot-password"); setIsDropdownOpen(false); }}
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

  // =============== DESKTOP NAV ===============
  const DesktopNavigation = () => (
    <nav className={`hidden lg:block fixed ${navTopClass} left-0 right-0 z-50 bg-white border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to={logoRoute} className="flex items-center space-x-3 flex-shrink-0">
              <img className="h-12 w-12" src="/logo.png" alt="" />
            </Link>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = isActive ? item.iconActive : item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.route)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors font-medium ${
                      isActive ? "text-primary bg-primary/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="whitespace-nowrap">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {notificationsRoute && (
              <button
                onClick={() => navigate(notificationsRoute)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}

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
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{roleLabel} connecté</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">{roleLabel}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => { navigate(profileRoute); setIsDropdownOpen(false); }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md mx-1"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Modifier profil
                      </button>
                      <button
                        onClick={() => { navigate("/forgot-password"); setIsDropdownOpen(false); }}
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

  const getMainContentPadding = () => {
    switch (screenSize) {
      case "mobile": return isImpersonating ? "pt-24 pb-20" : "pt-16 pb-20";
      case "tablet": return isImpersonating ? "pt-24" : "pt-16";
      case "desktop": return isImpersonating ? "pt-24" : "pt-16";
      default: return isImpersonating ? "pt-24" : "pt-16";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ImpersonationBanner />

      {screenSize === "mobile" && (
        <>
          <MobileHeader />
          <BottomNavigation />
        </>
      )}
      {screenSize === "tablet" && <TabletNavigation />}
      {screenSize === "desktop" && <DesktopNavigation />}

      <main className={getMainContentPadding()}>{children}</main>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default UserNotAdminLayout;