import React from 'react'
import ChessLogo from '../assets/chess-logo2.png';

const Navbar = () => {
  return (
    <div className='bg-gray-800 py-2 px-8'>
        <div>
            <img className='h-16' src={ChessLogo} alt='ERROR'/>
        </div>
    </div>
  )
}

export default Navbar