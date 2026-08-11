export const IMPACT_METRIC_KEYS = ["care_packages", "clothing_items", "student_volunteers"] as const;
export type ImpactMetricKey = (typeof IMPACT_METRIC_KEYS)[number];

export const DEFAULT_IMPACT_METRICS = [
  { metricKey: "care_packages" as const, value: 0, label: "care packages shared so far — you can make the difference", position: 0 },
  { metricKey: "clothing_items" as const, value: 0, label: "clothing items recirculated so far — you can make the difference", position: 1 },
  { metricKey: "student_volunteers" as const, value: 0, label: "student volunteers so far — you can make the difference", position: 2 },
];

export function isImpactMetricKey(value: string): value is ImpactMetricKey {
  return IMPACT_METRIC_KEYS.includes(value as ImpactMetricKey);
}
