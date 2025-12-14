// src/components/Navbar.jsx
import { useState } from 'react';
import DropdownMenu from './DropdownMenu';


function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* LEFT GROUP: Logo + Desktop Links */}
          <div className="flex items-center">
            <div className="ml-20">
              <div className="text-xl font-bold whitespace-nowrap">
                MyVault-Verify
              </div>
            </div>

            <ul className="hidden md:flex space-x-8 ml-20">
              <li><a href="/" className="hover:text-blue-200 transition">Home</a></li>
              <li><a href="/verification-request" className="hover:text-blue-200 transition">Verification Request</a></li>
              <li><a href="/guide" className="hover:text-blue-200 transition">Guide</a></li>
              <li><a href="/about" className="hover:text-blue-200 transition">About</a></li>
            </ul>
          </div>

          <div className="hidden md:block ml-6 mr-20">
            <DropdownMenu />
          </div>

          {/* MOBILE HAMBURGER */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-blue-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden bg-blue-700 rounded-b-lg">
            <ul className="px-4 py-3 space-y-2">
              <li><a href="/" className="block py-2 hover:text-blue-200">Home</a></li>
              <li><a href="/guide" className="block py-2 hover:text-blue-200">Guide</a></li>
              <li><a href="/about" className="block py-2 hover:text-blue-200">About</a></li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;