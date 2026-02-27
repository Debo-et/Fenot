// src/types/visualization-configs.ts

export interface BoxPlotConfig {
  title?: string;
  categoryField: string;
  valueField: string;
  orientation: 'vertical' | 'horizontal';
  showOutliers: boolean;
  whiskerType: 'tukey' | 'minmax' | 'percentile';
  percentileRange?: { lower: number; upper: number };
  iqrMultiplier?: number;
  boxWidth: number;
  colors?: string | string[];

  median?: {
    show?: boolean;
    color?: string;
    width?: number;
    dash?: string;
  };

  whisker?: {
    color?: string;
    width?: number;
    dash?: string;
  };

  outlier?: {
    symbol?: 'circle' | 'square' | 'diamond' | 'cross' | 'x';
    size?: number;
    color?: string;
    opacity?: number;
  };

  box?: {
    fillColor?: string;
    fillOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
  };

  mean?: {
    show?: boolean;
    symbol?: 'circle' | 'square' | 'diamond' | 'cross' | 'x';
    size?: number;
    color?: string;
  };

  notches?: {
    show?: boolean;
    width?: number;
    confidenceLevel?: number;
  };

  xAxis?: {
    label?: string;
    rotateLabels?: number;
    tickFormat?: string;
    lineColor?: string;
    lineWidth?: number;
    tickColor?: string;
    tickSize?: number;
  };

  yAxis?: {
    label?: string;
    tickFormat?: string;
    lineColor?: string;
    lineWidth?: number;
    tickColor?: string;
    tickSize?: number;
  };

  showGrid: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
  };

  showLegend: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    orientation?: 'horizontal' | 'vertical';
    itemGap?: number;
  };

  tooltip?: {
    show?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    format?: string;
  };

  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  dimensions: {
    width: number;
    height: number;
  };
}