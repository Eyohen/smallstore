// src/CheckoutPage.jsx - on the store

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { URL } from '../url';
import { PackageSearch } from 'lucide-react';

// import {
//     ThemeProvider,
//     CoinleyPayment,
//     PaymentAPI,
// } from 'stablezact-pay';
import { StablezactPayment } from 'stablezact-pay';

import 'stablezact-pay/dist/style.css'

const MERCHANT_PUBLIC_KEY = import.meta.env.VITE_STABLEZACT_PUBLIC_KEY;
const STABLEZACT_API_URL = import.meta.env.VITE_STABLEZACT_API_URL;

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

    // NEW: State for the enhanced payment modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [checkoutReference, setCheckoutReference] = useState(null);

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        root.classList.toggle('coinley-sdk-open', isPaymentModalOpen);
        body.classList.toggle('coinley-sdk-open', isPaymentModalOpen);

        return () => {
            root.classList.remove('coinley-sdk-open');
            body.classList.remove('coinley-sdk-open');
        };
    }, [isPaymentModalOpen]);

    // Calculate order totals - total is now just the subtotal (no shipping)
    const total = subtotal;

    
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

            if (!MERCHANT_PUBLIC_KEY || !STABLEZACT_API_URL) {
                throw new Error('Checkout is temporarily unavailable because its staging configuration is incomplete.');
            }

            const email = customerInfo.email.trim();
            const atIndex = email.indexOf('@');
            const dotIndex = email.lastIndexOf('.');
            const validEmail = email.length <= 254
                && atIndex > 0
                && atIndex === email.lastIndexOf('@')
                && dotIndex > atIndex + 1
                && dotIndex < email.length - 1
                && !email.includes(' ');
            if (!validEmail) {
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
                paymentMethod
            };

            // Create order in your system
            const orderResponse = await axios.post(`${URL}/api/orders`, order);
            const orderId = orderResponse.data.id;

            setCurrentOrderId(orderId);
            localStorage.setItem('currentOrderId', orderId);

            // UPDATED: Open the enhanced payment modal
            if (paymentMethod === 'coinley') {
                const checkoutResponse = await axios.post(`${URL}/api/orders/${orderId}/checkout-reference`);
                if (!checkoutResponse.data?.reference) {
                    throw new Error('The payment checkout could not be initialized.');
                }
                setCheckoutReference(checkoutResponse.data.reference);
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
    const handlePaymentSuccess = async ({ paymentId, transactionHash, senderAddress, network, currency, paymentDetails, depositAddress }) => {
        try {
            console.log('Payment success:', { paymentId, transactionHash, senderAddress, network, currency, paymentDetails, depositAddress });
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
                    network: network || paymentDetails?.network,
                    currency: currency || paymentDetails?.currency,
                    amount: paymentDetails?.amount || total,
                    timestamp: new Date().toISOString()
                }
            });

            // Clear the cart
            clearCart();

            // Store success data with all available payment information
            setSuccessData({
                orderId,
                total,
                paymentDetails: {
                    transactionId: transactionHash,
                    paymentId,
                    network: network || paymentDetails?.network,
                    currency: currency || paymentDetails?.currency,
                    amount: paymentDetails?.amount || total,
                    senderAddress: senderAddress || paymentDetails?.senderAddress,
                    timestamp: new Date().toISOString()
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
        setCheckoutReference(null);
        setProcessing(false);

        // Navigate to success page if payment was successful
        if (successData) {
            navigate('/order-success', { state: successData });
        }
    };

    return (
        <div className="smallstore-checkout-page container mx-auto px-4 py-6 sm:py-8">
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
                    <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-6">
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

            {MERCHANT_PUBLIC_KEY && STABLEZACT_API_URL && checkoutReference && <StablezactPayment
                publicKey={MERCHANT_PUBLIC_KEY}
                apiUrl={STABLEZACT_API_URL}
                reference={checkoutReference}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onClose={handleCloseModal}
                isOpen={isPaymentModalOpen}
                theme="light"
            />}
        </div>
    );
}

export default CheckoutPage;
