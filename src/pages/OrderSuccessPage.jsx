import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Coinley API URL for fetching payment details
const COINLEY_API_URL = 'https://talented-mercy-production.up.railway.app';

// Network icons/colors mapping
const networkConfig = {
  ethereum: { color: '#627EEA', name: 'Ethereum' },
  bsc: { color: '#F3BA2F', name: 'BNB Smart Chain' },
  polygon: { color: '#8247E5', name: 'Polygon' },
  arbitrum: { color: '#28A0F0', name: 'Arbitrum' },
  optimism: { color: '#FF0420', name: 'Optimism' },
  avalanche: { color: '#E84142', name: 'Avalanche' },
  base: { color: '#0052FF', name: 'Base' },
  celo: { color: '#FCFF52', name: 'Celo' }
};

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, paymentDetails } = location.state || {};

  // State for fetched payment data
  const [fullPaymentData, setFullPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // If user tries to access this page directly without completing an order, redirect to home
  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  // Fetch full payment details from Coinley API
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentDetails?.paymentId) return;

      setLoading(true);
      setFetchError(null);

      try {
        const response = await axios.get(
          `${COINLEY_API_URL}/api/payments/public/${paymentDetails.paymentId}`
        );

        if (response.data?.success && response.data?.payment) {
          setFullPaymentData(response.data.payment);
        }
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
        setFetchError('Could not load additional payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentDetails?.paymentId]);

  // Helper to truncate wallet addresses
  const truncateAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper to copy to clipboard
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get explorer URL for transaction
  const getExplorerUrl = () => {
    if (!fullPaymentData?.Network?.explorerUrl || !paymentDetails?.transactionId) return null;
    return `${fullPaymentData.Network.explorerUrl}/tx/${paymentDetails.transactionId}`;
  };

  // Get network display info
  const getNetworkInfo = () => {
    const networkKey = fullPaymentData?.Network?.shortName || paymentDetails?.network;
    return networkConfig[networkKey] || { color: '#6B7280', name: networkKey || 'Unknown' };
  };

  if (!orderId) {
    return null;
  }

  const networkInfo = getNetworkInfo();
  const explorerUrl = getExplorerUrl();

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mt-2">Your order has been placed and payment confirmed.</p>
        </div>

        {/* Order Details */}
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
                <p className="font-medium">Cryptocurrency</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="text-green-600 font-medium">Confirmed</p>
              </div>
            </div>
          </div>

          {/* Blockchain Payment Details */}
          {paymentDetails && (
            <div className="border border-gray-200 rounded-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Blockchain Payment Details
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-600">Loading payment details...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Network & Token Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Network</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: networkInfo.color }}
                        ></span>
                        <p className="font-semibold text-gray-900">
                          {fullPaymentData?.Network?.name || networkInfo.name}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Token</p>
                      <p className="font-semibold text-gray-900">
                        {fullPaymentData?.Token?.symbol || paymentDetails.currency || 'USDT'}
                        {fullPaymentData?.Token?.name && (
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            ({fullPaymentData.Token.name})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Amount Paid</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {fullPaymentData?.amount || paymentDetails.amount || total} {fullPaymentData?.Token?.symbol || paymentDetails.currency || 'USDT'}
                    </p>
                  </div>

                  {/* Transaction Hash */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                        {paymentDetails.transactionId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.transactionId, 'Transaction hash')}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Copy transaction hash"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2"
                      >
                        View on Explorer
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Sender Wallet Address */}
                  {(fullPaymentData?.senderAddress || paymentDetails.senderAddress) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Your Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                          {fullPaymentData?.senderAddress || paymentDetails.senderAddress}
                        </code>
                        <button
                          onClick={() => copyToClipboard(fullPaymentData?.senderAddress || paymentDetails.senderAddress, 'Wallet address')}
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy wallet address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Merchant Wallet (where payment went) */}
                  {fullPaymentData?.merchantWallet && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Merchant Wallet</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                          {fullPaymentData.merchantWallet}
                        </code>
                        <button
                          onClick={() => copyToClipboard(fullPaymentData.merchantWallet, 'Merchant wallet')}
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy merchant wallet"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Token Contract Address */}
                  {fullPaymentData?.Token?.contractAddress && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Token Contract</p>
                      <code className="block bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all text-gray-600">
                        {fullPaymentData.Token.contractAddress}
                      </code>
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className="font-semibold text-green-600 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {(fullPaymentData?.status || 'completed').charAt(0).toUpperCase() + (fullPaymentData?.status || 'completed').slice(1)}
                      </p>
                    </div>
                    {paymentDetails.timestamp && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Timestamp</p>
                        <p className="font-medium text-gray-700">
                          {new Date(paymentDetails.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {fetchError && (
                    <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                      {fetchError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
