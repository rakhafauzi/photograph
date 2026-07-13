import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  Camera,
  ChevronDown,
  LogOut,
  Settings,
  User,
  HelpCircle,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import SidebarNav from '@/components/SidebarNav';
import { sidebarMenu } from '@/config/sidebar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Toggle dark class on html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Cleanup when component unmounts (e.g., navigating to landing page)
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isDarkMode]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    // Find the current page label from sidebar config
    const currentMenuItem = sidebarMenu.find(
      (item) => item.isActive?.(location.pathname) || item.href === location.pathname
    );

    if (currentMenuItem) {
      breadcrumbs.push({ label: currentMenuItem.label, href: currentMenuItem.href || location.pathname });

      // If there's a submenu, find the active sub-item
      if (currentMenuItem.submenu) {
        const activeSub = currentMenuItem.submenu.find(
          (sub) => location.pathname === sub.href.split('?')[0]
        );
        if (activeSub && activeSub.label !== currentMenuItem.label) {
          breadcrumbs.push({ label: activeSub.label, href: activeSub.href });
        }
      }
    } else {
      // Fallback: generate from path
      pathParts.forEach((part, index) => {
        const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        breadcrumbs.push({
          label: index === 0 ? 'Admin' : label,
          href: '/' + pathParts.slice(0, index + 1).join('/'),
        });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentPageLabel = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';
  const shellPaddingClass = 'px-4 lg:px-6';

  // Generate notifications (mock data for now)
  const notifications = [
    { id: 1, title: 'Booking Baru', message: 'Rina Wijaya memesan paket Wedding Premium', time: '5 menit lalu', type: 'booking', read: false },
    { id: 2, title: 'Pembayaran Baru', message: 'Pembayaran DP Rp 1.500.000 dari Andi', time: '1 jam lalu', type: 'payment', read: false },
    { id: 3, title: 'Reminder Jadwal', message: 'Shooting Wedding - Basic besok jam 08:00', time: '3 jam lalu', type: 'reminder', read: true },
    { id: 4, title: 'Testimoni Baru', message: 'Sari menulis testimoni 5 bintang', time: '1 hari lalu', type: 'testimonial', read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-dark-bg dark:text-dark-text'
    )}>
      {/* Sidebar */}
      <SidebarNav
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'
      )}>
        {/* ==================== TOPBAR ==================== */}
        <header className={cn(
          'sticky top-0 z-30 border-b transition-colors duration-300 bg-white/80 backdrop-blur-xl border-gray-100',
          'dark:bg-dark-surface/80 dark:border-dark-border'
        )}>
          <div className={cn('flex items-center justify-between h-16', shellPaddingClass)}>
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-dark-hover"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary" />
              </button>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center gap-2 text-sm min-w-0">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.href} className="flex items-center gap-2 min-w-0">
                    {index > 0 && (
                      <span className="text-gray-300 dark:text-dark-text-tertiary">/</span>
                    )}
                    <Link
                      to={crumb.href}
                      className={cn(
                        'truncate transition-colors',
                        index === breadcrumbs.length - 1
                          ? 'text-gray-900 dark:text-dark-text font-semibold'
                          : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text'
                      )}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
              </nav>

              {/* Mobile Page Title */}
              <span className="sm:hidden text-sm font-semibold text-gray-900 dark:text-dark-text truncate">
                {currentPageLabel}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-xl text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                title="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors hidden sm:block"
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors hidden md:block"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
              </button>

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full theme-accent-gradient-br text-[9px] font-bold flex items-center justify-center shadow-theme-accent">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border overflow-hidden',
                        isDarkMode
                          ? 'bg-dark-elevated border-dark-border'
                          : 'bg-white border-gray-100'
                      )}
                    >
                      <div className={cn(
                        'px-4 py-3 border-b',
                        isDarkMode ? 'border-dark-border' : 'border-gray-100'
                      )}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Notifikasi</h3>
                          <button className="text-xs theme-accent-text font-medium hover:opacity-80">
                            Tandai semua dibaca
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            className={cn(
                              'w-full text-left px-4 py-3 transition-colors border-b last:border-0',
                              isDarkMode
                                ? 'hover:bg-dark-hover border-dark-border'
                                : 'hover:bg-gray-50 border-gray-50',
                              !notif.read && (isDarkMode ? 'bg-dark-hover/50' : 'theme-accent-surface-subtle')
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-2 h-2 rounded-full mt-1.5 shrink-0',
                                !notif.read ? 'theme-accent-surface' : 'bg-transparent'
                              )} />
                              <div className="min-w-0 flex-1">
                                <p className={cn(
                                  'text-sm font-medium',
                                  isDarkMode ? 'text-dark-text' : 'text-gray-900'
                                )}>
                                  {notif.title}
                                </p>
                                <p className={cn(
                                  'text-xs mt-0.5 line-clamp-1',
                                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                                )}>
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className={cn(
                        'px-4 py-2.5 border-t text-center',
                        isDarkMode ? 'border-dark-border' : 'border-gray-100'
                      )}>
                        <button className="text-xs theme-accent-text font-medium hover:opacity-80">
                          Lihat semua notifikasi
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(
                    'flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl transition-colors',
                    isDarkMode ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="w-7 h-7 rounded-xl theme-accent-gradient-br flex items-center justify-center text-xs font-semibold shadow-theme-accent">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-dark-text truncate max-w-[100px]">
                      {user?.name || 'Admin'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden',
                        isDarkMode
                          ? 'bg-dark-elevated border-dark-border'
                          : 'bg-white border-gray-100'
                      )}
                    >
                      {/* User info header */}
                      <div className={cn(
                        'px-4 py-3 border-b',
                        isDarkMode ? 'border-dark-border' : 'border-gray-100'
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl theme-accent-gradient-br flex items-center justify-center font-semibold shadow-theme-accent">
                            {user?.name?.charAt(0) || 'A'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text truncate">
                              {user?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <button className={cn(
                          'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                          isDarkMode ? 'text-dark-text hover:bg-dark-hover' : 'text-gray-600 hover:bg-gray-50'
                        )}>
                          <User className="w-4 h-4" />
                          Profile Saya
                        </button>
                        <Link
                          to="/admin/settings"
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                            isDarkMode ? 'text-dark-text hover:bg-dark-hover' : 'text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          <Settings className="w-4 h-4" />
                          Pengaturan
                        </Link>
                        <Link
                          to="/"
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                            isDarkMode ? 'text-dark-text hover:bg-dark-hover' : 'text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          <Camera className="w-4 h-4" />
                          Lihat Website
                        </Link>
                      </div>

                      <hr className={isDarkMode ? 'border-dark-border' : 'border-gray-100'} />

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={cn(
                  'border-t overflow-hidden',
                  isDarkMode ? 'border-dark-border' : 'border-gray-100'
                )}
              >
                <div className={cn(shellPaddingClass, 'py-3')}>
                  <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari booking, customer, paket..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors theme-accent-ring border',
                        isDarkMode
                          ? 'bg-dark-elevated text-dark-text placeholder:text-dark-text-tertiary border-dark-border'
                          : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200'
                      )}
                      autoFocus
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-200 dark:bg-dark-hover text-gray-500 dark:text-dark-text-secondary">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ==================== PAGE CONTENT ==================== */}
        <main className={cn(shellPaddingClass, 'py-4 lg:py-8')}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* ==================== FOOTER ==================== */}
        <footer className={cn(
          'border-t py-4 text-xs transition-colors',
          shellPaddingClass,
          isDarkMode ? 'border-dark-border text-dark-text-tertiary' : 'border-gray-100 text-gray-400'
        )}>
          <p>© {new Date().getFullYear()} Fotografi Booking System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
