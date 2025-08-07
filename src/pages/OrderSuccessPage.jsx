import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, paymentDetails } = location.state || {};
  
  // If user tries to access this page directly without completing an order, redirect to home
  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);
  
  if (!orderId) {
    return null;
  }
  
  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Thank You for Your Order!</h1>
          <p className="text-lg text-gray-600 mt-2">Your order has been placed successfully.</p>
        </div>
        
        <div className="mt-8">
          <div className="border border-gray-200 rounded-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{orderId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">${total ? total.toFixed(2) : '0.00'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">Blockchain Payment</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="text-green-600 font-medium">Confirmed</p>
              </div>
            </div>
          </div>
          
          {/* Blockchain Transaction Details */}
          {paymentDetails && (
            <div className="border border-gray-200 rounded-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm break-all">{paymentDetails.transactionId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="capitalize font-medium text-green-600">{paymentDetails.status}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-medium">{new Date(paymentDetails.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-600">
            We've sent you an email with your order details and will notify you when your order ships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
            
            <button 
              onClick={() => window.print()} 
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;