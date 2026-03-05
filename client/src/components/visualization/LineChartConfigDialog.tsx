// src/components/visualization/LineChartConfigDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  Grid,
  ChevronDown,
  ChevronRight,
  Palette,
  Eye,
  Play,
  Activity,
  Circle,
  Square,
  Diamond,
  X as XIcon,
  Target,
  Map,
  LineChart,
  Layers,
  Minus,
  Sigma,
  ZoomIn,
  MousePointer,
  Download,
  Accessibility,
  Zap,
} from 'lucide-react';

// Import the shared type
import { LineChartConfig } from '../../types/visualization-configs';

interface LineChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<LineChartConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: LineChartConfig) => void;
}

const defaultConfig: LineChartConfig = {
  title: '',
  description: '',
  xField: '',
  yField: '',
  colorField: '',
  sizeField: '',
  facetField: '',
  lineType: 'linear',
  curve: 'monotone',
  lineWidth: 2,
  lineDash: '',
  lineOpacity: 1,
  fillArea: false,
  fillOpacity: 0.3,
  stackSeries: false,
  stackedMode: 'normal',
  showMarkers: false,
  markerSymbol: 'circle',
  markerSize: 6,
  markerColor: '',
  markerBorderColor: '',
  markerBorderWidth: 1,
  markerOpacity: 1,
  colorScheme: '#3b82f6',
  colorGradient: false,
  gradientDirection: 'vertical',
  colorOpacity: 1,
  xAxis: {
    visible: true,
    position: 'bottom',
    title: '',
    titleFontSize: 12,
    titleColor: '#333333',
    tickLabelRotation: 0,
    tickFormat: '',
    tickCount: 5,
    tickColor: '#cccccc',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
    scaleType: 'linear',
    timeZone: 'UTC',
  },
  yAxis: {
    visible: true,
    position: 'left',
    title: '',
    titleFontSize: 12,
    titleColor: '#333333',
    tickFormat: '',
    tickCount: 5,
    tickColor: '#cccccc',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
    scaleType: 'linear',
    zeroBaseline: true,
  },
  showGrid: true,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
    xLines: true,
    yLines: true,
  },
  showLegend: false,
  legend: {
    position: 'top',
    orient: 'horizontal',
    itemGap: 10,
    itemWidth: 20,
    itemHeight: 14,
    symbolSize: 8,
    fontSize: 12,
    color: '#333333',
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    format: '',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showValues: true,
    showPercentage: false,
    showAllSeries: true,
    sortSeries: false,
  },
  dataLabels: {
    show: false,
    position: 'top',
    format: '',
    fontSize: 11,
    color: '#333333',
    backgroundColor: 'transparent',
    offset: 5,
  },
  interactivity: {
    zoom: false,
    pan: false,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
    focusNode: false,
    seriesFocusMode: 'highlight',
  },
  annotations: [],
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
    stagger: false,
  },
  dimensions: {
    width: 600,
    height: 400,
  },
  responsive: {
    enabled: false,
    minWidth: 300,
    minHeight: 200,
    aspectRatio: undefined,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    ariaLabel: '',
    ariaDescription: '',
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    maxPoints: 1000,
    progressive: false,
    virtualization: false,
  },
};

// Helper to stringify color array
const stringifyColors = (colors?: string | string[]): string => {
  if (!colors) return '';
  if (Array.isArray(colors)) return colors.join(', ');
  return colors;
};

export const LineChartConfigDialog: React.FC<LineChartConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar', 'date', 'timestamp'].includes(col.type.toLowerCase())
  );
  const numericalColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );

  // Basic fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description || defaultConfig.description);
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [yField, setYField] = useState(initialMetadata.yField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || '');
  const [facetField, setFacetField] = useState(initialMetadata.facetField || '');

  // Line style
  const [lineType, setLineType] = useState(initialMetadata.lineType || defaultConfig.lineType);
  const [curve, setCurve] = useState(initialMetadata.curve || defaultConfig.curve);
  const [lineWidth, setLineWidth] = useState(initialMetadata.lineWidth ?? defaultConfig.lineWidth);
  const [lineDash, setLineDash] = useState(initialMetadata.lineDash || defaultConfig.lineDash);
  const [lineOpacity, setLineOpacity] = useState(initialMetadata.lineOpacity ?? defaultConfig.lineOpacity);
  const [fillArea, setFillArea] = useState(initialMetadata.fillArea ?? defaultConfig.fillArea);
  const [fillOpacity, setFillOpacity] = useState(initialMetadata.fillOpacity ?? defaultConfig.fillOpacity);
  const [stackSeries, setStackSeries] = useState(initialMetadata.stackSeries ?? defaultConfig.stackSeries);
  const [stackedMode, setStackedMode] = useState(initialMetadata.stackedMode || defaultConfig.stackedMode);

  // Markers
  const [showMarkers, setShowMarkers] = useState(initialMetadata.showMarkers ?? defaultConfig.showMarkers);
  const [markerSymbol, setMarkerSymbol] = useState(initialMetadata.markerSymbol || defaultConfig.markerSymbol);
  const [markerSize, setMarkerSize] = useState(initialMetadata.markerSize ?? defaultConfig.markerSize);
  const [markerColor, setMarkerColor] = useState(initialMetadata.markerColor || defaultConfig.markerColor);
  const [markerBorderColor, setMarkerBorderColor] = useState(initialMetadata.markerBorderColor || defaultConfig.markerBorderColor);
  const [markerBorderWidth, setMarkerBorderWidth] = useState(initialMetadata.markerBorderWidth ?? defaultConfig.markerBorderWidth);
  const [markerOpacity, setMarkerOpacity] = useState(initialMetadata.markerOpacity ?? defaultConfig.markerOpacity);

  // Color
  const [colorSchemeInput, setColorSchemeInput] = useState(stringifyColors(initialMetadata.colorScheme ?? defaultConfig.colorScheme));
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
  const [gradientDirection, setGradientDirection] = useState(initialMetadata.gradientDirection || defaultConfig.gradientDirection);
  const [colorOpacity, setColorOpacity] = useState(initialMetadata.colorOpacity ?? defaultConfig.colorOpacity);

  // Axes – X
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
  const [xAxisPosition, setXAxisPosition] = useState(initialMetadata.xAxis?.position || defaultConfig.xAxis!.position);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
  const [xAxisTitleFontSize, setXAxisTitleFontSize] = useState(initialMetadata.xAxis?.titleFontSize ?? defaultConfig.xAxis!.titleFontSize);
  const [xAxisTitleColor, setXAxisTitleColor] = useState(initialMetadata.xAxis?.titleColor || defaultConfig.xAxis!.titleColor);
  const [xAxisTickRotation, setXAxisTickRotation] = useState(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
  const [xAxisTickCount, setXAxisTickCount] = useState(initialMetadata.xAxis?.tickCount ?? defaultConfig.xAxis!.tickCount);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor || defaultConfig.xAxis!.tickColor);
  const [xAxisTickSize, setXAxisTickSize] = useState(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor || defaultConfig.xAxis!.lineColor);
  const [xAxisLineWidth, setXAxisLineWidth] = useState(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
  const [xAxisScaleType, setXAxisScaleType] = useState(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
  const [xAxisTimeZone, setXAxisTimeZone] = useState(initialMetadata.xAxis?.timeZone || defaultConfig.xAxis!.timeZone);
  const [xAxisMin, setXAxisMin] = useState(initialMetadata.xAxis?.min !== undefined ? String(initialMetadata.xAxis.min) : '');
  const [xAxisMax, setXAxisMax] = useState(initialMetadata.xAxis?.max !== undefined ? String(initialMetadata.xAxis.max) : '');

  // Axes – Y
  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
  const [yAxisPosition, setYAxisPosition] = useState(initialMetadata.yAxis?.position || defaultConfig.yAxis!.position);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title || defaultConfig.yAxis!.title);
  const [yAxisTitleFontSize, setYAxisTitleFontSize] = useState(initialMetadata.yAxis?.titleFontSize ?? defaultConfig.yAxis!.titleFontSize);
  const [yAxisTitleColor, setYAxisTitleColor] = useState(initialMetadata.yAxis?.titleColor || defaultConfig.yAxis!.titleColor);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis!.tickFormat);
  const [yAxisTickCount, setYAxisTickCount] = useState(initialMetadata.yAxis?.tickCount ?? defaultConfig.yAxis!.tickCount);
  const [yAxisTickColor, setYAxisTickColor] = useState(initialMetadata.yAxis?.tickColor || defaultConfig.yAxis!.tickColor);
  const [yAxisTickSize, setYAxisTickSize] = useState(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);
  const [yAxisLineColor, setYAxisLineColor] = useState(initialMetadata.yAxis?.lineColor || defaultConfig.yAxis!.lineColor);
  const [yAxisLineWidth, setYAxisLineWidth] = useState(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
  const [yAxisScaleType, setYAxisScaleType] = useState(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis!.scaleType);
  const [yAxisMin, setYAxisMin] = useState(initialMetadata.yAxis?.min !== undefined ? String(initialMetadata.yAxis.min) : '');
  const [yAxisMax, setYAxisMax] = useState(initialMetadata.yAxis?.max !== undefined ? String(initialMetadata.yAxis.max) : '');
  const [yAxisZeroBaseline, setYAxisZeroBaseline] = useState(initialMetadata.yAxis?.zeroBaseline ?? defaultConfig.yAxis!.zeroBaseline);

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color || defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
  const [gridXLines, setGridXLines] = useState(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
  const [gridYLines, setGridYLines] = useState(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title || '');
  const [legendTitleFontSize, setLegendTitleFontSize] = useState(initialMetadata.legend?.titleFontSize ?? defaultConfig.legend!.titleFontSize);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
  const [legendItemWidth, setLegendItemWidth] = useState(initialMetadata.legend?.itemWidth ?? defaultConfig.legend!.itemWidth);
  const [legendItemHeight, setLegendItemHeight] = useState(initialMetadata.legend?.itemHeight ?? defaultConfig.legend!.itemHeight);
  const [legendSymbolSize, setLegendSymbolSize] = useState(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);
  const [legendColor, setLegendColor] = useState(initialMetadata.legend?.color || defaultConfig.legend!.color);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
  const [tooltipTextColor, setTooltipTextColor] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
  const [tooltipShowValues, setTooltipShowValues] = useState(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
  const [tooltipShowPercentage, setTooltipShowPercentage] = useState(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);
  const [tooltipShowAllSeries, setTooltipShowAllSeries] = useState(initialMetadata.tooltip?.showAllSeries ?? defaultConfig.tooltip!.showAllSeries);
  const [tooltipSortSeries, setTooltipSortSeries] = useState(initialMetadata.tooltip?.sortSeries ?? defaultConfig.tooltip!.sortSeries);

  // Data labels
  const [dataLabelsShow, setDataLabelsShow] = useState(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
  const [dataLabelsPosition, setDataLabelsPosition] = useState(initialMetadata.dataLabels?.position || defaultConfig.dataLabels!.position);
  const [dataLabelsFormat, setDataLabelsFormat] = useState(initialMetadata.dataLabels?.format || defaultConfig.dataLabels!.format);
  const [dataLabelsFontSize, setDataLabelsFontSize] = useState(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
  const [dataLabelsColor, setDataLabelsColor] = useState(initialMetadata.dataLabels?.color || defaultConfig.dataLabels!.color);
  const [dataLabelsBg, setDataLabelsBg] = useState(initialMetadata.dataLabels?.backgroundColor || defaultConfig.dataLabels!.backgroundColor);
  const [dataLabelsOffset, setDataLabelsOffset] = useState(initialMetadata.dataLabels?.offset ?? defaultConfig.dataLabels!.offset);

  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [interactivitySelection, setInteractivitySelection] = useState(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
  const [interactivityHoverHighlight, setInteractivityHoverHighlight] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
  const [interactivityClickAction, setInteractivityClickAction] = useState(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction);
  const [interactivityFocusNode, setInteractivityFocusNode] = useState(initialMetadata.interactivity?.focusNode ?? defaultConfig.interactivity!.focusNode);
  const [interactivitySeriesFocusMode, setInteractivitySeriesFocusMode] = useState(initialMetadata.interactivity?.seriesFocusMode || defaultConfig.interactivity!.seriesFocusMode);

  // Annotations (simplified – just a text area for now)
  const [annotationsJson, setAnnotationsJson] = useState(
    JSON.stringify(initialMetadata.annotations || defaultConfig.annotations, null, 2)
  );

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || defaultConfig.animation!.easing);
  const [animationStagger, setAnimationStagger] = useState(initialMetadata.animation?.stagger ?? defaultConfig.animation!.stagger);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [responsiveMinWidth, setResponsiveMinWidth] = useState(initialMetadata.responsive?.minWidth ?? defaultConfig.responsive!.minWidth);
  const [responsiveMinHeight, setResponsiveMinHeight] = useState(initialMetadata.responsive?.minHeight ?? defaultConfig.responsive!.minHeight);
  const [responsiveAspectRatio, setResponsiveAspectRatio] = useState(initialMetadata.responsive?.aspectRatio !== undefined ? String(initialMetadata.responsive.aspectRatio) : '');
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(
    initialMetadata.exportFormats || defaultConfig.exportFormats!
  );

  // Accessibility
  const [accessibilityAriaLabel, setAccessibilityAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || '');
  const [accessibilityAriaDescription, setAccessibilityAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription || '');
  const [accessibilityHighContrast, setAccessibilityHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? false);
  const [accessibilityFocusable, setAccessibilityFocusable] = useState(initialMetadata.accessibility?.focusable ?? true);

  // Performance
  const [performanceDownsampling, setPerformanceDownsampling] = useState(initialMetadata.performance?.downsampling ?? false);
  const [performanceMaxPoints, setPerformanceMaxPoints] = useState(initialMetadata.performance?.maxPoints ?? 1000);
  const [performanceProgressive, setPerformanceProgressive] = useState(initialMetadata.performance?.progressive ?? false);
  const [performanceVirtualization, setPerformanceVirtualization] = useState(initialMetadata.performance?.virtualization ?? false);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    mapping: true,
    lineStyle: false,
    markers: false,
    colors: false,
    axes: false,
    grid: false,
    legend: false,
    tooltip: false,
    dataLabels: false,
    interactivity: false,
    annotations: false,
    animation: false,
    dimensions: true,
    responsive: false,
    export: false,
    accessibility: false,
    performance: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setDescription(initialMetadata.description || defaultConfig.description);
    setXField(initialMetadata.xField || '');
    setYField(initialMetadata.yField || '');
    setColorField(initialMetadata.colorField || '');
    setSizeField(initialMetadata.sizeField || '');
    setFacetField(initialMetadata.facetField || '');

    setLineType(initialMetadata.lineType || defaultConfig.lineType);
    setCurve(initialMetadata.curve || defaultConfig.curve);
    setLineWidth(initialMetadata.lineWidth ?? defaultConfig.lineWidth);
    setLineDash(initialMetadata.lineDash || defaultConfig.lineDash);
    setLineOpacity(initialMetadata.lineOpacity ?? defaultConfig.lineOpacity);
    setFillArea(initialMetadata.fillArea ?? defaultConfig.fillArea);
    setFillOpacity(initialMetadata.fillOpacity ?? defaultConfig.fillOpacity);
    setStackSeries(initialMetadata.stackSeries ?? defaultConfig.stackSeries);
    setStackedMode(initialMetadata.stackedMode || defaultConfig.stackedMode);

    setShowMarkers(initialMetadata.showMarkers ?? defaultConfig.showMarkers);
    setMarkerSymbol(initialMetadata.markerSymbol || defaultConfig.markerSymbol);
    setMarkerSize(initialMetadata.markerSize ?? defaultConfig.markerSize);
    setMarkerColor(initialMetadata.markerColor || defaultConfig.markerColor);
    setMarkerBorderColor(initialMetadata.markerBorderColor || defaultConfig.markerBorderColor);
    setMarkerBorderWidth(initialMetadata.markerBorderWidth ?? defaultConfig.markerBorderWidth);
    setMarkerOpacity(initialMetadata.markerOpacity ?? defaultConfig.markerOpacity);

    setColorSchemeInput(stringifyColors(initialMetadata.colorScheme ?? defaultConfig.colorScheme));
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
    setGradientDirection(initialMetadata.gradientDirection || defaultConfig.gradientDirection);
    setColorOpacity(initialMetadata.colorOpacity ?? defaultConfig.colorOpacity);

    setXAxisVisible(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
    setXAxisPosition(initialMetadata.xAxis?.position || defaultConfig.xAxis!.position);
    setXAxisTitle(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
    setXAxisTitleFontSize(initialMetadata.xAxis?.titleFontSize ?? defaultConfig.xAxis!.titleFontSize);
    setXAxisTitleColor(initialMetadata.xAxis?.titleColor || defaultConfig.xAxis!.titleColor);
    setXAxisTickRotation(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
    setXAxisTickCount(initialMetadata.xAxis?.tickCount ?? defaultConfig.xAxis!.tickCount);
    setXAxisTickColor(initialMetadata.xAxis?.tickColor || defaultConfig.xAxis!.tickColor);
    setXAxisTickSize(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
    setXAxisLineColor(initialMetadata.xAxis?.lineColor || defaultConfig.xAxis!.lineColor);
    setXAxisLineWidth(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
    setXAxisScaleType(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
    setXAxisTimeZone(initialMetadata.xAxis?.timeZone || defaultConfig.xAxis!.timeZone);
    setXAxisMin(initialMetadata.xAxis?.min !== undefined ? String(initialMetadata.xAxis.min) : '');
    setXAxisMax(initialMetadata.xAxis?.max !== undefined ? String(initialMetadata.xAxis.max) : '');

    setYAxisVisible(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
    setYAxisPosition(initialMetadata.yAxis?.position || defaultConfig.yAxis!.position);
    setYAxisTitle(initialMetadata.yAxis?.title || defaultConfig.yAxis!.title);
    setYAxisTitleFontSize(initialMetadata.yAxis?.titleFontSize ?? defaultConfig.yAxis!.titleFontSize);
    setYAxisTitleColor(initialMetadata.yAxis?.titleColor || defaultConfig.yAxis!.titleColor);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis!.tickFormat);
    setYAxisTickCount(initialMetadata.yAxis?.tickCount ?? defaultConfig.yAxis!.tickCount);
    setYAxisTickColor(initialMetadata.yAxis?.tickColor || defaultConfig.yAxis!.tickColor);
    setYAxisTickSize(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);
    setYAxisLineColor(initialMetadata.yAxis?.lineColor || defaultConfig.yAxis!.lineColor);
    setYAxisLineWidth(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
    setYAxisScaleType(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis!.scaleType);
    setYAxisMin(initialMetadata.yAxis?.min !== undefined ? String(initialMetadata.yAxis.min) : '');
    setYAxisMax(initialMetadata.yAxis?.max !== undefined ? String(initialMetadata.yAxis.max) : '');
    setYAxisZeroBaseline(initialMetadata.yAxis?.zeroBaseline ?? defaultConfig.yAxis!.zeroBaseline);

    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setGridColor(initialMetadata.grid?.color || defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
    setGridXLines(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
    setGridYLines(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position || defaultConfig.legend!.position);
    setLegendOrient(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
    setLegendTitle(initialMetadata.legend?.title || '');
    setLegendTitleFontSize(initialMetadata.legend?.titleFontSize ?? defaultConfig.legend!.titleFontSize);
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
    setLegendItemWidth(initialMetadata.legend?.itemWidth ?? defaultConfig.legend!.itemWidth);
    setLegendItemHeight(initialMetadata.legend?.itemHeight ?? defaultConfig.legend!.itemHeight);
    setLegendSymbolSize(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
    setLegendFontSize(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);
    setLegendColor(initialMetadata.legend?.color || defaultConfig.legend!.color);

    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
    setTooltipFormat(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
    setTooltipTextColor(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);
    setTooltipFontSize(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
    setTooltipShowValues(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
    setTooltipShowPercentage(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);
    setTooltipShowAllSeries(initialMetadata.tooltip?.showAllSeries ?? defaultConfig.tooltip!.showAllSeries);
    setTooltipSortSeries(initialMetadata.tooltip?.sortSeries ?? defaultConfig.tooltip!.sortSeries);

    setDataLabelsShow(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
    setDataLabelsPosition(initialMetadata.dataLabels?.position || defaultConfig.dataLabels!.position);
    setDataLabelsFormat(initialMetadata.dataLabels?.format || defaultConfig.dataLabels!.format);
    setDataLabelsFontSize(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
    setDataLabelsColor(initialMetadata.dataLabels?.color || defaultConfig.dataLabels!.color);
    setDataLabelsBg(initialMetadata.dataLabels?.backgroundColor || defaultConfig.dataLabels!.backgroundColor);
    setDataLabelsOffset(initialMetadata.dataLabels?.offset ?? defaultConfig.dataLabels!.offset);

    setInteractivityZoom(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
    setInteractivityPan(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
    setInteractivitySelection(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
    setInteractivityBrush(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
    setInteractivityHoverHighlight(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
    setInteractivityClickAction(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction);
    setInteractivityFocusNode(initialMetadata.interactivity?.focusNode ?? defaultConfig.interactivity!.focusNode);
    setInteractivitySeriesFocusMode(initialMetadata.interactivity?.seriesFocusMode || defaultConfig.interactivity!.seriesFocusMode);

    setAnnotationsJson(JSON.stringify(initialMetadata.annotations || defaultConfig.annotations, null, 2));

    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing || defaultConfig.animation!.easing);
    setAnimationStagger(initialMetadata.animation?.stagger ?? defaultConfig.animation!.stagger);

    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
    setResponsiveMinWidth(initialMetadata.responsive?.minWidth ?? defaultConfig.responsive!.minWidth);
    setResponsiveMinHeight(initialMetadata.responsive?.minHeight ?? defaultConfig.responsive!.minHeight);
    setResponsiveAspectRatio(initialMetadata.responsive?.aspectRatio !== undefined ? String(initialMetadata.responsive.aspectRatio) : '');
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable);
    setExportFormats(initialMetadata.exportFormats || defaultConfig.exportFormats!);

    setAccessibilityAriaLabel(initialMetadata.accessibility?.ariaLabel || '');
    setAccessibilityAriaDescription(initialMetadata.accessibility?.ariaDescription || '');
    setAccessibilityHighContrast(initialMetadata.accessibility?.highContrast ?? false);
    setAccessibilityFocusable(initialMetadata.accessibility?.focusable ?? true);

    setPerformanceDownsampling(initialMetadata.performance?.downsampling ?? false);
    setPerformanceMaxPoints(initialMetadata.performance?.maxPoints ?? 1000);
    setPerformanceProgressive(initialMetadata.performance?.progressive ?? false);
    setPerformanceVirtualization(initialMetadata.performance?.virtualization ?? false);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField || !yField) {
      alert('Please select both X and Y fields.');
      return;
    }

    // Parse color scheme
    let colorScheme: string | string[] | undefined = colorSchemeInput;
    if (colorSchemeInput.includes(',')) {
      colorScheme = colorSchemeInput.split(',').map(s => s.trim());
    }

    // Parse annotations JSON
    let annotations = defaultConfig.annotations;
    try {
      annotations = JSON.parse(annotationsJson);
    } catch (e) {
      console.warn('Invalid annotations JSON, using empty array.');
    }

    const config: LineChartConfig = {
      title,
      description,
      xField,
      yField,
      colorField: colorField || undefined,
      sizeField: sizeField || undefined,
      facetField: facetField || undefined,
      lineType,
      curve,
      lineWidth,
      lineDash: lineDash || undefined,
      lineOpacity,
      fillArea,
      fillOpacity,
      stackSeries,
      stackedMode: stackSeries ? stackedMode : undefined,
      showMarkers,
      markerSymbol,
      markerSize,
      markerColor: markerColor || undefined,
      markerBorderColor: markerBorderColor || undefined,
      markerBorderWidth,
      markerOpacity,
      colorScheme,
      colorGradient,
      gradientDirection,
      colorOpacity,
      xAxis: {
        visible: xAxisVisible,
        position: xAxisPosition,
        title: xAxisTitle || undefined,
        titleFontSize: xAxisTitleFontSize,
        titleColor: xAxisTitleColor,
        tickLabelRotation: xAxisTickRotation,
        tickFormat: xAxisTickFormat || undefined,
        tickCount: xAxisTickCount,
        tickColor: xAxisTickColor,
        tickSize: xAxisTickSize,
        lineColor: xAxisLineColor,
        lineWidth: xAxisLineWidth,
        scaleType: xAxisScaleType,
        timeZone: xAxisTimeZone || undefined,
        min: xAxisMin ? (isNaN(Number(xAxisMin)) ? xAxisMin : Number(xAxisMin)) : undefined,
        max: xAxisMax ? (isNaN(Number(xAxisMax)) ? xAxisMax : Number(xAxisMax)) : undefined,
      },
      yAxis: {
        visible: yAxisVisible,
        position: yAxisPosition,
        title: yAxisTitle || undefined,
        titleFontSize: yAxisTitleFontSize,
        titleColor: yAxisTitleColor,
        tickFormat: yAxisTickFormat || undefined,
        tickCount: yAxisTickCount,
        tickColor: yAxisTickColor,
        tickSize: yAxisTickSize,
        lineColor: yAxisLineColor,
        lineWidth: yAxisLineWidth,
        scaleType: yAxisScaleType,
        min: yAxisMin ? Number(yAxisMin) : undefined,
        max: yAxisMax ? Number(yAxisMax) : undefined,
        zeroBaseline: yAxisZeroBaseline,
      },
      showGrid,
      grid: {
        color: gridColor,
        width: gridWidth,
        dash: gridDash || undefined,
        xLines: gridXLines,
        yLines: gridYLines,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        title: legendTitle || undefined,
        titleFontSize: legendTitleFontSize,
        itemGap: legendItemGap,
        itemWidth: legendItemWidth,
        itemHeight: legendItemHeight,
        symbolSize: legendSymbolSize,
        fontSize: legendFontSize,
        color: legendColor,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        format: tooltipFormat || undefined,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipTextColor,
        fontSize: tooltipFontSize,
        showValues: tooltipShowValues,
        showPercentage: tooltipShowPercentage,
        showAllSeries: tooltipShowAllSeries,
        sortSeries: tooltipSortSeries,
      },
      dataLabels: {
        show: dataLabelsShow,
        position: dataLabelsPosition,
        format: dataLabelsFormat || undefined,
        fontSize: dataLabelsFontSize,
        color: dataLabelsColor,
        backgroundColor: dataLabelsBg,
        offset: dataLabelsOffset,
      },
      interactivity: {
        zoom: interactivityZoom,
        pan: interactivityPan,
        selection: interactivitySelection,
        brush: interactivityBrush,
        hoverHighlight: interactivityHoverHighlight,
        clickAction: interactivityClickAction,
        focusNode: interactivityFocusNode,
        seriesFocusMode: interactivitySeriesFocusMode,
      },
      annotations,
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
        stagger: animationStagger,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth: responsiveMinWidth,
        minHeight: responsiveMinHeight,
        aspectRatio: responsiveAspectRatio ? parseFloat(responsiveAspectRatio) : undefined,
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel: accessibilityAriaLabel || undefined,
        ariaDescription: accessibilityAriaDescription || undefined,
        highContrast: accessibilityHighContrast,
        focusable: accessibilityFocusable,
      },
      performance: {
        downsampling: performanceDownsampling,
        maxPoints: performanceMaxPoints,
        progressive: performanceProgressive,
        virtualization: performanceVirtualization,
      },
    };

    onSave(config);
    onClose();
  };

  if (!open) return null;

  const SectionHeader = ({ title, icon, sectionKey }: { title: string; icon: React.ReactNode; sectionKey: keyof typeof sections }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-2 text-gray-200">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      {sections[sectionKey] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );

  const symbolOptions = [
    { value: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
    { value: 'square', label: 'Square', icon: <Square className="h-4 w-4" /> },
    { value: 'diamond', label: 'Diamond', icon: <Diamond className="h-4 w-4" /> },
    { value: 'cross', label: 'Cross', icon: <XIcon className="h-4 w-4" /> },
    { value: 'x', label: 'X', icon: <XIcon className="h-4 w-4" /> },
    { value: 'triangle', label: 'Triangle', icon: <Activity className="h-4 w-4" /> },
    { value: 'star', label: 'Star', icon: <Target className="h-4 w-4" /> },
    { value: 'none', label: 'None', icon: <Minus className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[1000px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Line Chart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Section */}
          <SectionHeader title="Basic Information" icon={<Layout className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Line Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>
            </div>
          )}

          {/* Data Mapping */}
          <SectionHeader title="Data Mapping" icon={<Map className="h-4 w-4" />} sectionKey="mapping" />
          {sections.mapping && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">X‑Axis Field <span className="text-red-400">*</span></label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="" disabled>Select a field</option>
                  {availableColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Y‑Axis Field <span className="text-red-400">*</span></label>
                <select
                  value={yField}
                  onChange={(e) => setYField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="" disabled>Select a numeric field</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color / Series Field (optional)</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None (single series)</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Size Field (optional)</label>
                <select
                  value={sizeField}
                  onChange={(e) => setSizeField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Facet / Small Multiples Field (optional)</label>
                <select
                  value={facetField}
                  onChange={(e) => setFacetField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Line Style */}
          <SectionHeader title="Line Style" icon={<Activity className="h-4 w-4" />} sectionKey="lineStyle" />
          {sections.lineStyle && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Line Type</label>
                  <select
                    value={lineType}
                    onChange={(e) => setLineType(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="linear">Linear</option>
                    <option value="smooth">Smooth</option>
                    <option value="step">Step</option>
                    <option value="step-start">Step‑start</option>
                    <option value="step-end">Step‑end</option>
                  </select>
                </div>
                {lineType === 'smooth' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Curve Type</label>
                    <select
                      value={curve}
                      onChange={(e) => setCurve(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="linear">Linear</option>
                      <option value="cardinal">Cardinal</option>
                      <option value="monotone">Monotone</option>
                      <option value="catmullRom">Catmull‑Rom</option>
                      <option value="natural">Natural</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Line Width (px)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Line Dash (e.g., 5,5)</label>
                  <input
                    type="text"
                    value={lineDash}
                    onChange={(e) => setLineDash(e.target.value)}
                    placeholder="solid"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Line Opacity (0-1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={lineOpacity}
                    onChange={(e) => setLineOpacity(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={fillArea}
                    onChange={(e) => setFillArea(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Fill area under line</span>
                </label>
                {fillArea && (
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Fill Opacity</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={fillOpacity}
                        onChange={(e) => setFillOpacity(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Stack series?</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={stackSeries}
                          onChange={(e) => setStackSeries(e.target.checked)}
                          className="rounded border-gray-600 text-blue-500"
                        />
                        <span className="text-xs text-gray-400">Enable stacking</span>
                      </div>
                    </div>
                    {stackSeries && (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Stacked mode</label>
                        <select
                          value={stackedMode}
                          onChange={(e) => setStackedMode(e.target.value as any)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        >
                          <option value="normal">Normal (sum)</option>
                          <option value="percent">Percentage (100%)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Markers */}
          <SectionHeader title="Markers (Points)" icon={<Circle className="h-4 w-4" />} sectionKey="markers" />
          {sections.markers && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show data points</span>
              </label>
              {showMarkers && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                    <select
                      value={markerSymbol}
                      onChange={(e) => setMarkerSymbol(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      {symbolOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Size (px)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={markerSize}
                      onChange={(e) => setMarkerSize(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color (fill)</label>
                    <input
                      type="color"
                      value={markerColor || '#000000'}
                      onChange={(e) => setMarkerColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                    <input
                      type="color"
                      value={markerBorderColor || '#000000'}
                      onChange={(e) => setMarkerBorderColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Border Width</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={markerBorderWidth}
                      onChange={(e) => setMarkerBorderWidth(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={markerOpacity}
                      onChange={(e) => setMarkerOpacity(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Colors */}
          <SectionHeader title="Colors" icon={<Palette className="h-4 w-4" />} sectionKey="colors" />
          {sections.colors && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Color Scheme <span className="text-xs text-gray-500">(single color or comma‑separated list)</span>
                </label>
                <input
                  type="text"
                  value={colorSchemeInput}
                  onChange={(e) => setColorSchemeInput(e.target.value)}
                  placeholder="#3b82f6, #ef4444, #10b981"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={colorGradient}
                  onChange={(e) => setColorGradient(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Use gradient fill (area only)</span>
              </label>
              {colorGradient && (
                <div className="ml-6">
                  <label className="block text-xs text-gray-400 mb-1">Gradient Direction</label>
                  <select
                    value={gradientDirection}
                    onChange={(e) => setGradientDirection(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Global Opacity (0-1)</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={colorOpacity}
                  onChange={(e) => setColorOpacity(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Axes */}
          <SectionHeader title="Axes" icon={<Grid className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* X‑Axis */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={xAxisVisible}
                    onChange={(e) => setXAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Show X‑Axis</span>
                </label>
                {xAxisVisible && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={xAxisPosition}
                        onChange={(e) => setXAxisPosition(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={xAxisTitle}
                        onChange={(e) => setXAxisTitle(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={xAxisTitleFontSize}
                        onChange={(e) => setXAxisTitleFontSize(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title Color</label>
                      <input
                        type="color"
                        value={xAxisTitleColor}
                        onChange={(e) => setXAxisTitleColor(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Rotation (°)</label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        value={xAxisTickRotation}
                        onChange={(e) => setXAxisTickRotation(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                      <input
                        type="text"
                        value={xAxisTickFormat}
                        onChange={(e) => setXAxisTickFormat(e.target.value)}
                        placeholder="e.g., .2f, %Y-%m"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Count</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={xAxisTickCount}
                        onChange={(e) => setXAxisTickCount(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                      <select
                        value={xAxisScaleType}
                        onChange={(e) => setXAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="linear">Linear</option>
                        <option value="log">Logarithmic</option>
                        <option value="time">Time</option>
                        <option value="band">Band (categorical)</option>
                        <option value="point">Point</option>
                      </select>
                    </div>
                    {xAxisScaleType === 'time' && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Time Zone</label>
                        <input
                          type="text"
                          value={xAxisTimeZone}
                          onChange={(e) => setXAxisTimeZone(e.target.value)}
                          placeholder="UTC, America/New_York"
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                      <input
                        type="text"
                        value={xAxisMin}
                        onChange={(e) => setXAxisMin(e.target.value)}
                        placeholder="auto"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                      <input
                        type="text"
                        value={xAxisMax}
                        onChange={(e) => setXAxisMax(e.target.value)}
                        placeholder="auto"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Y‑Axis */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={yAxisVisible}
                    onChange={(e) => setYAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Show Y‑Axis</span>
                </label>
                {yAxisVisible && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={yAxisPosition}
                        onChange={(e) => setYAxisPosition(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={yAxisTitle}
                        onChange={(e) => setYAxisTitle(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={yAxisTitleFontSize}
                        onChange={(e) => setYAxisTitleFontSize(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title Color</label>
                      <input
                        type="color"
                        value={yAxisTitleColor}
                        onChange={(e) => setYAxisTitleColor(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                      <input
                        type="text"
                        value={yAxisTickFormat}
                        onChange={(e) => setYAxisTickFormat(e.target.value)}
                        placeholder="e.g., .2f"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Count</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={yAxisTickCount}
                        onChange={(e) => setYAxisTickCount(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                      <select
                        value={yAxisScaleType}
                        onChange={(e) => setYAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="linear">Linear</option>
                        <option value="log">Logarithmic</option>
                        <option value="time">Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                      <input
                        type="number"
                        value={yAxisMin}
                        onChange={(e) => setYAxisMin(e.target.value)}
                        placeholder="auto"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                      <input
                        type="number"
                        value={yAxisMax}
                        onChange={(e) => setYAxisMax(e.target.value)}
                        placeholder="auto"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={yAxisZeroBaseline}
                          onChange={(e) => setYAxisZeroBaseline(e.target.checked)}
                          className="rounded border-gray-600 text-blue-500"
                        />
                        <span className="text-xs text-gray-400">Force zero baseline</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid */}
          <SectionHeader title="Grid" icon={<Grid className="h-4 w-4" />} sectionKey="grid" />
          {sections.grid && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show Grid</span>
              </label>
              {showGrid && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={gridColor}
                      onChange={(e) => setGridColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={gridWidth}
                      onChange={(e) => setGridWidth(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                    <input
                      type="text"
                      value={gridDash}
                      onChange={(e) => setGridDash(e.target.value)}
                      placeholder="solid"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="col-span-2 flex space-x-4">
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={gridXLines}
                        onChange={(e) => setGridXLines(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Vertical lines</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={gridYLines}
                        onChange={(e) => setGridYLines(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Horizontal lines</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <SectionHeader title="Legend" icon={<Layers className="h-4 w-4" />} sectionKey="legend" />
          {sections.legend && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show Legend</span>
              </label>
              {showLegend && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={legendPosition}
                      onChange={(e) => setLegendPosition(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top-left">Top‑left</option>
                      <option value="top-right">Top‑right</option>
                      <option value="bottom-left">Bottom‑left</option>
                      <option value="bottom-right">Bottom‑right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Orientation</label>
                    <select
                      value={legendOrient}
                      onChange={(e) => setLegendOrient(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={legendTitle}
                      onChange={(e) => setLegendTitle(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Item Gap (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={legendItemGap}
                      onChange={(e) => setLegendItemGap(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Symbol Size (px)</label>
                    <input
                      type="number"
                      min="4"
                      max="20"
                      value={legendSymbolSize}
                      onChange={(e) => setLegendSymbolSize(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={legendFontSize}
                      onChange={(e) => setLegendFontSize(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={legendColor}
                      onChange={(e) => setLegendColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tooltip */}
          <SectionHeader title="Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tooltipShow}
                  onChange={(e) => setTooltipShow(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show Tooltip</span>
              </label>
              {tooltipShow && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                    <select
                      value={tooltipTrigger}
                      onChange={(e) => setTooltipTrigger(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="item">Item (single point)</option>
                      <option value="axis">Axis (all series at same x)</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background</label>
                    <input
                      type="color"
                      value={tooltipBg}
                      onChange={(e) => setTooltipBg(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Border</label>
                    <input
                      type="color"
                      value={tooltipBorder}
                      onChange={(e) => setTooltipBorder(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={tooltipTextColor}
                      onChange={(e) => setTooltipTextColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={tooltipFontSize}
                      onChange={(e) => setTooltipFontSize(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format template</label>
                    <input
                      type="text"
                      value={tooltipFormat}
                      onChange={(e) => setTooltipFormat(e.target.value)}
                      placeholder="{{x}}: {{y}}"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowValues}
                        onChange={(e) => setTooltipShowValues(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Show values</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowPercentage}
                        onChange={(e) => setTooltipShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Show percentages (stacked mode)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowAllSeries}
                        onChange={(e) => setTooltipShowAllSeries(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Show all series at same x</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipSortSeries}
                        onChange={(e) => setTooltipSortSeries(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Sort series by value</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Labels */}
          <SectionHeader title="Data Labels" icon={<Sigma className="h-4 w-4" />} sectionKey="dataLabels" />
          {sections.dataLabels && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dataLabelsShow}
                  onChange={(e) => setDataLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show Data Labels</span>
              </label>
              {dataLabelsShow && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={dataLabelsPosition}
                      onChange={(e) => setDataLabelsPosition(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="top">Top</option>
                      <option value="inside">Inside</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={dataLabelsFormat}
                      onChange={(e) => setDataLabelsFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={dataLabelsFontSize}
                      onChange={(e) => setDataLabelsFontSize(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={dataLabelsColor}
                      onChange={(e) => setDataLabelsColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background</label>
                    <input
                      type="color"
                      value={dataLabelsBg}
                      onChange={(e) => setDataLabelsBg(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Offset (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={dataLabelsOffset}
                      onChange={(e) => setDataLabelsOffset(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity */}
          <SectionHeader title="Interactivity" icon={<MousePointer className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityZoom}
                    onChange={(e) => setInteractivityZoom(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-xs text-gray-400">Allow Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityPan}
                    onChange={(e) => setInteractivityPan(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-xs text-gray-400">Allow Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityBrush}
                    onChange={(e) => setInteractivityBrush(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-xs text-gray-400">Enable Brush</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityHoverHighlight}
                    onChange={(e) => setInteractivityHoverHighlight(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-xs text-gray-400">Highlight on Hover</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityFocusNode}
                    onChange={(e) => setInteractivityFocusNode(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-xs text-gray-400">Focus Series on Hover</span>
                </label>
              </div>
              {interactivityFocusNode && (
                <div className="ml-4">
                  <label className="block text-xs text-gray-400 mb-1">Focus Mode</label>
                  <select
                    value={interactivitySeriesFocusMode}
                    onChange={(e) => setInteractivitySeriesFocusMode(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="highlight">Highlight focused series</option>
                    <option value="dim">Dim others</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Selection Mode</label>
                <select
                  value={interactivitySelection}
                  onChange={(e) => setInteractivitySelection(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="none">None</option>
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Click Action</label>
                <select
                  value={interactivityClickAction}
                  onChange={(e) => setInteractivityClickAction(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="none">None</option>
                  <option value="select">Select point</option>
                  <option value="drilldown">Drill down</option>
                  <option value="custom">Custom (requires handler)</option>
                </select>
              </div>
            </div>
          )}

          {/* Annotations (simplified) */}
          <SectionHeader title="Annotations (JSON)" icon={<Target className="h-4 w-4" />} sectionKey="annotations" />
          {sections.annotations && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              <textarea
                value={annotationsJson}
                onChange={(e) => setAnnotationsJson(e.target.value)}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white font-mono text-sm"
                placeholder="Enter annotation definitions as JSON array"
              />
              <p className="text-xs text-gray-500">
                Each annotation: &#123;"type":"line","x":"2023-01-01","color":"red"&#125;
              </p>
            </div>
          )}

          {/* Animation */}
          <SectionHeader title="Animation" icon={<Play className="h-4 w-4" />} sectionKey="animation" />
          {sections.animation && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Enable Animation</span>
              </label>
              {animationEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duration (ms)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={animationDuration}
                      onChange={(e) => setAnimationDuration(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Easing</label>
                    <select
                      value={animationEasing}
                      onChange={(e) => setAnimationEasing(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="linear">Linear</option>
                      <option value="ease">Ease</option>
                      <option value="ease-in">Ease‑in</option>
                      <option value="ease-out">Ease‑out</option>
                      <option value="ease-in-out">Ease‑in‑out</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={animationStagger}
                        onChange={(e) => setAnimationStagger(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-400">Stagger series animation</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dimensions */}
          <SectionHeader title="Dimensions" icon={<Grid className="h-4 w-4" />} sectionKey="dimensions" />
          {sections.dimensions && (
            <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                <input
                  type="number"
                  min="200"
                  max="2000"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                <input
                  type="number"
                  min="200"
                  max="2000"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Responsive */}
          <SectionHeader title="Responsive" icon={<ZoomIn className="h-4 w-4" />} sectionKey="responsive" />
          {sections.responsive && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Enable Responsive Resizing</span>
              </label>
              {responsiveEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min Width (px)</label>
                    <input
                      type="number"
                      min="100"
                      value={responsiveMinWidth}
                      onChange={(e) => setResponsiveMinWidth(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min Height (px)</label>
                    <input
                      type="number"
                      min="100"
                      value={responsiveMinHeight}
                      onChange={(e) => setResponsiveMinHeight(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Aspect Ratio (w/h)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={responsiveAspectRatio}
                      onChange={(e) => setResponsiveAspectRatio(e.target.value)}
                      placeholder="auto"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export */}
          <SectionHeader title="Export" icon={<Download className="h-4 w-4" />} sectionKey="export" />
          {sections.export && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportable}
                  onChange={(e) => setExportable(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Allow Export</span>
              </label>
              {exportable && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400 mb-1">Formats</label>
                  <div className="flex space-x-4">
                    {(['png', 'svg', 'pdf'] as const).map(f => (
                      <label key={f} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={exportFormats.includes(f)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExportFormats([...exportFormats, f]);
                            } else {
                              setExportFormats(exportFormats.filter(v => v !== f));
                            }
                          }}
                          className="rounded border-gray-600 text-blue-500"
                        />
                        <span className="text-xs text-gray-400 uppercase">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accessibility */}
          <SectionHeader title="Accessibility" icon={<Accessibility className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA Label</label>
                <input
                  type="text"
                  value={accessibilityAriaLabel}
                  onChange={(e) => setAccessibilityAriaLabel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Descriptive label for screen readers"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA Description</label>
                <input
                  type="text"
                  value={accessibilityAriaDescription}
                  onChange={(e) => setAccessibilityAriaDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="More detailed description"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={accessibilityHighContrast}
                  onChange={(e) => setAccessibilityHighContrast(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">High Contrast Mode</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={accessibilityFocusable}
                  onChange={(e) => setAccessibilityFocusable(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Focusable (keyboard navigation)</span>
              </label>
            </div>
          )}

          {/* Performance */}
          <SectionHeader title="Performance" icon={<Zap className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={performanceDownsampling}
                  onChange={(e) => setPerformanceDownsampling(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Downsampling (for large data)</span>
              </label>
              {performanceDownsampling && (
                <div className="ml-4">
                  <label className="block text-xs text-gray-400 mb-1">Max Points</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={performanceMaxPoints}
                    onChange={(e) => setPerformanceMaxPoints(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={performanceProgressive}
                  onChange={(e) => setPerformanceProgressive(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Progressive Rendering</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={performanceVirtualization}
                  onChange={(e) => setPerformanceVirtualization(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Virtualization (only render visible)</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};