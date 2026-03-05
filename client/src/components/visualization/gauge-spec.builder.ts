import { GaugeConfig } from '../../types/visualization-configs';

export function buildGaugeSpec(config: GaugeConfig, rows: any[]) {
  // Assume rows is an array with one object containing the value field
  const value = rows.length > 0 ? rows[0][config.valueField] : null;

  // Auto‑compute min/max if not provided (use data range)
  let min = config.min;
  let max = config.max;
  if (min === undefined && rows.length > 0) {
    const values = rows.map(r => r[config.valueField]).filter(v => v != null);
    if (values.length > 0) {
      min = Math.min(...values);
      max = Math.max(...values);
    } else {
      min = 0;
      max = 100;
    }
  }

  return {
    type: 'gauge',
    config,
    data: { value },
    computed: { min, max },
  };
}