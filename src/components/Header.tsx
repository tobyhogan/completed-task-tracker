import React from 'react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header 