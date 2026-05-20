import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileNavDrawer from '../components/layout/MobileNavDrawer.jsx';
import useTheme from '../hooks/useTheme.js';

function MainLayout() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <Navbar />
      <main 
        className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 py-6 md:px-6 md:py-10 transition-colors duration-300"
      >
        <Outlet />
      </main>
      <Footer />
      <MobileNavDrawer />
    </div>
  );
}

export default MainLayout;
