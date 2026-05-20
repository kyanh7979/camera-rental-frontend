import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label 
          className="block text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon 
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ 
              color: isFocused ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 200ms ease'
            }} 
          />
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full h-11 rounded-xl border text-sm
            transition-all duration-200
            ${Icon ? 'pl-10 pr-10' : 'px-3'}
            ${isPassword ? 'pr-10' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: error 
              ? '#ef4444' 
              : isFocused 
                ? 'var(--primary)' 
                : 'var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: isFocused 
              ? '0 0 0 3px rgba(6, 182, 212, 0.15)' 
              : 'none'
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] font-medium" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
