import React from 'react';

interface NavItem {
  name: string;
  href: string;
  current: boolean;
}

interface MobileNavProps {
  navItems: NavItem[];
  handleClick: (name: string) => void;
  isOpen: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, navItems, handleClick }) => {
  return (
    <main className={`${isOpen ? 'h-screen' : 'h-0'} duration-500 fixed z-0 w-screen bg-stone-50 flex md:hidden items-center justify-center`}>
      <ul className={`${isOpen ? '-translate-y-1/2' : '-translate-y-full'} transform grid grid-rows-1 w-40 divide-y-2`}>
        {navItems.map((item) => (
          <li
            key={item.name}
            className={`${item.current ? 'text-gray-400' : 'text-black'} text-xl p-3 text-center tracking-wide hover:text-gray-400 duration-500`}
            onClick={() => handleClick(item.name)}>
            <a className='font-inter cursor-pointer' href={item.href}>{item.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default MobileNav;
