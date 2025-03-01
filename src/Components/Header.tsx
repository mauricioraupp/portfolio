import React, { useState } from 'react';
import { List } from "@phosphor-icons/react";

const navigation = [
  { name: 'About', href: '#', current: true },
  { name: 'Projects', href: '#', current: false },
  { name: 'Resume', href: '#', current: false },
  { name: 'Contact', href: '#', current: false },
];

function Header() {
  const [navItems, setNavItems] = useState(navigation);

  const handleClick = (name: string) => {
    setNavItems((prevNavItems) =>
      prevNavItems.map((item) =>
        item.name === name ? { ...item, current: true } : { ...item, current: false }
      )
    );
  };

  return (
    <header className='w-full fixed'>
      <div className='w-full py-4 md:py-12 px-8 md:px-20 flex flex-row justify-between'>
        <ul>
          <li className='text-xl font-semibold text-gray-900 cursor-pointer'>Mauricio Raupp</li>
        </ul>
        <List size={32} id='burguer' className='flex md:hidden cursor pointer'
        /*onClick={() => }*/ />
        <ul className='hidden md:flex flex-row gap-8'>
          {navItems.map((item) => (
            <li
              key={item.name}
              className={`text-base font-medium ${item.current ? 'text-black' : 'text-gray-400'} cursor-pointer hover:text-black duration-500`}
              onClick={() => handleClick(item.name)}>
              <a href={item.href}>{item.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Header;