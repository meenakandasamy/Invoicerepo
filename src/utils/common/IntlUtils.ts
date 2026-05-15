/**
 * Custom Intl Utils
 *
 * This module provides utility functions for formatting numbers and dates according to user locale.
 */

/**
 * Format a number as currency according to user locale and currency.
 * @param {Object} options - Options for formatting the number.
 * @param {number} options.value - The number to be formatted.
 * @param {string} [options.locale] - The locale to use for formatting (defaults to navigator.language).
 * @param {string} [options.currency] - The currency to use for formatting (defaults to 'INR').
 * @returns {string} The formatted number as currency.
 */
function formatCurrency({
  value,
  locale = navigator.language,
  currency = 'INR',
}: {
  value: number;
  locale?: string;
  currency?: string;
}): string {
  const userLocale = locale;
  const userCurrency = currency;
  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    currency: userCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const INTL_UTILS = { formatCurrency };
