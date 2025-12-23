import Decimal from "decimal.js";

type DecimalType = InstanceType<typeof Decimal>;

/**
 * Defines when payments are made during a period.
 */
export type PaymentTiming = 0 | 1;

export const PaymentTiming = {
  EndOfPeriod: 0 as PaymentTiming,
  BeginningOfPeriod: 1 as PaymentTiming,
};

/**
 * Calculates the payment (PMT) using arbitrary-precision arithmetic.
 * * @param rate - Interest rate per period (e.g., 0.05/12).
 * @param periods - Total number of periods (NPER).
 * @param presentValue - The present value (PV).
 * @param futureValue - The future value (FV). Default is 0.
 * @param timing - Payment timing (0 = End, 1 = Beginning).
 * @returns Decimal - Returns a Decimal object to allow the caller to define rounding strategy.
 */
export function calculatePMT(
  rate: number | string | DecimalType,
  periods: number | string | DecimalType,
  presentValue: number | string | DecimalType,
  futureValue: number | string | DecimalType = 0,
  timing: PaymentTiming = PaymentTiming.EndOfPeriod
): DecimalType {
  // Convert all inputs to Decimal immediately
  const r = new Decimal(rate);
  const n = new Decimal(periods);
  const pv = new Decimal(presentValue);
  const fv = new Decimal(futureValue);

  // Guard: Zero periods
  if (n.isZero()) {
    throw new Error("Number of periods cannot be zero.");
  }

  // Handle Zero Interest Rate
  if (r.isZero()) {
    // -(pv + fv) / n
    return pv.plus(fv).negated().div(n);
  }

  // Calculate Compound Factor: (1 + r)^n
  const compoundFactor = r.plus(1).pow(n);

  // Calculate PMT (Annuity Immediate)
  // Formula: (pv * r * (1+r)^n + fv * r) / ((1+r)^n - 1)
  const numerator = r.times(pv.times(compoundFactor).plus(fv));

  // denominator = compoundFactor - 1
  const denominator = compoundFactor.minus(1);

  let pmt = numerator.div(denominator);

  // Adjust for Annuity Due (Beginning of Period)
  if (timing === PaymentTiming.BeginningOfPeriod) {
    // pmt /= (1 + r)
    pmt = pmt.div(r.plus(1));
  }

  // Return negative to signify cash outflow (standard financial convention)
  return pmt.negated();
}

/**
 * Determines the effective and stress rates based on mortgage type (fixed/variable).
 */
export function getMortgageRates(mortgage: {
  amount: number;
  term: number;
  type: "fixed" | "variable";
  fixedRate: number;
  varCurrent: number;
  varExpected: number;
}) {
  const isFixed = mortgage.type === "fixed";
  const effectiveRate = isFixed ? mortgage.fixedRate : mortgage.varExpected;
  // Standard banking stress test is often +2% or +2.5%
  const stressRate = isFixed ? mortgage.fixedRate : mortgage.varExpected + 2.5;

  return {
    effectiveRate,
    stressRate,
    monthlyRate: effectiveRate / 100 / 12,
    stressMonthlyRate: stressRate / 100 / 12,
  };
}
