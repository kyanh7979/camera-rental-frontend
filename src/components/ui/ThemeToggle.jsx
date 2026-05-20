import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useTheme from '../../hooks/useTheme.js';

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        relative h-10 w-10 flex items-center justify-center rounded-xl
        border transition-all duration-300
        hover:scale-105 active:scale-95
        group
        ${className}
      `}
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
      }}
      title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
      
      <motion.div
        key={theme}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        {theme === 'dark' ? (
          <FiSun 
            className="w-5 h-5 transition-all duration-300 group-hover:rotate-45" 
            style={{ color: '#fbbf24' }}
          />
        ) : (
          <FiMoon 
            className="w-5 h-5 transition-all duration-300 group-hover:-rotate-12" 
            style={{ color: 'var(--primary)' }}
          />
        )}
      </motion.div>
    </button>
  );
}

export default ThemeToggle;
