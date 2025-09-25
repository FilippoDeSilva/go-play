import React from 'react'

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>
}

export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const DropdownMenuContent: React.FC<{ align?: string; children: React.ReactNode }> = ({ children }) => {
  return <div className="absolute right-0 mt-2 w-40 rounded-md bg-white dark:bg-slate-800 shadow-lg border border-gray-200/40 dark:border-gray-700/40 z-50">{children}</div>
}

export const DropdownMenuItem: React.FC<React.ComponentProps<'button'>> = ({ children, ...props }) => {
  return (
    <button {...props} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700">{children}</button>
  )
}

export default DropdownMenu
