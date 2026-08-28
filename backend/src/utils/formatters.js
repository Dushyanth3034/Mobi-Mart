/**
 * Format a number as Indian Currency string: e.g. ₹4,00,00,000, ₹28,50,000, ₹1,25,000
 * @param {number} amount
 * @param {boolean} includeSymbol
 * @returns {string}
 */
function formatRupee(amount, includeSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? '₹0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  // Convert to Indian format (xx,xx,xxx)
  let str = absAmount.toString();
  let lastThree = str.substring(str.length - 3);
  let otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  let res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const prefix = includeSymbol ? '₹' : '';
  const sign = isNegative ? '-' : '';
  return `${sign}${prefix}${res}`;
}

/**
 * Format large numbers in compact Indian notation (e.g. ₹4.00 Cr, ₹28.50 L, ₹45.2 K)
 * @param {number} amount
 * @returns {string}
 */
function formatRupeeCompact(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const sign = isNegative ? '-' : '';

  if (absAmount >= 10000000) {
    return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    return `${sign}₹${(absAmount / 100000).toFixed(2)} L`;
  } else if (absAmount >= 1000) {
    return `${sign}₹${(absAmount / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${Math.round(absAmount)}`;
}

/**
 * Format percentage
 * @param {number} val
 * @param {number} decimals
 * @returns {string}
 */
function formatPercent(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(decimals)}%`;
}

module.exports = {
  formatRupee,
  formatRupeeCompact,
  formatPercent
};
