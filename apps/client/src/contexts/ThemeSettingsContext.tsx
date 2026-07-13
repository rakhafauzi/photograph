import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useFetch } from '@/hooks/useQuery';
import type { WebsiteSettings } from '@/types';
import { applyThemeSettings } from '@/lib/theme';

const ThemeSettingsContext = createContext<{ isReady: boolean }>({ isReady: false });

export function ThemeSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  useEffect(() => {
    applyThemeSettings(settings.theme_palette, settings.font_type);
  }, [settings.theme_palette, settings.font_type]);

  return (
    <ThemeSettingsContext.Provider value={{ isReady: true }}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  return useContext(ThemeSettingsContext);
}
