interface PaymentTermValidationResult {
  isValid: boolean;
  errors: string[];
  cleanedData: any;
}

export const validatePaymentTerms = (
  data: any,
): PaymentTermValidationResult => {
  const errors: string[] = [];
  const cleanedData = { ...data };
  const installments = Number(cleanedData.noOfInstallments) || 0;

  // Validate installment count
  if (installments < 1) {
    errors.push('Number of installments must be at least 1');
  }

  let sumPercentages = 0;
  const maxInstallments = 6;
  let hasEmptyInstallments = false;
  let previousNetDays = -1;

  // Validate each active installment
  for (let i = 1; i <= maxInstallments; i++) {
    const percentageKey = `payment${i}Percentage`;
    const daysKey = `net${i}Days`;

    // Convert to numbers (null/undefined becomes 0)
    cleanedData[percentageKey] = Number(cleanedData[percentageKey]) || 0;
    cleanedData[daysKey] = Number(cleanedData[daysKey]) || 0;

    if (i <= installments) {
      // Check for empty payment terms (special handling for first installment)
      const isFirstInstallment = i === 1;
      const isEmptyPayment = cleanedData[percentageKey] === 0;
      const isEmptyNetDays = cleanedData[daysKey] === 0;

      // Only consider it "empty" if:
      // - Payment is 0 (for any installment), OR
      // - Net days is 0 AND it's not the first installment
      if (isEmptyPayment || (!isFirstInstallment && isEmptyNetDays)) {
        hasEmptyInstallments = true;
      }

      // Payment % validation (must be > 0 for all installments)
      if (cleanedData[percentageKey] <= 0) {
        errors.push(`Payment ${i} percentage must be greater than 0`);
      }

      // Net days validation
      if (isFirstInstallment) {
        // Only net days 1 can be 0 (but not negative)
        if (cleanedData[daysKey] < 0) {
          errors.push(`Net days ${i} cannot be negative`);
        }
      } else {
        // Subsequent net days must be > 0 and > previous net days
        if (cleanedData[daysKey] <= 0) {
          errors.push(`Net days ${i} must be greater than 0`);
        } else if (cleanedData[daysKey] < previousNetDays) {
          errors.push(`Net days ${i} must be greater than net days ${i - 1}`);
        }
      }

      previousNetDays = cleanedData[daysKey];
      sumPercentages += cleanedData[percentageKey];
    } else {
      // Reset inactive fields
      cleanedData[percentageKey] = 0;
      cleanedData[daysKey] = 0;
    }
  }

  // Special error message for empty installments (won't show if only net1Days is 0)
  if (hasEmptyInstallments) {
    errors.unshift(
      `Enter payment term fields for ${installments} installments`,
    );
  }

  // Validate sum of percentages
  if (Math.abs(sumPercentages - 100) > 0.001) {
    errors.push(
      `Payment percentages must sum to 100 (current sum: ${sumPercentages.toFixed(2)})`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData,
  };
};
