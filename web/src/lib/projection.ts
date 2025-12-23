import { calculatePMT, getMortgageRates } from "./math";

// TODO: make pledge rate configurable
const PLEDGE_APR = 0.045; // 4.5% annual interest-only, as you already assume

export interface ProjectionPoint {
  year: number;

  // Nominal
  propertyValue: number;
  balance: number;
  netWorth: number;
  totalInterest: number;
  cashOutlay: number;
  investmentValue: number;

  // Real (inflation-adjusted to year-0 money) — optional, non-breaking
  realPropertyValue?: number;
  realBalance?: number;
  realNetWorth?: number;
  realTotalInterest?: number;
  realCashOutlay?: number;
  realInvestmentValue?: number;
}

export interface ScenarioResults {
  rates: {
    effectiveRate: number;
    stressRate: number;
    monthlyRate: number;
  };
  payments: {
    monthly: number;
    stress: number;
    totalMonthlyOutflow: number;
    totalMonthlyPropertyExpenses: number;
  };
  projections: ProjectionPoint[];
  risk: {
    isPledgeRisk: boolean;
    currentLTV: number;
  };
}

export interface ProjectionData {
  property: {
    price: number;
    closingCosts: number;
    growth: number; // assumed nominal annual %
    maintenance: number; // assumed annual amount in year-0 money
    taxes: number; // assumed annual amount in year-0 money
  };
  mortgage: {
    amount: number;
    term: number; // years
    type: "fixed" | "variable";
    fixedRate: number;
    varCurrent: number;
    varExpected: number;
  };
  investing: {
    return: number; // nominal annual %
    inflation: number; // annual %
    investUpfront: boolean;
  };
  profile: {
    netIncome: number;
    age: number;
    otherDebtsMonthly: number;
  };
  pledge: {
    amount: number;
    ltv: number;
  };
}

function monthlyFromAnnualRatePct(annualPct: number): number {
  const r = (annualPct ?? 0) / 100;
  return Math.pow(1 + r, 1 / 12) - 1;
}

function upfrontInvestmentAmount(data: ProjectionData): number {
  if (!data.investing.investUpfront) return 0;
  const closingCosts = data.property.price * (data.property.closingCosts / 100);
  return data.mortgage.amount + closingCosts;
}

/**
 * Generates yearly projections (nominal + real).
 */
export function generateProjections(
  data: ProjectionData,
  monthlyPayment: number,
  monthlyRate: number,
  years: number = 30
): ProjectionPoint[] {
  if (years <= 0) return [];

  const mortgageMonths = Math.max(0, Math.floor(data.mortgage.term * 12));
  const horizonMonths = years * 12;

  let mortgageBalance = Math.max(0, data.mortgage.amount);
  let propertyValue = Math.max(0, data.property.price);

  const pledgeAmount = Math.max(0, data.pledge.amount);

  const closingCosts = propertyValue * (data.property.closingCosts / 100);
  const downPayment = Math.max(
    0,
    propertyValue - data.mortgage.amount - pledgeAmount
  );

  const investedUpfront = upfrontInvestmentAmount(data);
  let investmentValue = investedUpfront;

  // Nominal accumulators
  let totalInterest = 0;
  let totalCashOutlay = downPayment + closingCosts + investedUpfront;

  // Real accumulators
  let realTotalInterest = 0;
  let realCashOutlay = totalCashOutlay; // t=0, no discount

  const monthlyInvRate = monthlyFromAnnualRatePct(data.investing.return);
  const monthlyInfl = monthlyFromAnnualRatePct(data.investing.inflation);
  const pledgeMonthlyRate = PLEDGE_APR / 12;

  // Base monthly ownership cost in year-0 money
  const baseMonthlyOwnershipCost =
    ((data.property.maintenance ?? 0) + (data.property.taxes ?? 0)) / 12;

  const projectionData: ProjectionPoint[] = [];

  for (let year = 1; year <= years; year++) {
    let interestYear = 0;

    for (let m = 0; m < 12; m++) {
      const monthIndex = (year - 1) * 12 + (m + 1);
      const inflationDeflator = Math.pow(1 + monthlyInfl, monthIndex); // convert nominal@month -> real@t0

      // --- Mortgage amortization (only during term) ---
      if (monthIndex <= mortgageMonths && mortgageBalance > 0) {
        const interest = mortgageBalance * monthlyRate;
        const principal = monthlyPayment - interest;

        // cashflow happens
        totalCashOutlay += monthlyPayment;
        realCashOutlay += monthlyPayment / inflationDeflator;

        // interest tracking
        interestYear += interest;
        realTotalInterest += interest / inflationDeflator;

        // guard negative amortization
        if (principal >= 0) {
          mortgageBalance = Math.max(0, mortgageBalance - principal);
        } else {
          mortgageBalance = mortgageBalance + (interest - monthlyPayment);
        }
      }

      // --- Pledge interest-only cost (no term provided; apply across horizon) ---
      if (pledgeAmount > 0 && monthIndex <= horizonMonths) {
        const pledgeInterest = pledgeAmount * pledgeMonthlyRate;
        totalCashOutlay += pledgeInterest;
        realCashOutlay += pledgeInterest / inflationDeflator;
      }

      // --- Ownership costs (inflate nominal over time) ---
      if (baseMonthlyOwnershipCost > 0) {
        const costNominal =
          baseMonthlyOwnershipCost * Math.pow(1 + monthlyInfl, monthIndex - 1);
        totalCashOutlay += costNominal;
        realCashOutlay += costNominal / inflationDeflator; // becomes ~baseMonthlyOwnershipCost in real terms
      }

      // --- Investment growth (nominal) ---
      if (investmentValue > 0) {
        investmentValue *= 1 + monthlyInvRate;
      }
    }

    totalInterest += interestYear;

    // Property nominal growth (assumed nominal input)
    propertyValue *= 1 + (data.property.growth ?? 0) / 100;

    const yearInflationDeflator = Math.pow(
      1 + (data.investing.inflation ?? 0) / 100,
      year
    );

    const netWorthNominal =
      propertyValue - mortgageBalance + investmentValue - pledgeAmount;
    const netWorthReal = netWorthNominal / yearInflationDeflator;

    projectionData.push({
      year,
      // nominal
      propertyValue: Math.round(propertyValue),
      balance: Math.round(mortgageBalance),
      netWorth: Math.round(netWorthNominal),
      totalInterest: Math.round(totalInterest),
      cashOutlay: Math.round(totalCashOutlay),
      investmentValue: Math.round(investmentValue),

      // real
      realPropertyValue: Math.round(propertyValue / yearInflationDeflator),
      realBalance: Math.round(mortgageBalance / yearInflationDeflator),
      realNetWorth: Math.round(netWorthReal),
      realTotalInterest: Math.round(realTotalInterest),
      realCashOutlay: Math.round(realCashOutlay),
      realInvestmentValue: Math.round(investmentValue / yearInflationDeflator),
    });
  }

  return projectionData;
}

/**
 * Calculates the mortgage scenario including payments, projections, and risk assessment.
 */
export function calculateScenario(data: ProjectionData): ScenarioResults {
  const rates = getMortgageRates(data.mortgage);
  const totalMonths = data.mortgage.term * 12;

  const monthlyPayment = Math.abs(
    calculatePMT(rates.monthlyRate, totalMonths, data.mortgage.amount)
      .toDecimalPlaces(2)
      .toNumber()
  );

  const stressPayment = Math.abs(
    calculatePMT(rates.stressMonthlyRate, totalMonths, data.mortgage.amount)
      .toDecimalPlaces(2)
      .toNumber()
  );

  const pledgeCost = (data.pledge.amount * PLEDGE_APR) / 12;

  const totalMonthlyOtherDebts = data.profile.otherDebtsMonthly ?? 0;
  const totalMonthlyOutflow =
    monthlyPayment +
    pledgeCost +
    totalMonthlyOtherDebts +
    data.property.maintenance / 12 +
    data.property.taxes / 12;

  const projections = generateProjections(
    data,
    monthlyPayment,
    rates.monthlyRate
  );

  // LTV risk: pledge vs collateral invested upfront
  const collateral = upfrontInvestmentAmount(data);
  const currentLTV =
    data.pledge.amount > 0 && collateral > 0
      ? (data.pledge.amount / collateral) * 100
      : 0;

  const isPledgeRisk = currentLTV > data.pledge.ltv;

  // Total monthly property expenses (taxes + maintenance + insurance est.)
  const totalMonthlyPropertyExpenses = data.property.maintenance / 12;

  return {
    rates: {
      effectiveRate: rates.effectiveRate,
      stressRate: rates.stressRate,
      monthlyRate: rates.monthlyRate,
    },
    payments: {
      monthly: monthlyPayment,
      stress: stressPayment,
      totalMonthlyOutflow,
      totalMonthlyPropertyExpenses,
    },
    projections,
    risk: {
      isPledgeRisk,
      currentLTV,
    },
  };
}

/**
 * Amortization schedule entry for a single month
 */
export interface AmortizationEntry {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Generates detailed monthly amortization schedule
 */
export function generateAmortizationSchedule(
  data: ProjectionData,
  monthlyPayment: number,
  monthlyRate: number
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];
  const mortgageMonths = Math.max(0, Math.floor(data.mortgage.term * 12));

  let balance = Math.max(0, data.mortgage.amount);

  for (let month = 1; month <= mortgageMonths && balance > 0; month++) {
    const year = Math.ceil(month / 12);
    const interest = balance * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principal);

    schedule.push({
      month,
      year,
      payment: monthlyPayment,
      principal,
      interest,
      balance,
    });
  }

  return schedule;
}
