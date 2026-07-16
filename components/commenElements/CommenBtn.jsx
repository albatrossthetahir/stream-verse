import React from 'react'

const CommenBtn = ({
  type,
  value
}) => {
  return (
    <button type={type} className='w-full block p-3 leading-6 text-base font-semibold text-white bg-[#e50914] hover:bg-red-700 rounded-lg duration-300 transition-all ease-in '>
      {value}
    </button>
  )
}

export default CommenBtn