import { getRiskLevel } from "./risk";

describe("getRiskLevel", () => {
  describe("High risk (r >= 0.70)", () => {
    it("returns High at exact threshold 0.70", () => {
      expect(getRiskLevel(0.7)).toBe("High");
    });

    it("returns High above threshold (0.85)", () => {
      expect(getRiskLevel(0.85)).toBe("High");
    });

    it("returns High at maximum value (1.0)", () => {
      expect(getRiskLevel(1)).toBe("High");
    });
  });

  describe("Medium risk (0.40 <= r < 0.70)", () => {
    it("returns Medium at exact lower threshold (0.40)", () => {
      expect(getRiskLevel(0.4)).toBe("Medium");
    });

    it("returns Medium in the middle of the range (0.55)", () => {
      expect(getRiskLevel(0.55)).toBe("Medium");
    });

    it("returns Medium just below upper threshold (0.699)", () => {
      expect(getRiskLevel(0.699)).toBe("Medium");
    });
  });

  describe("Low risk (r < 0.40)", () => {
    it("returns Low just below lower threshold (0.399)", () => {
      expect(getRiskLevel(0.399)).toBe("Low");
    });

    it("returns Low in the low range (0.20)", () => {
      expect(getRiskLevel(0.2)).toBe("Low");
    });

    it("returns Low at minimum value (0)", () => {
      expect(getRiskLevel(0)).toBe("Low");
    });
  });
});
