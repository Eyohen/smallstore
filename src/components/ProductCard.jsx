import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PackageSearch } from 'lucide-react';

function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();

  // Check if this product is already in the cart
  const isInCart = cartItems.some(item => item.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation when clicking the button
    addToCart(product);
  };

  return (
    <div className="card group transition-transform duration-300 hover:scale-105 rounded-2xl">
      <Link to={`/products/${product.id}`}>
        <div className="h-48 overflow-hidden flex justify-center items-center border">
          {/* <img 
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 rounded-2xl"
          /> */}
          <div >
             <PackageSearch size={50}/>
      
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-[#7042D2]">{product?.name}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-900 font-bricolage text-xl font-bold">
              ${Number(product?.price)?.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product?.description}</p>
        </div>
      </Link>
      
      <div className="p-4 pt-0">
        {isInCart ? (
          <Link to="/cart" onClick={(e) => e.stopPropagation()}>
            <button className="w-full bg-green-600 hover:bg-green-700 mt-3 text-white font-bricolage py-2 rounded-xl transition-colors duration-200">
              View Cart
            </button>
          </Link>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="w-full bg-[#7042D2] hover:bg-[#5c2db5] mt-3 text-white font-bricolage py-2 rounded-xl transition-colors duration-200"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;