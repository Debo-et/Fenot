// src/visualization/boxplot-spec.builder.ts
import { BoxPlotConfig } from '../../types/visualization-configs';

/**
 * Build an ECharts box plot specification from configuration and data rows.
 * Handles both pre‑computed stats (min, q1, median, q3, max) and raw data.
 */
export function buildBoxPlotSpec(config: BoxPlotConfig, rows: any[]): any {
  const {
    title,
    categoryField,
    valueField,
    orientation = 'vertical',
    showOutliers = true,
    whiskerType = 'tukey',
    iqrMultiplier = 1.5,
    percentileRange = { lower: 5, upper: 95 },
    boxWidth = 40,
    colors,
    median,
    whisker,
    outlier,
    box,
    mean,
    xAxis,
    yAxis,
    showGrid = true,
    grid,
    showLegend = false,
    legend,
    tooltip,
    animation,
  } = config;

  // Helper to safely extract a statistic from a row (case‑insensitive)
  const getStat = (row: any, name: string): number | undefined => {
    const val = row[name] ?? row[name.toUpperCase()] ?? row[name.toLowerCase()];
    return val === null || val === undefined ? undefined : Number(val);
  };

  // 1. Detect if rows contain pre‑computed box‑plot stats
  const firstRow = rows[0];
  const hasPrecomputedStats = firstRow &&
    (getStat(firstRow, 'min') !== undefined) &&
    (getStat(firstRow, 'q1') !== undefined) &&
    (getStat(firstRow, 'median') !== undefined) &&
    (getStat(firstRow, 'q3') !== undefined) &&
    (getStat(firstRow, 'max') !== undefined);

  if (hasPrecomputedStats) {
    // ------------------------------------------------------------
    // MODE 2: Pre‑aggregated data (like from Data Summary node)
    // ------------------------------------------------------------
    console.log('📦 BoxPlot using pre‑computed stats');
    const categories: string[] = [];
    const boxData: number[][] = [];
    const outlierData: number[][] = [];

    rows.forEach((row, idx) => {
      const cat = categoryField ? String(row[categoryField] ?? 'Unknown') : `Group ${idx}`;
      categories.push(cat);

      const min = getStat(row, 'min');
      const q1 = getStat(row, 'q1');
      const medianVal = getStat(row, 'median');
      const q3 = getStat(row, 'q3');
      const max = getStat(row, 'max');

      if (min === undefined || q1 === undefined || medianVal === undefined || q3 === undefined || max === undefined) {
        console.warn(`Skipping group ${cat} due to missing statistics`);
        return; // skip this box
      }

      boxData.push([min, q1, medianVal, q3, max]);

      // Outliers: if present in the row (could be an array)
      if (row.outliers && Array.isArray(row.outliers)) {
        row.outliers.forEach((out: number) => {
          outlierData.push([boxData.length - 1, out]);
        });
      }
    });

    const isHorizontal = orientation === 'horizontal';
    const option: any = {
      title: { text: title || 'Box Plot' },
      tooltip: tooltip?.show !== false ? {
        trigger: 'item',
        axisPointer: { type: 'shadow' },
        backgroundColor: tooltip?.backgroundColor,
        borderColor: tooltip?.borderColor,
        textStyle: { color: tooltip?.textColor },
        formatter: tooltip?.format,
      } : undefined,
      legend: showLegend ? {
        show: true,
        ...(legend ? {
          orient: legend.orientation,
          left: legend.position === 'left' ? 0 : undefined,
          right: legend.position === 'right' ? 0 : undefined,
          top: legend.position === 'top' ? 0 : undefined,
          bottom: legend.position === 'bottom' ? 0 : undefined,
          itemGap: legend.itemGap,
        } : {})
      } : { show: false },
      grid: showGrid && grid ? {
        show: true,
        borderColor: grid.color,
        borderWidth: grid.width,
        ...(grid.dash ? { borderType: 'dashed' } : {})
      } : { show: false },
      xAxis: isHorizontal
        ? {
            type: 'value',
            name: xAxis?.label,
            axisLine: { show: true, lineStyle: { color: xAxis?.lineColor, width: xAxis?.lineWidth } },
            axisTick: { show: true, lineStyle: { color: xAxis?.tickColor }, length: xAxis?.tickSize },
            axisLabel: { rotate: xAxis?.rotateLabels ?? 0 },
          }
        : {
            type: 'category',
            data: categories,
            name: xAxis?.label,
            axisLine: { show: true, lineStyle: { color: xAxis?.lineColor, width: xAxis?.lineWidth } },
            axisTick: { show: true, lineStyle: { color: xAxis?.tickColor }, length: xAxis?.tickSize },
            axisLabel: { rotate: xAxis?.rotateLabels ?? 0 },
          },
      yAxis: isHorizontal
        ? {
            type: 'category',
            data: categories,
            name: yAxis?.label,
            axisLine: { show: true, lineStyle: { color: yAxis?.lineColor, width: yAxis?.lineWidth } },
            axisTick: { show: true, lineStyle: { color: yAxis?.tickColor }, length: yAxis?.tickSize },
            axisLabel: { rotate: yAxis?.rotateLabels ?? 0 },
          }
        : {
            type: 'value',
            name: yAxis?.label,
            axisLine: { show: true, lineStyle: { color: yAxis?.lineColor, width: yAxis?.lineWidth } },
            axisTick: { show: true, lineStyle: { color: yAxis?.tickColor }, length: yAxis?.tickSize },
            axisLabel: { rotate: yAxis?.rotateLabels ?? 0 },
          },
      series: [
        {
          name: 'boxplot',
          type: 'boxplot',
          data: boxData,
          itemStyle: {
            color: box?.fillColor,
            borderColor: box?.borderColor,
            borderWidth: box?.borderWidth,
            opacity: box?.fillOpacity,
          },
          boxWidth: boxWidth,
          whisker: whisker ? {
            color: whisker.color,
            width: whisker.width,
            lineStyle: { type: whisker.dash ? 'dashed' : 'solid' },
          } : undefined,
          median: median?.show ? {
            color: median.color,
            width: median.width,
            lineStyle: { type: median.dash ? 'dashed' : 'solid' },
          } : undefined,
        },
      ],
    };

    if (mean?.show) {
      const means: [number, number][] = [];
      rows.forEach((row, idx) => {
        const meanVal = getStat(row, 'mean');
        if (meanVal !== undefined) {
          means.push([idx, meanVal]);
        }
      });
      if (means.length) {
        option.series.push({
          name: 'mean',
          type: 'scatter',
          data: means,
          symbol: mean.symbol,
          symbolSize: mean.size,
          itemStyle: { color: mean.color },
        });
      }
    }

    if (showOutliers && outlierData.length > 0) {
      option.series.push({
        name: 'outliers',
        type: 'scatter',
        data: outlierData,
        symbol: outlier?.symbol,
        symbolSize: outlier?.size,
        itemStyle: { color: outlier?.color, opacity: outlier?.opacity },
      });
    }

    if (animation) {
      option.animation = animation.enabled;
      option.animationDuration = animation.duration;
      option.animationEasing = animation.easing;
    }

    return option;
  }

  // ------------------------------------------------------------
  // MODE 1: Raw data – compute stats from the rows
  // ------------------------------------------------------------
  console.log('📦 BoxPlot using raw data (computing stats)');

  // If we received only a count row (degenerate case), throw a helpful error
  if (rows.length === 1 && Object.keys(rows[0]).length === 1 && 'count' in rows[0]) {
    throw new Error(
      'Data Summary node produced only a count. Please configure it to generate the five‑number summary (min, q1, median, q3, max) or connect a raw data source.'
    );
  }

  const percentile = (sorted: number[], p: number): number => {
    if (sorted.length === 0) return NaN;
    if (sorted.length === 1) return sorted[0];
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const computeBoxStats = (values: number[]): { min: number; q1: number; median: number; q3: number; max: number; outliers: number[] } => {
    if (values.length === 0) {
      return { min: NaN, q1: NaN, median: NaN, q3: NaN, max: NaN, outliers: [] };
    }
    const sorted = values.slice().sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const medianVal = percentile(sorted, 0.5);
    const q1 = percentile(sorted, 0.25);
    const q3 = percentile(sorted, 0.75);

    let outliers: number[] = [];
    if (showOutliers) {
      if (whiskerType === 'tukey') {
        const iqr = q3 - q1;
        const mult = iqrMultiplier ?? 1.5;
        const lowerFence = q1 - mult * iqr;
        const upperFence = q3 + mult * iqr;
        outliers = sorted.filter(v => v < lowerFence || v > upperFence);
      } else if (whiskerType === 'percentile') {
        const lowerP = (percentileRange?.lower ?? 5) / 100;
        const upperP = (percentileRange?.upper ?? 95) / 100;
        const lowerBound = percentile(sorted, lowerP);
        const upperBound = percentile(sorted, upperP);
        outliers = sorted.filter(v => v < lowerBound || v > upperBound);
      }
    }
    return { min, q1, median: medianVal, q3, max, outliers };
  };

  const groups = new Map<string, number[]>();
  if (!categoryField) {
    const values = rows
      .map(r => Number(r[valueField]))
      .filter(v => !isNaN(v));
    groups.set('All', values);
  } else {
    rows.forEach(r => {
      const cat = String(r[categoryField] ?? 'Unknown');
      const val = Number(r[valueField]);
      if (!isNaN(val)) {
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat)!.push(val);
      }
    });
  }

  const categories: string[] = [];
  const boxData: number[][] = [];
  const outlierData: number[][] = [];

  groups.forEach((values, cat) => {
    categories.push(cat);
    const stats = computeBoxStats(values);
    if (!isNaN(stats.min)) {
      boxData.push([stats.min, stats.q1, stats.median, stats.q3, stats.max]);
      stats.outliers.forEach(val => {
        outlierData.push([categories.length - 1, val]);
      });
    } else {
      boxData.push([0, 0, 0, 0, 0]);
    }
  });

  const isHorizontal = orientation === 'horizontal';
  const option: any = {
    title: { text: title || 'Box Plot' },
    tooltip: tooltip?.show !== false ? {
      trigger: 'item',
      axisPointer: { type: 'shadow' },
      backgroundColor: tooltip?.backgroundColor,
      borderColor: tooltip?.borderColor,
      textStyle: { color: tooltip?.textColor },
      formatter: tooltip?.format,
    } : undefined,
    legend: showLegend ? {
      show: true,
      ...(legend ? {
        orient: legend.orientation,
        left: legend.position === 'left' ? 0 : undefined,
        right: legend.position === 'right' ? 0 : undefined,
        top: legend.position === 'top' ? 0 : undefined,
        bottom: legend.position === 'bottom' ? 0 : undefined,
        itemGap: legend.itemGap,
      } : {})
    } : { show: false },
    grid: showGrid && grid ? {
      show: true,
      borderColor: grid.color,
      borderWidth: grid.width,
      ...(grid.dash ? { borderType: 'dashed' } : {})
    } : { show: false },
    xAxis: isHorizontal
      ? {
          type: 'value',
          name: xAxis?.label,
          axisLine: { show: true, lineStyle: { color: xAxis?.lineColor, width: xAxis?.lineWidth } },
          axisTick: { show: true, lineStyle: { color: xAxis?.tickColor }, length: xAxis?.tickSize },
          axisLabel: { rotate: xAxis?.rotateLabels ?? 0 },
        }
      : {
          type: 'category',
          data: categories,
          name: xAxis?.label,
          axisLine: { show: true, lineStyle: { color: xAxis?.lineColor, width: xAxis?.lineWidth } },
          axisTick: { show: true, lineStyle: { color: xAxis?.tickColor }, length: xAxis?.tickSize },
          axisLabel: { rotate: xAxis?.rotateLabels ?? 0 },
        },
    yAxis: isHorizontal
      ? {
          type: 'category',
          data: categories,
          name: yAxis?.label,
          axisLine: { show: true, lineStyle: { color: yAxis?.lineColor, width: yAxis?.lineWidth } },
          axisTick: { show: true, lineStyle: { color: yAxis?.tickColor }, length: yAxis?.tickSize },
          axisLabel: { rotate: yAxis?.rotateLabels ?? 0 },
        }
      : {
          type: 'value',
          name: yAxis?.label,
          axisLine: { show: true, lineStyle: { color: yAxis?.lineColor, width: yAxis?.lineWidth } },
          axisTick: { show: true, lineStyle: { color: yAxis?.tickColor }, length: yAxis?.tickSize },
          axisLabel: { rotate: yAxis?.rotateLabels ?? 0 },
        },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        data: boxData,
        itemStyle: {
          color: box?.fillColor,
          borderColor: box?.borderColor,
          borderWidth: box?.borderWidth,
          opacity: box?.fillOpacity,
        },
        boxWidth: boxWidth,
        whisker: whisker ? {
          color: whisker.color,
          width: whisker.width,
          lineStyle: { type: whisker.dash ? 'dashed' : 'solid' },
        } : undefined,
        median: median?.show ? {
          color: median.color,
          width: median.width,
          lineStyle: { type: median.dash ? 'dashed' : 'solid' },
        } : undefined,
      },
    ],
  };

  if (showOutliers && outlierData.length > 0) {
    option.series.push({
      name: 'outliers',
      type: 'scatter',
      data: outlierData,
      symbol: outlier?.symbol,
      symbolSize: outlier?.size,
      itemStyle: { color: outlier?.color, opacity: outlier?.opacity },
    });
  }

  if (mean?.show) {
    const means: [number, number][] = [];
    Array.from(groups.entries()).forEach(([, values], idx) => {
      if (values.length === 0) return;
      const sum = values.reduce((a, b) => a + b, 0);
      means.push([idx, sum / values.length]);
    });
    if (means.length) {
      option.series.push({
        name: 'mean',
        type: 'scatter',
        data: means,
        symbol: mean.symbol,
        symbolSize: mean.size,
        itemStyle: { color: mean.color },
      });
    }
  }

  if (colors && !Array.isArray(colors) && colors !== '#3b82f6') {
    option.series[0].itemStyle.color = colors;
  }

  if (animation) {
    option.animation = animation.enabled;
    option.animationDuration = animation.duration;
    option.animationEasing = animation.easing;
  }

  return option;
}