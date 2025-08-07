// Simple demo app - use this for quick testing

import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, CoinleyProvider, CoinleyCheckout } from 'coinley-checkout';

function QuickDemo() {
  const checkoutRef = useRef(null);
  
  const handlePay = () => {
    console.log('Starting payment...');
    // Open the checkout - this triggers the modal
    checkoutRef.current.open({
      amount: 1.09,
      currency: 'USDT',
      metadata: { orderId: 'test-order-123' }
    });
  };
  
  return (
    <div style={{ maxWidth: '500px', margin: '100px auto', textAlign: 'center' }}>
      <h1>Coinley Checkout Quick Test</h1>
      <button 
        onClick={handlePay}
        style={{
          padding: '10px 20px',
          background: '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Test Payment Flow
      </button>
      
      <ThemeProvider initialTheme="light">
        <CoinleyProvider
          apiKey="fdb87b029d8fb531589df71e17a8cc55"
          apiSecret="5fe381f54803f100312117028542e952bd5d3d1d8b8df2dd1d0761c030cda4bf"
          apiUrl="http://localhost:9000"
          debug={true}
        >
          <CoinleyCheckout
            ref={checkoutRef}
            merchantName="Test Store"
            onSuccess={(paymentId, txHash) => {
              console.log('SUCCESS!', paymentId, txHash);
              alert('Payment successful! ' + txHash.slice(0, 10) + '...');
            }}
            onError={(err) => {
              console.error('ERROR!', err);
              alert('Payment failed: ' + err.message);
            }}
            onClose={() => console.log('Modal closed')}
          />
        </CoinleyProvider>
      </ThemeProvider>
    </div>
  );
}

export default QuickDemo;

// Render the app
// ReactDOM.render(<QuickDemo />, document.getElementById('root'));