import React from 'react'

const Separator = ({ className = "", orientation = "horizontal", ...props }) => {
  return (
    <div 
      className={`
        ${orientation === "horizontal" ? "h-px w-full" : "w-px h-full"}
        bg-border
        ${className}
      `}
      {...props}
    />
  )
}

export { Separator }
