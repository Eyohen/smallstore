import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart } from "react-icons/fi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { PackageSearch } from 'lucide-react';


function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();

  // Total is now just the subtotal (no shipping or tax)
  const total = subtotal;

  return (
    <div className="container-custom py-8 px-4 md:px-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className='container w-16 mx-auto'>
          <div className="mb-4 bg-gray-200 py-2 w-[80px] h-[80px] flex justify-center items-center rounded-full">
          <FiShoppingCart size={25}/>
          </div>
          </div>
          <p className="text-2xl font-bold mb-6">Your cart is empty</p>
          <p className='text-gray-500 text-lg '>Looks like you haven't added any items to your cart yet</p>


          <Link to="/products" >
          <button 
          onClick={()=> navigate('/products')}
          className="bg-[#7042D2] text-white px-9 py-2 rounded-3xl mt-6">
            Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl">
              <ul className="space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6 bg-white rounded-2xl shadow-2xl">
                    <div className="flex items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                        {/* <img 
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover object-center"
                        /> */}
                        <div className='flex justify-center items-center h-full'>
                        <PackageSearch/>
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/products/${item.id}`} className="hover:text-primary">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-lg font-bold">${Number (item?.price)?.toFixed(2)}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center ml-4 border px-3 rounded-2xl py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <span className="mx-2 text-gray-700 w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 text-red-500 hover:text-red-600 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 w-[350px]">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900 font-medium">${subtotal.toFixed(2)}</p>
                </div>
                
                <div className="border-t pt-4 flex justify-between">
                  <p className="text-lg font-medium text-gray-900">Total</p>
                  <p className="text-lg font-bold text-primary">${total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className='flex flex-col gap-y-4'>
                <Link
                  to="/checkout">
                    <button
                  className="px-12 rounded-3xl py-2 bg-[#7042D2] text-white w-full"
                >
                  Proceed to Checkout
                  </button>
                </Link>
                
                <Link
                  to="/products">
                                 <button
                  className="px-12 rounded-3xl py-2 flex items-center gap-x-2 w-full font-semibold"
                >
                 < HiArrowNarrowLeft/>
                  Continue Shopping
                  </button>
                </Link>
                  </div>



              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;