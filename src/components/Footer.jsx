import { Link } from 'react-router-dom';
import coinleystore from '../assets/coinley-store-dark.svg';


function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-12 px-9">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4"><img src={coinleystore} className='w-48'/></h3>
            <p className="text-gray-300">
              We provide the freshest fruits and vegetables from local farmers to your table.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <address className="text-gray-300 not-italic">
              <p>123 Fresh Street</p>
              <p>Healthy City, HC 12345</p>
              <p>Email: info@freshbites.com</p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-300">
          <p>&copy; {currentYear} Coinley Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;