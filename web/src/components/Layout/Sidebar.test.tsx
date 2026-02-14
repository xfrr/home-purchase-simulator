import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Sidebar from "./Sidebar";
import { ProjectionData } from "@/lib/projection";

const mockMessages = {
  Sidebar: {
    title: "Home Purchase Simulator",
    subtitle: "Compare scenarios",
    profile: {
      title: "Profile",
      netIncome: "Net Monthly Income",
      age: "Age",
      otherDebtsMonthly: "Other Debts (Monthly)",
    },
    property: {
      title: "Property",
      price: "Property Price",
      closingCosts: "Closing Costs",
      growth: "Annual Growth",
      optional: "Optional",
      maintenance: "Maintenance",
      taxes: "Property Taxes",
      perYear: "per year",
    },
    mortgage: {
      title: "Mortgage",
      amount: "Loan Amount",
      term: "Loan Term",
      yearsShort: "years",
      type: "Mortgage Type",
      fixed: "Fixed",
      variable: "Variable",
      rate: "Interest Rate",
      euribor: "EURIBOR",
      spread: "Spread",
      longTerm: "Long-term spread",
    },
    investing: {
      title: "Investing",
      nominalReturn: "Nominal Return",
      inflation: "Inflation",
      strategy: "Strategy",
      investUpfront: "Invest upfront",
      investUpfrontDescription: "Invest remaining cash at the start",
    },
    pledge: {
      title: "Pledge",
      amount: "Pledge Amount",
      ltvLimit: "LTV Limit",
      warning: "Pledging investments as collateral carries risk.",
    },
  },
};

const mockData: ProjectionData = {
  profile: { netIncome: 2500, age: 30, otherDebtsMonthly: 0 },
  property: {
    price: 350000,
    closingCosts: 10,
    growth: 0,
    maintenance: 1200,
    taxes: 450,
  },
  mortgage: {
    amount: 280000,
    term: 30,
    type: "fixed",
    fixedRate: 3.5,
    varCurrent: 0,
    varExpected: 0,
  },
  investing: { return: 7, inflation: 2.5, investUpfront: false },
  pledge: { amount: 0, ltv: 0 },
};

const mockHandlePropertyChange = jest.fn();

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sidebar with header", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    expect(screen.getByText("Home Purchase Simulator")).toBeInTheDocument();
    expect(screen.getByText("Compare scenarios")).toBeInTheDocument();
  });

  it("renders all section titles", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Property")).toBeInTheDocument();
    expect(screen.getByText("Mortgage")).toBeInTheDocument();
    expect(screen.getByText("Investing")).toBeInTheDocument();
    expect(screen.getByText("Pledge")).toBeInTheDocument();
  });

  it("toggles section visibility", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    const investingButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.includes("Investing"));
    fireEvent.click(investingButton!);
    // Section content should become visible after toggle
  });

  it("calls onPropertyChange with correct parameters on input change", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    const netIncomeInput = screen.getByDisplayValue("2500") as HTMLInputElement;
    fireEvent.change(netIncomeInput, { target: { value: "3000" } });
    expect(mockHandlePropertyChange).toHaveBeenCalledWith(
      "profile",
      "netIncome",
      3000,
    );
  });

  it("handles mortgage type toggle between fixed and variable", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    const variableButton = screen.getByRole("button", { name: /variable/i });
    fireEvent.click(variableButton);
    expect(mockHandlePropertyChange).toHaveBeenCalledWith(
      "mortgage",
      "type",
      "variable",
    );
  });

  it("shows fixed rate input when mortgage type is fixed", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    expect(screen.getByDisplayValue("3.5")).toBeInTheDocument();
  });

  it("shows variable rate inputs when mortgage type is variable", () => {
    const variableData = {
      ...mockData,
      mortgage: { ...mockData.mortgage, type: "variable" as const },
    };
    renderWithIntl(
      <Sidebar
        data={variableData}
        onPropertyChange={mockHandlePropertyChange}
      />,
    );
    expect(screen.getByText("EURIBOR")).toBeInTheDocument();
    expect(screen.getByText("Spread")).toBeInTheDocument();
  });

  it("displays pledge warning", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    expect(
      screen.getByText("Pledging investments as collateral carries risk."),
    ).toBeInTheDocument();
  });

  it("handles pledge LTV slider change", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "50" } });
    expect(mockHandlePropertyChange).toHaveBeenCalledWith("pledge", "ltv", 50);
  });

  it("converts empty string to 0 for number inputs", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    const ageInputs = screen.getAllByDisplayValue("30");
    const ageInput = ageInputs[0] as HTMLInputElement;
    fireEvent.change(ageInput, { target: { value: "" } });
    expect(mockHandlePropertyChange).toHaveBeenCalledWith("profile", "age", 0);
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    renderWithIntl(
      <Sidebar
        data={mockData}
        onPropertyChange={mockHandlePropertyChange}
        onClose={mockOnClose}
      />,
    );
    const closeButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not render close button when onClose is not provided", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    expect(screen.queryByLabelText("Toggle menu")).not.toBeInTheDocument();
  });

  it("toggles invest upfront setting", () => {
    renderWithIntl(
      <Sidebar data={mockData} onPropertyChange={mockHandlePropertyChange} />,
    );
    const investUpfrontToggle = screen.getByRole("checkbox");
    fireEvent.click(investUpfrontToggle);
    expect(mockHandlePropertyChange).toHaveBeenCalledWith(
      "investing",
      "investUpfront",
      true,
    );
  });

  it("displays pledge LTV percentage", () => {
    const pledgeData = { ...mockData, pledge: { ...mockData.pledge, ltv: 40 } };
    renderWithIntl(
      <Sidebar data={pledgeData} onPropertyChange={mockHandlePropertyChange} />,
    );
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
});
