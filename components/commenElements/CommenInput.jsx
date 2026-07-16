'use client'
import React from "react"

const CommenInput = ({
  type,
  label,
  value,
  onChange,
  required = false,
  id,
  error
}) => {
  return (
    <div className="relative mb-4 w-full">
      <input 
        id={id}
        type={type} 
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full appearance-none rounded text-white px-4 pt-6 pb-2 text-base font-medium leading-6 max-w-full border bg-black/50 border-solid focus:ring-0 outline-0 peer transition-all duration-200 ${
          error 
            ? 'border-[#e50914] focus:border-[#e50914]' 
            : 'border-zinc-600 focus:border-white'
        }`} 
        placeholder=" " 
      />
      <label 
        htmlFor={id} 
        className="absolute text-sm text-zinc-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-zinc-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
      >
        {label}
      </label>
      {error && (
        <div className="text-[#e50914] text-xs mt-1.5 px-1 flex items-start gap-1 font-medium">
          <svg className="w-4 h-4 fill-current flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default CommenInput