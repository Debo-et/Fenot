import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  Grid,
  ChevronDown,
  ChevronRight,
  Palette,
  Sliders,
  Eye,
  Play,
  Wrench,
  BarChart,
  Type,
  Activity,
  Layers,
  Target,
  Zap,
} from 'lucide-react';
import { BarChartConfig, BarOrientation, BarGroupMode, ScaleType, AxisPosition, LegendPosition, TooltipTrigger, SelectionMode } from '../../types/visualization-configs';

interface BarChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<BarChartConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: BarChartConfig) => void;
}

const defaultConfig = {
  title: '',
  description: '',
  xField: '',
  yField: '',
  colorField: undefined,
  sizeField: undefined,
  facetField: undefined,
  orientation: 'vertical',
  groupMode: 'group',
  barWidth: undefined,
  barGap: 2,
  categoryGap: 10,
  borderRadius: 0,
  colorScheme: '#3b82f6',
  colorGradient: false,
  gradientDirection: 'vertical',
  opacity: 0.8,
  borderColor: '#1e3a8a',
  borderWidth: 1,
  borderType: 'solid',
  xAxis: {
    visible: true,
    position: 'bottom',
    title: '',
    titleFontSize: 12,
    titleColor: '#cccccc',
    tickLabelRotation: 0,
    tickFormat: '',
    tickCount: undefined,
    tickColor: '#999999',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
    scaleType: 'categorical',
  },
  yAxis: {
    visible: true,
    position: 'left',
    title: '',
    titleFontSize: 12,
    titleColor: '#cccccc',
    tickFormat: '',
    tickCount: undefined,
    tickColor: '#999999',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
    scaleType: 'linear',
    min: undefined,
    max: undefined,
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
    title: '',
    titleFontSize: 12,
    itemGap: 10,
    itemWidth: 25,
    itemHeight: 14,
    symbolSize: 8,
    fontSize: 12,
    color: '#ffffff',
  },
  tooltip: {
    show: true,
    trigger: 'item',
    format: '',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showValues: true,
    showPercentage: false,
  },
  dataLabels: {
    show: false,
    position: 'top',
    format: '',
    fontSize: 11,
    color: '#000000',
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
    customClickHandler: undefined,
  },
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
  },
  dimensions: {
    width: 500,
    height: 400,
  },
  responsive: {
    enabled: false,
    minWidth: undefined,
    minHeight: undefined,
    aspectRatio: undefined,
  },
  exportable: true,
  exportFormats: ['png', 'svg'],
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
} as const satisfies BarChartConfig;
export const BarChartConfigDialog: React.FC<BarChartConfigDialogProps> = ({
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
  const [title, setTitle] = useState(initialMetadata.title ?? defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description ?? defaultConfig.description);
  const [xField, setXField] = useState(initialMetadata.xField ?? '');
  const [yField, setYField] = useState(initialMetadata.yField ?? '');
  const [colorField, setColorField] = useState(initialMetadata.colorField ?? '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField ?? '');
  const [facetField, setFacetField] = useState(initialMetadata.facetField ?? '');
  const [orientation, setOrientation] = useState<BarOrientation>(initialMetadata.orientation ?? defaultConfig.orientation);
  const [groupMode, setGroupMode] = useState<BarGroupMode>(initialMetadata.groupMode ?? defaultConfig.groupMode);
  const [barWidth, setBarWidth] = useState<number | undefined>(initialMetadata.barWidth);
  const [barGap, setBarGap] = useState(initialMetadata.barGap ?? defaultConfig.barGap!);
  const [categoryGap, setCategoryGap] = useState(initialMetadata.categoryGap ?? defaultConfig.categoryGap!);
  const [borderRadius, setBorderRadius] = useState(initialMetadata.borderRadius ?? defaultConfig.borderRadius!);

  // Color
  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScheme ?? defaultConfig.colorScheme);
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient!);
  const [gradientDirection, setGradientDirection] = useState(initialMetadata.gradientDirection ?? defaultConfig.gradientDirection!);
  const [opacity, setOpacity] = useState(initialMetadata.opacity ?? defaultConfig.opacity!);
  const [borderColor, setBorderColor] = useState(initialMetadata.borderColor ?? defaultConfig.borderColor!);
  const [borderWidth, setBorderWidth] = useState(initialMetadata.borderWidth ?? defaultConfig.borderWidth!);
  const [borderType, setBorderType] = useState(initialMetadata.borderType ?? defaultConfig.borderType!);

  // Axes
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
  const [xAxisPosition, setXAxisPosition] = useState<AxisPosition>(initialMetadata.xAxis?.position ?? defaultConfig.xAxis!.position);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title ?? '');
  const [xAxisTitleFontSize, setXAxisTitleFontSize] = useState(initialMetadata.xAxis?.titleFontSize ?? defaultConfig.xAxis!.titleFontSize);
  const [xAxisTitleColor, setXAxisTitleColor] = useState(initialMetadata.xAxis?.titleColor ?? defaultConfig.xAxis!.titleColor);
  const [xAxisTickRotation, setXAxisTickRotation] = useState(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat ?? '');
  const [xAxisTickCount, setXAxisTickCount] = useState<number | undefined>(initialMetadata.xAxis?.tickCount);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor ?? defaultConfig.xAxis!.tickColor);
  const [xAxisTickSize, setXAxisTickSize] = useState(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor ?? defaultConfig.xAxis!.lineColor);
  const [xAxisLineWidth, setXAxisLineWidth] = useState(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
  const [xAxisScaleType, setXAxisScaleType] = useState<ScaleType>(initialMetadata.xAxis?.scaleType ?? defaultConfig.xAxis!.scaleType);

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
  const [yAxisPosition, setYAxisPosition] = useState<AxisPosition>(initialMetadata.yAxis?.position ?? defaultConfig.yAxis!.position);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title ?? '');
  const [yAxisTitleFontSize, setYAxisTitleFontSize] = useState(initialMetadata.yAxis?.titleFontSize ?? defaultConfig.yAxis!.titleFontSize);
  const [yAxisTitleColor, setYAxisTitleColor] = useState(initialMetadata.yAxis?.titleColor ?? defaultConfig.yAxis!.titleColor);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat ?? '');
  const [yAxisTickCount, setYAxisTickCount] = useState<number | undefined>(initialMetadata.yAxis?.tickCount);
  const [yAxisTickColor, setYAxisTickColor] = useState(initialMetadata.yAxis?.tickColor ?? defaultConfig.yAxis!.tickColor);
  const [yAxisTickSize, setYAxisTickSize] = useState(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);
  const [yAxisLineColor, setYAxisLineColor] = useState(initialMetadata.yAxis?.lineColor ?? defaultConfig.yAxis!.lineColor);
  const [yAxisLineWidth, setYAxisLineWidth] = useState(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
  const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType>(initialMetadata.yAxis?.scaleType ?? defaultConfig.yAxis!.scaleType);
  const [yAxisMin, setYAxisMin] = useState<number | undefined>(initialMetadata.yAxis?.min);
  const [yAxisMax, setYAxisMax] = useState<number | undefined>(initialMetadata.yAxis?.max);
  const [yAxisZeroBaseline, setYAxisZeroBaseline] = useState(initialMetadata.yAxis?.zeroBaseline ?? defaultConfig.yAxis!.zeroBaseline);

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash ?? '');
  const [gridXLines, setGridXLines] = useState(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
  const [gridYLines, setGridYLines] = useState(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState<LegendPosition>(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState<'horizontal' | 'vertical'>(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title ?? '');
  const [legendTitleFontSize, setLegendTitleFontSize] = useState(initialMetadata.legend?.titleFontSize ?? defaultConfig.legend!.titleFontSize);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
  const [legendItemWidth, setLegendItemWidth] = useState(initialMetadata.legend?.itemWidth ?? defaultConfig.legend!.itemWidth);
  const [legendItemHeight, setLegendItemHeight] = useState(initialMetadata.legend?.itemHeight ?? defaultConfig.legend!.itemHeight);
  const [legendSymbolSize, setLegendSymbolSize] = useState(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);
  const [legendColor, setLegendColor] = useState(initialMetadata.legend?.color ?? defaultConfig.legend!.color);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState<TooltipTrigger>(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format ?? '');
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
  const [tooltipShowValues, setTooltipShowValues] = useState(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
  const [tooltipShowPercentage, setTooltipShowPercentage] = useState(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);

  // Data labels
  const [dataLabelsShow, setDataLabelsShow] = useState(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
  const [dataLabelsPosition, setDataLabelsPosition] = useState<'top' | 'inside' | 'outside'>(initialMetadata.dataLabels?.position ?? defaultConfig.dataLabels!.position);
  const [dataLabelsFormat, setDataLabelsFormat] = useState(initialMetadata.dataLabels?.format ?? '');
  const [dataLabelsFontSize, setDataLabelsFontSize] = useState(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
  const [dataLabelsColor, setDataLabelsColor] = useState(initialMetadata.dataLabels?.color ?? defaultConfig.dataLabels!.color);
  const [dataLabelsBg, setDataLabelsBg] = useState(initialMetadata.dataLabels?.backgroundColor ?? defaultConfig.dataLabels!.backgroundColor);
  const [dataLabelsOffset, setDataLabelsOffset] = useState(initialMetadata.dataLabels?.offset ?? defaultConfig.dataLabels!.offset);

  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [interactivitySelection, setInteractivitySelection] = useState<SelectionMode>(initialMetadata.interactivity?.selection ?? defaultConfig.interactivity!.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
  const [interactivityClickAction, setInteractivityClickAction] = useState<'none' | 'select' | 'drilldown' | 'custom'>(initialMetadata.interactivity?.clickAction ?? defaultConfig.interactivity!.clickAction);
  const [interactivityCustomHandler, setInteractivityCustomHandler] = useState(initialMetadata.interactivity?.customClickHandler ?? '');

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [responsiveMinWidth, setResponsiveMinWidth] = useState<number | undefined>(initialMetadata.responsive?.minWidth);
  const [responsiveMinHeight, setResponsiveMinHeight] = useState<number | undefined>(initialMetadata.responsive?.minHeight);
  const [responsiveAspectRatio, setResponsiveAspectRatio] = useState<number | undefined>(initialMetadata.responsive?.aspectRatio);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable!);
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(initialMetadata.exportFormats ?? defaultConfig.exportFormats!);

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel ?? '');
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription ?? '');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive ?? defaultConfig.performance!.progressive);
  const [virtualization, setVirtualization] = useState(initialMetadata.performance?.virtualization ?? defaultConfig.performance!.virtualization);

  // UI sections
  const [sections, setSections] = useState({
    basic: true,
    data: false,
    style: false,
    axes: false,
    grid: false,
    legend: false,
    tooltip: false,
    labels: false,
    interactivity: false,
    animation: false,
    dimensions: true,
    advanced: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    setTitle(initialMetadata.title ?? defaultConfig.title);
    setDescription(initialMetadata.description ?? defaultConfig.description);
    setXField(initialMetadata.xField ?? '');
    setYField(initialMetadata.yField ?? '');
    setColorField(initialMetadata.colorField ?? '');
    setSizeField(initialMetadata.sizeField ?? '');
    setFacetField(initialMetadata.facetField ?? '');
    setOrientation(initialMetadata.orientation ?? defaultConfig.orientation);
    setGroupMode(initialMetadata.groupMode ?? defaultConfig.groupMode);
    setBarWidth(initialMetadata.barWidth);
    setBarGap(initialMetadata.barGap ?? defaultConfig.barGap!);
    setCategoryGap(initialMetadata.categoryGap ?? defaultConfig.categoryGap!);
    setBorderRadius(initialMetadata.borderRadius ?? defaultConfig.borderRadius!);
    setColorScheme(initialMetadata.colorScheme ?? defaultConfig.colorScheme);
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient!);
    setGradientDirection(initialMetadata.gradientDirection ?? defaultConfig.gradientDirection!);
    setOpacity(initialMetadata.opacity ?? defaultConfig.opacity!);
    setBorderColor(initialMetadata.borderColor ?? defaultConfig.borderColor!);
    setBorderWidth(initialMetadata.borderWidth ?? defaultConfig.borderWidth!);
    setBorderType(initialMetadata.borderType ?? defaultConfig.borderType!);
    setXAxisVisible(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
    setXAxisPosition(initialMetadata.xAxis?.position ?? defaultConfig.xAxis!.position);
    setXAxisTitle(initialMetadata.xAxis?.title ?? '');
    setXAxisTitleFontSize(initialMetadata.xAxis?.titleFontSize ?? defaultConfig.xAxis!.titleFontSize);
    setXAxisTitleColor(initialMetadata.xAxis?.titleColor ?? defaultConfig.xAxis!.titleColor);
    setXAxisTickRotation(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat ?? '');
    setXAxisTickCount(initialMetadata.xAxis?.tickCount);
    setXAxisTickColor(initialMetadata.xAxis?.tickColor ?? defaultConfig.xAxis!.tickColor);
    setXAxisTickSize(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
    setXAxisLineColor(initialMetadata.xAxis?.lineColor ?? defaultConfig.xAxis!.lineColor);
    setXAxisLineWidth(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
    setXAxisScaleType(initialMetadata.xAxis?.scaleType ?? defaultConfig.xAxis!.scaleType);
    setYAxisVisible(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
    setYAxisPosition(initialMetadata.yAxis?.position ?? defaultConfig.yAxis!.position);
    setYAxisTitle(initialMetadata.yAxis?.title ?? '');
    setYAxisTitleFontSize(initialMetadata.yAxis?.titleFontSize ?? defaultConfig.yAxis!.titleFontSize);
    setYAxisTitleColor(initialMetadata.yAxis?.titleColor ?? defaultConfig.yAxis!.titleColor);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat ?? '');
    setYAxisTickCount(initialMetadata.yAxis?.tickCount);
    setYAxisTickColor(initialMetadata.yAxis?.tickColor ?? defaultConfig.yAxis!.tickColor);
    setYAxisTickSize(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);
    setYAxisLineColor(initialMetadata.yAxis?.lineColor ?? defaultConfig.yAxis!.lineColor);
    setYAxisLineWidth(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
    setYAxisScaleType(initialMetadata.yAxis?.scaleType ?? defaultConfig.yAxis!.scaleType);
    setYAxisMin(initialMetadata.yAxis?.min);
    setYAxisMax(initialMetadata.yAxis?.max);
    setYAxisZeroBaseline(initialMetadata.yAxis?.zeroBaseline ?? defaultConfig.yAxis!.zeroBaseline);
    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setGridColor(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash ?? '');
    setGridXLines(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
    setGridYLines(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
    setLegendOrient(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
    setLegendTitle(initialMetadata.legend?.title ?? '');
    setLegendTitleFontSize(initialMetadata.legend?.titleFontSize ?? defaultConfig.legend!.titleFontSize);
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
    setLegendItemWidth(initialMetadata.legend?.itemWidth ?? defaultConfig.legend!.itemWidth);
    setLegendItemHeight(initialMetadata.legend?.itemHeight ?? defaultConfig.legend!.itemHeight);
    setLegendSymbolSize(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
    setLegendFontSize(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);
    setLegendColor(initialMetadata.legend?.color ?? defaultConfig.legend!.color);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
    setTooltipFormat(initialMetadata.tooltip?.format ?? '');
    setTooltipBg(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
    setTooltipText(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
    setTooltipFontSize(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
    setTooltipShowValues(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
    setTooltipShowPercentage(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);
    setDataLabelsShow(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
    setDataLabelsPosition(initialMetadata.dataLabels?.position ?? defaultConfig.dataLabels!.position);
    setDataLabelsFormat(initialMetadata.dataLabels?.format ?? '');
    setDataLabelsFontSize(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
    setDataLabelsColor(initialMetadata.dataLabels?.color ?? defaultConfig.dataLabels!.color);
    setDataLabelsBg(initialMetadata.dataLabels?.backgroundColor ?? defaultConfig.dataLabels!.backgroundColor);
    setDataLabelsOffset(initialMetadata.dataLabels?.offset ?? defaultConfig.dataLabels!.offset);
    setInteractivityZoom(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
    setInteractivityPan(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
    setInteractivitySelection(initialMetadata.interactivity?.selection ?? defaultConfig.interactivity!.selection);
    setInteractivityBrush(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
    setInteractivityHover(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
    setInteractivityClickAction(initialMetadata.interactivity?.clickAction ?? defaultConfig.interactivity!.clickAction);
    setInteractivityCustomHandler(initialMetadata.interactivity?.customClickHandler ?? '');
    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);
    setWidth(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
    setResponsiveMinWidth(initialMetadata.responsive?.minWidth);
    setResponsiveMinHeight(initialMetadata.responsive?.minHeight);
    setResponsiveAspectRatio(initialMetadata.responsive?.aspectRatio);
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable!);
    setExportFormats(initialMetadata.exportFormats ?? defaultConfig.exportFormats!);
    setAriaLabel(initialMetadata.accessibility?.ariaLabel ?? '');
    setAriaDescription(initialMetadata.accessibility?.ariaDescription ?? '');
    setHighContrast(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
    setFocusable(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);
    setDownsampling(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
    setMaxPoints(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);
    setProgressive(initialMetadata.performance?.progressive ?? defaultConfig.performance!.progressive);
    setVirtualization(initialMetadata.performance?.virtualization ?? defaultConfig.performance!.virtualization);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField || !yField) {
      alert('Please select both X and Y fields.');
      return;
    }

    const config: BarChartConfig = {
      ...defaultConfig,
      title,
      description,
      xField,
      yField,
      colorField: colorField || undefined,
      sizeField: sizeField || undefined,
      facetField: facetField || undefined,
      orientation,
      groupMode,
      barWidth,
      barGap,
      categoryGap,
      borderRadius,
      colorScheme,
      colorGradient,
      gradientDirection,
      opacity,
      borderColor,
      borderWidth,
      borderType,
      xAxis: {
        visible: xAxisVisible,
        position: xAxisPosition,
        title: xAxisTitle,
        titleFontSize: xAxisTitleFontSize,
        titleColor: xAxisTitleColor,
        tickLabelRotation: xAxisTickRotation,
        tickFormat: xAxisTickFormat,
        tickCount: xAxisTickCount,
        tickColor: xAxisTickColor,
        tickSize: xAxisTickSize,
        lineColor: xAxisLineColor,
        lineWidth: xAxisLineWidth,
        scaleType: xAxisScaleType,
      },
      yAxis: {
        visible: yAxisVisible,
        position: yAxisPosition,
        title: yAxisTitle,
        titleFontSize: yAxisTitleFontSize,
        titleColor: yAxisTitleColor,
        tickFormat: yAxisTickFormat,
        tickCount: yAxisTickCount,
        tickColor: yAxisTickColor,
        tickSize: yAxisTickSize,
        lineColor: yAxisLineColor,
        lineWidth: yAxisLineWidth,
        scaleType: yAxisScaleType,
        min: yAxisMin,
        max: yAxisMax,
        zeroBaseline: yAxisZeroBaseline,
      },
      showGrid,
      grid: {
        color: gridColor,
        width: gridWidth,
        dash: gridDash,
        xLines: gridXLines,
        yLines: gridYLines,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        title: legendTitle,
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
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: tooltipFontSize,
        showValues: tooltipShowValues,
        showPercentage: tooltipShowPercentage,
      },
      dataLabels: {
        show: dataLabelsShow,
        position: dataLabelsPosition,
        format: dataLabelsFormat,
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
        hoverHighlight: interactivityHover,
        clickAction: interactivityClickAction,
        customClickHandler: interactivityCustomHandler || undefined,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth: responsiveMinWidth,
        minHeight: responsiveMinHeight,
        aspectRatio: responsiveAspectRatio,
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel,
        ariaDescription,
        highContrast,
        focusable,
      },
      performance: {
        downsampling,
        maxPoints,
        progressive,
        virtualization,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[1000px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Bar Chart</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Section */}
          <SectionHeader title="Basic Settings" icon={<Sliders className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Bar Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Brief description"
                />
              </div>
            </div>
          )}

          {/* Data Mapping Section */}
          <SectionHeader title="Data Mapping" icon={<Layers className="h-4 w-4" />} sectionKey="data" />
          {sections.data && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  X‑Axis Field (categorical) <span className="text-red-400">*</span>
                </label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="" disabled>Select a field</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Y‑Axis Field (numeric) <span className="text-red-400">*</span>
                </label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Color / Group By (optional)</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Facet Field (optional)</label>
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

          {/* Style Section */}
          <SectionHeader title="Style" icon={<Palette className="h-4 w-4" />} sectionKey="style" />
          {sections.style && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Orientation</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="vertical"
                      checked={orientation === 'vertical'}
                      onChange={(e) => setOrientation(e.target.value as 'vertical')}
                      className="text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Vertical</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="horizontal"
                      checked={orientation === 'horizontal'}
                      onChange={(e) => setOrientation(e.target.value as 'horizontal')}
                      className="text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Horizontal</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Group Mode</label>
                <select
                  value={groupMode}
                  onChange={(e) => setGroupMode(e.target.value as BarGroupMode)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="group">Grouped</option>
                  <option value="stack">Stacked</option>
                  <option value="percent">100% Stacked</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bar Width (px, auto if empty)</label>
                  <input
                    type="number"
                    min="0"
                    value={barWidth ?? ''}
                    onChange={(e) => setBarWidth(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bar Gap (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={barGap}
                    onChange={(e) => setBarGap(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category Gap (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={categoryGap}
                    onChange={(e) => setCategoryGap(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Radius</label>
                  <input
                    type="number"
                    min="0"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scheme / Color</label>
                    <input
                      type="text"
                      value={colorScheme as string}
                      onChange={(e) => setColorScheme(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      placeholder="#3b82f6 or palette name"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={colorGradient}
                        onChange={(e) => setColorGradient(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Gradient</span>
                    </label>
                    {colorGradient && (
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value as 'vertical' | 'horizontal')}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Border Width</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Axes Section */}
          <SectionHeader title="Axes" icon={<Activity className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">X‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={xAxisVisible}
                        onChange={(e) => setXAxisVisible(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Visible</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={xAxisPosition}
                      onChange={(e) => setXAxisPosition(e.target.value as AxisPosition)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick Rotation</label>
                    <input
                      type="number"
                      min="-90"
                      max="90"
                      value={xAxisTickRotation}
                      onChange={(e) => setXAxisTickRotation(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                    <input
                      type="text"
                      value={xAxisTickFormat}
                      onChange={(e) => setXAxisTickFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                    <select
                      value={xAxisScaleType}
                      onChange={(e) => setXAxisScaleType(e.target.value as ScaleType)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="categorical">Categorical</option>
                      <option value="band">Band</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">Y‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={yAxisVisible}
                        onChange={(e) => setYAxisVisible(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Visible</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={yAxisPosition}
                      onChange={(e) => setYAxisPosition(e.target.value as AxisPosition)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                    <input
                      type="text"
                      value={yAxisTickFormat}
                      onChange={(e) => setYAxisTickFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                    <select
                      value={yAxisScaleType}
                      onChange={(e) => setYAxisScaleType(e.target.value as ScaleType)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                    <input
                      type="number"
                      value={yAxisMin ?? ''}
                      onChange={(e) => setYAxisMin(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                    <input
                      type="number"
                      value={yAxisMax ?? ''}
                      onChange={(e) => setYAxisMax(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={yAxisZeroBaseline}
                      onChange={(e) => setYAxisZeroBaseline(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-xs text-gray-200">Force zero baseline</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Section */}
          <SectionHeader title="Grid" icon={<Grid className="h-4 w-4" />} sectionKey="grid" />
          {sections.grid && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show Grid</span>
              </label>
              {showGrid && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={gridColor}
                        onChange={(e) => setGridColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={gridWidth}
                        onChange={(e) => setGridWidth(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Dash</label>
                      <input
                        type="text"
                        value={gridDash}
                        onChange={(e) => setGridDash(e.target.value)}
                        placeholder="5,5"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={gridXLines}
                          onChange={(e) => setGridXLines(e.target.checked)}
                          className="rounded border-gray-600 text-purple-500"
                        />
                        <span className="text-xs text-gray-200">X‑axis lines</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={gridYLines}
                          onChange={(e) => setGridYLines(e.target.checked)}
                          className="rounded border-gray-600 text-purple-500"
                        />
                        <span className="text-xs text-gray-200">Y‑axis lines</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend Section */}
          <SectionHeader title="Legend" icon={<Eye className="h-4 w-4" />} sectionKey="legend" />
          {sections.legend && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show Legend</span>
              </label>
              {showLegend && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={legendPosition}
                        onChange={(e) => setLegendPosition(e.target.value as LegendPosition)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                        onChange={(e) => setLegendOrient(e.target.value as 'horizontal' | 'vertical')}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Item Gap</label>
                      <input
                        type="number"
                        min="0"
                        value={legendItemGap}
                        onChange={(e) => setLegendItemGap(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tooltip Section */}
          <SectionHeader title="Tooltip" icon={<Target className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tooltipShow}
                  onChange={(e) => setTooltipShow(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show Tooltip</span>
              </label>
              {tooltipShow && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                      <select
                        value={tooltipTrigger}
                        onChange={(e) => setTooltipTrigger(e.target.value as TooltipTrigger)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="item">Item</option>
                        <option value="axis">Axis</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Format</label>
                      <input
                        type="text"
                        value={tooltipFormat}
                        onChange={(e) => setTooltipFormat(e.target.value)}
                        placeholder="Custom template"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={tooltipBg}
                        onChange={(e) => setTooltipBg(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Border</label>
                      <input
                        type="color"
                        value={tooltipBorder}
                        onChange={(e) => setTooltipBorder(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Text</label>
                      <input
                        type="color"
                        value={tooltipText}
                        onChange={(e) => setTooltipText(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="20"
                        value={tooltipFontSize}
                        onChange={(e) => setTooltipFontSize(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowValues}
                        onChange={(e) => setTooltipShowValues(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Show values</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowPercentage}
                        onChange={(e) => setTooltipShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Show %</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Labels Section */}
          <SectionHeader title="Data Labels" icon={<Type className="h-4 w-4" />} sectionKey="labels" />
          {sections.labels && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dataLabelsShow}
                  onChange={(e) => setDataLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show Data Labels</span>
              </label>
              {dataLabelsShow && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={dataLabelsPosition}
                        onChange={(e) => setDataLabelsPosition(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="top">Top</option>
                        <option value="inside">Inside</option>
                        <option value="outside">Outside</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Format</label>
                      <input
                        type="text"
                        value={dataLabelsFormat}
                        onChange={(e) => setDataLabelsFormat(e.target.value)}
                        placeholder=".2f"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="20"
                        value={dataLabelsFontSize}
                        onChange={(e) => setDataLabelsFontSize(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={dataLabelsColor}
                        onChange={(e) => setDataLabelsColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={dataLabelsBg}
                        onChange={(e) => setDataLabelsBg(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Offset (px)</label>
                      <input
                        type="number"
                        min="0"
                        value={dataLabelsOffset}
                        onChange={(e) => setDataLabelsOffset(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Zap className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityZoom}
                    onChange={(e) => setInteractivityZoom(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityPan}
                    onChange={(e) => setInteractivityPan(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityBrush}
                    onChange={(e) => setInteractivityBrush(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Brush</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityHover}
                    onChange={(e) => setInteractivityHover(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Hover highlight</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Selection Mode</label>
                <select
                  value={interactivitySelection}
                  onChange={(e) => setInteractivitySelection(e.target.value as SelectionMode)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
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
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="none">None</option>
                  <option value="select">Select</option>
                  <option value="drilldown">Drill Down</option>
                  <option value="custom">Custom</option>
                </select>
                {interactivityClickAction === 'custom' && (
                  <input
                    type="text"
                    value={interactivityCustomHandler}
                    onChange={(e) => setInteractivityCustomHandler(e.target.value)}
                    placeholder="Handler function name"
                    className="mt-2 w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                )}
              </div>
            </div>
          )}

          {/* Animation Section */}
          <SectionHeader title="Animation" icon={<Play className="h-4 w-4" />} sectionKey="animation" />
          {sections.animation && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Easing</label>
                    <select
                      value={animationEasing}
                      onChange={(e) => setAnimationEasing(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="linear">Linear</option>
                      <option value="ease">Ease</option>
                      <option value="ease-in">Ease‑in</option>
                      <option value="ease-out">Ease‑out</option>
                      <option value="ease-in-out">Ease‑in‑out</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dimensions Section */}
          <SectionHeader title="Dimensions" icon={<Layout className="h-4 w-4" />} sectionKey="dimensions" />
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

          {/* Advanced Section */}
          <SectionHeader title="Advanced" icon={<Wrench className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <h4 className="text-sm font-semibold text-white">Responsive & Export</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responsiveEnabled}
                    onChange={(e) => setResponsiveEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Responsive</span>
                </label>
                {responsiveEnabled && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min Width</label>
                      <input
                        type="number"
                        value={responsiveMinWidth ?? ''}
                        onChange={(e) => setResponsiveMinWidth(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min Height</label>
                      <input
                        type="number"
                        value={responsiveMinHeight ?? ''}
                        onChange={(e) => setResponsiveMinHeight(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Aspect Ratio</label>
                      <input
                        type="number"
                        step="0.1"
                        value={responsiveAspectRatio ?? ''}
                        onChange={(e) => setResponsiveAspectRatio(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportable}
                    onChange={(e) => setExportable(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Allow Export</span>
                </label>
                {exportable && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Formats</label>
                    <div className="flex space-x-2">
                      {(['png', 'svg', 'pdf'] as const).map(fmt => (
                        <label key={fmt} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={exportFormats.includes(fmt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFormats([...exportFormats, fmt]);
                              } else {
                                setExportFormats(exportFormats.filter(f => f !== fmt));
                              }
                            }}
                            className="rounded border-gray-600 text-purple-500"
                          />
                          <span className="text-xs text-gray-200 uppercase">{fmt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <h4 className="text-sm font-semibold text-white mt-4">Accessibility</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">ARIA Label</label>
                  <input
                    type="text"
                    value={ariaLabel}
                    onChange={(e) => setAriaLabel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">ARIA Description</label>
                  <input
                    type="text"
                    value={ariaDescription}
                    onChange={(e) => setAriaDescription(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">High Contrast</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={focusable}
                    onChange={(e) => setFocusable(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Focusable</span>
                </label>
              </div>

              <h4 className="text-sm font-semibold text-white mt-4">Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={downsampling}
                    onChange={(e) => setDownsampling(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Downsampling</span>
                </label>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Points</label>
                  <input
                    type="number"
                    min="0"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={progressive}
                    onChange={(e) => setProgressive(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Progressive Rendering</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={virtualization}
                    onChange={(e) => setVirtualization(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Virtualization</span>
                </label>
              </div>
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
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};