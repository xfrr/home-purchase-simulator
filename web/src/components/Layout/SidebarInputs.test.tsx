import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home } from "lucide-react";
import { Section, InputGroup, Toggle, SegmentControl } from "./SidebarInputs";

describe("SidebarInputs Components", () => {
  describe("Section", () => {
    it("renders section with title and icon", () => {
      render(
        <Section
          title="Test Section"
          icon={Home}
          isOpen={false}
          onToggle={jest.fn()}
        >
          Content
        </Section>,
      );

      expect(screen.getByText("Test Section")).toBeInTheDocument();
    });

    it("calls onToggle when section header is clicked", () => {
      const onToggle = jest.fn();
      render(
        <Section
          title="Test Section"
          icon={Home}
          isOpen={false}
          onToggle={onToggle}
        >
          Content
        </Section>,
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("displays children when isOpen is true", () => {
      render(
        <Section
          title="Test Section"
          icon={Home}
          isOpen={true}
          onToggle={jest.fn()}
        >
          Open Content
        </Section>,
      );

      expect(screen.getByText("Open Content")).toBeInTheDocument();
    });

    it("hides children when isOpen is false", () => {
      const { container } = render(
        <Section
          title="Test Section"
          icon={Home}
          isOpen={false}
          onToggle={jest.fn()}
        >
          Hidden Content
        </Section>,
      );

      const contentDiv = container.querySelector(".max-h-0");
      expect(contentDiv).toBeInTheDocument();
    });

    it("displays ChevronUp when isOpen is true", () => {
      const { container } = render(
        <Section
          title="Test Section"
          icon={Home}
          isOpen={true}
          onToggle={jest.fn()}
        >
          Content
        </Section>,
      );

      const chevronUp = container.querySelector("svg");
      expect(chevronUp).toBeInTheDocument();
    });
  });

  describe("InputGroup", () => {
    it("renders label and input", () => {
      render(<InputGroup label="Price" value="" onChange={jest.fn()} />);

      expect(screen.getByText("Price")).toBeInTheDocument();
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    it("calls onChange with input value", () => {
      const onChange = jest.fn();
      render(<InputGroup label="Price" value="" onChange={onChange} />);

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "500000" } });

      expect(onChange).toHaveBeenCalledWith("500000");
    });

    it("displays subLabel when provided", () => {
      render(
        <InputGroup
          label="Price"
          subLabel="Optional"
          value=""
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByText("Optional")).toBeInTheDocument();
    });

    it("renders prefix when provided", () => {
      render(
        <InputGroup label="Price" prefix="$" value="" onChange={jest.fn()} />,
      );

      expect(screen.getByText("$")).toBeInTheDocument();
    });

    it("renders suffix when provided", () => {
      render(
        <InputGroup
          label="Interest Rate"
          suffix="%"
          value=""
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByText("%")).toBeInTheDocument();
    });

    it("displays placeholder text", () => {
      render(
        <InputGroup
          label="Price"
          placeholder="Enter price"
          value=""
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByPlaceholderText("Enter price")).toBeInTheDocument();
    });

    it("sets correct input type", () => {
      render(
        <InputGroup label="Email" type="email" value="" onChange={jest.fn()} />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("email");
    });

    it("displays empty string when value is undefined", () => {
      render(
        <InputGroup label="Price" value={undefined} onChange={jest.fn()} />,
      );

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("displays value correctly", () => {
      render(<InputGroup label="Price" value="50000" onChange={jest.fn()} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("50000");
    });
  });

  describe("Toggle", () => {
    it("renders toggle with label", () => {
      render(
        <Toggle label="Enable Feature" enabled={false} onChange={jest.fn()} />,
      );

      expect(screen.getByText("Enable Feature")).toBeInTheDocument();
    });

    it("calls onChange when toggled", () => {
      const onChange = jest.fn();
      render(
        <Toggle label="Enable Feature" enabled={false} onChange={onChange} />,
      );

      fireEvent.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("has correct aria-checked attribute", () => {
      const { rerender } = render(
        <Toggle label="Enable Feature" enabled={false} onChange={jest.fn()} />,
      );

      let checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "false");

      rerender(
        <Toggle label="Enable Feature" enabled={true} onChange={jest.fn()} />,
      );

      checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("toggles to false when enabled is true", () => {
      const onChange = jest.fn();
      render(
        <Toggle label="Enable Feature" enabled={true} onChange={onChange} />,
      );

      fireEvent.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("applies correct background color when enabled", () => {
      const { rerender, container: container1 } = render(
        <Toggle label="Enable Feature" enabled={false} onChange={jest.fn()} />,
      );

      let button = screen.getByRole("checkbox");
      expect(button).toHaveClass("bg-slate-200");

      rerender(
        <Toggle label="Enable Feature" enabled={true} onChange={jest.fn()} />,
      );

      button = screen.getByRole("checkbox");
      expect(button).toHaveClass("bg-indigo-600");
    });
  });

  describe("SegmentControl", () => {
    const options = [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
      { label: "Option C", value: "c" },
    ];

    it("renders all options", () => {
      render(
        <SegmentControl options={options} active="a" onChange={jest.fn()} />,
      );

      expect(screen.getByText("Option A")).toBeInTheDocument();
      expect(screen.getByText("Option B")).toBeInTheDocument();
      expect(screen.getByText("Option C")).toBeInTheDocument();
    });

    it("calls onChange when option is clicked", () => {
      const onChange = jest.fn();
      render(
        <SegmentControl options={options} active="a" onChange={onChange} />,
      );

      fireEvent.click(screen.getByText("Option B"));
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("highlights active option", () => {
      const { rerender } = render(
        <SegmentControl options={options} active="a" onChange={jest.fn()} />,
      );

      let activeButton = screen.getByText("Option A").closest("button");
      expect(activeButton).toHaveClass("bg-white", "text-indigo-600");

      rerender(
        <SegmentControl options={options} active="b" onChange={jest.fn()} />,
      );

      activeButton = screen.getByText("Option B").closest("button");
      expect(activeButton).toHaveClass("bg-white", "text-indigo-600");
    });

    it("applies inactive styles to non-active options", () => {
      render(
        <SegmentControl options={options} active="a" onChange={jest.fn()} />,
      );

      const inactiveButton = screen.getByText("Option B").closest("button");
      expect(inactiveButton).toHaveClass("text-slate-500");
      expect(inactiveButton).not.toHaveClass("bg-white");
    });

    it("handles single option", () => {
      const singleOption = [{ label: "Only Option", value: "only" }];
      render(
        <SegmentControl
          options={singleOption}
          active="only"
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByText("Only Option")).toBeInTheDocument();
    });

    it("handles empty options array", () => {
      const { container } = render(
        <SegmentControl options={[]} active="" onChange={jest.fn()} />,
      );

      expect(container.querySelector(".bg-slate-100")).toBeInTheDocument();
    });
  });
});
