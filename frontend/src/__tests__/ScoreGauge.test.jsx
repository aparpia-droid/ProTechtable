import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreGauge from "../components/ScoreGauge";

describe("ScoreGauge", () => {
  it("renders score and uses accessible label", () => {
    render(<ScoreGauge score={42} />);
    expect(screen.getByLabelText(/42 out of 100/i)).toBeTruthy();
  });

  it("clamps display to 0-100", () => {
    render(<ScoreGauge score={500} />);
    expect(screen.getByText("100")).toBeTruthy();
  });
});
