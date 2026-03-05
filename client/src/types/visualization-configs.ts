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


// src/types/visualization-configs.ts (add after LineChartConfig)

export interface PieChartConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  angleField: string;               // numeric measure for slice size
  colorField?: string;               // categorical dimension for slice colors
  seriesField?: string;               // optional field to split into multiple pies (facet)

  // Multi‑pie layout
  multiPieMode?: 'single' | 'multiple' | 'nested'; // default 'single'

  // Visual appearance
  innerRadius?: number;               // 0–1, for donut charts
  outerRadius?: number;               // 0–1, default 0.8
  startAngle?: number;                 // degrees, default 0
  endAngle?: number;                   // degrees, default 360
  roseType?: boolean | 'area' | 'radius'; // for Nightingale rose
  clockwise?: boolean;                  // default true
  avoidLabelOverlap?: boolean;          // default false

  // Label line styling (for outside labels)
  labelLine?: {
    show?: boolean;
    length?: number;                    // first segment length
    length2?: number;                   // second segment length (for bent lines)
    smooth?: boolean;
    color?: string;
    width?: number;
    opacity?: number;
  };

  // Color
  colorScheme?: string | string[];      // single color or palette name/array
  colorGradient?: boolean;               // use gradient fill
  opacity?: number;                      // global fill opacity

  // Labels on slices
  labels?: {
    show?: boolean;
    position?: 'outside' | 'inside' | 'center';
    format?: string;                     // d3 format specifier for values/percentages
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;                     // offset from slice (for outside labels)
    showPercentage?: boolean;             // show percentage instead of value
    showValue?: boolean;                  // show raw value
    showName?: boolean;                   // show category name
    rotate?: boolean;                     // rotate label (inside)
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;                      // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;
  };

  // Interactivity
  interactivity?: {
    hoverHighlight?: boolean;              // highlight slice on hover
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;           // for advanced usage
  };

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                     // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                    // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;                // not usually needed for pie, but included for consistency
    maxPoints?: number;
    progressive?: boolean;
    virtualization?: boolean;
  };
}

// src/types/visualization-configs.ts

// ==================== SCATTER PLOT ====================

export type ScatterPointSymbol =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'cross'
  | 'x'
  | 'triangle'
  | 'star'
  | 'none';

export interface ScatterPlotConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // numeric field for x‑axis
  yField: string;               // numeric field for y‑axis
  colorField?: string;          // categorical or numeric field for point color
  sizeField?: string;           // numeric field for point size (scaled)
  shapeField?: string;          // categorical field for point symbol
  opacityField?: string;        // numeric field for point opacity (0‑1)
  facetField?: string;          // field to create small multiples (grid)

  // Point styling
  point: {
    symbol?: ScatterPointSymbol;       // default symbol if no shapeField
    size?: number;                     // fixed size (px) if no sizeField
    sizeScale?: 'linear' | 'log';      // scaling when sizeField is used
    sizeMin?: number;                  // minimum point size (px)
    sizeMax?: number;                  // maximum point size (px)
    color?: string;                    // fixed color if no colorField
    colorOpacity?: number;              // global point opacity (0‑1)
    colorScale?: 'linear' | 'log' | 'categorical'; // scaling for colorField
    colorPalette?: string | string[];   // single color or palette name/array
    borderColor?: string;               // point stroke color
    borderWidth?: number;                // point stroke width
    borderOpacity?: number;               // stroke opacity
    blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  };

  // Aggregation / binning (optional, for large datasets)
  transform?: {
    mode?: 'raw' | 'sample' | 'bin' | 'hexbin' | 'contour';
    sampleSize?: number;                 // if mode = 'sample'
    binSize?: number;                    // grid resolution for binning
    binMethod?: 'count' | 'sum' | 'avg'; // aggregation inside bins
    binColorScale?: string;               // color mapping for bin values
  };

  // Axes – X
  xAxis?: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;                  // d3 format specifier (e.g. '.2f')
    tickCount?: number;                    // suggested number of ticks
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time' | 'categorical';
    timeZone?: string;                     // e.g. 'UTC', 'America/New_York'
    min?: number | string;                  // manual min (numeric or date)
    max?: number | string;                  // manual max
    zeroBaseline?: boolean;                 // force include zero?
  };

  // Axes – Y (similar structure)
  yAxis?: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time' | 'categorical';
    timeZone?: string;
    min?: number | string;
    max?: number | string;
    zeroBaseline?: boolean;
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;          // vertical lines
    yLines?: boolean;          // horizontal lines
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;                     // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;              // for binned modes
    showAllPoints?: boolean;                // for dense data (summary)
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;                        // allow zoom via scroll/pan
    pan?: boolean;                         // allow panning after zoom
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;                        // rectangular selection
    hoverHighlight?: boolean;                // highlight point on hover
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;             // for advanced usage
  };

  // Annotations / reference lines
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;                    // x coordinate or category
    y?: number;                              // y coordinate
    x2?: number | string;                    // for bands
    y2?: number;                              // for bands
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                        // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    stagger?: boolean;                         // animate points one after another
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                        // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;                    // reduce points for rendering
    maxPoints?: number;
    progressive?: boolean;                      // render incrementally
    virtualization?: boolean;                    // only render visible portion
  };
}

// src/types/visualization-configs.ts (add after ScatterPlotConfig)

export type HistogramOrientation = 'vertical' | 'horizontal';
export type BinMethod = 'auto' | 'fixedCount' | 'fixedWidth';
export type HistogramNormalization = 'count' | 'probability' | 'density' | 'cumulative';

export interface HistogramConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // numeric field to bin
  colorField?: string;          // optional categorical field for stacked/grouped bars
  facetField?: string;          // field to create small multiples

  // Binning
  binning: {
    method: BinMethod;          // how bin width/count is determined
    bins?: number;              // number of bins (for fixedCount)
    binWidth?: number;           // fixed bin width (for fixedWidth)
    binRange?: {                 // optional manual range
      min?: number;
      max?: number;
    };
    autoBinStrategy?: 'freedman-diaconis' | 'scott' | 'sqrt'; // for auto
  };

  // Visual style
  orientation: HistogramOrientation;   // default vertical
  normalization: HistogramNormalization; // how y-axis is scaled
  cumulative: boolean;                  // show cumulative distribution
  barStyle: {
    fillColor?: string | string[];       // single color or per‑series palette
    fillOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;                // corner rounding
    gap?: number;                         // gap between bars (pixels)
  };
  colorScheme?: string | string[];        // palette name or custom array
  colorGradient?: boolean;
  gradientDirection?: 'vertical' | 'horizontal';

  // Axes – X (bin axis)
  xAxis?: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;                   // d3 format specifier
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time'; // for xField if time
    min?: number | string;
    max?: number | string;
  };

  // Axes – Y (count/density axis)
  yAxis?: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log';
    min?: number;
    max?: number;
    zeroBaseline?: boolean;
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;          // vertical lines (bin boundaries)
    yLines?: boolean;          // horizontal lines
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;                     // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;             // for normalized histograms
    showBinRange?: boolean;                // show bin interval
  };

  // Data labels (on bars)
  dataLabels?: {
    show?: boolean;
    position?: 'top' | 'inside' | 'outside';
    format?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;                        // allow zoom via scroll/pan
    pan?: boolean;
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;                        // rectangular selection
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
  };

  // Annotations / reference lines
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number;                             // bin position (midpoint)
    y?: number;
    x2?: number;
    y2?: number;
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;                // reduce bins/points
    maxPoints?: number;
    progressive?: boolean;
    virtualization?: boolean;
  };
}

// ==================== HEATMAP ====================

export type HeatmapColorScaleType = 'sequential' | 'diverging' | 'categorical';
export type HeatmapColorInterpolation = 'linear' | 'log' | 'sqrt' | 'pow';
export type HeatmapMissingValueBehavior = 'hide' | 'zero' | 'ignore';
export type HeatmapAxisScale = 'linear' | 'log' | 'time' | 'categorical';
export type HeatmapLegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type HeatmapTooltipTrigger = 'item' | 'axis' | 'none';

export interface HeatmapConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // categorical or time field for x‑axis cells
  yField: string;               // categorical or time field for y‑axis cells
  valueField: string;           // numeric field for cell color intensity
  groupField?: string;          // optional field to split into multiple heatmaps (facets)

  // Color scale
  colorScale: {
    type: HeatmapColorScaleType;           // sequential, diverging, categorical
    scheme: string | string[];              // palette name or custom colors
    interpolator?: HeatmapColorInterpolation; // scaling of color steps
    min?: number;                           // fixed minimum value (auto if undefined)
    max?: number;                           // fixed maximum value (auto if undefined)
    steps?: number;                         // number of discrete color steps (optional)
    opacity?: number;                        // global opacity
    missingValueColor?: string;               // color for missing/null values
    missingValueBehavior?: HeatmapMissingValueBehavior;
    reverse?: boolean;                       // reverse the color scheme
  };

  // Cell styling
  cell: {
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;                   // rounded corners (px)
    size?: number;                            // fixed cell size (px) – if not set, auto
    aspectRatio?: number;                     // width/height ratio when auto‑sized
    spacing?: number;                          // gap between cells (px)
    showValues?: boolean;                      // display numeric value inside cell
    valueFormat?: string;                       // d3 format for cell values (e.g. '.2f')
    valueFontSize?: number;
    valueColor?: string;
  };

  // Axes
  xAxis: {
    visible?: boolean;
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;                      // d3 format
    tickLabelRotation?: number;
    tickCount?: number;                         // suggested number of ticks
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: HeatmapAxisScale;
    timeZone?: string;                         // for time scales
    sort?: 'asc' | 'desc' | 'none';              // category ordering
  };

  yAxis: {
    visible?: boolean;
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickLabelRotation?: number;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: HeatmapAxisScale;
    timeZone?: string;
    sort?: 'asc' | 'desc' | 'none';
  };

  // Legend
  showLegend: boolean;
  legend?: {
    position?: HeatmapLegendPosition;
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemWidth?: number;
    itemHeight?: number;
    fontSize?: number;
    color?: string;
    format?: string;                           // d3 format for legend values
    continuous?: boolean;                       // continuous gradient vs. discrete steps
  };

  // Tooltip
  tooltip: {
    show?: boolean;
    trigger?: HeatmapTooltipTrigger;
    format?: string;                            // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;                    // for normalized values
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    showXLines?: boolean;
    showYLines?: boolean;
  };

  // Facet (for groupField)
  facet?: {
    columns?: number;                            // number of columns in facet grid
    spacing?: number;                             // gap between facets
    title?: {
      show?: boolean;
      fontSize?: number;
      color?: string;
    };
  };

  // Annotations / reference lines / text
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'text' | 'rect';
    x?: string | number;                         // x coordinate or category
    y?: string | number;                         // y coordinate or category
    x2?: string | number;                         // for bands/rects
    y2?: string | number;
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Interactivity
  interactivity: {
    zoom?: boolean;
    pan?: boolean;
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;                              // rectangular selection
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;                   // for advanced usage
    keyboardNavigation?: boolean;
  };

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                            // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                           // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large datasets)
  performance?: {
    downsampling?: boolean;                       // aggregate cells if too many
    maxCells?: number;                             // limit rendering
    progressive?: boolean;                         // render incrementally
    virtualization?: boolean;                       // only render visible cells
  };
}


// src/types/visualization-configs.ts (add after existing interfaces)

export type KpiComparisonType = 'none' | 'percentChange' | 'absoluteDifference' | 'targetRatio';
export type KpiTrendIcon = 'arrow' | 'triangle' | 'none';

export interface KpiConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  primaryValueField: string;          // main metric field
  secondaryValueField?: string;       // comparison field (previous period, target, etc.)
  labelField?: string;                 // optional field to use as label (if not using title)

  // Formatting
  numberFormat?: string;               // d3 format specifier (e.g. '.2s', ',.0f')
  prefix?: string;                      // e.g. '$', '€'
  suffix?: string;                      // e.g. ' units', '%'
  decimalPlaces?: number;                // 0–10

  // Comparison settings
  comparison?: {
    type: KpiComparisonType;
    label?: string;                      // e.g. 'vs previous month'
    colorPositive?: string;               // color for positive change
    colorNegative?: string;               // color for negative change
    showIcon?: boolean;
    iconType?: KpiTrendIcon;
  };

  // Visual appearance
  primaryColor?: string;                  // main value color
  labelColor?: string;                     // label color
  backgroundColor?: string;                 // card background
  border?: {
    color?: string;
    width?: number;
    radius?: number;                       // border radius in px
    style?: 'solid' | 'dashed' | 'dotted';
  };
  shadow?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };

  // Typography
  typography?: {
    primaryFontSize?: number;               // px
    primaryFontWeight?: 'normal' | 'bold' | 'lighter';
    labelFontSize?: number;
    comparisonFontSize?: number;
    fontFamily?: string;
  };

  // Sparkline (optional mini chart)
  sparkline?: {
    enabled: boolean;
    field?: string;                         // field for sparkline values
    color?: string;
    width?: number;
    height?: number;
  };

  // Interactivity
  tooltip?: {
    show?: boolean;
    format?: string;                        // custom template
    backgroundColor?: string;
    textColor?: string;
  };
  clickAction?: 'none' | 'drilldown' | 'url' | 'custom';
  customClickHandler?: string;               // for advanced usage
  hoverEffect?: boolean;

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
  };
  exportable?: boolean;                       // allow PNG export
  exportFormats?: Array<'png' | 'svg'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Dimensions (required)
  dimensions: {
    width: number;
    height: number;
  };
}

// src/types/visualization-configs.ts

export type GaugeType = 'arc' | 'bullet' | 'dial';
export type GaugeSegment = {
  id: string;
  min: number;
  max: number;
  color: string;
  label?: string;
};

export interface GaugeConfig {
  // Basic
  title?: string;
  valueField: string;               // numeric field containing the gauge value
  min?: number;                      // minimum of the scale (auto if omitted)
  max?: number;                      // maximum of the scale (auto if omitted)
  units?: string;                     // e.g., "km/h", "€"

  // Gauge type
  type: GaugeType;                   // visual style of the gauge

  // Segments / thresholds
  segments: GaugeSegment[];           // coloured ranges

  // Needle styling (for arc/dial)
  needle?: {
    color?: string;
    width?: number;                   // px
    length?: number;                  // relative to radius (0–1)
  };

  // Tick marks and labels
  ticks?: {
    show: boolean;
    step?: number;                    // interval between ticks
    format?: string;                   // d3 format specifier
    count?: number;                     // approximate number of ticks
    fontSize?: number;
    color?: string;
  };

  // Value label
  valueLabel?: {
    show: boolean;
    fontSize?: number;
    color?: string;
    format?: string;                    // d3 format for the displayed value
  };

  // Animation
  animation?: {
    enabled: boolean;
    duration?: number;                   // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Interactivity
  tooltip?: {
    show: boolean;
    format?: string;                      // custom template
    backgroundColor?: string;
    textColor?: string;
  };
  clickAction?: 'none' | 'drilldown' | 'custom';
  customClickHandler?: string;

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };
}

// ==================== FUNNEL CONFIGURATION ====================

export type FunnelOrientation = 'vertical' | 'horizontal';
export type FunnelShape = 'trapezoid' | 'bar' | 'pyramid';

export interface FunnelConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  stageField: string;               // categorical field for funnel stages
  valueField: string;               // numeric field for stage counts/values
  groupField?: string;               // optional field to split into multiple funnels

  // Stage order
  stageOrder?: 'ascending' | 'descending' | 'custom';
  customStageOrder?: string[];        // explicit list of stage names in order

  // Visual style
  orientation: FunnelOrientation;    // default vertical
  shape: FunnelShape;                 // default trapezoid
  barWidth?: number;                   // fixed width per bar (px) – if not set, auto
  barGap?: number;                     // gap between bars (px)
  barStyle: {
    fillColor?: string | string[];      // single color or per‑stage palette
    fillOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;               // corner rounding (for bar shape)
  };
  colorScheme?: string | string[];        // palette name or custom array
  colorGradient?: boolean;                // use gradient fill
  gradientDirection?: 'vertical' | 'horizontal';

  // Axes
  xAxis?: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;                  // d3 format
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
  };
  yAxis?: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    zeroBaseline?: boolean;                // force include zero
  };

  // Labels on bars
  dataLabels?: {
    show?: boolean;
    position?: 'inside' | 'outside' | 'top';
    format?: string;                        // d3 format for values
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;                         // offset from bar
    showPercentage?: boolean;                 // show percentage of total
    showStageName?: boolean;                   // show stage name
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;                         // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;                  // show percentage of total
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;
    yLines?: boolean;
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;
    pan?: boolean;
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
  };

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                        // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                        // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (optional)
  performance?: {
    downsampling?: boolean;                    // for very large data
    maxPoints?: number;
    progressive?: boolean;
    virtualization?: boolean;
  };
}

// ==================== TREEMAP CONFIGURATION ====================

export type TreemapTileAlgorithm = 'squarify' | 'slice' | 'dice' | 'slicedice' | 'binary';
export type TreemapColorScaleType = 'sequential' | 'diverging' | 'categorical';
export type TreemapLabelPosition = 'top' | 'center' | 'bottom' | 'none';

export interface TreemapConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  // Hierarchy levels: from broadest to finest (e.g., ['continent', 'country', 'city'])
  hierarchy: string[];                     // fields for nested rectangles
  sizeField: string;                       // numeric measure determining rectangle area
  colorField?: string;                      // numeric or categorical field for color
  labelField?: string;                       // field to use for rectangle labels (defaults to last hierarchy level)

  // Layout
  tileAlgorithm: TreemapTileAlgorithm;      // how rectangles are arranged
  padding: number;                           // padding between rectangles (px)
  paddingInner?: number;                      // padding between siblings
  paddingOuter?: number;                      // padding around groups
  round?: boolean;                            // round pixel values for crisp edges
  aspectRatio?: number;                        // target aspect ratio (for squarify)

  // Color scale
  colorScale: {
    type: TreemapColorScaleType;
    scheme: string | string[];                // palette name or custom colors
    interpolator?: 'linear' | 'log' | 'sqrt'; // scaling of color steps
    min?: number;                              // fixed minimum value (auto if undefined)
    max?: number;                              // fixed maximum value (auto if undefined)
    steps?: number;                             // number of discrete steps (for sequential)
    opacity?: number;                            // global opacity
    missingValueColor?: string;                  // color for missing/null values
    reverse?: boolean;                            // reverse the color scheme
  };

  // Borders
  border?: {
    color?: string;
    width?: number;
    dash?: string;
    opacity?: number;
  };

  // Labels
  labels: {
    show: boolean;
    position?: TreemapLabelPosition;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    padding?: number;                             // internal label padding (px)
    format?: string;                              // d3 format for values (if showing values)
    showName?: boolean;                            // show category name
    showValue?: boolean;                            // show numeric value
    showPercentage?: boolean;                        // show percentage of total
    truncate?: boolean;                              // truncate long names
    maxLength?: number;                              // max characters before truncation
    textShadow?: boolean;                            // add text shadow for contrast
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'hover' | 'click' | 'both';
    format?: string;                               // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showAllFields?: boolean;                        // show all available fields for the node
    showHierarchy?: boolean;                         // show full path in hierarchy
    showSize?: boolean;                               // show size value
    showColorValue?: boolean;                         // show color value
  };

  // Legend
  showLegend: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
    continuous?: boolean;                            // for sequential color scales
  };

  // Interactivity
  interactivity: {
    zoomToRect?: boolean;                             // allow clicking a rectangle to zoom
    drillDown?: boolean;                               // drill down to next hierarchy level
    hoverHighlight?: boolean;                          // highlight on hover
    clickAction?: 'none' | 'select' | 'drilldown' | 'zoom' | 'custom';
    customClickHandler?: string;                        // for advanced usage
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;                                    // allow rectangle selection
    keyboardNavigation?: boolean;                       // arrow keys to move focus
  };

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                                 // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    stagger?: boolean;                                  // animate hierarchy levels sequentially
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                                 // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large datasets)
  performance?: {
    downsampling?: boolean;                            // aggregate small rectangles
    maxNodes?: number;                                   // limit rendering
    progressive?: boolean;                               // render incrementally
    virtualization?: boolean;                             // only render visible rectangles
  };
}

// ==================== BUBBLE CHART CONFIGURATION ====================

export type BubbleMarkerSymbol =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'cross'
  | 'x'
  | 'triangle'
  | 'star'
  | 'none';

export interface BubbleChartConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // numeric or categorical field for x‑axis
  yField: string;               // numeric field for y‑axis
  sizeField: string;            // numeric field for bubble size
  colorField?: string;          // categorical or numeric field for bubble color
  shapeField?: string;          // categorical field for bubble symbol (optional)
  facetField?: string;          // field to create small multiples

  // Point (bubble) styling
  point: {
    symbol?: BubbleMarkerSymbol;       // default symbol if no shapeField
    sizeScale?: 'linear' | 'log';      // scaling for sizeField
    sizeMin?: number;                  // minimum point size (px)
    sizeMax?: number;                  // maximum point size (px)
    baseSize?: number;                 // base size when sizeField is missing (px)
    opacity?: number;                  // global bubble opacity (0‑1)
    colorOpacity?: number;              // separate opacity for color mapping (if used)
    color?: string;                    // fixed color if no colorField
    colorScale?: 'linear' | 'log' | 'categorical'; // scaling for colorField
    colorPalette?: string | string[];   // single color or palette name/array
    borderColor?: string;               // bubble stroke color
    borderWidth?: number;                // bubble stroke width
    borderOpacity?: number;               // stroke opacity
    blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  };

  // Axes – X
  xAxis?: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;                  // d3 format specifier
    tickCount?: number;                    // suggested number of ticks
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time' | 'categorical';
    timeZone?: string;
    min?: number | string;                  // manual min (numeric or date)
    max?: number | string;                  // manual max
    zeroBaseline?: boolean;                  // force include zero?
  };

  // Axes – Y (similar)
  yAxis?: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time' | 'categorical';
    timeZone?: string;
    min?: number | string;
    max?: number | string;
    zeroBaseline?: boolean;
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;          // vertical lines
    yLines?: boolean;          // horizontal lines
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?:
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;                     // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;              // for binned modes (if applicable)
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;                        // allow zoom via scroll/pan
    pan?: boolean;                         // allow panning after zoom
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;                        // rectangular selection
    hoverHighlight?: boolean;                // highlight point on hover
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;             // for advanced usage
  };

  // Annotations / reference lines
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;                    // x coordinate or category
    y?: number;                              // y coordinate
    x2?: number | string;                    // for bands
    y2?: number;                              // for bands
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                        // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    stagger?: boolean;                         // animate points one after another
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                        // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;                    // reduce points for rendering
    maxPoints?: number;
    progressive?: boolean;                      // render incrementally
    virtualization?: boolean;                    // only render visible portion
  };
}

// ==================== SCATTER MATRIX (SPLOM) ====================

export type MatrixDiagonalContent = 'histogram' | 'density' | 'none' | 'scatter';
export type MatrixLabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'corner';

export interface ScatterMatrixConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  /** List of numeric columns to include in the matrix (required) */
  columns: string[];
  /** Optional categorical field for point color */
  colorField?: string;
  /** Optional numeric field for point size */
  sizeField?: string;
  /** Optional field for faceting (small multiples) – usually not used, but kept for consistency */
  facetField?: string;

  // Matrix layout
  matrix: {
    /** Number of plots per row (if not set, auto‑fit) */
    columnsPerRow?: number;
    /** Spacing between individual plots (px) */
    spacing: number;
    /** What to show on the diagonal (distribution of the variable itself) */
    diagonalContent: MatrixDiagonalContent;
    /** Whether to show variable names on the diagonal */
    showDiagonalLabels: boolean;
    /** Position of axis labels inside each cell */
    labelPosition: MatrixLabelPosition;
    /** Whether to rotate axis labels */
    rotateLabels?: boolean;
    /** Shared axes between cells? (true = all cells share same scale) */
    sharedAxes: boolean;
  };

  // Point styling
  point: {
    symbol?: ScatterPointSymbol;       // e.g., 'circle', 'square', 'cross'
    size?: number;                      // fixed size if no sizeField
    sizeScale?: 'linear' | 'log';       // scaling when sizeField is used
    sizeMin?: number;                    // minimum point size (px)
    sizeMax?: number;                    // maximum point size (px)
    color?: string;                      // fixed color if no colorField
    colorOpacity?: number;                // global point opacity
    colorScale?: 'linear' | 'log' | 'categorical'; // for colorField
    colorPalette?: string | string[];     // single color or palette name/array
    borderColor?: string;                 // stroke color
    borderWidth?: number;                  // stroke width
    borderOpacity?: number;
  };

  // Axes (applied to every cell)
  xAxis?: {
    visible?: boolean;
    tickFormat?: string;                  // d3 format
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time'; // usually linear for scatter matrix
    min?: number;
    max?: number;
  };

  yAxis?: {
    visible?: boolean;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time';
    min?: number;
    max?: number;
  };

  // Grid (optional, per cell)
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
  };

  // Legend (for color and size)
  showLegend?: boolean;
  legend?: {
    position?: LegendPosition;
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
    continuous?: boolean;                 // for color gradients
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: TooltipTrigger;
    format?: string;                       // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showAllFields?: boolean;                // show all columns of the point
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;                         // allow zoom (applies to all cells)
    pan?: boolean;
    selection?: SelectionMode;               // single, multiple, none
    brush?: boolean;                          // rectangular selection (linked brushing across cells)
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
    linkedBrushing?: boolean;                 // highlight points across all cells
  };

  // Annotations (reference lines can be placed on all cells or specific ones)
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'text';
    x?: number | string;                      // for line at a specific x value
    y?: number;                                // for line at a specific y value
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    cell?: {                                   // optionally restrict to a specific cell
      xColumn: string;
      yColumn: string;
    };
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions (total canvas size – the matrix will be laid out inside it)
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance
  performance?: {
    downsampling?: boolean;                    // reduce points when many
    maxPoints?: number;
    progressive?: boolean;
  };
}

// src/types/visualization-configs.ts

export type SeriesType = 'line' | 'bar' | 'area' | 'scatter';
export type AxisSide = 'left' | 'right';

export interface DualAxisSeries {
  id: string;
  field: string;                 // data field to plot
  type: SeriesType;              // chart type for this series
  axis: AxisSide;                 // which y‑axis this series belongs to
  name?: string;                  // display name (legend)
  // Styling options
  color?: string;
  lineStyle?: {
    width?: number;
    dash?: string;
    opacity?: number;
  };
  marker?: {
    symbol?: 'circle' | 'square' | 'diamond' | 'cross' | 'x' | 'triangle' | 'star' | 'none';
    size?: number;
  };
  barStyle?: {
    fillOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  areaStyle?: {
    fillOpacity?: number;
  };
}

export interface AxisConfig {
  visible?: boolean;
  title?: string;
  titleFontSize?: number;
  titleColor?: string;
  tickFormat?: string;            // d3 format specifier (e.g. '.2f', '%')
  tickCount?: number;              // suggested number of ticks
  tickColor?: string;
  tickSize?: number;
  lineColor?: string;
  lineWidth?: number;
  scaleType?: 'linear' | 'log' | 'time' | 'categorical';
  min?: number | string;           // manual min (numeric or date string)
  max?: number | string;           // manual max
  zeroBaseline?: boolean;          // force include zero (for linear scale)
}

export interface DualAxisConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;                 // shared x‑axis field
  series: DualAxisSeries[];        // list of series

  // Axes configurations
  leftAxis?: AxisConfig;
  rightAxis?: AxisConfig;

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;                 // e.g. '5,5'
    xLines?: boolean;               // show vertical grid lines
    yLines?: boolean;               // show horizontal grid lines
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis';
    format?: string;                // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showAllSeries?: boolean;        // show all series at same x
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;
    pan?: boolean;
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;                 // rectangular selection
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
  };

  // Annotations
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;
    y?: number;
    x2?: number | string;
    y2?: number;
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;               // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;              // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large datasets)
  performance?: {
    downsampling?: boolean;
    maxPoints?: number;
    progressive?: boolean;           // render incrementally
    virtualization?: boolean;        // only render visible portion
  };
}

// ==================== PARETO CHART CONFIGURATION ====================

export interface ParetoChartConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  barField: string;               // categorical field for bars
  valueField: string;              // numeric measure for bar heights
  colorField?: string;             // optional field for bar colors
  facetField?: string;              // optional field for small multiples

  // Pareto specific
  sortOrder: 'descending' | 'ascending' | 'custom';
  customSortOrder?: string[];        // if sortOrder is 'custom'
  showCumulativeLine: boolean;
  cumulativeLineStyle?: {
    color?: string;
    width?: number;
    dash?: string;
    opacity?: number;
  };
  secondaryAxis?: {                   // right axis for cumulative percentage
    visible?: boolean;
    title?: string;
    tickFormat?: string;
    min?: number;
    max?: number;
  };
  showPercentageLabels?: boolean;     // show % on bars or points
  targetLine?: {
    show?: boolean;
    value?: number;                    // target cumulative % or value
    color?: string;
    width?: number;
    dash?: string;
  };

  // Bar styling (similar to bar chart)
  barStyle: {
    fillColor?: string | string[];      // single color or per‑series palette
    fillOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    gap?: number;                         // gap between bars (pixels)
  };
  colorScheme?: string | string[];        // palette name or custom array
  colorGradient?: boolean;                // use gradient fill
  gradientDirection?: 'vertical' | 'horizontal';

  // Axes
  xAxis?: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;                  // d3 format specifier
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'band' | 'point' | 'categorical'; // usually band
    min?: number | string;
    max?: number | string;
  };
  yAxis?: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log';
    min?: number;
    max?: number;
    zeroBaseline?: boolean;
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;
    yLines?: boolean;
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;                     // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;             // show percentage
  };

  // Data labels on bars
  dataLabels?: {
    show?: boolean;
    position?: 'top' | 'inside' | 'outside';
    format?: string;                       // d3 format for values
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;
    showPercentage?: boolean;               // show % instead of value
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;
    pan?: boolean;
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
  };

  // Annotations / reference lines
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;
    y?: number;
    x2?: number | string;
    y2?: number;
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                    // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                    // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;
    maxPoints?: number;
    progressive?: boolean;
    virtualization?: boolean;
  };
}

// src/types/visualization-configs.ts

export type WordCloudLayout = 'spiral' | 'grid' | 'random' | 'archimedean' | 'rectangular';
export type WordCloudSpiral = 'archimedean' | 'rectangular';
export type WordCase = 'original' | 'lowercase' | 'uppercase' | 'capitalize';
export type WordCloudScale = 'linear' | 'log' | 'sqrt';
export type WordCloudRotationMode = 'none' | 'random' | 'steps';

export interface WordCloudConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  wordField: string;               // required – field containing the words
  sizeField?: string;               // optional – numeric field for word weight
  colorField?: string;               // optional – field for color mapping
  groupField?: string;               // optional – create multiple clouds (facet)

  // Text appearance
  fontFamily: string | string[];     // single font or list (fallback)
  fontSizeRange: { min: number; max: number }; // scaling range in px
  fontWeight: 'normal' | 'bold' | 'lighter' | number;
  fontStyle: 'normal' | 'italic' | 'oblique';
  rotation: {
    enabled: boolean;
    mode: WordCloudRotationMode;     // 'none' | 'random' | 'steps'
    angles?: number[];                // if mode = 'steps', e.g. [0, 90]
    range?: [number, number];         // if mode = 'random', e.g. [-90, 90]
    steps?: number;                    // number of discrete steps (optional)
  };
  padding: number;                     // spacing between words (px)
  wordCase: WordCase;                  // case transformation

  // Color
  colorScheme?: string | string[];     // single color or palette name/array
  colorGradient?: boolean;              // use gradient fill
  opacity?: number;                      // global opacity
  randomColors?: boolean;                 // if true, assign random colors (ignores colorField)

  // Layout
  layoutAlgorithm: WordCloudLayout;
  spiral?: WordCloudSpiral;                // if layoutAlgorithm = 'spiral'
  scale: WordCloudScale;                    // how size maps to font size
  minSize: number;                           // minimum font size (px)
  maxSize: number;                           // maximum font size (px)
  maxWords: number;                           // limit number of displayed words
  minFrequency?: number;                       // only include words with frequency >= this value
  stopwords: string[];                         // custom stopwords list
  usePredefinedStopwords: boolean;              // include common English stopwords
  removeNumbers: boolean;
  removePunctuation: boolean;
  stemWords: boolean;                           // apply stemming
  caseSensitive: boolean;                        // treat same word with different case as separate?

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'none';
    format?: string;                          // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showWord?: boolean;
    showWeight?: boolean;
  };

  // Interactivity
  interactivity?: {
    hoverHighlight?: boolean;                  // highlight word on hover
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
    selection?: 'single' | 'multiple' | 'none';
    zoom?: boolean;
    pan?: boolean;
  };

  // Legend (if colorField is used)
  showLegend?: boolean;
  legend?: {
    position?:
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
    continuous?: boolean;                       // for numeric colorField
  };

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                           // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                           // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;                       // reduce number of words
    maxWords?: number;                             // already present, but can be separate
    progressive?: boolean;
    virtualization?: boolean;
  };
}
// src/types/visualization-configs.ts (add after LineChartConfig)

export type AreaStackMode = 'none' | 'normal' | 'percent' | 'stream';
export type AreaBaseline = 'zero' | 'minimum' | 'wiggle' | 'silhouette';

export interface AreaChartConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // field for x‑axis (time, numeric, categorical)
  yField: string;               // numeric measure for y‑axis
  colorField?: string;          // field to split into multiple series (areas)
  sizeField?: string;           // optional field to vary line width
  facetField?: string;          // field for small multiples

  // Area appearance
  fillOpacity: number;           // 0–1
  fillGradient?: boolean;        // use gradient fill across area
  gradientDirection?: 'vertical' | 'horizontal';
  curve: 'linear' | 'monotone' | 'cardinal' | 'catmullRom' | 'natural';
  stackMode: AreaStackMode;      // stacking behaviour
  baseline: AreaBaseline;        // baseline for stream/stack

  // Outline (stroke) properties
  stroke?: {
    show: boolean;
    color?: string;
    width?: number;
    dash?: string;
    opacity?: number;
  };

  // Markers on the area
  showMarkers: boolean;
  markerSymbol: 'circle' | 'square' | 'diamond' | 'cross' | 'x' | 'triangle' | 'star' | 'none';
  markerSize: number;
  markerColor?: string;
  markerBorderColor?: string;
  markerBorderWidth?: number;
  markerOpacity?: number;

  // Color
  colorScheme?: string | string[];   // single color or palette name/array
  colorGradient?: boolean;           // use gradient across series (if multiple)
  colorOpacity?: number;             // global opacity

  // Axes
  xAxis?: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time' | 'categorical';
    timeZone?: string;
    min?: number | string;
    max?: number | string;
  };

  yAxis?: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: 'linear' | 'log' | 'time';
    min?: number;
    max?: number;
    zeroBaseline?: boolean;
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;
    yLines?: boolean;
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    format?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;        // for percent stacking
    showAllSeries?: boolean;         // show all series at same x
    sortSeries?: boolean;
  };

  // Data labels on points
  dataLabels?: {
    show?: boolean;
    position?: 'top' | 'inside' | 'bottom';
    format?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;
    pan?: boolean;
    selection?: 'single' | 'multiple' | 'none';
    brush?: boolean;
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;
    seriesFocusMode?: 'highlight' | 'dim';
  };

  // Annotations
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;
    y?: number;
    x2?: number | string;
    y2?: number;
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;               // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    stagger?: boolean;                // animate series sequentially
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;
    maxPoints?: number;
    progressive?: boolean;
    virtualization?: boolean;
  };
}

// ==================== WATERFALL CHART CONFIGURATION ====================

export type WaterfallOrientation = 'vertical' | 'horizontal';
export type ConnectorType = 'line' | 'step' | 'curve';
export type LabelPosition = 'top' | 'inside' | 'bottom' | 'none';
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface WaterfallConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // categorical field for bars (e.g., stages)
  yField: string;               // numeric measure for bar height
  colorField?: string;          // optional categorical field for bar colors
  sizeField?: string;           // optional numeric field for bar width scaling
  facetField?: string;          // optional field to create small multiples

  // Orientation
  orientation: WaterfallOrientation;   // default vertical

  // Bar styling
  barStyle: {
    fillColor?: string | string[];      // single color or per‑series palette
    fillOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;               // corner rounding (px)
    width?: number;                      // fixed bar width (px) – if not set, auto
    gap?: number;                        // gap between bars (px)
  };

  // Connectors (lines between bars)
  connectors: {
    show: boolean;
    type?: ConnectorType;                // line, step, curve
    color?: string;
    width?: number;
    dash?: string;                       // e.g., '5,5'
    opacity?: number;
  };

  // Color scheme
  colorScheme?: string | string[];       // palette name or custom array
  colorGradient?: boolean;               // use gradient fill
  gradientDirection?: 'vertical' | 'horizontal';

  // Labels on bars
  labels: {
    show: boolean;
    position?: LabelPosition;
    format?: string;                      // d3 format for values (e.g., '.2f')
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    offset?: number;                       // offset from bar (px)
    showValue?: boolean;                    // display numeric value
    showPercentage?: boolean;                // display percentage of total
    showName?: boolean;                       // display category name
    rotate?: boolean;                          // rotate label (inside)
  };

  // Axes
  xAxis: {
    visible?: boolean;
    position?: 'bottom' | 'top';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;                     // d3 format
    tickCount?: number;                       // suggested number of ticks
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: ScaleType;                    // usually 'categorical' or 'time'
    timeZone?: string;                         // for time scales
    sort?: 'asc' | 'desc' | 'none';              // category ordering
  };

  yAxis: {
    visible?: boolean;
    position?: 'left' | 'right';
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: ScaleType;                    // linear, log, time
    min?: number;                               // manual min
    max?: number;                               // manual max
    zeroBaseline?: boolean;                     // force include zero
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;          // vertical lines
    yLines?: boolean;          // horizontal lines
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: LegendPosition;
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: TooltipTrigger;
    format?: string;                           // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;                   // show percentage of total
    showAllSeries?: boolean;                    // show all series at the same x
  };

  // Interactivity
  interactivity: {
    zoom?: boolean;
    pan?: boolean;
    selection?: SelectionMode;
    brush?: boolean;                            // rectangular selection
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;                 // for advanced usage
    keyboardNavigation?: boolean;                 // arrow keys to move focus
  };

  // Annotations / reference lines
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;                         // x coordinate or category
    y?: number;
    x2?: number | string;                         // for bands
    y2?: number;
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation: {
    enabled: boolean;
    duration?: number;                            // ms
    easing?: AnimationEasing;
    stagger?: boolean;                             // animate bars sequentially
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                            // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large datasets)
  performance?: {
    downsampling?: boolean;                        // reduce points/aggregate bars
    maxPoints?: number;
    progressive?: boolean;                          // render incrementally
    virtualization?: boolean;                        // only render visible portion
  };
}

// src/types/visualization-configs.ts (add after BoxPlotConfig)

export type BarOrientation = 'vertical' | 'horizontal';
export type BarGroupMode = 'group' | 'stack' | 'percent';

export interface BarChartConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // categorical or time field for x-axis
  yField: string;               // numeric measure for bar height
  colorField?: string;          // optional field to group/color bars
  sizeField?: string;           // optional field to vary bar width (if supported)
  facetField?: string;          // optional field to create small multiples

  // Chart style
  orientation: BarOrientation;
  groupMode: BarGroupMode;      // grouped, stacked, or percentage stacked
  barWidth?: number;            // fixed bar width (px), if undefined = auto
  barGap?: number;              // gap between bars within a group (px)
  categoryGap?: number;         // gap between groups/categories (px)
  borderRadius?: number;        // rounded corners on bars

  // Color
  colorScheme?: string | string[];   // single color or palette name/array
  colorGradient?: boolean;           // use gradient fill
  gradientDirection?: 'vertical' | 'horizontal';
  opacity?: number;                  // global fill opacity
  borderColor?: string;
  borderWidth?: number;
  borderType?: 'solid' | 'dashed' | 'dotted';

  // Axes
  xAxis?: {
    visible?: boolean;
    position?: AxisPosition;
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;               // d3 format specifier
    tickCount?: number;                 // suggested number of ticks
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: ScaleType;              // for x axis (usually band or categorical)
  };

  yAxis?: {
    visible?: boolean;
    position?: AxisPosition;
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: ScaleType;              // for y axis (usually linear/log)
    min?: number;                        // manual min
    max?: number;                        // manual max
    zeroBaseline?: boolean;              // force include zero
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;
    yLines?: boolean;
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: LegendPosition;
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: TooltipTrigger;
    format?: string;                     // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;             // for stacked/percent mode
  };

  // Labels on bars
  dataLabels?: {
    show?: boolean;
    position?: 'top' | 'inside' | 'outside';
    format?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;
    pan?: boolean;
    selection?: SelectionMode;
    brush?: boolean;
    hoverHighlight?: boolean;
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;          // for advanced usage
  };

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                    // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                    // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;
    maxPoints?: number;
    progressive?: boolean;
    virtualization?: boolean;
  };
}

// src/types/visualization-configs.ts (add after BarChartConfig)

export type LineType = 'linear' | 'smooth' | 'step' | 'step-start' | 'step-end';
export type CurveType = 'linear' | 'cardinal' | 'monotone' | 'catmullRom' | 'natural';
export type MarkerSymbol = 'circle' | 'square' | 'diamond' | 'cross' | 'x' | 'triangle' | 'star' | 'none';
export type AxisPosition = 'bottom' | 'left' | 'top' | 'right';
export type ScaleType = 'linear' | 'log' | 'time' | 'band' | 'point' | 'categorical';
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type TooltipTrigger = 'item' | 'axis' | 'none';
export type SelectionMode = 'single' | 'multiple' | 'none';

export interface LineChartConfig {
  // Basic identification
  title?: string;
  description?: string;

  // Data mapping
  xField: string;               // field for x‑axis (time, numeric, or categorical)
  yField: string;               // numeric measure for y‑axis
  colorField?: string;          // field to split into multiple series (lines)
  sizeField?: string;           // optional field to vary line width (if supported)
  facetField?: string;          // field for small multiples (grid of charts)

  // Chart style – line properties
  lineType: LineType;            // how the line is drawn
  curve?: CurveType;             // for smooth lines, e.g. 'monotone'
  lineWidth: number;             // stroke width
  lineDash?: string;             // e.g. '5,5'
  lineOpacity?: number;          // 0–1
  fillArea?: boolean;            // area chart under the line
  fillOpacity?: number;          // 0–1
  stackSeries?: boolean;         // stack multiple series (area chart)
  stackedMode?: 'normal' | 'percent'; // for percentage stacked area

  // Markers (points on the line)
  showMarkers: boolean;
  markerSymbol: MarkerSymbol;
  markerSize: number;
  markerColor?: string;
  markerBorderColor?: string;
  markerBorderWidth?: number;
  markerOpacity?: number;

  // Color
  colorScheme?: string | string[];   // single color or palette name/array
  colorGradient?: boolean;           // use gradient fill (for area)
  gradientDirection?: 'vertical' | 'horizontal';
  colorOpacity?: number;             // global opacity for lines/areas

  // Axes – X
  xAxis?: {
    visible?: boolean;
    position?: AxisPosition;
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickLabelRotation?: number;
    tickFormat?: string;               // d3 format specifier (e.g. '.2f', '%Y-%m')
    tickCount?: number;                 // suggested number of ticks
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: ScaleType;              // linear, log, time, band, etc.
    timeZone?: string;                  // e.g. 'UTC', 'America/New_York' (for time scale)
    min?: number | string;               // manual min (numeric or date string)
    max?: number | string;               // manual max
  };

  // Axes – Y
  yAxis?: {
    visible?: boolean;
    position?: AxisPosition;
    title?: string;
    titleFontSize?: number;
    titleColor?: string;
    tickFormat?: string;
    tickCount?: number;
    tickColor?: string;
    tickSize?: number;
    lineColor?: string;
    lineWidth?: number;
    scaleType?: ScaleType;              // usually linear or log
    min?: number;
    max?: number;
    zeroBaseline?: boolean;              // force include zero
  };

  // Grid
  showGrid?: boolean;
  grid?: {
    color?: string;
    width?: number;
    dash?: string;
    xLines?: boolean;                    // show vertical grid lines
    yLines?: boolean;                    // show horizontal grid lines
  };

  // Legend
  showLegend?: boolean;
  legend?: {
    position?: LegendPosition;
    orient?: 'horizontal' | 'vertical';
    title?: string;
    titleFontSize?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    symbolSize?: number;
    fontSize?: number;
    color?: string;
  };

  // Tooltip
  tooltip?: {
    show?: boolean;
    trigger?: TooltipTrigger;
    format?: string;                     // custom template
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    showValues?: boolean;
    showPercentage?: boolean;             // for stacked/percent mode
    showAllSeries?: boolean;              // show all series at the same x
    sortSeries?: boolean;                 // sort series by value in tooltip
  };

  // Data labels (on points)
  dataLabels?: {
    show?: boolean;
    position?: 'top' | 'inside' | 'bottom';
    format?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    offset?: number;
  };

  // Interactivity
  interactivity?: {
    zoom?: boolean;                       // allow zoom via scroll/pan
    pan?: boolean;                        // allow panning after zoom
    selection?: SelectionMode;             // data point selection
    brush?: boolean;                       // rectangular selection
    hoverHighlight?: boolean;              // highlight line on hover
    clickAction?: 'none' | 'select' | 'drilldown' | 'custom';
    customClickHandler?: string;           // for advanced usage
    focusNode?: boolean;                   // focus on a specific series (highlight, dim others)
    seriesFocusMode?: 'highlight' | 'dim'; // how focus affects other series
  };

  // Annotations / reference lines
  annotations?: Array<{
    id: string;
    type: 'line' | 'band' | 'point' | 'text';
    x?: number | string;                   // x coordinate or category
    y?: number;                             // y coordinate
    x2?: number | string;                   // for bands
    y2?: number;                             // for bands
    color?: string;
    width?: number;
    dash?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    textPosition?: 'start' | 'middle' | 'end';
  }>;

  // Animation
  animation?: {
    enabled?: boolean;
    duration?: number;                    // ms
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    stagger?: boolean;                     // animate series one after another
  };

  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Responsive & Export
  responsive?: {
    enabled?: boolean;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
  };
  exportable?: boolean;                    // allow PNG/SVG/PDF export
  exportFormats?: Array<'png' | 'svg' | 'pdf'>;

  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    highContrast?: boolean;
    focusable?: boolean;
  };

  // Performance (for large data)
  performance?: {
    downsampling?: boolean;                // reduce points for rendering
    maxPoints?: number;
    progressive?: boolean;                  // render incrementally
    virtualization?: boolean;                // only render visible portion
  };
}