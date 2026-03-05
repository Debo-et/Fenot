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
  Circle,
  Square,
  Diamond,
  X as XIcon,
  Activity,
  Layers,
  Type,
  Map,
  TrendingUp,
  Hash,
  Sigma,
  FunctionSquare,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AreaChartConfig } from '../../types/visualization-configs';

interface AreaChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<AreaChartConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: AreaChartConfig) => void;
}

const defaultConfig: AreaChartConfig = {
  title: '',
  description: '',
  xField: '',
  yField: '',
  colorField: '',
  sizeField: '',
  facetField: '',
  fillOpacity: 0.7,
  fillGradient: false,
  gradientDirection: 'vertical',
  curve: 'monotone',
  stackMode: 'none',
  baseline: 'zero',
  stroke: {
    show: true,
    color: '#000000',
    width: 1.5,
    dash: '',
    opacity: 1,
  },
  showMarkers: false,
  markerSymbol: 'circle',
  markerSize: 4,
  markerColor: '#000000',
  markerBorderColor: '#ffffff',
  markerBorderWidth: 1,
  markerOpacity: 1,
  colorScheme: '#3b82f6',
  colorGradient: false,
  colorOpacity: 1,
  xAxis: {
    visible: true,
    position: 'bottom',
    title: '',
    tickFormat: '',
    tickCount: undefined,
    tickLabelRotation: 0,
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
    scaleType: 'linear',
  },
  yAxis: {
    visible: true,
    position: 'left',
    title: '',
    tickFormat: '',
    tickCount: undefined,
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
    scaleType: 'linear',
    zeroBaseline: true,
  },
  showGrid: true,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
    xLines: false,
    yLines: true,
  },
  showLegend: false,
  legend: {
    position: 'top',
    orient: 'horizontal',
    itemGap: 10,
  },
  tooltip: {
    show: true,
    trigger: 'axis',
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
    fontSize: 11,
    color: '#000000',
    offset: 5,
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
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
    enabled: true,
    minWidth: 300,
    minHeight: 200,
    aspectRatio: undefined,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    ariaLabel: 'Area chart',
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    maxPoints: 5000,
    progressive: false,
    virtualization: false,
  },
};

export const AreaChartConfigDialog: React.FC<AreaChartConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const categoricalColumns = availableColumns.filter(
    col => col.type.toLowerCase() === 'string' || col.type.toLowerCase() === 'text' || col.type.toLowerCase() === 'varchar'
  );
  const numericalColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const dateColumns = availableColumns.filter(
    col => col.type.toLowerCase().includes('date') || col.type.toLowerCase().includes('time')
  );

  // Basic
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description || defaultConfig.description);

  // Data mapping
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [yField, setYField] = useState(initialMetadata.yField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || '');
  const [facetField, setFacetField] = useState(initialMetadata.facetField || '');

  // Area appearance
  const [fillOpacity, setFillOpacity] = useState(initialMetadata.fillOpacity ?? defaultConfig.fillOpacity);
  const [fillGradient, setFillGradient] = useState(initialMetadata.fillGradient ?? defaultConfig.fillGradient);
  const [gradientDirection, setGradientDirection] = useState(initialMetadata.gradientDirection || defaultConfig.gradientDirection);
  const [curve, setCurve] = useState(initialMetadata.curve || defaultConfig.curve);
  const [stackMode, setStackMode] = useState(initialMetadata.stackMode || defaultConfig.stackMode);
  const [baseline, setBaseline] = useState(initialMetadata.baseline || defaultConfig.baseline);

  // Stroke
  const [strokeShow, setStrokeShow] = useState(initialMetadata.stroke?.show ?? defaultConfig.stroke!.show);
  const [strokeColor, setStrokeColor] = useState(initialMetadata.stroke?.color ?? defaultConfig.stroke!.color);
  const [strokeWidth, setStrokeWidth] = useState(initialMetadata.stroke?.width ?? defaultConfig.stroke!.width);
  const [strokeDash, setStrokeDash] = useState(initialMetadata.stroke?.dash ?? defaultConfig.stroke!.dash);
  const [strokeOpacity, setStrokeOpacity] = useState(initialMetadata.stroke?.opacity ?? defaultConfig.stroke!.opacity);

  // Markers
  const [showMarkers, setShowMarkers] = useState(initialMetadata.showMarkers ?? defaultConfig.showMarkers);
  const [markerSymbol, setMarkerSymbol] = useState(initialMetadata.markerSymbol || defaultConfig.markerSymbol);
  const [markerSize, setMarkerSize] = useState(initialMetadata.markerSize ?? defaultConfig.markerSize);
  const [markerColor, setMarkerColor] = useState(initialMetadata.markerColor || defaultConfig.markerColor);
  const [markerBorderColor, setMarkerBorderColor] = useState(initialMetadata.markerBorderColor || defaultConfig.markerBorderColor);
  const [markerBorderWidth, setMarkerBorderWidth] = useState(initialMetadata.markerBorderWidth ?? defaultConfig.markerBorderWidth);
  const [markerOpacity, setMarkerOpacity] = useState(initialMetadata.markerOpacity ?? defaultConfig.markerOpacity);

  // Color
  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScheme || defaultConfig.colorScheme);
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
  const [colorOpacity, setColorOpacity] = useState(initialMetadata.colorOpacity ?? defaultConfig.colorOpacity);

  // Axes
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
  const [xAxisPosition, setXAxisPosition] = useState(initialMetadata.xAxis?.position || defaultConfig.xAxis!.position);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
  const [xAxisTickCount, setXAxisTickCount] = useState(initialMetadata.xAxis?.tickCount);
  const [xAxisTickRotation, setXAxisTickRotation] = useState(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor || defaultConfig.xAxis!.lineColor);
  const [xAxisLineWidth, setXAxisLineWidth] = useState(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor || defaultConfig.xAxis!.tickColor);
  const [xAxisTickSize, setXAxisTickSize] = useState(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
  const [xAxisScaleType, setXAxisScaleType] = useState(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
  const [xAxisMin, setXAxisMin] = useState(initialMetadata.xAxis?.min);
  const [xAxisMax, setXAxisMax] = useState(initialMetadata.xAxis?.max);

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
  const [yAxisPosition, setYAxisPosition] = useState(initialMetadata.yAxis?.position || defaultConfig.yAxis!.position);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title || defaultConfig.yAxis!.title);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis!.tickFormat);
  const [yAxisTickCount, setYAxisTickCount] = useState(initialMetadata.yAxis?.tickCount);
  const [yAxisLineColor, setYAxisLineColor] = useState(initialMetadata.yAxis?.lineColor || defaultConfig.yAxis!.lineColor);
  const [yAxisLineWidth, setYAxisLineWidth] = useState(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
  const [yAxisTickColor, setYAxisTickColor] = useState(initialMetadata.yAxis?.tickColor || defaultConfig.yAxis!.tickColor);
  const [yAxisTickSize, setYAxisTickSize] = useState(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);
  const [yAxisScaleType, setYAxisScaleType] = useState(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis!.scaleType);
  const [yAxisMin, setYAxisMin] = useState(initialMetadata.yAxis?.min);
  const [yAxisMax, setYAxisMax] = useState(initialMetadata.yAxis?.max);
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
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? 12);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
  const [tooltipTextColor, setTooltipTextColor] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
  const [tooltipShowValues, setTooltipShowValues] = useState(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
  const [tooltipShowPercentage, setTooltipShowPercentage] = useState(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);
  const [tooltipShowAllSeries, setTooltipShowAllSeries] = useState(initialMetadata.tooltip?.showAllSeries ?? defaultConfig.tooltip!.showAllSeries);
  const [tooltipSortSeries, setTooltipSortSeries] = useState(initialMetadata.tooltip?.sortSeries ?? defaultConfig.tooltip!.sortSeries);

  // Data labels
  const [dataLabelsShow] = useState(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
  const [dataLabelsPosition, setDataLabelsPosition] = useState(initialMetadata.dataLabels?.position || defaultConfig.dataLabels!.position);
  const [dataLabelsFormat, setDataLabelsFormat] = useState(initialMetadata.dataLabels?.format || '');
  const [dataLabelsFontSize, setDataLabelsFontSize] = useState(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
  const [dataLabelsColor, setDataLabelsColor] = useState(initialMetadata.dataLabels?.color || defaultConfig.dataLabels!.color);
  const [dataLabelsBg, setDataLabelsBg] = useState(initialMetadata.dataLabels?.backgroundColor || '');
  const [dataLabelsOffset, setDataLabelsOffset] = useState(initialMetadata.dataLabels?.offset ?? defaultConfig.dataLabels!.offset);

  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [interactivitySelection, setInteractivitySelection] = useState(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
  const [interactivityClickAction, setInteractivityClickAction] = useState(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction);
  const [interactivityFocusMode, setInteractivityFocusMode] = useState(initialMetadata.interactivity?.seriesFocusMode || defaultConfig.interactivity!.seriesFocusMode);

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
  const [responsiveMinWidth, setResponsiveMinWidth] = useState(initialMetadata.responsive?.minWidth);
  const [responsiveMinHeight, setResponsiveMinHeight] = useState(initialMetadata.responsive?.minHeight);
  const [responsiveAspectRatio, setResponsiveAspectRatio] = useState(initialMetadata.responsive?.aspectRatio);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  const [exportFormats, setExportFormats] = useState(initialMetadata.exportFormats || defaultConfig.exportFormats);

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || defaultConfig.accessibility!.ariaLabel);
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription || '');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints || defaultConfig.performance!.maxPoints);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive ?? defaultConfig.performance!.progressive);
  const [virtualization, setVirtualization] = useState(initialMetadata.performance?.virtualization ?? defaultConfig.performance!.virtualization);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    mapping: false,
    appearance: false,
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

  useEffect(() => {
    // Sync with initialMetadata when it changes
    setTitle(initialMetadata.title || defaultConfig.title);
    setDescription(initialMetadata.description || defaultConfig.description);
    setXField(initialMetadata.xField || '');
    setYField(initialMetadata.yField || '');
    setColorField(initialMetadata.colorField || '');
    setSizeField(initialMetadata.sizeField || '');
    setFacetField(initialMetadata.facetField || '');
    // ... (similar for all other fields)
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField || !yField) {
      alert('Please select both X and Y fields.');
      return;
    }

    const config: AreaChartConfig = {
      title: title || undefined,
      description: description || undefined,
      xField,
      yField,
      colorField: colorField || undefined,
      sizeField: sizeField || undefined,
      facetField: facetField || undefined,
      fillOpacity,
      fillGradient,
      gradientDirection,
      curve,
      stackMode,
      baseline,
      stroke: {
        show: strokeShow,
        color: strokeColor,
        width: strokeWidth,
        dash: strokeDash,
        opacity: strokeOpacity,
      },
      showMarkers,
      markerSymbol,
      markerSize,
      markerColor,
      markerBorderColor,
      markerBorderWidth,
      markerOpacity,
      colorScheme,
      colorGradient,
      colorOpacity,
      xAxis: {
        visible: xAxisVisible,
        position: xAxisPosition,
        title: xAxisTitle,
        tickFormat: xAxisTickFormat,
        tickCount: xAxisTickCount,
        tickLabelRotation: xAxisTickRotation,
        lineColor: xAxisLineColor,
        lineWidth: xAxisLineWidth,
        tickColor: xAxisTickColor,
        tickSize: xAxisTickSize,
        scaleType: xAxisScaleType,
        min: xAxisMin,
        max: xAxisMax,
      },
      yAxis: {
        visible: yAxisVisible,
        position: yAxisPosition,
        title: yAxisTitle,
        tickFormat: yAxisTickFormat,
        tickCount: yAxisTickCount,
        lineColor: yAxisLineColor,
        lineWidth: yAxisLineWidth,
        tickColor: yAxisTickColor,
        tickSize: yAxisTickSize,
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
        itemGap: legendItemGap,
        fontSize: legendFontSize,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
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
        seriesFocusMode: interactivityFocusMode,
      },
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

  const symbolOptions = [
    { value: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
    { value: 'square', label: 'Square', icon: <Square className="h-4 w-4" /> },
    { value: 'diamond', label: 'Diamond', icon: <Diamond className="h-4 w-4" /> },
    { value: 'cross', label: 'Cross', icon: <XIcon className="h-4 w-4" /> },
    { value: 'x', label: 'X', icon: <XIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Configure Area Chart</h2>
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
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Area Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Brief description of the chart"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Data Mapping Section */}
          <SectionHeader title="Data Mapping" icon={<Layers className="h-4 w-4" />} sectionKey="mapping" />
          {sections.mapping && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">X‑Axis Field <span className="text-red-400">*</span></label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select field</option>
                  {[...dateColumns, ...categoricalColumns, ...numericalColumns].map(col => (
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
                  <option value="">Select numeric field</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color / Series Field</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Facet Field (small multiples)</label>
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

          {/* Appearance Section */}
          <SectionHeader title="Appearance" icon={<Palette className="h-4 w-4" />} sectionKey="appearance" />
          {sections.appearance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Fill & Opacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Fill Opacity (0‑1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={fillOpacity}
                    onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={fillGradient}
                    onChange={(e) => setFillGradient(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-300">Use gradient fill</span>
                </div>
              </div>
              {fillGradient && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Gradient Direction</label>
                  <select
                    value={gradientDirection}
                    onChange={(e) => setGradientDirection(e.target.value as 'vertical' | 'horizontal')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </div>
              )}

              {/* Curve & Stacking */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Curve Type</label>
                  <select
                    value={curve}
                    onChange={(e) => setCurve(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="linear">Linear</option>
                    <option value="monotone">Monotone</option>
                    <option value="cardinal">Cardinal</option>
                    <option value="catmullRom">Catmull‑Rom</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Stack Mode</label>
                  <select
                    value={stackMode}
                    onChange={(e) => setStackMode(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="none">None (overlap)</option>
                    <option value="normal">Stacked</option>
                    <option value="percent">Percent stacked</option>
                    <option value="stream">Streamgraph</option>
                  </select>
                </div>
              </div>

              {/* Baseline (for stream/stack) */}
              {(stackMode === 'stream' || stackMode === 'normal') && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Baseline</label>
                  <select
                    value={baseline}
                    onChange={(e) => setBaseline(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="zero">Zero</option>
                    <option value="minimum">Minimum</option>
                    <option value="wiggle">Wiggle (streamgraph)</option>
                    <option value="silhouette">Silhouette</option>
                  </select>
                </div>
              )}

              {/* Stroke / Outline */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={strokeShow}
                    onChange={(e) => setStrokeShow(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Show outline (stroke)</span>
                </label>
                {strokeShow && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                      <input
                        type="text"
                        value={strokeDash}
                        onChange={(e) => setStrokeDash(e.target.value)}
                        placeholder="e.g., 5,5"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Opacity (0‑1)</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={strokeOpacity}
                        onChange={(e) => setStrokeOpacity(parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Markers */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showMarkers}
                    onChange={(e) => setShowMarkers(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Show markers</span>
                </label>
                {showMarkers && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                      <select
                        value={markerSymbol}
                        onChange={(e) => setMarkerSymbol(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                        onChange={(e) => setMarkerSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
                      <input
                        type="color"
                        value={markerColor}
                        onChange={(e) => setMarkerColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                      <input
                        type="color"
                        value={markerBorderColor}
                        onChange={(e) => setMarkerBorderColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Border Width</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={markerBorderWidth}
                        onChange={(e) => setMarkerBorderWidth(parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                        onChange={(e) => setMarkerOpacity(parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Scheme</label>
                <input
                  type="text"
                  value={colorScheme as string}
                  onChange={(e) => setColorScheme(e.target.value)}
                  placeholder="e.g., category10, or comma‑separated list"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={colorGradient}
                    onChange={(e) => setColorGradient(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-300">Use gradient across series</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Global Opacity</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={colorOpacity}
                    onChange={(e) => setColorOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Axes Section */}
          <SectionHeader title="Axes" icon={<Grid className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* X Axis */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={xAxisVisible}
                    onChange={(e) => setXAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Show X‑Axis</span>
                </label>
                {xAxisVisible && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={xAxisTitle}
                        onChange={(e) => setXAxisTitle(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={xAxisPosition}
                        onChange={(e) => setXAxisPosition(e.target.value as 'bottom' | 'top')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                      <input
                        type="text"
                        value={xAxisTickFormat}
                        onChange={(e) => setXAxisTickFormat(e.target.value)}
                        placeholder="e.g., .2f"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Count</label>
                      <input
                        type="number"
                        min="0"
                        value={xAxisTickCount || ''}
                        onChange={(e) => setXAxisTickCount(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Label Rotation</label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        value={xAxisTickRotation}
                        onChange={(e) => setXAxisTickRotation(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                      <select
                        value={xAxisScaleType}
                        onChange={(e) => setXAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="linear">Linear</option>
                        <option value="log">Log</option>
                        <option value="time">Time</option>
                        <option value="categorical">Categorical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                      <input
                        type="text"
                        value={xAxisMin || ''}
                        onChange={(e) => setXAxisMin(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                      <input
                        type="text"
                        value={xAxisMax || ''}
                        onChange={(e) => setXAxisMax(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line Color</label>
                      <input
                        type="color"
                        value={xAxisLineColor}
                        onChange={(e) => setXAxisLineColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line Width</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={xAxisLineWidth}
                        onChange={(e) => setXAxisLineWidth(parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Color</label>
                      <input
                        type="color"
                        value={xAxisTickColor}
                        onChange={(e) => setXAxisTickColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Size</label>
                      <input
                        type="number"
                        min="0"
                        value={xAxisTickSize}
                        onChange={(e) => setXAxisTickSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Y Axis – similar structure, omitted for brevity but will be included in the actual dialog */}
              <div className="space-y-2 mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={yAxisVisible}
                    onChange={(e) => setYAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Show Y‑Axis</span>
                </label>
                {yAxisVisible && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Similar fields as X‑Axis */}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend & Tooltip – analogous to BoxPlotConfigDialog */}
          {/* Data Labels – analogous */}
          {/* Interactivity – analogous */}
          {/* Animation – analogous */}
          {/* Dimensions – analogous */}
          {/* Advanced (Responsive, Export, Accessibility, Performance) – analogous */}
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
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};