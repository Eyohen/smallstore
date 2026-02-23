/**
 * Currency Converter Utility
 * Fetches exchange rates from Coinley backend (which proxies to multiple providers)
 *
 * Supported providers:
 * - free (default): No API key required
 * - coinmarketcap: Requires API key from https://coinmarketcap.com/api/
 * - exchangerate_api: Requires API key from https://www.exchangerate-api.com/
 * - openexchangerates: Requires API key from https://openexchangerates.org/
 */

// Cache for exchange rates (to reduce API calls)
const rateCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

/**
 * Fetch exchange rates from Coinley backend
 * @param {Object} options - Configuration options
 * @param {string} options.apiUrl - Coinley API URL (e.g., 'https://talented-mercy-production.up.railway.app')
 * @param {string} options.provider - Provider: 'free' | 'coinmarketcap' | 'exchangerate_api' | 'openexchangerates'
 * @param {string} options.apiKey - API key (required for paid providers)
 * @param {string} options.currency - Target currency (default: 'NGN')
 * @returns {Object} Exchange rates data
 */
export async function fetchExchangeRates(options = {}) {
  const {
    apiUrl = 'https://talented-mercy-production.up.railway.app',
    provider = 'free',
    apiKey = '',
    currency = 'NGN'
  } = options;

  // Check cache first
  const now = Date.now();
  if (rateCache.data && (now - rateCache.timestamp) < rateCache.ttl) {
    console.log('[CurrencyConverter] Using cached rates');
    return rateCache.data;
  }

  try {
    // Build query params
    const params = new URLSearchParams({
      provider,
      currency
    });

    if (apiKey) {
      params.append('apiKey', apiKey);
    }

    const response = await fetch(
      `${apiUrl}/api/currency/ngn-rates?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch rates');
    }

    // Update cache
    rateCache.data = result.data;
    rateCache.timestamp = now;

    console.log('[CurrencyConverter] Fetched rates from', provider, ':', result.data);
    return result.data;

  } catch (error) {
    console.error('[CurrencyConverter] Error fetching rates:', error);
    throw error;
  }
}

/**
 * Fetch list of available providers
 * @param {string} apiUrl - Coinley API URL
 * @returns {Array} List of providers
 */
export async function fetchProviders(apiUrl = 'https://talented-mercy-production.up.railway.app') {
  try {
    const response = await fetch(`${apiUrl}/api/currency/providers`);
    const result = await response.json();
    return result.providers || [];
  } catch (error) {
    console.error('[CurrencyConverter] Error fetching providers:', error);
    return [];
  }
}

/**
 * Convert fiat amount to crypto (USDT/USDC)
 * @param {number} amount - Amount in fiat currency
 * @param {string} cryptoCurrency - Target crypto (USDT or USDC)
 * @param {Object} rates - Exchange rates object from fetchExchangeRates
 * @param {string} fiatCurrency - Source fiat currency (default: NGN)
 * @returns {Object} Conversion result
 */
export function convertFiatToCrypto(amount, cryptoCurrency = 'USDT', rates, fiatCurrency = 'NGN') {
  if (!rates || !rates[cryptoCurrency]?.[fiatCurrency]) {
    throw new Error('Exchange rates not available');
  }

  const rate = rates[cryptoCurrency][fiatCurrency];
  const cryptoAmount = amount / rate;

  return {
    originalAmount: amount,
    originalCurrency: fiatCurrency,
    convertedAmount: parseFloat(cryptoAmount.toFixed(6)),
    convertedCurrency: cryptoCurrency,
    exchangeRate: rate,
    rateTimestamp: rates.timestamp,
    provider: rates.provider
  };
}

// Alias for backward compatibility
export const convertNGNToCrypto = (ngnAmount, cryptoCurrency = 'USDT', rates) => {
  return convertFiatToCrypto(ngnAmount, cryptoCurrency, rates, 'NGN');
};

/**
 * Convert crypto to fiat amount
 * @param {number} cryptoAmount - Amount in crypto
 * @param {string} cryptoCurrency - Source crypto (USDT or USDC)
 * @param {Object} rates - Exchange rates object
 * @param {string} fiatCurrency - Target fiat currency (default: NGN)
 * @returns {Object} Conversion result
 */
export function convertCryptoToFiat(cryptoAmount, cryptoCurrency = 'USDT', rates, fiatCurrency = 'NGN') {
  if (!rates || !rates[cryptoCurrency]?.[fiatCurrency]) {
    throw new Error('Exchange rates not available');
  }

  const rate = rates[cryptoCurrency][fiatCurrency];
  const fiatAmount = cryptoAmount * rate;

  return {
    originalAmount: cryptoAmount,
    originalCurrency: cryptoCurrency,
    convertedAmount: parseFloat(fiatAmount.toFixed(2)),
    convertedCurrency: fiatCurrency,
    exchangeRate: rate,
    rateTimestamp: rates.timestamp,
    provider: rates.provider
  };
}

// Alias for backward compatibility
export const convertCryptoToNGN = (cryptoAmount, cryptoCurrency = 'USDT', rates) => {
  return convertCryptoToFiat(cryptoAmount, cryptoCurrency, rates, 'NGN');
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (NGN, USDT, USDC, USD, etc.)
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, currency) {
  switch (currency) {
    case 'NGN':
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'USD':
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${amount.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GBP':
      return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'USDT':
    case 'USDC':
      return `${amount.toFixed(6)} ${currency}`;
    default:
      return `${amount} ${currency}`;
  }
}

/**
 * Create a currency converter instance with pre-configured options
 * @param {Object} config - Configuration
 * @returns {Object} Converter instance with methods
 */
export function createCurrencyConverter(config = {}) {
  const {
    apiUrl = 'https://talented-mercy-production.up.railway.app',
    provider = 'free',
    apiKey = '',
    currency = 'NGN'
  } = config;

  let rates = null;
  let loading = false;
  let error = null;

  return {
    async init() {
      loading = true;
      error = null;
      try {
        rates = await fetchExchangeRates({ apiUrl, provider, apiKey, currency });
        loading = false;
        return rates;
      } catch (e) {
        error = e.message;
        loading = false;
        throw e;
      }
    },

    convertToCrypto(amount, cryptoCurrency = 'USDT') {
      if (!rates) throw new Error('Rates not loaded. Call init() first.');
      return convertFiatToCrypto(amount, cryptoCurrency, rates, currency);
    },

    convertToFiat(cryptoAmount, cryptoCurrency = 'USDT') {
      if (!rates) throw new Error('Rates not loaded. Call init() first.');
      return convertCryptoToFiat(cryptoAmount, cryptoCurrency, rates, currency);
    },

    getRates() {
      return rates;
    },

    isLoading() {
      return loading;
    },

    getError() {
      return error;
    },

    getProvider() {
      return rates?.provider || provider;
    }
  };
}

// ============================================================
// LEGACY SUPPORT - Old function name for backward compatibility
// ============================================================
export async function fetchCoinMarketCapRates(apiKey) {
  // This now uses the backend with coinmarketcap provider
  return fetchExchangeRates({
    provider: apiKey ? 'coinmarketcap' : 'free',
    apiKey
  });
}
