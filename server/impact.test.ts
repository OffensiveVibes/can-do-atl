import { describe, expect, it } from "vitest";
import { DEFAULT_IMPACT_METRICS, IMPACT_METRIC_KEYS } from "./impact";

describe("Can Do ATL impact metric defaults", () => {
  it("starts honestly at zero with one editable metric for each public impact card", () => {
    expect(DEFAULT_IMPACT_METRICS).toHaveLength(3);
    expect(DEFAULT_IMPACT_METRICS.map((metric) => metric.metricKey)).toEqual([...IMPACT_METRIC_KEYS]);
    expect(DEFAULT_IMPACT_METRICS.every((metric) => metric.value === 0)).toBe(true);
  });
});
