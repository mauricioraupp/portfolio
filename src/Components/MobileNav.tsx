function MobileNav() {
  return(
    <main className='fixed z-1 h-screen w-screen bg-stone-50 flex items-center justify-center'>
      <ul className='fixed z-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 grid grid-rows-1 w-36 divide-y-2'>
        <li className='text-black text-lg p-2 text-center'><a className='font-inter'>About</a></li>
        <li className='text-black text-lg p-2 text-center'><a className='font-inter'>Projects</a></li>
        <li className='text-black text-lg p-2 text-center'><a className='font-inter'>Resume</a></li>
        <li className='text-black text-lg p-2 text-center'><a className='font-inter'>Contact</a></li>
      </ul>
    </main>
  )
}

export default MobileNav;