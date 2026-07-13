import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, Menu, X, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { sidebarMenu, type SidebarMenuItem } from '@/config/sidebar';
import { useFetch } from '@/hooks/useQuery';
import type { WebsiteSettings } from '@/types';
import { resolveAssetUrl } from '@/lib/utils';

interface SidebarNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function SidebarNav({ isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { data: settingsData } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  // Auto-expand the menu matching the current path
  useEffect(() => {
    sidebarMenu.forEach((item) => {
      if (item.submenu && item.isActive?.(location.pathname)) {
        setExpandedMenus((prev) => ({ ...prev, [item.label]: true }));
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const desktop = event.matches;
      setIsDesktop(desktop);

      if (desktop) {
        setIsSidebarOpen(false);
      }
    };

    handleViewportChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleViewportChange(event);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [setIsSidebarOpen]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isMenuActive = (item: SidebarMenuItem): boolean => {
    if (item.isActive) return item.isActive(location.pathname);
    if (item.href) return location.pathname === item.href;
    return false;
  };

  const isSubmenuActive = (href: string): boolean => {
    // For query-based filtering like ?status=pending
    const [path, queryString] = href.split('?');
    if (queryString) {
      return location.pathname === path && location.search === `?${queryString}`;
    }
    return location.pathname === href;
  };

  const settings = settingsData?.data || {};
  const studioName = settings.studio_name || 'Fotografi Studio';
  const adminLogoUrl = resolveAssetUrl(settings.admin_logo_url || settings.logo_url || '');

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop || isSidebarOpen ? 0 : '-100%',
          width: isCollapsed ? 72 : 280,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-100',
          'dark:bg-dark-surface dark:border-dark-border',
          'lg:translate-x-0',
          'flex flex-col'
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          'flex items-center border-b border-gray-100 dark:border-dark-border shrink-0',
          isCollapsed ? 'justify-center h-16 px-0' : 'px-6 h-16'
        )}>
          {isCollapsed ? (
            adminLogoUrl ? (
              <img
                src={adminLogoUrl}
                alt={studioName}
                className="h-8 w-8 rounded-xl object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 theme-accent-text" />
            )
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl theme-accent-gradient-br flex items-center justify-center shadow-theme-accent shrink-0 overflow-hidden">
                {adminLogoUrl ? (
                  <img
                    src={adminLogoUrl}
                    alt={studioName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="ml-3 min-w-0">
                <span className="block font-bold text-gray-900 dark:text-dark-text text-sm leading-tight">Admin Panel</span>
                <span className="block text-[10px] text-gray-400 dark:text-dark-text-tertiary leading-tight truncate">{studioName}</span>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin">
          {sidebarMenu.map((item) => {
            const isActive = isMenuActive(item);
            const isExpanded = expandedMenus[item.label];

            if (item.submenu) {
              return (
                <div key={item.label} className="select-none">
                  <button
                    onClick={() => {
                      if (!isCollapsed) {
                        toggleSubmenu(item.label);
                      } else {
                        setIsCollapsed(false);
                        setTimeout(() => toggleSubmenu(item.label), 100);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                      isActive || isExpanded
                        ? 'theme-accent-surface theme-accent-text-strong'
                        : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      isActive || isExpanded ? 'theme-accent-text' : 'text-gray-400 dark:text-dark-text-tertiary group-hover:text-gray-600 dark:group-hover:text-dark-text'
                    )} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-dark-text-tertiary" />
                        </motion.div>
                      </>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 theme-accent-border pl-3">
                          {item.submenu.map((sub) => {
                            const subActive = isSubmenuActive(sub.href);
                            return (
                              <Link
                                key={sub.href}
                                to={sub.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
                                  subActive
                                    ? 'theme-accent-surface theme-accent-text-strong font-medium'
                                    : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover'
                                )}
                              >
                                <span className={cn(
                                  'w-1.5 h-1.5 rounded-full shrink-0',
                                  subActive ? 'theme-accent-surface' : 'bg-gray-300 dark:bg-dark-text-tertiary/30 group-hover:bg-gray-400 dark:group-hover:bg-dark-text-tertiary/50'
                                )} />
                                <span className="flex-1">{sub.label}</span>
                                {sub.badge && (
                                  <span className={cn(
                                    'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                                    sub.badgeColor || 'theme-accent-surface'
                                  )}>
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Single menu item (no submenu)
            return (
              <Link
                key={item.label}
                to={item.href!}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'theme-accent-surface theme-accent-text-strong'
                    : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'theme-accent-text' : 'text-gray-400 dark:text-dark-text-tertiary group-hover:text-gray-600 dark:group-hover:text-dark-text'
                )} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center h-10 mx-2 mb-2 rounded-xl text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover transition-all shrink-0"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>

        {/* User Info */}
        <div className={cn(
          'border-t border-gray-100 dark:border-dark-border shrink-0',
          isCollapsed ? 'p-2' : 'p-4'
        )}>
          <div className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center' : 'gap-3'
          )}>
            <div className="w-8 h-8 rounded-xl theme-accent-gradient-br flex items-center justify-center text-xs font-semibold shrink-0 shadow-theme-accent">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-gray-400 dark:text-dark-text-tertiary">Super Admin</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
