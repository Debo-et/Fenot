// src/visualization/piechart-spec.builder.ts
import { PieChartConfig } from '../../types/visualization-configs';

export function buildPieChartSpec(config: PieChartConfig, rows: any[]): any {
  const {
    title,
    angleField,
    colorField,
    seriesField,
    multiPieMode = 'single',
    innerRadius = 0,
    outerRadius = 0.8,
    startAngle = 0,
    endAngle = 360,
    roseType,
    clockwise = true,
    avoidLabelOverlap = false,
    labelLine,
    colorScheme,
    opacity = 1,
    labels,
    showLegend = false,
    legend,
    tooltip,
    animation,
  } = config;

  // Helper to convert hex to rgba if opacity < 1
  const applyOpacity = (color: string, opacity: number): string => {
    if (opacity === 1) return color;
    // Simple hex to rgba conversion (assumes 6‑digit hex)
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // If rows are empty, return empty spec
  if (!rows || rows.length === 0) {
    return {
      title: { text: title || 'Pie Chart', left: 'center' },
      series: [],
      tooltip: { show: false },
    };
  }

  // ----------------------------------------------------------------------
  // MODE 1: Single pie (no seriesField)
  // ----------------------------------------------------------------------
  if (!seriesField || multiPieMode === 'single') {
    const data = rows.map(row => ({
      name: colorField ? String(row[colorField] ?? 'Unknown') : `Slice ${row.index}`,
      value: Number(row[angleField] ?? 0),
    }));

    // If no data after filtering, return placeholder
    if (data.length === 0) {
      return { title: { text: title || 'Pie Chart (no data)' } };
    }

    const series: any = {
      name: title || 'Pie',
      type: 'pie',
      radius: [innerRadius * 100 + '%', outerRadius * 100 + '%'],
      center: ['50%', '50%'],
      startAngle,
      endAngle,
      clockwise,
      avoidLabelOverlap,
      data,
      label: labels?.show ? {
        show: true,
        position: labels.position,
        formatter: (params: any) => {
          if (labels.format) {
            // Simple template replacement (can be extended)
            return labels.format
              .replace('{name}', params.name)
              .replace('{value}', params.value)
              .replace('{percent}', params.percent);
          }
          if (labels.showPercentage && labels.showValue) {
            return `${params.name}: ${params.value} (${params.percent}%)`;
          }
          if (labels.showPercentage) {
            return `${params.name}: ${params.percent}%`;
          }
          if (labels.showValue) {
            return `${params.name}: ${params.value}`;
          }
          if (labels.showName) {
            return params.name;
          }
          return params.name;
        },
        fontSize: labels.fontSize,
        color: labels.color,
        backgroundColor: labels.backgroundColor,
        rotate: labels.rotate,
        offset: labels.offset,
      } : { show: false },
      labelLine: labelLine?.show ? {
        show: true,
        length: labelLine.length,
        length2: labelLine.length2,
        smooth: labelLine.smooth,
        lineStyle: {
          color: labelLine.color,
          width: labelLine.width,
          opacity: labelLine.opacity,
        },
      } : { show: false },
      itemStyle: {
        color: (params: any) => {
          if (Array.isArray(colorScheme)) {
            return applyOpacity(colorScheme[params.dataIndex % colorScheme.length], opacity);
          }
          if (typeof colorScheme === 'string' && colorScheme.startsWith('#')) {
            return applyOpacity(colorScheme, opacity);
          }
          // Default echarts global color set
          return undefined;
        },
        opacity,
      },
      roseType,
    };

    if (roseType) {
      series.roseType = roseType === true ? 'radius' : roseType;
    }

    const option: any = {
      title: { text: title || 'Pie Chart', left: 'center' },
      tooltip: tooltip?.show !== false ? {
        trigger: tooltip?.trigger || 'item',
        formatter: tooltip?.format,
        backgroundColor: tooltip?.backgroundColor,
        borderColor: tooltip?.borderColor,
        textStyle: { color: tooltip?.textColor, fontSize: tooltip?.fontSize },
      } : { show: false },
      legend: showLegend ? {
        show: true,
        orient: legend?.orient || 'horizontal',
        left: legend?.position === 'left' ? 0 : undefined,
        right: legend?.position === 'right' ? 0 : undefined,
        top: legend?.position === 'top' ? 0 : undefined,
        bottom: legend?.position === 'bottom' ? 0 : undefined,
        itemGap: legend?.itemGap,
        itemWidth: legend?.itemWidth,
        itemHeight: legend?.itemHeight,
        textStyle: { fontSize: legend?.fontSize, color: legend?.color },
      } : { show: false },
      series: [series],
      animation: animation?.enabled,
      animationDuration: animation?.duration,
      animationEasing: animation?.easing,
    };

    return option;
  }

  // ----------------------------------------------------------------------
  // MODE 2: Multiple pies (faceted by seriesField)
  // ----------------------------------------------------------------------
  // Group rows by seriesField
  const groups = new Map<string, any[]>();
  rows.forEach(row => {
    const groupKey = String(row[seriesField] ?? 'Unknown');
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(row);
  });

  const series: any[] = [];
  let gridIndex = 0;
  const totalGroups = groups.size;

  // Layout grid for multiple pies (simple row layout)
  const cols = Math.ceil(Math.sqrt(totalGroups));
  const rowsCount = Math.ceil(totalGroups / cols);
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rowsCount;

  groups.forEach((groupRows, groupName) => {
    const data = groupRows.map(row => ({
      name: colorField ? String(row[colorField] ?? 'Unknown') : 'Slice',
      value: Number(row[angleField] ?? 0),
    }));

    const centerX = (cellWidth * (gridIndex % cols) + cellWidth / 2) + '%';
    const centerY = (cellHeight * Math.floor(gridIndex / cols) + cellHeight / 2) + '%';

    series.push({
      name: groupName,
      type: 'pie',
      radius: [innerRadius * 100 + '%', outerRadius * 100 + '%'],
      center: [centerX, centerY],
      startAngle,
      endAngle,
      clockwise,
      avoidLabelOverlap,
      data,
      label: labels?.show ? {
        show: true,
        position: labels.position,
        formatter: labels.format,
        fontSize: labels.fontSize,
        color: labels.color,
      } : { show: false },
      labelLine: labelLine?.show ? { show: true, ...labelLine } : { show: false },
      itemStyle: {
        color: (params: any) => {
          if (Array.isArray(colorScheme)) {
            return applyOpacity(colorScheme[params.dataIndex % colorScheme.length], opacity);
          }
          return undefined;
        },
        opacity,
      },
      roseType,
    });

    gridIndex++;
  });

  const option: any = {
    title: { text: title || 'Pie Chart (multiple)', left: 'center' },
    tooltip: tooltip?.show !== false ? {
      trigger: tooltip?.trigger || 'item',
      formatter: tooltip?.format,
    } : { show: false },
    legend: showLegend ? {
      show: true,
      orient: legend?.orient || 'vertical',
      left: 'right',
      top: 'center',
      ...legend,
    } : { show: false },
    series,
    animation: animation?.enabled,
    animationDuration: animation?.duration,
    animationEasing: animation?.easing,
  };

  return option;
}