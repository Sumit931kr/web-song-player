import React from 'react'
import Logo from '../assets/logo1.png.png';
const Navbar = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className='border-2 border-white-500 h-12 rounded-lg flex flex-row justify-between items-center px-12 text-lg'>
        <div className='flex flex-row gap-4'>
            <a href='/'><img src={Logo} className='w-8 h-8 cursor-pointer'></img></a>
            <a className='hover:text-green-300 cursor-pointer' href='/'>
              e-pod
            </a>
        </div>
        <div className='flex flex-row justify-between gap-16'>
            <a className=' hover:text-green-300 cursor-pointer'  href='/import-playlist'>import Playlist</a>
            <a className=' hover:text-green-300 cursor-pointer'>Your Playlist</a>
            <a className=' hover:text-green-300 cursor-pointer'>You</a>
        </div>
    </div>
  )
}

export default Navbar