import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { URL } from '../url';
import { HiArrowNarrowRight } from "react-icons/hi";


function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${URL}/api/products`);
        console.log("response", response)
        setFeaturedProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
        setLoading(false);
      }
    }


    useEffect(()=>{
      fetchFeaturedProducts();
    },[])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 px-9 md:px-64 pt-9">
        <div className='px-6 md:px-24 bg-[#7042D2] rounded-3xl py-24'>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/80"></div>
        <div className="container-custom relative h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Fresh Fruits & Vegetables
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Farm-fresh produce delivered to your doorstep. Healthy eating made easy.
          </p>
          <Link to="/products" className="btn bg-white text-primary hover:bg-gray-100 w-max text-[#7042D2] flex gap-x-2 items-center rounded-2xl py-2 px-6">
            Explore Products <HiArrowNarrowRight/>
          </Link>
        </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-28 md:py-24 px-9 md:px-64">
        <div className="container-custom">
          <h2 className="text-3xl font-bricolage font-bold text-gray-900 text-center mb-8">Featured Products</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {featuredProducts?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-100">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-5 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh & Organic</h3>
              <p className="text-gray-600">All our products are fresh, organic, and locally sourced from trusted farms.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-5 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">We deliver to your doorstep within 24 hours of placing your order.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-5 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Our blockchain payment system ensures secure and transparent transactions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;