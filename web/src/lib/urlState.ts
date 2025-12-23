import { ProjectionData } from "./projection";

/**
 * Serialize ProjectionData to a compressed URL query string
 * Uses short property names to minimize URL length
 */
export function encodeStateToQuery(data: ProjectionData): string {
  const encoded = {
    // Property
    pp: data.property.price,
    pcc: data.property.closingCosts,
    pg: data.property.growth,
    pm: data.property.maintenance,
    pt: data.property.taxes,
    // Mortgage
    ma: data.mortgage.amount,
    mte: data.mortgage.term,
    mty: data.mortgage.type,
    mfr: data.mortgage.fixedRate,
    mvc: data.mortgage.varCurrent,
    mve: data.mortgage.varExpected,
    // Investing
    ir: data.investing.return,
    ii: data.investing.inflation,
    iup: data.investing.investUpfront ? "1" : "0",
    // Profile
    pms: data.profile.netIncome,
    pag: data.profile.age,
    pod: data.profile.otherDebtsMonthly,
    // Pledge
    pla: data.pledge.amount,
    plt: data.pledge.ltv,
  };

  const params = new URLSearchParams();
  Object.entries(encoded).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Deserialize URL query string back to ProjectionData
 * Returns null if query string is invalid or empty
 */
export function decodeQueryToState(
  query: string,
  defaults: ProjectionData
): ProjectionData {
  if (!query) return defaults;

  try {
    const params = new URLSearchParams(query);

    const state: ProjectionData = {
      property: {
        price: parseFloat(params.get("pp") ?? String(defaults.property.price)),
        closingCosts: parseFloat(
          params.get("pcc") ?? String(defaults.property.closingCosts)
        ),
        growth: parseFloat(
          params.get("pg") ?? String(defaults.property.growth)
        ),
        maintenance: parseFloat(
          params.get("pm") ?? String(defaults.property.maintenance)
        ),
        taxes: parseFloat(params.get("pt") ?? String(defaults.property.taxes)),
      },
      mortgage: {
        amount: parseFloat(
          params.get("ma") ?? String(defaults.mortgage.amount)
        ),
        term: parseFloat(params.get("mte") ?? String(defaults.mortgage.term)),
        type: (params.get("mty") ?? defaults.mortgage.type) as
          | "fixed"
          | "variable",
        fixedRate: parseFloat(
          params.get("mfr") ?? String(defaults.mortgage.fixedRate)
        ),
        varCurrent: parseFloat(
          params.get("mvc") ?? String(defaults.mortgage.varCurrent)
        ),
        varExpected: parseFloat(
          params.get("mve") ?? String(defaults.mortgage.varExpected)
        ),
      },
      investing: {
        return: parseFloat(
          params.get("ir") ?? String(defaults.investing.return)
        ),
        inflation: parseFloat(
          params.get("ii") ?? String(defaults.investing.inflation)
        ),
        investUpfront:
          (params.get("iup") ??
            (defaults.investing.investUpfront ? "1" : "0")) === "1",
      },
      profile: {
        netIncome: parseFloat(
          params.get("pms") ?? String(defaults.profile.netIncome)
        ),
        age: parseFloat(params.get("pag") ?? String(defaults.profile.age)),
        otherDebtsMonthly: parseFloat(
          params.get("pod") ?? String(defaults.profile.otherDebtsMonthly)
        ),
      },
      pledge: {
        amount: parseFloat(params.get("pla") ?? String(defaults.pledge.amount)),
        ltv: parseFloat(params.get("plt") ?? String(defaults.pledge.ltv)),
      },
    };

    return state;
  } catch (error) {
    console.error("Failed to decode query state:", error);
    return defaults;
  }
}

/**
 * Get the current window URL with updated query parameters
 */
export function getShareableUrl(data: ProjectionData): string {
  if (typeof window === "undefined") return "";

  const query = encodeStateToQuery(data);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?${query}`;
}
