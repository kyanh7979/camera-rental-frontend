import { useEffect } from 'react';
import useUIStore from '../store/uiStore.js';

const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme, toggleTheme };
};

export default useTheme;
