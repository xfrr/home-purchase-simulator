import { ProjectionData } from "./projection";

/**
 * Serialize ProjectionData to a base64-encoded URL query string
 * Creates a much shorter and cleaner URL than traditional query parameters
 */
export function encodeStateToQuery(data: ProjectionData): string {
  // Create a compact array representation of the data
  const compact = [
    // Property [0-4]
    data.property.price,
    data.property.closingCosts,
    data.property.growth,
    data.property.maintenance,
    data.property.taxes,
    // Mortgage [5-10]
    data.mortgage.amount,
    data.mortgage.term,
    data.mortgage.type === "fixed" ? 0 : 1,
    data.mortgage.fixedRate,
    data.mortgage.varCurrent,
    data.mortgage.varExpected,
    // Investing [11-13]
    data.investing.return,
    data.investing.inflation,
    data.investing.investUpfront ? 1 : 0,
    // Profile [14-16]
    data.profile.netIncome,
    data.profile.age,
    data.profile.otherDebtsMonthly,
    // Pledge [17-18]
    data.pledge.amount,
    data.pledge.ltv,
  ];

  // Convert to JSON and then to base64
  const json = JSON.stringify(compact);
  const base64 = btoa(json);

  // URL-safe base64: replace +/= with -_~ for better compatibility
  const urlSafe = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "~");

  return `s=${urlSafe}`;
}

/**
 * Deserialize URL query string back to ProjectionData
 * Supports both new base64 format (s=...) and legacy format for backwards compatibility
 */
export function decodeQueryToState(
  query: string,
  defaults: ProjectionData
): ProjectionData {
  if (!query) return defaults;

  try {
    const params = new URLSearchParams(query);

    // Check for new base64 format
    const base64State = params.get("s");
    if (base64State) {
      // Decode URL-safe base64
      const base64 = base64State
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .replace(/~/g, "=");
      const json = atob(base64);
      const compact = JSON.parse(json) as number[];

      // Reconstruct ProjectionData from compact array
      return {
        property: {
          price: compact[0] ?? defaults.property.price,
          closingCosts: compact[1] ?? defaults.property.closingCosts,
          growth: compact[2] ?? defaults.property.growth,
          maintenance: compact[3] ?? defaults.property.maintenance,
          taxes: compact[4] ?? defaults.property.taxes,
        },
        mortgage: {
          amount: compact[5] ?? defaults.mortgage.amount,
          term: compact[6] ?? defaults.mortgage.term,
          type: (compact[7] === 0 ? "fixed" : "variable") as
            | "fixed"
            | "variable",
          fixedRate: compact[8] ?? defaults.mortgage.fixedRate,
          varCurrent: compact[9] ?? defaults.mortgage.varCurrent,
          varExpected: compact[10] ?? defaults.mortgage.varExpected,
        },
        investing: {
          return: compact[11] ?? defaults.investing.return,
          inflation: compact[12] ?? defaults.investing.inflation,
          investUpfront: (compact[13] ?? 0) === 1,
        },
        profile: {
          netIncome: compact[14] ?? defaults.profile.netIncome,
          age: compact[15] ?? defaults.profile.age,
          otherDebtsMonthly: compact[16] ?? defaults.profile.otherDebtsMonthly,
        },
        pledge: {
          amount: compact[17] ?? defaults.pledge.amount,
          ltv: compact[18] ?? defaults.pledge.ltv,
        },
      };
    }

    // Legacy format support (backwards compatibility)
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
