export function usePradoTheme() {
  const theme = useState<'light' | 'dark'>('theme', () => 'light');

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    if (import.meta.client) {
      localStorage.setItem('prado-theme', theme.value);
      document.documentElement.setAttribute('data-theme', theme.value);
    }
  };

  return { theme, toggleTheme };
}
