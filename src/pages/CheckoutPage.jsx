// src/CheckoutPage.jsx - on the store

// ============================================================
// ORIGINAL CHECKOUT PAGE (For USD merchants)
// ============================================================
// import { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import axios from 'axios';
// import { URL } from '../url';
// import { PackageSearch } from 'lucide-react';

// // ============================================================
// // COINLEY-PAY (Production SDK) - Currently Active
// // Using RedesignedCoinleyPayment (new UI with sidebar tabs, grid selection)
// // ============================================================
// import {
//     ThemeProvider,
//     RedesignedCoinleyPayment,  // <- NEW: Redesigned component with sidebar tabs
//     PaymentAPI,
// } from 'coinley-pay';
// import 'coinley-pay/dist/style.css'

// // ============================================================
// // COINLEY-TEST (Staging SDK) - Commented Out
// // ============================================================
// // import {
// //     ThemeProvider,
// //     EnhancedSimpleCoinleyPayment,  // <- Old enhanced component
// //     PaymentAPI,
// // } from 'coinley-test';
// // import 'coinley-test/dist/style.css'

// function CheckoutPage() {
//     const navigate = useNavigate();
//     const { cartItems, subtotal, clearCart } = useCart();

//     // Customer information state - simplified to just email
//     const [customerInfo, setCustomerInfo] = useState({
//         email: '',
//     });

//     // Payment state
//     const [paymentMethod, setPaymentMethod] = useState('coinley');
//     const [processing, setProcessing] = useState(false);
//     const [error, setError] = useState(null);
//     const [currentOrderId, setCurrentOrderId] = useState(null);
//     const [paymentStatus, setPaymentStatus] = useState('pending');

//     // Add state to store payment success data
//     const [successData, setSuccessData] = useState(null);

//     // Add state for merchant wallet configuration
//     const [merchantWallets, setMerchantWallets] = useState({});

//     // NEW: State for the enhanced payment modal
//     const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

//     // Calculate order totals - total is now just the subtotal (no shipping)
//     const total = subtotal;

//     // Merchant public key for API authentication
//     const MERCHANT_PUBLIC_KEY = 'pk_95eb0b7a2fc51bc343527ecc61a90617';
//     // const MERCHANT_PUBLIC_KEY = 'pk_55b618684a25669f942bd4b21a4d61c4';

//     const API_URL = 'https://hub.coinley.io';

//     // Fetch merchant wallet configuration on component mount
//     useEffect(() => {

//         const fetchMerchantConfig = async () => {
//             try {
//                 // Create PaymentAPI instance with public key (no secret needed)
//                 const paymentAPI = new PaymentAPI(API_URL, MERCHANT_PUBLIC_KEY);

//                 // Use the PaymentAPI to fetch merchant wallets
//                 const walletsResponse = await paymentAPI.api.get('/api/merchants/wallets');

//                 if (walletsResponse.data && walletsResponse.data.wallets) {
//                     // Transform the wallet data from backend format to simple key-value pairs
//                     const walletMap = {};
//                     walletsResponse.data.wallets.forEach(wallet => {
//                         if (wallet.walletAddress && wallet.walletAddress.trim() !== '') {
//                             walletMap[wallet.networkShortName] = wallet.walletAddress;
//                         }
//                     });

//                     setMerchantWallets(walletMap);
//                     console.log('Merchant wallets loaded from backend:', walletMap);
//                 } else {
//                     setMerchantWallets({}); // Empty if no wallets configured
//                 }
//             } catch (error) {
//                 console.error('Failed to fetch merchant wallet config:', error);
//                 setMerchantWallets({});// Empty on error
//             }
//         };

//         fetchMerchantConfig();
//     }, []);


//     // Handle input change
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setCustomerInfo(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setProcessing(true);
//         setError(null);

//         try {
//             // Validate email field only
//             if (!customerInfo.email) {
//                 throw new Error('Please enter your email address');
//             }

//             // Validate email format
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             if (!emailRegex.test(customerInfo.email)) {
//                 throw new Error('Please enter a valid email address');
//             }

//             // Create order object
//             const order = {
//                 items: cartItems,
//                 customer: customerInfo,
//                 totals: {
//                     subtotal,
//                     total
//                 },
//                 paymentMethod,
//                 merchantWallets: merchantWallets // Include wallet addresses in order
//             };

//             // Create order in your system
//             const orderResponse = await axios.post(`${URL}/api/orders`, order);
//             const orderId = orderResponse.data.id;

//             setCurrentOrderId(orderId);
//             localStorage.setItem('currentOrderId', orderId);

//             // UPDATED: Open the enhanced payment modal
//             if (paymentMethod === 'coinley') {
//                 setIsPaymentModalOpen(true);
//             } else {
//                 setProcessing(false);
//             }
//         } catch (err) {
//             console.error('Checkout error:', err);
//             setError(err.response?.data?.error || err.message || 'There was a problem processing your order. Please try again.');
//             setProcessing(false);
//         }
//     };

//     // Handle successful payment - Same logic as before
//     const handlePaymentSuccess = async (paymentId, transactionHash, paymentDetails) => {
//         try {
//             console.log('Payment success:', { paymentId, transactionHash, paymentDetails });
//             setPaymentStatus('success');

//             const orderId = currentOrderId || localStorage.getItem('currentOrderId');
//             if (!orderId) {
//                 throw new Error('Order ID is missing. Please contact support with your transaction hash.');
//             }

//             // Update order with payment details
//             await axios.put(`${URL}/api/orders/${orderId}`, {
//                 paymentStatus: 'paid',
//                 paymentDetails: {
//                     paymentId,
//                     status: 'success',
//                     transactionId: transactionHash,
//                     network: paymentDetails?.network,
//                     currency: paymentDetails?.currency,
//                     amount: paymentDetails?.amount || total,
//                     timestamp: new Date().toISOString()
//                 }
//             });

//             // Clear the cart
//             clearCart();

//             // Store success data with all available payment information
//             setSuccessData({
//                 orderId,
//                 total,
//                 paymentDetails: {
//                     transactionId: transactionHash,
//                     paymentId,
//                     network: paymentDetails?.network,
//                     currency: paymentDetails?.currency,
//                     amount: paymentDetails?.amount || total,
//                     senderAddress: paymentDetails?.senderAddress,
//                     timestamp: new Date().toISOString()
//                 }
//             });

//         } catch (err) {
//             console.error('Payment update error:', err);
//             setError('Payment was received, but we had trouble updating your order. Please contact support with your transaction ID: ' + transactionHash);
//         } finally {
//             setProcessing(false);
//         }
//     };

//     // Handle payment error - Same logic as before
//     const handlePaymentError = (error) => {
//         console.error('Payment error:', error);
//         setPaymentStatus('failed');
//         setError(`Payment failed: ${error}`);
//         setProcessing(false);
//     };

//     // Handle closing the payment modal - Same logic as before
//     const handleCloseModal = () => {
//         console.log('Payment modal closed');
//         setIsPaymentModalOpen(false);
//         setProcessing(false);

//         // Navigate to success page if payment was successful
//         if (successData) {
//             navigate('/order-success', { state: successData });
//         }
//     };

//     return (
//         <div className="container mx-auto py-8 px-4">
//             <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Checkout Form - Same as before */}
//                 <div>
//                     <form onSubmit={handleSubmit}>
//                         {/* Email Input Only */}
//                         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                             <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

//                             <div className="space-y-4">
//                                 <div>
//                                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                                         Email Address*
//                                     </label>
//                                     <input
//                                         type="email"
//                                         id="email"
//                                         name="email"
//                                         value={customerInfo.email}
//                                         onChange={handleInputChange}
//                                         required
//                                         placeholder="Enter your email address"
//                                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7042D2]"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Payment Method */}
//                         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                             <div className="space-y-4">
//                                 <div className="flex items-center">
//                                     <input
//                                         id="coinley"
//                                         name="paymentMethod"
//                                         type="radio"
//                                         checked={paymentMethod === 'coinley'}
//                                         onChange={() => setPaymentMethod('coinley')}
//                                         className="h-4 w-4 text-blue-600 focus:ring-[#7042D2] border-gray-300"
//                                     />
//                                     <label htmlFor="coinley" className="ml-3 block text-sm font-medium text-gray-700">
//                                         Pay with Cryptocurrency
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Submit Order */}
//                         <div className="bg-white rounded-lg shadow-md p-6">
//                             {error && (
//                                 <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
//                                     {error}
//                                 </div>
//                             )}

//                             {paymentStatus === 'success' && (
//                                 <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
//                                     Payment successful!
//                                 </div>
//                             )}

//                             <button
//                                 type="submit"
//                                 className="w-full py-2 px-4 bg-[#7042D2] hover:bg-[#8152E2] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7042D2]"
//                                 disabled={processing || paymentStatus === 'success'}
//                             >
//                                 {processing ? (
//                                     <span className="flex items-center justify-center">
//                                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         Processing...
//                                     </span>
//                                 ) : (
//                                     'Place Order'
//                                 )}
//                             </button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Order Summary - Same as before */}
//                 <div>
//                     <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
//                         <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

//                         <div className="max-h-80 overflow-y-auto mb-4">
//                             <ul className="divide-y divide-gray-200">
//                                 {cartItems.map((item) => (
//                                     <li key={item.id} className="py-3 flex items-center">
//                                         <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
//                                             <div className='flex justify-center items-center h-full'>
//                                                 <PackageSearch />
//                                             </div>
//                                         </div>
//                                         <div className="ml-3 flex-1">
//                                             <p className="text-sm font-medium text-gray-900">{item.name}</p>
//                                             <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
//                                         </div>
//                                         <p className="text-sm font-medium text-gray-900">
//                                             ${(item.price * item.quantity).toFixed(2)}
//                                         </p>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>

//                         <div className="space-y-3 border-t pt-3">
//                             <div className="flex justify-between">
//                                 <p className="text-sm text-gray-600">Subtotal</p>
//                                 <p className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</p>
//                             </div>

//                             <div className="flex justify-between border-t pt-3">
//                                 <p className="text-base font-medium text-gray-900">Total</p>
//                                 <div className="text-right">
//                                     <p className="text-base font-bold text-blue-600">${total.toFixed(2)}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* REDESIGNED: Coinley Payment Component with Sidebar Tabs & Grid Selection */}
//             {/*
//                 Note: Webhooks are configured in the Coinley merchant dashboard, not here.
//                 The onSuccess/onError callbacks below are for frontend UI updates only.
//                 Always verify payment status via webhooks before fulfilling orders.
//             */}
//             <RedesignedCoinleyPayment
//                 publicKey={MERCHANT_PUBLIC_KEY}
//                 apiUrl={API_URL}
//                 config={{
//                     amount: total,
//                     customerEmail: customerInfo.email,
//                     merchantName: "Fresh food",
//                     merchantWalletAddresses: merchantWallets,
//                     metadata: {
//                         orderId: currentOrderId,
//                         customerName: customerInfo.email
//                     }
//                 }}
//                 onSuccess={handlePaymentSuccess}
//                 onError={handlePaymentError}
//                 onClose={handleCloseModal}
//                 isOpen={isPaymentModalOpen}
//                 theme="light"
//             />
//         </div>
//     );
// }

// export default CheckoutPage;


// ============================================================
// NAIRA MERCHANT CHECKOUT PAGE (For NGN merchants)
// Uses CoinMarketCap API for NGN to USDT conversion
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { URL } from '../url';
import { PackageSearch, RefreshCw, AlertCircle } from 'lucide-react';

// Coinley-pay SDK
import {
    ThemeProvider,
    RedesignedCoinleyPayment,
    PaymentAPI,
} from 'coinley-pay';
import 'coinley-pay/dist/style.css';

// Currency converter utility for NGN to USDT conversion
import {
    fetchExchangeRates,
    convertNGNToCrypto,
    formatCurrency
} from '../utils/currencyConverter';

function CheckoutPage() {
    const navigate = useNavigate();
    const { cartItems, subtotal, clearCart } = useCart();

    // Customer information
    const [customerInfo, setCustomerInfo] = useState({ email: '' });

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('coinley');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [successData, setSuccessData] = useState(null);
    const [merchantWallets, setMerchantWallets] = useState({});
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Exchange rate state (for Naira merchants using CoinMarketCap)
    const [exchangeRates, setExchangeRates] = useState(null);
    const [ratesLoading, setRatesLoading] = useState(true);
    const [ratesError, setRatesError] = useState(null);
    const [lastRateUpdate, setLastRateUpdate] = useState(null);
    const [convertedPrice, setConvertedPrice] = useState(null);

    // Total in NGN (subtotal from cart is in Naira for naira merchants)
    const totalNGN = subtotal;

    // Merchant configuration
    const MERCHANT_PUBLIC_KEY = 'pk_95eb0b7a2fc51bc343527ecc61a90617';
    const API_URL = 'https://hub.coinley.io';

    // ⚠️ IMPORTANT: Replace with your CoinMarketCap API key
    // Get your API key at: https://coinmarketcap.com/api/
    const CMC_API_KEY = 'fa1c508f6c3649f082a2bb1ad7962d60';

    // Load exchange rates on mount
    useEffect(() => {
        loadExchangeRates();
    }, []);

    // Update converted price when rates or total changes
    useEffect(() => {
        if (exchangeRates && totalNGN > 0) {
            try {
                const conversion = convertNGNToCrypto(totalNGN, 'USDT', exchangeRates);
                setConvertedPrice(conversion);
            } catch (err) {
                console.error('Conversion error:', err);
            }
        }
    }, [exchangeRates, totalNGN]);

    // Load exchange rates from CoinMarketCap
    async function loadExchangeRates() {
        setRatesLoading(true);
        setRatesError(null);

        try {
            const rates = await fetchCoinMarketCapRates(CMC_API_KEY);
            setExchangeRates(rates);
            setLastRateUpdate(new Date());
        } catch (err) {
            setRatesError('Failed to load exchange rates. Please try again.');
            console.error('Failed to load rates:', err);
        } finally {
            setRatesLoading(false);
        }
    }

    // Fetch merchant wallet configuration
    useEffect(() => {
        const fetchMerchantConfig = async () => {
            try {
                const paymentAPI = new PaymentAPI(API_URL, MERCHANT_PUBLIC_KEY);
                const walletsResponse = await paymentAPI.api.get('/api/merchants/wallets');

                if (walletsResponse.data?.wallets) {
                    const walletMap = {};
                    walletsResponse.data.wallets.forEach(wallet => {
                        if (wallet.walletAddress?.trim()) {
                            walletMap[wallet.networkShortName] = wallet.walletAddress;
                        }
                    });
                    setMerchantWallets(walletMap);
                    console.log('Merchant wallets loaded:', walletMap);
                }
            } catch (error) {
                console.error('Failed to fetch merchant wallets:', error);
            }
        };
        fetchMerchantConfig();
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            // Validate email
            if (!customerInfo.email) {
                throw new Error('Please enter your email address');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerInfo.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Ensure we have exchange rates
            if (!convertedPrice) {
                throw new Error('Exchange rates not available. Please refresh and try again.');
            }

            // Create order with both NGN and USDT amounts
            const order = {
                items: cartItems,
                customer: customerInfo,
                totals: {
                    subtotalNGN: totalNGN,
                    subtotalUSDT: convertedPrice.convertedAmount,
                    exchangeRate: convertedPrice.exchangeRate,
                    rateTimestamp: convertedPrice.rateTimestamp
                },
                paymentMethod: 'coinley',
                merchantWallets,
                isNairaMerchant: true
            };

            // Create order
            const orderResponse = await axios.post(`${URL}/api/orders`, order);
            const orderId = orderResponse.data.id;

            setCurrentOrderId(orderId);
            localStorage.setItem('currentOrderId', orderId);

            // Open payment modal
            setIsPaymentModalOpen(true);

        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.error || err.message);
            setProcessing(false);
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (paymentId, transactionHash, paymentDetails) => {
        try {
            console.log('Payment success:', { paymentId, transactionHash, paymentDetails });
            setPaymentStatus('success');

            const orderId = currentOrderId || localStorage.getItem('currentOrderId');
            if (!orderId) {
                throw new Error('Order ID missing');
            }

            // Update order with payment details
            await axios.put(`${URL}/api/orders/${orderId}`, {
                paymentStatus: 'paid',
                paymentDetails: {
                    paymentId,
                    transactionId: transactionHash,
                    network: paymentDetails?.network,
                    currency: paymentDetails?.currency,
                    amountUSDT: convertedPrice?.convertedAmount,
                    amountNGN: totalNGN,
                    exchangeRate: convertedPrice?.exchangeRate,
                    timestamp: new Date().toISOString()
                }
            });

            clearCart();

            setSuccessData({
                orderId,
                totalNGN,
                totalUSDT: convertedPrice?.convertedAmount,
                paymentDetails: {
                    transactionId: transactionHash,
                    paymentId,
                    network: paymentDetails?.network,
                    currency: paymentDetails?.currency
                }
            });

        } catch (err) {
            console.error('Payment update error:', err);
            setError('Payment received but order update failed. Contact support with TX: ' + transactionHash);
        } finally {
            setProcessing(false);
        }
    };

    // Handle payment error
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentStatus('failed');
        setError(`Payment failed: ${error}`);
        setProcessing(false);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setIsPaymentModalOpen(false);
        setProcessing(false);
        if (successData) {
            navigate('/order-success', { state: successData });
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2 text-center">Checkout</h1>
            <p className="text-center text-gray-500 mb-8">Pay with Cryptocurrency (NGN to USDT)</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checkout Form */}
                <div>
                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
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

                        {/* Exchange Rate Info */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-purple-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Exchange Rate</h2>
                                <button
                                    type="button"
                                    onClick={loadExchangeRates}
                                    disabled={ratesLoading}
                                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                                >
                                    <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>

                            {ratesError ? (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{ratesError}</span>
                                </div>
                            ) : ratesLoading ? (
                                <div className="text-gray-500">Loading exchange rates...</div>
                            ) : exchangeRates ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">1 USDT =</span>
                                        <span className="font-semibold text-gray-800">
                                            {formatCurrency(exchangeRates.USDT?.NGN || 0, 'NGN')}
                                        </span>
                                    </div>
                                    {lastRateUpdate && (
                                        <div className="text-xs text-gray-400">
                                            Last updated: {lastRateUpdate.toLocaleTimeString()}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400">
                                        Powered by CoinMarketCap
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Submit Button */}
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
                                className="w-full py-3 px-4 bg-[#7042D2] hover:bg-[#8152E2] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7042D2] disabled:opacity-50"
                                disabled={processing || paymentStatus === 'success' || ratesLoading || !exchangeRates}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Pay ${convertedPrice ? formatCurrency(convertedPrice.convertedAmount, 'USDT') : '...'}`
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        {/* Cart Items */}
                        <div className="max-h-60 overflow-y-auto mb-4">
                            <ul className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="py-3 flex items-center">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                            <PackageSearch className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(item.price * item.quantity, 'NGN')}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Totals */}
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal (NGN)</span>
                                <span className="font-medium">{formatCurrency(totalNGN, 'NGN')}</span>
                            </div>

                            {convertedPrice && (
                                <>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Exchange Rate</span>
                                        <span>1 USDT = {formatCurrency(convertedPrice.exchangeRate, 'NGN')}</span>
                                    </div>

                                    <div className="flex justify-between border-t pt-3">
                                        <span className="text-lg font-semibold">Pay in USDT</span>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-purple-600">
                                                {formatCurrency(convertedPrice.convertedAmount, 'USDT')}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                ≈ {formatCurrency(totalNGN, 'NGN')}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Coinley Payment Modal */}
            <RedesignedCoinleyPayment
                publicKey={MERCHANT_PUBLIC_KEY}
                apiUrl={API_URL}
                config={{
                    amount: convertedPrice?.convertedAmount || 0, // Amount in USDT
                    customerEmail: customerInfo.email,
                    merchantName: "Naira Store",
                    merchantWalletAddresses: merchantWallets,
                    metadata: {
                        orderId: currentOrderId,
                        originalAmountNGN: totalNGN,
                        exchangeRate: convertedPrice?.exchangeRate,
                        customerEmail: customerInfo.email
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
