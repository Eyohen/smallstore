




// src/CheckoutPage.jsx - Updated to use the Enhanced Component

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { URL } from '../url';
import { PackageSearch } from 'lucide-react';

// UPDATED: Import the enhanced component with modern design
import {
    ThemeProvider,
    EnhancedSimpleCoinleyPayment,  // <- NEW: Enhanced component with beautiful design
    PaymentAPI,
} from 'coinley-test';
import 'coinley-test/dist/style.css'

function CheckoutPage() {
    const navigate = useNavigate();
    const { cartItems, subtotal, clearCart } = useCart();

    // Customer information state - simplified to just email
    const [customerInfo, setCustomerInfo] = useState({
        email: '',
    });

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('coinley');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    // Add state to store payment success data
    const [successData, setSuccessData] = useState(null);

    // Add state for merchant wallet configuration
    const [merchantWallets, setMerchantWallets] = useState({});
    
    // NEW: State for the enhanced payment modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Calculate order totals - total is now just the subtotal (no shipping)
    const total = subtotal;

    // Fetch merchant wallet configuration on component mount
    useEffect(() => {
        const fetchMerchantConfig = async () => {
            try {
                // Create PaymentAPI instance with correct credentials and URL
                const paymentAPI = new PaymentAPI(
                    'http://localhost:9000', // Correct blockchain API URL
                    'fdb87b029d8fb531589df71e17a8cc55', // Your API key
                    '5fe381f54803f100312117028542e952bd5d3d1d8b8df2dd1d0761c030cda4bf' // Your API secret
                );

                // Use the PaymentAPI to fetch merchant wallets
                const walletsResponse = await paymentAPI.api.get('/api/merchants/wallets');

                if (walletsResponse.data && walletsResponse.data.wallets) {
                    // Transform the wallet data from backend format to simple key-value pairs
                    const walletMap = {};
                    walletsResponse.data.wallets.forEach(wallet => {
                        if (wallet.walletAddress && wallet.walletAddress.trim() !== '') {
                            walletMap[wallet.networkShortName] = wallet.walletAddress;
                        }
                    });

                    setMerchantWallets(walletMap);
                    console.log('Merchant wallets loaded from backend:', walletMap);
                } else {
                    setMerchantWallets({}); // Empty if no wallets configured
                } 
            } catch (error) {
                console.error('Failed to fetch merchant wallet config:', error);
                setMerchantWallets({});// Empty on error
            }
        };

        fetchMerchantConfig();
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            // Validate email field only
            if (!customerInfo.email) {
                throw new Error('Please enter your email address');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerInfo.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Create order object
            const order = {
                items: cartItems,
                customer: customerInfo,
                totals: {
                    subtotal,
                    total
                },
                paymentMethod,
                merchantWallets: merchantWallets // Include wallet addresses in order
            };

            // Create order in your system
            const orderResponse = await axios.post(`${URL}/api/orders`, order);
            const orderId = orderResponse.data.id;

            setCurrentOrderId(orderId);
            localStorage.setItem('currentOrderId', orderId);

            // UPDATED: Open the enhanced payment modal
            if (paymentMethod === 'coinley') {
                setIsPaymentModalOpen(true);
            } else {
                setProcessing(false);
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.error || err.message || 'There was a problem processing your order. Please try again.');
            setProcessing(false);
        }
    };

    // Handle successful payment - Same logic as before
    const handlePaymentSuccess = async (paymentId, transactionHash, paymentDetails) => {
        try {
            console.log('Payment success:', { paymentId, transactionHash, paymentDetails });
            setPaymentStatus('success');

            const orderId = currentOrderId || localStorage.getItem('currentOrderId');
            if (!orderId) {
                throw new Error('Order ID is missing. Please contact support with your transaction hash.');
            }

            // Update order with payment details
            await axios.put(`${URL}/api/orders/${orderId}`, {
                paymentStatus: 'paid',
                paymentDetails: {
                    paymentId,
                    status: 'success',
                    transactionId: transactionHash,
                    network: paymentDetails?.network,
                    currency: paymentDetails?.currency,
                    amount: paymentDetails?.amount || total,
                    timestamp: new Date().toISOString()
                }
            });

            // Clear the cart
            clearCart();

            // Store success data
            setSuccessData({
                orderId,
                total,
                paymentDetails: {
                    transactionId: transactionHash,
                    paymentId,
                    network: paymentDetails?.network,
                    currency: paymentDetails?.currency
                }
            });

        } catch (err) {
            console.error('Payment update error:', err);
            setError('Payment was received, but we had trouble updating your order. Please contact support with your transaction ID: ' + transactionHash);
        } finally {
            setProcessing(false);
        }
    };

    // Handle payment error - Same logic as before
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentStatus('failed');
        setError(`Payment failed: ${error}`);
        setProcessing(false);
    };

    // Handle closing the payment modal - Same logic as before
    const handleCloseModal = () => {
        console.log('Payment modal closed');
        setIsPaymentModalOpen(false);
        setProcessing(false);

        // Navigate to success page if payment was successful
        if (successData) {
            navigate('/order-success', { state: successData });
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checkout Form - Same as before */}
                <div>
                    <form onSubmit={handleSubmit}>
                        {/* Email Input Only */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address*
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={customerInfo.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your email address"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7042D2]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        id="coinley"
                                        name="paymentMethod"
                                        type="radio"
                                        checked={paymentMethod === 'coinley'}
                                        onChange={() => setPaymentMethod('coinley')}
                                        className="h-4 w-4 text-blue-600 focus:ring-[#7042D2] border-gray-300"
                                    />
                                    <label htmlFor="coinley" className="ml-3 block text-sm font-medium text-gray-700">
                                        Pay with Cryptocurrency
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Order */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}

                            {paymentStatus === 'success' && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                                    Payment successful! 
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-[#7042D2] hover:bg-[#8152E2] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7042D2]"
                                disabled={processing || paymentStatus === 'success'}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary - Same as before */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        <div className="max-h-80 overflow-y-auto mb-4">
                            <ul className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="py-3 flex items-center">
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                            <div className='flex justify-center items-center h-full'>
                                                <PackageSearch />
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-3 border-t pt-3">
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</p>
                            </div>

                            <div className="flex justify-between border-t pt-3">
                                <p className="text-base font-medium text-gray-900">Total</p>
                                <div className="text-right">
                                    <p className="text-base font-bold text-blue-600">${total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* UPDATED: Enhanced Coinley Payment Component with Beautiful Design */}
            <EnhancedSimpleCoinleyPayment
                apiKey="fdb87b029d8fb531589df71e17a8cc55"
                apiSecret="5fe381f54803f100312117028542e952bd5d3d1d8b8df2dd1d0761c030cda4bf"
                apiUrl="http://localhost:9000"
                config={{
                    amount: total,
                    customerEmail: customerInfo.email,
                    merchantName: "Fresh food", // Add your store name here
                    callbackUrl: `${window.location.origin}/api/webhooks/payments/coinley`,
                    merchantWalletAddresses: merchantWallets,
                    metadata: {
                        orderId: currentOrderId,
                        customerName: customerInfo.email
                    }
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onClose={handleCloseModal}
                isOpen={isPaymentModalOpen}
                theme="light"
            />
        </div>
    );
}

export default CheckoutPage;