import React, { useState, useEffect } from 'react';
import {
  X, Save, ChevronDown, ChevronRight,
  Palette, Sliders, Eye, Play, Grid, BarChart,
  
  Layers, Hash, Sigma
} from 'lucide-react';
import {
  WaterfallConfig,
  ScaleType,
  SelectionMode,
  AnimationEasing,
  LegendPosition,
  TooltipTrigger,
  ConnectorType,
  LabelPosition
} from '../../types/visualization-configs';

interface WaterfallConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<WaterfallConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: WaterfallConfig) => void;
}

const defaultConfig: WaterfallConfig = {
  title: '',
  xField: '',
  yField: '',
  colorField: '',
  sizeField: '',
  facetField: '',
  orientation: 'vertical',
  barStyle: {
    fillColor: '#3b82f6',
    fillOpacity: 0.7,
    borderColor: '#1e3a8a',
    borderWidth: 1,
    borderRadius: 0,
    width: undefined,
    gap: 2,
  },
  connectors: {
    show: true,
    type: 'line',
    color: '#666666',
    width: 1.5,
    dash: '',
    opacity: 1,
  },
  colorScheme: '#3b82f6',
  colorGradient: false,
  gradientDirection: 'vertical',
  labels: {
    show: false,
    position: 'top',
    format: '.2f',
    fontSize: 11,
    color: '#333333',
    backgroundColor: '',
    backgroundOpacity: 0,
    offset: 4,
    showValue: true,
    showPercentage: false,
    showName: false,
    rotate: false,
  },
  xAxis: {
    visible: true,
    position: 'bottom',
    title: '',
    titleFontSize: 12,
    titleColor: '#333333',
    tickLabelRotation: 0,
    tickFormat: '',
    tickCount: undefined,
    tickColor: '#999999',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
    scaleType: 'categorical',
    sort: 'none',
  },
  yAxis: {
    visible: true,
    position: 'left',
    title: '',
    titleFontSize: 12,
    titleColor: '#333333',
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
    format: '',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showValues: true,
    showPercentage: false,
    showAllSeries: false,
  },
  interactivity: {
    zoom: false,
    pan: false,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
    keyboardNavigation: false,
  },
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
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
};

export const WaterfallConfigDialog: React.FC<WaterfallConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const categoricalColumns = initialMetadata.inputSchema?.filter(
    col => ['string', 'text', 'varchar', 'category'].includes(col.type.toLowerCase())
  ).map(col => col.name) || [];
  const numericalColumns = initialMetadata.inputSchema?.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  ).map(col => col.name) || [];

  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
const [tooltipTrigger, setTooltipTrigger] = useState<TooltipTrigger | undefined>(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);

  // Form state
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [yField, setYField] = useState(initialMetadata.yField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || '');
  const [facetField, setFacetField] = useState(initialMetadata.facetField || '');
  const [orientation, setOrientation] = useState(initialMetadata.orientation || defaultConfig.orientation);

  // Bar style
  const [barFillColor, setBarFillColor] = useState(initialMetadata.barStyle?.fillColor || defaultConfig.barStyle.fillColor);
  const [barFillOpacity, setBarFillOpacity] = useState(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
  const [barBorderColor, setBarBorderColor] = useState(initialMetadata.barStyle?.borderColor || defaultConfig.barStyle.borderColor);
  const [barBorderWidth, setBarBorderWidth] = useState(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
  const [barBorderRadius, setBarBorderRadius] = useState(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);
  const [barWidth, setBarWidth] = useState(initialMetadata.barStyle?.width);
  const [barGap, setBarGap] = useState(initialMetadata.barStyle?.gap ?? defaultConfig.barStyle.gap);

  // Connectors
  const [connectorsShow, setConnectorsShow] = useState(initialMetadata.connectors?.show ?? defaultConfig.connectors.show);
  const [connectorsType, setConnectorsType] = useState<ConnectorType | undefined>(initialMetadata.connectors?.type || defaultConfig.connectors.type);
  const [connectorsColor, setConnectorsColor] = useState(initialMetadata.connectors?.color || defaultConfig.connectors.color);
  const [connectorsWidth, setConnectorsWidth] = useState(initialMetadata.connectors?.width ?? defaultConfig.connectors.width);
  const [connectorsDash, setConnectorsDash] = useState(initialMetadata.connectors?.dash || defaultConfig.connectors.dash);
  const [connectorsOpacity, setConnectorsOpacity] = useState(initialMetadata.connectors?.opacity ?? defaultConfig.connectors.opacity);

  // Color scheme
  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScheme || defaultConfig.colorScheme);
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
  const [gradientDirection, setGradientDirection] = useState(initialMetadata.gradientDirection || defaultConfig.gradientDirection);

  // Labels
  const [labelsShow, setLabelsShow] = useState(initialMetadata.labels?.show ?? defaultConfig.labels.show);
  const [labelsPosition, setLabelsPosition] = useState<LabelPosition | undefined>(initialMetadata.labels?.position || defaultConfig.labels.position);
  const [labelsFormat, setLabelsFormat] = useState(initialMetadata.labels?.format || defaultConfig.labels.format);
  const [labelsFontSize, setLabelsFontSize] = useState(initialMetadata.labels?.fontSize ?? defaultConfig.labels.fontSize);
  const [labelsColor, setLabelsColor] = useState(initialMetadata.labels?.color || defaultConfig.labels.color);
  const [labelsBackgroundColor, setLabelsBackgroundColor] = useState(initialMetadata.labels?.backgroundColor || defaultConfig.labels.backgroundColor);
  const [labelsBackgroundOpacity, setLabelsBackgroundOpacity] = useState(initialMetadata.labels?.backgroundOpacity ?? defaultConfig.labels.backgroundOpacity);
  const [labelsOffset, setLabelsOffset] = useState(initialMetadata.labels?.offset ?? defaultConfig.labels.offset);
  const [labelsShowValue, setLabelsShowValue] = useState(initialMetadata.labels?.showValue ?? defaultConfig.labels.showValue);
  const [labelsShowPercentage, setLabelsShowPercentage] = useState(initialMetadata.labels?.showPercentage ?? defaultConfig.labels.showPercentage);
  const [labelsShowName, setLabelsShowName] = useState(initialMetadata.labels?.showName ?? defaultConfig.labels.showName);
  const [labelsRotate, setLabelsRotate] = useState(initialMetadata.labels?.rotate ?? defaultConfig.labels.rotate);

  // Axes
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis.visible);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || defaultConfig.xAxis.title);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis.tickFormat);
  const [xAxisTickRotation, setXAxisTickRotation] = useState(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis.tickLabelRotation);
  const [xAxisScaleType, setXAxisScaleType] = useState<ScaleType | undefined>(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis.scaleType);
  const [xAxisSort, setXAxisSort] = useState<'asc' | 'desc' | 'none' | undefined>(initialMetadata.xAxis?.sort || defaultConfig.xAxis.sort);

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis.visible);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title || defaultConfig.yAxis.title);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis.tickFormat);
  const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType | undefined>(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis.scaleType);
  const [yAxisMin, setYAxisMin] = useState<number | undefined>(initialMetadata.yAxis?.min);
  const [yAxisMax, setYAxisMax] = useState<number | undefined>(initialMetadata.yAxis?.max);
  const [yAxisZeroBaseline, setYAxisZeroBaseline] = useState(initialMetadata.yAxis?.zeroBaseline ?? defaultConfig.yAxis.zeroBaseline);

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color || defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
  const [gridXLines, setGridXLines] = useState(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
  const [gridYLines, setGridYLines] = useState(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState<LegendPosition | undefined>(initialMetadata.legend?.position || defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState<'horizontal' | 'vertical' | undefined>(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);


  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity.pan);
  const [interactivitySelection, setInteractivitySelection] = useState<SelectionMode | undefined>(initialMetadata.interactivity?.selection || defaultConfig.interactivity.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity.brush);
  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity.hoverHighlight);
  const [interactivityClick, setInteractivityClick] = useState<'none' | 'select' | 'drilldown' | 'custom' | undefined>(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity.clickAction);
  const [interactivityKeyboard, setInteractivityKeyboard] = useState(initialMetadata.interactivity?.keyboardNavigation ?? defaultConfig.interactivity.keyboardNavigation);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation.duration);
  const [animationEasing, setAnimationEasing] = useState<AnimationEasing | undefined>(initialMetadata.animation?.easing || defaultConfig.animation.easing);
  const [animationStagger, setAnimationStagger] = useState(initialMetadata.animation?.stagger ?? defaultConfig.animation.stagger);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Export
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  const [exportFormats, setExportFormats] = useState(initialMetadata.exportFormats || defaultConfig.exportFormats!);

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || '');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? false);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? false);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive ?? false);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    bars: false,
    connectors: false,
    colors: false,
    labels: false,
    axes: false,
    grid: false,
    legend: false,
    tooltip: false,
    interactivity: false,
    animation: false,
    dimensions: true,
    export: false,
    accessibility: false,
    performance: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    if (!initialMetadata) return;
    setTitle(initialMetadata.title || defaultConfig.title);
    setXField(initialMetadata.xField || '');
    setYField(initialMetadata.yField || '');
    setColorField(initialMetadata.colorField || '');
    setSizeField(initialMetadata.sizeField || '');
    setFacetField(initialMetadata.facetField || '');
    setOrientation(initialMetadata.orientation || defaultConfig.orientation);

    setBarFillColor(initialMetadata.barStyle?.fillColor || defaultConfig.barStyle.fillColor);
    setBarFillOpacity(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
    setBarBorderColor(initialMetadata.barStyle?.borderColor || defaultConfig.barStyle.borderColor);
    setBarBorderWidth(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
    setBarBorderRadius(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);
    setBarWidth(initialMetadata.barStyle?.width);
    setBarGap(initialMetadata.barStyle?.gap ?? defaultConfig.barStyle.gap);

    setConnectorsShow(initialMetadata.connectors?.show ?? defaultConfig.connectors.show);
    setConnectorsType(initialMetadata.connectors?.type || defaultConfig.connectors.type);
    setConnectorsColor(initialMetadata.connectors?.color || defaultConfig.connectors.color);
    setConnectorsWidth(initialMetadata.connectors?.width ?? defaultConfig.connectors.width);
    setConnectorsDash(initialMetadata.connectors?.dash || defaultConfig.connectors.dash);
    setConnectorsOpacity(initialMetadata.connectors?.opacity ?? defaultConfig.connectors.opacity);

    setColorScheme(initialMetadata.colorScheme || defaultConfig.colorScheme);
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
    setGradientDirection(initialMetadata.gradientDirection || defaultConfig.gradientDirection);

    setLabelsShow(initialMetadata.labels?.show ?? defaultConfig.labels.show);
    setLabelsPosition(initialMetadata.labels?.position || defaultConfig.labels.position);
    setLabelsFormat(initialMetadata.labels?.format || defaultConfig.labels.format);
    setLabelsFontSize(initialMetadata.labels?.fontSize ?? defaultConfig.labels.fontSize);
    setLabelsColor(initialMetadata.labels?.color || defaultConfig.labels.color);
    setLabelsBackgroundColor(initialMetadata.labels?.backgroundColor || defaultConfig.labels.backgroundColor);
    setLabelsBackgroundOpacity(initialMetadata.labels?.backgroundOpacity ?? defaultConfig.labels.backgroundOpacity);
    setLabelsOffset(initialMetadata.labels?.offset ?? defaultConfig.labels.offset);
    setLabelsShowValue(initialMetadata.labels?.showValue ?? defaultConfig.labels.showValue);
    setLabelsShowPercentage(initialMetadata.labels?.showPercentage ?? defaultConfig.labels.showPercentage);
    setLabelsShowName(initialMetadata.labels?.showName ?? defaultConfig.labels.showName);
    setLabelsRotate(initialMetadata.labels?.rotate ?? defaultConfig.labels.rotate);

    setXAxisVisible(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis.visible);
    setXAxisTitle(initialMetadata.xAxis?.title || defaultConfig.xAxis.title);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis.tickFormat);
    setXAxisTickRotation(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis.tickLabelRotation);
    setXAxisScaleType(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis.scaleType);
    setXAxisSort(initialMetadata.xAxis?.sort || defaultConfig.xAxis.sort);

    setYAxisVisible(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis.visible);
    setYAxisTitle(initialMetadata.yAxis?.title || defaultConfig.yAxis.title);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis.tickFormat);
    setYAxisScaleType(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis.scaleType);
    setYAxisMin(initialMetadata.yAxis?.min);
    setYAxisMax(initialMetadata.yAxis?.max);
    setYAxisZeroBaseline(initialMetadata.yAxis?.zeroBaseline ?? defaultConfig.yAxis.zeroBaseline);

    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setGridColor(initialMetadata.grid?.color || defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
    setGridXLines(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
    setGridYLines(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position || defaultConfig.legend!.position);
    setLegendOrient(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);

setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
setTooltipTrigger(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
setTooltipBg(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
setTooltipBorder(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
setTooltipText(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);

    setInteractivityZoom(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity.zoom);
    setInteractivityPan(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity.pan);
    setInteractivitySelection(initialMetadata.interactivity?.selection || defaultConfig.interactivity.selection);
    setInteractivityBrush(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity.brush);
    setInteractivityHover(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity.hoverHighlight);
    setInteractivityClick(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity.clickAction);
    setInteractivityKeyboard(initialMetadata.interactivity?.keyboardNavigation ?? defaultConfig.interactivity.keyboardNavigation);

    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation.duration);
    setAnimationEasing(initialMetadata.animation?.easing || defaultConfig.animation.easing);
    setAnimationStagger(initialMetadata.animation?.stagger ?? defaultConfig.animation.stagger);

    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

    setExportable(initialMetadata.exportable ?? defaultConfig.exportable);
    setExportFormats(initialMetadata.exportFormats || defaultConfig.exportFormats!);

    setAriaLabel(initialMetadata.accessibility?.ariaLabel || '');
    setHighContrast(initialMetadata.accessibility?.highContrast ?? false);

    setDownsampling(initialMetadata.performance?.downsampling ?? false);
    setMaxPoints(initialMetadata.performance?.maxPoints);
    setProgressive(initialMetadata.performance?.progressive ?? false);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField || !yField) {
      alert('Please select both a category (X) and a value (Y) field.');
      return;
    }

    const config: WaterfallConfig = {
      title,
      xField,
      yField,
      colorField,
      sizeField,
      facetField,
      orientation,
      barStyle: {
        fillColor: barFillColor,
        fillOpacity: barFillOpacity,
        borderColor: barBorderColor,
        borderWidth: barBorderWidth,
        borderRadius: barBorderRadius,
        width: barWidth,
        gap: barGap,
      },
      connectors: {
        show: connectorsShow,
        type: connectorsType,
        color: connectorsColor,
        width: connectorsWidth,
        dash: connectorsDash,
        opacity: connectorsOpacity,
      },
      colorScheme,
      colorGradient,
      gradientDirection,
      labels: {
        show: labelsShow,
        position: labelsPosition,
        format: labelsFormat,
        fontSize: labelsFontSize,
        color: labelsColor,
        backgroundColor: labelsBackgroundColor,
        backgroundOpacity: labelsBackgroundOpacity,
        offset: labelsOffset,
        showValue: labelsShowValue,
        showPercentage: labelsShowPercentage,
        showName: labelsShowName,
        rotate: labelsRotate,
      },
      xAxis: {
        visible: xAxisVisible,
        position: 'bottom',
        title: xAxisTitle,
        titleFontSize: 12,
        titleColor: '#333333',
        tickLabelRotation: xAxisTickRotation,
        tickFormat: xAxisTickFormat,
        tickCount: undefined,
        tickColor: '#999999',
        tickSize: 6,
        lineColor: '#cccccc',
        lineWidth: 1,
        scaleType: xAxisScaleType,
        timeZone: undefined,
        sort: xAxisSort,
      },
      yAxis: {
        visible: yAxisVisible,
        position: 'left',
        title: yAxisTitle,
        titleFontSize: 12,
        titleColor: '#333333',
        tickFormat: yAxisTickFormat,
        tickCount: undefined,
        tickColor: '#999999',
        tickSize: 6,
        lineColor: '#cccccc',
        lineWidth: 1,
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
        itemGap: legendItemGap,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        format: '',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: 12,
        showValues: true,
        showPercentage: false,
        showAllSeries: false,
      },
      interactivity: {
        zoom: interactivityZoom,
        pan: interactivityPan,
        selection: interactivitySelection,
        brush: interactivityBrush,
        hoverHighlight: interactivityHover,
        clickAction: interactivityClick,
        keyboardNavigation: interactivityKeyboard,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
        stagger: animationStagger,
      },
      dimensions: { width, height },
      exportable,
      exportFormats: exportFormats || [],
      accessibility: {
        ariaLabel,
        highContrast,
      },
      performance: {
        downsampling,
        maxPoints,
        progressive,
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Waterfall Chart</h2>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Waterfall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category (X‑axis) <span className="text-red-400">*</span></label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="" disabled>Select a categorical field</option>
                  {categoricalColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value (Y‑axis) <span className="text-red-400">*</span></label>
                <select
                  value={yField}
                  onChange={(e) => setYField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="" disabled>Select a numeric field</option>
                  {numericalColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Field (optional)</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {categoricalColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
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
                    <option key={col} value={col}>{col}</option>
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
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Orientation</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="vertical"
                      checked={orientation === 'vertical'}
                      onChange={(e) => setOrientation(e.target.value as 'vertical')}
                      className="text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Vertical</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="horizontal"
                      checked={orientation === 'horizontal'}
                      onChange={(e) => setOrientation(e.target.value as 'horizontal')}
                      className="text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Horizontal</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Bar Styling Section */}
          <SectionHeader title="Bar Styling" icon={<BarChart className="h-4 w-4" />} sectionKey="bars" />
          {sections.bars && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
                  <input
                    type="color"
                    value={barFillColor as string}
                    onChange={(e) => setBarFillColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opacity (0‑1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={barFillOpacity}
                    onChange={(e) => setBarFillOpacity(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={barBorderColor as string}
                    onChange={(e) => setBarBorderColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Width (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={barBorderWidth}
                    onChange={(e) => setBarBorderWidth(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Radius (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={barBorderRadius}
                    onChange={(e) => setBarBorderRadius(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gap between bars (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={barGap}
                    onChange={(e) => setBarGap(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fixed Bar Width (px, optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={barWidth || ''}
                    onChange={(e) => setBarWidth(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="auto"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Connectors Section */}
          <SectionHeader title="Connectors" icon={<Layers className="h-4 w-4" />} sectionKey="connectors" />
          {sections.connectors && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={connectorsShow}
                  onChange={(e) => setConnectorsShow(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show connector lines</span>
              </label>
              {connectorsShow && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                    <select
                      value={connectorsType}
                      onChange={(e) => setConnectorsType(e.target.value as ConnectorType)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="line">Line</option>
                      <option value="step">Step</option>
                      <option value="curve">Curve</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={connectorsColor}
                      onChange={(e) => setConnectorsColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={connectorsWidth}
                      onChange={(e) => setConnectorsWidth(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                    <input
                      type="text"
                      value={connectorsDash}
                      onChange={(e) => setConnectorsDash(e.target.value)}
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
                      value={connectorsOpacity}
                      onChange={(e) => setConnectorsOpacity(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Colors Section */}
          <SectionHeader title="Colors" icon={<Palette className="h-4 w-4" />} sectionKey="colors" />
          {sections.colors && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Color Scheme <span className="text-xs text-gray-500">(single color or comma‑separated list)</span>
                </label>
                <input
                  type="text"
                  value={colorScheme as string}
                  onChange={(e) => setColorScheme(e.target.value)}
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
                <span className="text-sm text-gray-200">Use gradient fill</span>
              </label>
              {colorGradient && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gradient direction</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="vertical"
                        checked={gradientDirection === 'vertical'}
                        onChange={(e) => setGradientDirection(e.target.value as 'vertical')}
                        className="text-blue-500"
                      />
                      <span className="text-sm text-gray-200">Vertical</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="horizontal"
                        checked={gradientDirection === 'horizontal'}
                        onChange={(e) => setGradientDirection(e.target.value as 'horizontal')}
                        className="text-blue-500"
                      />
                      <span className="text-sm text-gray-200">Horizontal</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Labels Section */}
          <SectionHeader title="Data Labels" icon={<Hash className="h-4 w-4" />} sectionKey="labels" />
          {sections.labels && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={labelsShow}
                  onChange={(e) => setLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Show labels on bars</span>
              </label>
              {labelsShow && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={labelsPosition}
                      onChange={(e) => setLabelsPosition(e.target.value as LabelPosition)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="top">Top</option>
                      <option value="inside">Inside</option>
                      <option value="bottom">Bottom</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={labelsFormat}
                      onChange={(e) => setLabelsFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size (px)</label>
                    <input
                      type="number"
                      min="6"
                      max="30"
                      value={labelsFontSize}
                      onChange={(e) => setLabelsFontSize(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={labelsColor}
                      onChange={(e) => setLabelsColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={labelsBackgroundColor}
                      onChange={(e) => setLabelsBackgroundColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={labelsBackgroundOpacity}
                      onChange={(e) => setLabelsBackgroundOpacity(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Offset (px)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={labelsOffset}
                      onChange={(e) => setLabelsOffset(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelsShowValue}
                        onChange={(e) => setLabelsShowValue(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">Show value</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelsShowPercentage}
                        onChange={(e) => setLabelsShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">Show percentage</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelsShowName}
                        onChange={(e) => setLabelsShowName(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">Show category name</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelsRotate}
                        onChange={(e) => setLabelsRotate(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">Rotate labels</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Axes & Grid Section */}
          <SectionHeader title="Axes & Grid" icon={<Grid className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">X‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={xAxisVisible}
                      onChange={(e) => setXAxisVisible(e.target.checked)}
                      className="rounded border-gray-600 text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Show axis</span>
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
                    <label className="block text-xs text-gray-400 mb-1">Tick format</label>
                    <input
                      type="text"
                      value={xAxisTickFormat}
                      onChange={(e) => setXAxisTickFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick rotation (°)</label>
                    <input
                      type="number"
                      min="-90"
                      max="90"
                      value={xAxisTickRotation}
                      onChange={(e) => setXAxisTickRotation(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scale type</label>
                    <select
                      value={xAxisScaleType}
                      onChange={(e) => setXAxisScaleType(e.target.value as ScaleType)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="categorical">Categorical</option>
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Category order</label>
                    <select
                      value={xAxisSort}
                      onChange={(e) => setXAxisSort(e.target.value as 'asc' | 'desc' | 'none')}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="none">As‑is</option>
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Y‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={yAxisVisible}
                      onChange={(e) => setYAxisVisible(e.target.checked)}
                      className="rounded border-gray-600 text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Show axis</span>
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
                    <label className="block text-xs text-gray-400 mb-1">Tick format</label>
                    <input
                      type="text"
                      value={yAxisTickFormat}
                      onChange={(e) => setYAxisTickFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scale type</label>
                    <select
                      value={yAxisScaleType}
                      onChange={(e) => setYAxisScaleType(e.target.value as ScaleType)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                    <input
                      type="number"
                      value={yAxisMax ?? ''}
                      onChange={(e) => setYAxisMax(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={yAxisZeroBaseline}
                      onChange={(e) => setYAxisZeroBaseline(e.target.checked)}
                      className="rounded border-gray-600 text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Force zero baseline</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Grid</h4>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Show grid lines</span>
                </label>
                {showGrid && (
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
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-200">Vertical lines</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={gridYLines}
                        onChange={(e) => setGridYLines(e.target.checked)}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-xs text-gray-200">Horizontal lines</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend Section */}
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
                <span className="text-sm text-gray-200">Show legend</span>
              </label>
              {showLegend && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={legendPosition}
                      onChange={(e) => setLegendPosition(e.target.value as LegendPosition)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Item gap (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={legendItemGap}
                      onChange={(e) => setLegendItemGap(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tooltip Section */}
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
                <span className="text-sm text-gray-200">Show tooltip</span>
              </label>
              {tooltipShow && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                    <select
                      value={tooltipTrigger}
                      onChange={(e) => setTooltipTrigger(e.target.value as TooltipTrigger)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="item">Item (hover bar)</option>
                      <option value="axis">Axis (hover anywhere)</option>
                      <option value="none">None</option>
                    </select>
                  </div>
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
                    <label className="block text-xs text-gray-400 mb-1">Text color</label>
                    <input
                      type="color"
                      value={tooltipText}
                      onChange={(e) => setTooltipText(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Sliders className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityZoom}
                    onChange={(e) => setInteractivityZoom(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityPan}
                    onChange={(e) => setInteractivityPan(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityBrush}
                    onChange={(e) => setInteractivityBrush(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Brush selection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityHover}
                    onChange={(e) => setInteractivityHover(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Hover highlight</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityKeyboard}
                    onChange={(e) => setInteractivityKeyboard(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Keyboard navigation</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Selection mode</label>
                <select
                  value={interactivitySelection}
                  onChange={(e) => setInteractivitySelection(e.target.value as SelectionMode)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                >
                  <option value="none">None</option>
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Click action</label>
                <select
                  value={interactivityClick}
                  onChange={(e) => setInteractivityClick(e.target.value as 'none' | 'select' | 'drilldown' | 'custom')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                >
                  <option value="none">None</option>
                  <option value="select">Select</option>
                  <option value="drilldown">Drill down</option>
                  <option value="custom">Custom</option>
                </select>
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
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Enable animation</span>
              </label>
              {animationEnabled && (
                <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e) => setAnimationEasing(e.target.value as AnimationEasing)}
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
                      className="rounded border-gray-600 text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Stagger bars</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Dimensions Section */}
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

          {/* Export & Accessibility Section */}
          <SectionHeader title="Export & Accessibility" icon={<Eye className="h-4 w-4" />} sectionKey="export" />
          {sections.export && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportable}
                  onChange={(e) => setExportable(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Allow export</span>
              </label>
              {exportable && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Export formats</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value="png"
                        checked={exportFormats.includes('png')}
                        onChange={(e) => {
                          const value = e.target.value as 'png' | 'svg' | 'pdf';
                          if (e.target.checked) {
                            setExportFormats([...exportFormats, value]);
                          } else {
                            setExportFormats(exportFormats.filter(f => f !== value));
                          }
                        }}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">PNG</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value="svg"
                        checked={exportFormats.includes('svg')}
                        onChange={(e) => {
                          const value = e.target.value as 'png' | 'svg' | 'pdf';
                          if (e.target.checked) {
                            setExportFormats([...exportFormats, value]);
                          } else {
                            setExportFormats(exportFormats.filter(f => f !== value));
                          }
                        }}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">SVG</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value="pdf"
                        checked={exportFormats.includes('pdf')}
                        onChange={(e) => {
                          const value = e.target.value as 'png' | 'svg' | 'pdf';
                          if (e.target.checked) {
                            setExportFormats([...exportFormats, value]);
                          } else {
                            setExportFormats(exportFormats.filter(f => f !== value));
                          }
                        }}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-200">PDF</span>
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  placeholder="Describe the chart for screen readers"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">High contrast mode</span>
              </label>
            </div>
          )}

          {/* Performance Section */}
          <SectionHeader title="Performance" icon={<Sigma className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={downsampling}
                  onChange={(e) => setDownsampling(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Downsample (for large data)</span>
              </label>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max points (optional)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={maxPoints || ''}
                  onChange={(e) => setMaxPoints(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 5000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={progressive}
                  onChange={(e) => setProgressive(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Progressive rendering</span>
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