import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import coinleystore from '../assets/coinley-store.svg';
import { GoPerson } from "react-icons/go";
import { FiShoppingCart } from "react-icons/fi";



function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();


  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md px-9">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary text-2xl font-bold"><img src={coinleystore} className='w-48'/></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary font-medium">
              Products
            </Link>
            {/* <Link to="/login" className="text-white hover:text-primary font-medium bg-[#7042D2] px-9 rounded-lg">
              Login
            </Link> */}
          </div>

          {/* Cart Icon */}
          <div className="flex items-center space-x-4">
          {/* <Link to="/" className="relative">
               <GoPerson size={25}/>
            
            </Link> */}
            <Link to="/cart" className="relative">
            <FiShoppingCart size={25}/>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7042D2] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
 
            <div></div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-primary font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="block py-2 text-gray-700 hover:text-primary font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>


          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;