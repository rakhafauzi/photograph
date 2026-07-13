export type ThemePaletteKey = 'gold' | 'emerald' | 'rose' | 'sapphire';
export type FontTypeKey = 'modern-sans' | 'elegant-serif' | 'neo-grotesk' | 'friendly-rounded';

type ThemePaletteDefinition = {
  value: ThemePaletteKey;
  label: string;
  description: string;
  preview: [string, string, string];
  vars: Record<string, string>;
};

type FontDefinition = {
  value: FontTypeKey;
  label: string;
  description: string;
  family: string;
  preview: string;
};

export const themePalettes: ThemePaletteDefinition[] = [
  {
    value: 'gold',
    label: 'Gold Luxury',
    description: 'Elegan, premium, dan cocok untuk studio fotografi.',
    preview: ['#f3d98c', '#d4941a', '#7a4618'],
    vars: {
      '--theme-accent-50': '#fdf8e8',
      '--theme-accent-100': '#f9ecc4',
      '--theme-accent-200': '#f3d98c',
      '--theme-accent-300': '#edc254',
      '--theme-accent-400': '#e5ab2e',
      '--theme-accent-500': '#d4941a',
      '--theme-accent-600': '#b47614',
      '--theme-accent-700': '#935715',
      '--theme-accent-800': '#7a4618',
      '--theme-accent-900': '#683b1a',
      '--theme-accent-rgb': '212 148 26',
    },
  },
  {
    value: 'emerald',
    label: 'Emerald Studio',
    description: 'Segar, profesional, dan terasa modern.',
    preview: ['#a7f3d0', '#10b981', '#065f46'],
    vars: {
      '--theme-accent-50': '#ecfdf5',
      '--theme-accent-100': '#d1fae5',
      '--theme-accent-200': '#a7f3d0',
      '--theme-accent-300': '#6ee7b7',
      '--theme-accent-400': '#34d399',
      '--theme-accent-500': '#10b981',
      '--theme-accent-600': '#059669',
      '--theme-accent-700': '#047857',
      '--theme-accent-800': '#065f46',
      '--theme-accent-900': '#064e3b',
      '--theme-accent-rgb': '16 185 129',
    },
  },
  {
    value: 'rose',
    label: 'Rose Editorial',
    description: 'Lembut, artistik, dan berkesan editorial.',
    preview: ['#fbcfe8', '#ec4899', '#9d174d'],
    vars: {
      '--theme-accent-50': '#fff1f6',
      '--theme-accent-100': '#ffe4ef',
      '--theme-accent-200': '#fbcfe8',
      '--theme-accent-300': '#f9a8d4',
      '--theme-accent-400': '#f472b6',
      '--theme-accent-500': '#ec4899',
      '--theme-accent-600': '#db2777',
      '--theme-accent-700': '#be185d',
      '--theme-accent-800': '#9d174d',
      '--theme-accent-900': '#831843',
      '--theme-accent-rgb': '236 72 153',
    },
  },
  {
    value: 'sapphire',
    label: 'Sapphire Modern',
    description: 'Tegas, bersih, dan cocok untuk dashboard operasional.',
    preview: ['#bfdbfe', '#3b82f6', '#1d4ed8'],
    vars: {
      '--theme-accent-50': '#eff6ff',
      '--theme-accent-100': '#dbeafe',
      '--theme-accent-200': '#bfdbfe',
      '--theme-accent-300': '#93c5fd',
      '--theme-accent-400': '#60a5fa',
      '--theme-accent-500': '#3b82f6',
      '--theme-accent-600': '#2563eb',
      '--theme-accent-700': '#1d4ed8',
      '--theme-accent-800': '#1e40af',
      '--theme-accent-900': '#1e3a8a',
      '--theme-accent-rgb': '59 130 246',
    },
  },
];

export const fontOptions: FontDefinition[] = [
  {
    value: 'modern-sans',
    label: 'Modern Sans',
    description: 'Netral, rapi, dan aman untuk dashboard harian.',
    family: "'Inter', system-ui, -apple-system, sans-serif",
    preview: 'Dashboard modern dengan teks yang bersih dan efisien.',
  },
  {
    value: 'elegant-serif',
    label: 'Elegant Serif',
    description: 'Lebih mewah dan editorial untuk branding studio.',
    family: "Georgia, Cambria, 'Times New Roman', serif",
    preview: 'Nuansa premium untuk studio fotografi yang artistik.',
  },
  {
    value: 'neo-grotesk',
    label: 'Neo Grotesk',
    description: 'Tajam, profesional, dan sangat mudah dibaca.',
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    preview: 'Tampilan tegas untuk panel admin yang profesional.',
  },
  {
    value: 'friendly-rounded',
    label: 'Friendly Rounded',
    description: 'Lebih lembut, hangat, dan tetap modern.',
    family: "'Trebuchet MS', 'Avenir Next', Arial, sans-serif",
    preview: 'Kesan ramah untuk admin panel yang lebih approachable.',
  },
];

export function getPaletteByValue(value?: string | null) {
  return themePalettes.find((palette) => palette.value === value) ?? themePalettes[0];
}

export function getFontByValue(value?: string | null) {
  return fontOptions.find((font) => font.value === value) ?? fontOptions[0];
}

export function applyThemeSettings(themePalette?: string | null, fontType?: string | null) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const palette = getPaletteByValue(themePalette);
  const font = getFontByValue(fontType);

  Object.entries(palette.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.style.setProperty('--font-sans', font.family);
}
