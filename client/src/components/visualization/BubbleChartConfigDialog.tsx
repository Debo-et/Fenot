import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Grid,
  ChevronDown,
  ChevronRight,
  Sliders,
  Eye,
  Play,
  Circle,
  Square,
  Diamond,
  X as XIcon,
  Maximize2,
  MousePointer,
  Activity,
  Layers,
} from 'lucide-react';
import { BubbleChartConfig } from '../../types/visualization-configs';

// ==================== PROPS ====================
interface BubbleChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<BubbleChartConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: BubbleChartConfig) => void;
}

// ==================== DEFAULT CONFIGURATION ====================
const defaultConfig: BubbleChartConfig = {
  title: '',
  description: '',
  xField: '',
  yField: '',
  sizeField: '',
  colorField: '',
  shapeField: '',
  facetField: '',
  point: {
    symbol: 'circle',
    sizeScale: 'linear',
    sizeMin: 5,
    sizeMax: 30,
    baseSize: 10,
    opacity: 0.8,
    colorOpacity: 1,
    color: '#3b82f6',
    colorScale: 'categorical',
    colorPalette: '#3b82f6',
    borderColor: '#ffffff',
    borderWidth: 1,
    borderOpacity: 0.5,
    blendMode: 'normal',
  },
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
    scaleType: 'linear',
    timeZone: 'UTC',
    min: undefined,
    max: undefined,
    zeroBaseline: true,
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
    timeZone: 'UTC',
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
    itemWidth: 20,
    itemHeight: 14,
    symbolSize: 8,
    fontSize: 11,
    color: '#cccccc',
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
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
    customClickHandler: '',
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
    ariaLabel: 'Bubble chart',
    ariaDescription: '',
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

// ==================== HELPER ====================
const stringifyColors = (colors?: string | string[]): string => {
  if (!colors) return '';
  if (Array.isArray(colors)) return colors.join(', ');
  return colors;
};

// ==================== MAIN DIALOG ====================
export const BubbleChartConfigDialog: React.FC<BubbleChartConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const numericColumns = availableColumns.filter(col =>
    ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const categoricalColumns = availableColumns.filter(col =>
    ['string', 'text', 'varchar', 'char', 'category'].includes(col.type.toLowerCase())
  );
  const timeColumns = availableColumns.filter(col =>
    ['date', 'datetime', 'timestamp', 'time'].includes(col.type.toLowerCase())
  );

  // State for all config fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description || defaultConfig.description);
  const [xField, setXField] = useState(initialMetadata.xField || defaultConfig.xField);
  const [yField, setYField] = useState(initialMetadata.yField || defaultConfig.yField);
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || defaultConfig.sizeField);
  const [colorField, setColorField] = useState(initialMetadata.colorField || defaultConfig.colorField);
  const [shapeField, setShapeField] = useState(initialMetadata.shapeField || defaultConfig.shapeField);
  const [facetField, setFacetField] = useState(initialMetadata.facetField || defaultConfig.facetField);

  // Point styling
  const [pointSymbol, setPointSymbol] = useState(initialMetadata.point?.symbol || defaultConfig.point.symbol!);
  const [sizeScale, setSizeScale] = useState(initialMetadata.point?.sizeScale || defaultConfig.point.sizeScale!);
  const [sizeMin, setSizeMin] = useState(initialMetadata.point?.sizeMin ?? defaultConfig.point.sizeMin!);
  const [sizeMax, setSizeMax] = useState(initialMetadata.point?.sizeMax ?? defaultConfig.point.sizeMax!);
  const [baseSize, setBaseSize] = useState(initialMetadata.point?.baseSize ?? defaultConfig.point.baseSize!);
  const [pointOpacity, setPointOpacity] = useState(initialMetadata.point?.opacity ?? defaultConfig.point.opacity!);
  const [colorOpacity, setColorOpacity] = useState(initialMetadata.point?.colorOpacity ?? defaultConfig.point.colorOpacity!);
  const [pointColor, setPointColor] = useState(initialMetadata.point?.color || defaultConfig.point.color!);
  const [colorScale, setColorScale] = useState(initialMetadata.point?.colorScale || defaultConfig.point.colorScale!);
  const [colorPaletteInput, setColorPaletteInput] = useState(stringifyColors(initialMetadata.point?.colorPalette ?? defaultConfig.point.colorPalette));
  const [borderColor, setBorderColor] = useState(initialMetadata.point?.borderColor || defaultConfig.point.borderColor!);
  const [borderWidth, setBorderWidth] = useState(initialMetadata.point?.borderWidth ?? defaultConfig.point.borderWidth!);
  const [borderOpacity, setBorderOpacity] = useState(initialMetadata.point?.borderOpacity ?? defaultConfig.point.borderOpacity!);
  const [blendMode, setBlendMode] = useState(initialMetadata.point?.blendMode || defaultConfig.point.blendMode!);

  // Axes
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
  const [xAxisScaleType, setXAxisScaleType] = useState(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
  const [xAxisMin, setXAxisMin] = useState(initialMetadata.xAxis?.min);
  const [xAxisMax, setXAxisMax] = useState(initialMetadata.xAxis?.max);
  const [xAxisZeroBaseline, setXAxisZeroBaseline] = useState(initialMetadata.xAxis?.zeroBaseline ?? defaultConfig.xAxis!.zeroBaseline);

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title || defaultConfig.yAxis!.title);
  const [yAxisScaleType, setYAxisScaleType] = useState(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis!.scaleType);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis!.tickFormat);
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
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title || defaultConfig.legend!.title);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format);

  // Interactivity
  const [zoomEnabled, setZoomEnabled] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [panEnabled, setPanEnabled] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [selectionMode, setSelectionMode] = useState(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
  const [brushEnabled, setBrushEnabled] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
  const [hoverHighlight, setHoverHighlight] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);

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
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  // --- FIX: Explicitly type exportFormats as the union of allowed literals ---
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(
    (initialMetadata.exportFormats as Array<'png' | 'svg' | 'pdf'>) || defaultConfig.exportFormats!
  );

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || defaultConfig.accessibility!.ariaLabel);
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    mapping: false,
    point: false,
    axes: false,
    grid: false,
    legend: false,
    tooltip: false,
    interactivity: false,
    animation: false,
    dimensions: false,
    advanced: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setDescription(initialMetadata.description || defaultConfig.description);
    setXField(initialMetadata.xField || defaultConfig.xField);
    setYField(initialMetadata.yField || defaultConfig.yField);
    setSizeField(initialMetadata.sizeField || defaultConfig.sizeField);
    setColorField(initialMetadata.colorField || defaultConfig.colorField);
    setShapeField(initialMetadata.shapeField || defaultConfig.shapeField);
    setFacetField(initialMetadata.facetField || defaultConfig.facetField);

    setPointSymbol(initialMetadata.point?.symbol || defaultConfig.point.symbol!);
    setSizeScale(initialMetadata.point?.sizeScale || defaultConfig.point.sizeScale!);
    setSizeMin(initialMetadata.point?.sizeMin ?? defaultConfig.point.sizeMin!);
    setSizeMax(initialMetadata.point?.sizeMax ?? defaultConfig.point.sizeMax!);
    setBaseSize(initialMetadata.point?.baseSize ?? defaultConfig.point.baseSize!);
    setPointOpacity(initialMetadata.point?.opacity ?? defaultConfig.point.opacity!);
    setColorOpacity(initialMetadata.point?.colorOpacity ?? defaultConfig.point.colorOpacity!);
    setPointColor(initialMetadata.point?.color || defaultConfig.point.color!);
    setColorScale(initialMetadata.point?.colorScale || defaultConfig.point.colorScale!);
    setColorPaletteInput(stringifyColors(initialMetadata.point?.colorPalette ?? defaultConfig.point.colorPalette));
    setBorderColor(initialMetadata.point?.borderColor || defaultConfig.point.borderColor!);
    setBorderWidth(initialMetadata.point?.borderWidth ?? defaultConfig.point.borderWidth!);
    setBorderOpacity(initialMetadata.point?.borderOpacity ?? defaultConfig.point.borderOpacity!);
    setBlendMode(initialMetadata.point?.blendMode || defaultConfig.point.blendMode!);

    setXAxisVisible(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
    setXAxisTitle(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
    setXAxisScaleType(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
    setXAxisMin(initialMetadata.xAxis?.min);
    setXAxisMax(initialMetadata.xAxis?.max);
    setXAxisZeroBaseline(initialMetadata.xAxis?.zeroBaseline ?? defaultConfig.xAxis!.zeroBaseline);

    setYAxisVisible(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
    setYAxisTitle(initialMetadata.yAxis?.title || defaultConfig.yAxis!.title);
    setYAxisScaleType(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis!.scaleType);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis!.tickFormat);
    setYAxisMin(initialMetadata.yAxis?.min);
    setYAxisMax(initialMetadata.yAxis?.max);
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
    setLegendTitle(initialMetadata.legend?.title || defaultConfig.legend!.title);

    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
    setTooltipFormat(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format);

    setZoomEnabled(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
    setPanEnabled(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
    setSelectionMode(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
    setBrushEnabled(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
    setHoverHighlight(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);

    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing || defaultConfig.animation!.easing);
    setAnimationStagger(initialMetadata.animation?.stagger ?? defaultConfig.animation!.stagger);

    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable);
    setExportFormats(
      (initialMetadata.exportFormats as Array<'png' | 'svg' | 'pdf'>) || defaultConfig.exportFormats!
    );

    setAriaLabel(initialMetadata.accessibility?.ariaLabel || defaultConfig.accessibility!.ariaLabel);
    setHighContrast(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);

    setDownsampling(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
    setMaxPoints(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField || !yField || !sizeField) {
      alert('Please select X, Y, and Size fields.');
      return;
    }

    // Parse color palette input
    let colorPalette: string | string[] = colorPaletteInput;
    if (colorPaletteInput.includes(',')) {
      colorPalette = colorPaletteInput.split(',').map(s => s.trim());
    }

    const config: BubbleChartConfig = {
      title,
      description,
      xField,
      yField,
      sizeField,
      colorField,
      shapeField,
      facetField,
      point: {
        symbol: pointSymbol,
        sizeScale,
        sizeMin,
        sizeMax,
        baseSize,
        opacity: pointOpacity,
        colorOpacity,
        color: pointColor,
        colorScale,
        colorPalette,
        borderColor,
        borderWidth,
        borderOpacity,
        blendMode,
      },
      xAxis: {
        visible: xAxisVisible,
        position: defaultConfig.xAxis!.position,
        title: xAxisTitle,
        titleFontSize: defaultConfig.xAxis!.titleFontSize,
        titleColor: defaultConfig.xAxis!.titleColor,
        tickLabelRotation: defaultConfig.xAxis!.tickLabelRotation,
        tickFormat: xAxisTickFormat,
        tickCount: defaultConfig.xAxis!.tickCount,
        tickColor: defaultConfig.xAxis!.tickColor,
        tickSize: defaultConfig.xAxis!.tickSize,
        lineColor: defaultConfig.xAxis!.lineColor,
        lineWidth: defaultConfig.xAxis!.lineWidth,
        scaleType: xAxisScaleType,
        timeZone: defaultConfig.xAxis!.timeZone,
        min: xAxisMin,
        max: xAxisMax,
        zeroBaseline: xAxisZeroBaseline,
      },
      yAxis: {
        visible: yAxisVisible,
        position: defaultConfig.yAxis!.position,
        title: yAxisTitle,
        titleFontSize: defaultConfig.yAxis!.titleFontSize,
        titleColor: defaultConfig.yAxis!.titleColor,
        tickFormat: yAxisTickFormat,
        tickCount: defaultConfig.yAxis!.tickCount,
        tickColor: defaultConfig.yAxis!.tickColor,
        tickSize: defaultConfig.yAxis!.tickSize,
        lineColor: defaultConfig.yAxis!.lineColor,
        lineWidth: defaultConfig.yAxis!.lineWidth,
        scaleType: yAxisScaleType,
        timeZone: defaultConfig.yAxis!.timeZone,
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
        titleFontSize: defaultConfig.legend!.titleFontSize,
        itemGap: defaultConfig.legend!.itemGap,
        itemWidth: defaultConfig.legend!.itemWidth,
        itemHeight: defaultConfig.legend!.itemHeight,
        symbolSize: defaultConfig.legend!.symbolSize,
        fontSize: defaultConfig.legend!.fontSize,
        color: defaultConfig.legend!.color,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        format: tooltipFormat,
        backgroundColor: defaultConfig.tooltip!.backgroundColor,
        borderColor: defaultConfig.tooltip!.borderColor,
        textColor: defaultConfig.tooltip!.textColor,
        fontSize: defaultConfig.tooltip!.fontSize,
        showValues: defaultConfig.tooltip!.showValues,
        showPercentage: defaultConfig.tooltip!.showPercentage,
      },
      interactivity: {
        zoom: zoomEnabled,
        pan: panEnabled,
        selection: selectionMode,
        brush: brushEnabled,
        hoverHighlight,
        clickAction: defaultConfig.interactivity!.clickAction,
        customClickHandler: defaultConfig.interactivity!.customClickHandler,
      },
      annotations: defaultConfig.annotations,
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
        stagger: animationStagger,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth: defaultConfig.responsive!.minWidth,
        minHeight: defaultConfig.responsive!.minHeight,
        aspectRatio: defaultConfig.responsive!.aspectRatio,
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel,
        ariaDescription: defaultConfig.accessibility!.ariaDescription,
        highContrast,
        focusable: defaultConfig.accessibility!.focusable,
      },
      performance: {
        downsampling,
        maxPoints,
        progressive: defaultConfig.performance!.progressive,
        virtualization: defaultConfig.performance!.virtualization,
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
    { value: 'star', label: 'Star', icon: <Layers className="h-4 w-4" /> },
    { value: 'none', label: 'None', icon: <MousePointer className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Circle className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Bubble Chart</h2>
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
                  placeholder="My Bubble Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Brief description"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Data Mapping Section */}
          <SectionHeader title="Data Mapping" icon={<Layers className="h-4 w-4" />} sectionKey="mapping" />
          {sections.mapping && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    X Field <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={xField}
                    onChange={(e) => setXField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Select column</option>
                    <optgroup label="Numeric">
                      {numericColumns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Time">
                      {timeColumns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Y Field <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={yField}
                    onChange={(e) => setYField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Select column</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Size Field <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={sizeField}
                    onChange={(e) => setSizeField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Select column</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color Field</label>
                  <select
                    value={colorField}
                    onChange={(e) => setColorField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">None</option>
                    <optgroup label="Categorical">
                      {categoricalColumns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Numeric">
                      {numericColumns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Shape Field</label>
                  <select
                    value={shapeField}
                    onChange={(e) => setShapeField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">None</option>
                    {categoricalColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Facet Field</label>
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
            </div>
          )}

          {/* Point Styling Section */}
          <SectionHeader title="Point Styling" icon={<Circle className="h-4 w-4" />} sectionKey="point" />
          {sections.point && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                  <select
                    value={pointSymbol}
                    onChange={(e) => setPointSymbol(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    {symbolOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Size Scale</label>
                  <select
                    value={sizeScale}
                    onChange={(e) => setSizeScale(e.target.value as 'linear' | 'log')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="linear">Linear</option>
                    <option value="log">Logarithmic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={sizeMin}
                    onChange={(e) => setSizeMin(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={sizeMax}
                    onChange={(e) => setSizeMax(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Base Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={baseSize}
                    onChange={(e) => setBaseSize(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Opacity (0-1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={pointOpacity}
                    onChange={(e) => setPointOpacity(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color Opacity</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fixed Color</label>
                  <input
                    type="color"
                    value={pointColor}
                    onChange={(e) => setPointColor(e.target.value)}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color Scale</label>
                  <select
                    value={colorScale}
                    onChange={(e) => setColorScale(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="categorical">Categorical</option>
                    <option value="linear">Linear</option>
                    <option value="log">Log</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Color Palette <span className="text-xs text-gray-500">(single or comma‑separated)</span>
                  </label>
                  <input
                    type="text"
                    value={colorPaletteInput}
                    onChange={(e) => setColorPaletteInput(e.target.value)}
                    placeholder="#3b82f6, #ef4444, #10b981"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Border Width</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Border Opacity</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={borderOpacity}
                    onChange={(e) => setBorderOpacity(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Blend Mode</label>
                  <select
                    value={blendMode}
                    onChange={(e) => setBlendMode(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Axes Section */}
          <SectionHeader title="Axes" icon={<Grid className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-sm font-semibold text-gray-300">X‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={xAxisVisible}
                      onChange={(e) => setXAxisVisible(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Show X‑Axis</span>
                  </label>
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
                    <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                    <input
                      type="text"
                      value={xAxisTickFormat}
                      onChange={(e) => setXAxisTickFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                    <input
                      type="text"
                      value={xAxisMin || ''}
                      onChange={(e) => setXAxisMin(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      placeholder="auto"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                    <input
                      type="text"
                      value={xAxisMax || ''}
                      onChange={(e) => setXAxisMax(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      placeholder="auto"
                    />
                  </div>
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={xAxisZeroBaseline}
                      onChange={(e) => setXAxisZeroBaseline(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Force zero baseline</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-sm font-semibold text-gray-300">Y‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={yAxisVisible}
                      onChange={(e) => setYAxisVisible(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Show Y‑Axis</span>
                  </label>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={yAxisTitle}
                      onChange={(e) => setYAxisTitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                    <select
                      value={yAxisScaleType}
                      onChange={(e) => setYAxisScaleType(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                      <option value="categorical">Categorical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                    <input
                      type="text"
                      value={yAxisTickFormat}
                      onChange={(e) => setYAxisTickFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                    <input
                      type="text"
                      value={yAxisMin || ''}
                      onChange={(e) => setYAxisMin(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      placeholder="auto"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                    <input
                      type="text"
                      value={yAxisMax || ''}
                      onChange={(e) => setYAxisMax(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      placeholder="auto"
                    />
                  </div>
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={yAxisZeroBaseline}
                      onChange={(e) => setYAxisZeroBaseline(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Force zero baseline</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Grid Section */}
          <SectionHeader title="Grid" icon={<Grid className="h-4 w-4" />} sectionKey="grid" />
          {sections.grid && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show grid lines</span>
              </label>
              {showGrid && (
                <div className="grid grid-cols-2 gap-3 mt-2">
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
                    <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={gridWidth}
                      onChange={(e) => setGridWidth(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                    <input
                      type="text"
                      value={gridDash}
                      onChange={(e) => setGridDash(e.target.value)}
                      placeholder="e.g., 5,5"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={gridXLines}
                      onChange={(e) => setGridXLines(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-xs text-gray-200">X lines</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={gridYLines}
                      onChange={(e) => setGridYLines(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-xs text-gray-200">Y lines</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Legend & Tooltip Section */}
          <SectionHeader title="Legend & Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="legend" />
          {sections.legend && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                    <span className="text-sm text-gray-200">Show legend</span>
                </label>
                {showLegend && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={legendPosition}
                        onChange={(e) => setLegendPosition(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="top-left">Top‑Left</option>
                        <option value="top-right">Top‑Right</option>
                        <option value="bottom-left">Bottom‑Left</option>
                        <option value="bottom-right">Bottom‑Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Orientation</label>
                      <select
                        value={legendOrient}
                        onChange={(e) => setLegendOrient(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={legendTitle}
                        onChange={(e) => setLegendTitle(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tooltipShow}
                    onChange={(e) => setTooltipShow(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show tooltip</span>
                </label>
                {tooltipShow && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                      <select
                        value={tooltipTrigger}
                        onChange={(e) => setTooltipTrigger(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="item">Item (per point)</option>
                        <option value="axis">Axis (all points)</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Format</label>
                      <input
                        type="text"
                        value={tooltipFormat}
                        onChange={(e) => setTooltipFormat(e.target.value)}
                        placeholder="e.g., x: {{x}}, y: {{y}}"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<MousePointer className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={zoomEnabled}
                    onChange={(e) => setZoomEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Enable zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={panEnabled}
                    onChange={(e) => setPanEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Enable pan</span>
                </label>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Selection mode</label>
                  <select
                    value={selectionMode}
                    onChange={(e) => setSelectionMode(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="none">None</option>
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={brushEnabled}
                    onChange={(e) => setBrushEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Enable brush selection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hoverHighlight}
                    onChange={(e) => setHoverHighlight(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Highlight on hover</span>
                </label>
              </div>
            </div>
          )}

          {/* Animation Section */}
          <SectionHeader title="Animation" icon={<Play className="h-4 w-4" />} sectionKey="animation" />
          {sections.animation && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Enable animation</span>
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Easing</label>
                    <select
                      value={animationEasing}
                      onChange={(e) => setAnimationEasing(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="linear">Linear</option>
                      <option value="ease">Ease</option>
                      <option value="ease-in">Ease‑in</option>
                      <option value="ease-out">Ease‑out</option>
                      <option value="ease-in-out">Ease‑in‑out</option>
                    </select>
                  </div>
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={animationStagger}
                      onChange={(e) => setAnimationStagger(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-200">Stagger points</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Dimensions Section */}
          <SectionHeader title="Dimensions" icon={<Maximize2 className="h-4 w-4" />} sectionKey="dimensions" />
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

          {/* Advanced Section (Responsive, Export, Accessibility, Performance) */}
          <SectionHeader title="Advanced" icon={<Layers className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Responsive */}
              <div className="space-y-2 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responsiveEnabled}
                    onChange={(e) => setResponsiveEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Enable responsive resizing</span>
                </label>
              </div>

              {/* Export */}
              <div className="space-y-2 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportable}
                    onChange={(e) => setExportable(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Allow export</span>
                </label>
                {exportable && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Export formats</label>
                    <div className="flex space-x-3">
                      {['png', 'svg', 'pdf'].map(f => (
                        <label key={f} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            value={f}
                            checked={exportFormats.includes(f as 'png' | 'svg' | 'pdf')}
                            onChange={(e) => {
                              const value = e.target.value as 'png' | 'svg' | 'pdf';
                              setExportFormats(prev =>
                                e.target.checked
                                  ? [...prev, value]
                                  : prev.filter(v => v !== value)
                              );
                            }}
                            className="rounded border-gray-600 text-purple-500"
                          />
                          <span className="text-xs text-gray-300 uppercase">{f}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accessibility */}
              <div className="space-y-2 p-3 bg-gray-800 rounded-md">
                <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                />
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">High contrast mode</span>
                </label>
              </div>

              {/* Performance */}
              <div className="space-y-2 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={downsampling}
                    onChange={(e) => setDownsampling(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Enable downsampling (for large data)</span>
                </label>
                {downsampling && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max points</label>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                )}
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