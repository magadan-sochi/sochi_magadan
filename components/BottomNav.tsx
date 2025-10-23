import React from 'react';
// FIX: Switched to a named import for react-router-dom to resolve module resolution errors.
// FIX-GEMINI: Using NavLink from react-router-dom v5.
import { NavLink } from "react-router-dom";
import { HomeIcon } from './icons/HomeIcon.tsx';
import { BookOpenIcon } from './icons/BookOpenIcon.tsx';
import { FileTextIcon } from './icons/FileTextIcon.tsx';
import { Gamepad2Icon } from './icons/Gamepad2Icon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';

const navItems = [
  { path: '/app/dashboard', label: 'Главная', icon: HomeIcon },
  { path: '/app/learn', label: 'Учить', icon: BookOpenIcon },
  { path: '/app/tests', label: 'Тесты', icon: FileTextIcon },
  { path: '/app/games', label: 'Игры', icon: Gamepad2Icon },
  { path: '/app/profile', label: 'Профиль', icon: UserIcon },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
