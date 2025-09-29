import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'default'
  size?: 'icon' | 'default'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, className = '', variant = 'default', size, ...props }, ref) {
  const base = 'inline-flex items-center justify-center rounded-md transition focus:outline-none'
  const variants: Record<string,string> = {
    default: 'bg-indigo-600 text-white',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-200'
  }
  const sizes: Record<string,string> = {
    icon: 'p-2 w-8 h-8',
    default: 'px-3 py-1'
  }
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size||'default']} ${className}`} {...props}>
      {children}
    </button>
  )
})

export default Button
