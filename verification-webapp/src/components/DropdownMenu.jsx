import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Cog6ToothIcon,
    ShieldCheckIcon,
    BookOpenIcon,
    InformationCircleIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';


const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
  const navigate = useNavigate();

    // close dropdown when clicking outside
    useEffect (() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // handle menu item click
  const handleItemClick = (label, route) => {
    console.log(`${label} clicked`);

    // navigate when a route is provided
    if (route) {
      try {
        navigate(route);
      } catch (err) {
        console.error('Navigation failed:', err);
      }
    }

    setIsOpen(false);
  };

    const menuItems = [
        { label: 'Settings', icon: Cog6ToothIcon, route: '/settings' },
        { label: 'Admin Login', icon: ShieldCheckIcon, route: '/admin/login' },
        { label: 'Guide', icon: BookOpenIcon, route: '/guide' },
        { label: 'About', icon: InformationCircleIcon, route: '/about' },
    ]

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            {/* dropdown toggle button */}
            <button
                onClick={ () => setIsOpen(!isOpen)}
                className={ `
          inline-flex items-center justify-center gap-2 rounded-lg
          bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white
          shadow-sm transition-all duration-200
          hover:bg-blue-700 hover:shadow-md
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
          focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50
          active:scale-95
        ` }
        aria-haspopup='true'
        aria-expanded={isOpen}
        >
            <Bars3Icon className="h-6 w-6" />
            <svg
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
        </button>


        {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`
            absolute left-0 mt-2 w-40 origin-top-left
            rounded-xl bg-white shadow-xl  
            focus:outline-none z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          `}
          role="menu"
          aria-orientation="vertical"
        >
            <div className="py-1" role="none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item.label, item.route)}
                  className={`
                    flex w-full items-center gap-3 px-4 py-3 text-sm
                    text-gray-700 transition-colors duration-150
                    hover:bg-gray-50 hover:text-gray-900
                    focus:bg-gray-50 focus:text-gray-900
                    focus:outline-none
                  `}
                  role="menuitem"
                >
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Optional: Footer */}
          <div className="border-t border-gray-100 px-4 py-2">
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      )}
    </div>

        
    );
};

export default DropdownMenu;