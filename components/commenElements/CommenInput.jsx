'use client'
import React from "react"

const CommenInput = ({
  type,
  label,
  value,
  onChange,
  required = false,
  id
}) => {
  return (
    <div className="relative mb-4">
      <input 
        id={id}
        type={type} 
        value={value}
        onChange={onChange}
        required={required}
        className="w-full appearance-none rounded-lg text-white p-4 py-5 pb-3 text-base font-medium leading-6 max-w-full border bg-black border-solid border-[#808080b3] outline-0 peer" 
        placeholder="" 
      />
      <label htmlFor={id} className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-5 z-10 origin-[0] start-4 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">{label}</label>
    </div>
  )
}

export default CommenInput