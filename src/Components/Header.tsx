import React, { useState } from 'react';
import { motion } from "framer-motion";
import MobileNav from './MobileNav';

const navigation = [
  { name: 'Work', href: '#', current: true },
  { name: 'About', href: '#', current: false },
  { name: 'Resume', href: '#', current: false },
  { name: 'Contact', href: '#', current: false },
];

const Header: React.FC = () => {
  const [navItems, setNavItems] = useState(navigation);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (name: string) => {
    setNavItems((prevNavItems) =>
      prevNavItems.map((item) =>
        item.name === name ? { ...item, current: true } : { ...item, current: false }
      )
    );
    setIsOpen(false);
  };

  return (
    <header className='w-full fixed z-20'>
      <div className='w-full py-4 md:py-12 px-8 md:px-20 flex flex-row justify-between'>
        <ul>
          <li className='text-xl font-semibold font-varela text-black cursor-pointer pr-4'>Mauricio Raupp</li>
        </ul>
        <div className="relative w-10 h-10 flex md:hidden items-center justify-center pb-2" onClick={() => setIsOpen(!isOpen)}>
          <motion.div
            className="w-8 h-6 flex flex-col justify-between cursor-pointer"
            initial={false}>
            <motion.div
              className="w-8 h-0.75 bg-black rounded"
              animate={isOpen ? { rotate: 45, y: 10.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="w-8 h-0.75 bg-black rounded"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="w-8 h-0.75 bg-black rounded"
              animate={isOpen ? { rotate: -45, y: -10.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        </div>

        <ul className='hidden md:flex flex-row gap-8'>
          {navItems.map((item) => (
            <li
              key={item.name}
              className={`${item.current ? 'text-black' : 'text-gray-400'} text-base cursor-pointer hover:text-black duration-500`}
              onClick={() => handleClick(item.name)}>
              <a className='font-normal' href={item.href}>{item.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <MobileNav isOpen={isOpen} navItems={navItems} handleClick={handleClick} />
    </header>
  );
};

export default Header;