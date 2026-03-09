export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', rate: 840 },
  { code: 'UYU', symbol: '$U', name: 'Peso Uruguayo', rate: 39 },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', rate: 5 },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', rate: 17 },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', rate: 950 },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', rate: 3900 },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', rate: 3.7 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 150 },
];

export const getLocalCurrency = () => {
  try {
    const locale = navigator.language;
    const region = locale.split('-')[1] || locale.toUpperCase();
    
    const regionToCurrency: { [key: string]: string } = {
      'UY': 'UYU',
      'AR': 'ARS',
      'BR': 'BRL',
      'MX': 'MXN',
      'CL': 'CLP',
      'CO': 'COP',
      'PE': 'PEN',
      'ES': 'EUR',
      'US': 'USD',
      'GB': 'GBP',
      'JP': 'JPY',
    };

    return regionToCurrency[region] || 'USD';
  } catch (e) {
    return 'USD';
  }
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  // Try to find the currency in our list for rates
  const currency = currencies.find(c => c.code === currencyCode) || { code: currencyCode, rate: 1 };
  const convertedAmount = amount * (currency.rate || 1);
  
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
};
