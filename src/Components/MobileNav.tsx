import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

function MobileNav() {
  <main className='fixed h-screen w-screen bg-stone-50 blur-sm flex items-center justify-center'>
    <X size={32} className='fixed top-3 right-3'/>
    <ul>
      <li><a>About</a></li>
      <li><a>Projects</a></li>
      <li><a>Resume</a></li>
      <li><a>Contact</a></li>
    </ul>
  </main>
}

export default MobileNav;