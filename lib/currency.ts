// Money utilities using minor units (paise) to guarantee integer arithmetic safety

export const PAISE_PER_RUPEE = 100;
export const PLATFORM_FEE_PERCENTAGE = 15;
export const GST_RATE = 18;

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / PAISE_PER_RUPEE;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

export function formatINR(paise: number, options?: { showDecimal?: boolean }): string {
  const rupees = paiseToRupees(paise);
  const showDec = options?.showDecimal ?? (rupees % 1 !== 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDec ? 2 : 0,
    maximumFractionDigits: showDec ? 2 : 0,
  }).format(rupees);
}

export function calculateCommissionBreakdown(
  effectiveBidPaise: number,
  commissionPercent = PLATFORM_FEE_PERCENTAGE,
  gstPercent = GST_RATE
) {
  const platformFeePaise = Math.round((effectiveBidPaise * commissionPercent) / 100);
  const gstPaise = Math.round((platformFeePaise * gstPercent) / 100);
  const totalChargePaise = effectiveBidPaise + platformFeePaise + gstPaise;

  return {
    baseBidPaise: effectiveBidPaise,
    platformFeePaise,
    gstPaise,
    totalChargePaise,
    commissionPercent,
    gstPercent,
  };
}
