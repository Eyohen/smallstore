import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { URL } from '../url';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');


    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${URL}/api/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
        
    
      }
    };



    useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by category and search term
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (filter !== 'all' && product.category !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container-custom py-8 px-9">
      <h1 className="text-3xl font-bold mb-8 text-center font-bricolage">Our Products</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 px-4 md:px-64'>
      
      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px] px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col gap-y-4 justify-start">

        <h1 className="text-xl font-bold mb-8 font-bricolage">Categories</h1>

          <div
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'bg-[#7042D2] text-white hover:bg-[#7042D2] hover:text-white rounded-3xl py-2 w-[200px] px-4' : 'bg-gray-200 text-gray-800 hover:bg-[#7042D2]'}`}
          >
            All
          </div>

          {/* <div
            onClick={() => setFilter('fruits')}
            className={`btn ${filter === 'all' ? 'hover:bg-[#7042D2] hover:text-white rounded-3xl py-2 w-[200px] px-4' : 'bg-gray-200 text-gray-800 hover:bg-[#7042D2]'}`}
          >
            Fruits
          </div>

          <div
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'hover:bg-[#7042D2] hover:text-white rounded-3xl py-2 w-[200px] px-4' : 'bg-gray-200 text-gray-800 hover:bg-[#7042D2]'}`}
          >
            Vegetables
          </div> */}

  
        </div>
      </div>
      
      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}


</div>
    </div>
  );
}

export default ProductsPage;