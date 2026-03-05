// src/components/visualization/HistogramConfigDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  Grid,
  ChevronDown,
  ChevronRight,
  Sliders,
  Eye,
  Play,
  Wrench,
  BarChart,
  Layers,
  ScatterChart,
  LineChart,
  Settings,
  Cpu,
} from 'lucide-react';

import { HistogramConfig } from '../../types/visualization-configs';

interface HistogramConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<HistogramConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: HistogramConfig) => void;
}

const defaultConfig: HistogramConfig = {
  title: '',
  xField: '',
  colorField: '',
  facetField: '',
  binning: {
    method: 'auto',
    bins: 30,
    binWidth: undefined,
    binRange: {},
    autoBinStrategy: 'freedman-diaconis',
  },
  orientation: 'vertical',
  normalization: 'count',
  cumulative: false,
  barStyle: {
    fillColor: '#3b82f6',
    fillOpacity: 0.7,
    borderColor: '#1e3a8a',
    borderWidth: 1,
    borderRadius: 0,
    gap: 1,
  },
  colorScheme: '#3b82f6',
  colorGradient: false,
  gradientDirection: 'vertical',
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
    showBinRange: true,
  },
  dataLabels: {
    show: false,
    position: 'top',
    fontSize: 11,
    color: '#333333',
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
  },
  annotations: [],
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
  },
  dimensions: {
    width: 600,
    height: 400,
  },
  responsive: {
    enabled: true,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    ariaLabel: 'Histogram chart',
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    progressive: false,
  },
};

export const HistogramConfigDialog: React.FC<HistogramConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const numericColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const categoricalColumns = availableColumns.filter(
    col => col.type.toLowerCase() === 'string' || col.type.toLowerCase() === 'text' || col.type.toLowerCase() === 'varchar'
  );

  // State for all config fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [facetField, setFacetField] = useState(initialMetadata.facetField || '');

  const [binMethod, setBinMethod] = useState(initialMetadata.binning?.method || defaultConfig.binning.method);
  const [binCount, setBinCount] = useState(initialMetadata.binning?.bins ?? defaultConfig.binning.bins);
  const [binWidth, setBinWidth] = useState(initialMetadata.binning?.binWidth);
  const [binMin, setBinMin] = useState(initialMetadata.binning?.binRange?.min);
  const [binMax, setBinMax] = useState(initialMetadata.binning?.binRange?.max);
  const [autoBinStrategy, setAutoBinStrategy] = useState(initialMetadata.binning?.autoBinStrategy || defaultConfig.binning.autoBinStrategy);

  const [orientation, setOrientation] = useState(initialMetadata.orientation || defaultConfig.orientation);
  const [normalization, setNormalization] = useState(initialMetadata.normalization || defaultConfig.normalization);
  const [cumulative, setCumulative] = useState(initialMetadata.cumulative ?? defaultConfig.cumulative);

  const [barFillColor, setBarFillColor] = useState(initialMetadata.barStyle?.fillColor || defaultConfig.barStyle.fillColor);
  const [barFillOpacity, setBarFillOpacity] = useState(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
  const [barBorderColor, setBarBorderColor] = useState(initialMetadata.barStyle?.borderColor || defaultConfig.barStyle.borderColor);
  const [barBorderWidth, setBarBorderWidth] = useState(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
  const [barBorderRadius, setBarBorderRadius] = useState(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);
  const [barGap, setBarGap] = useState(initialMetadata.barStyle?.gap ?? defaultConfig.barStyle.gap);

  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScheme || defaultConfig.colorScheme);
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
  const [gradientDirection, setGradientDirection] = useState(initialMetadata.gradientDirection || defaultConfig.gradientDirection);

  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
  const [xAxisTickCount, setXAxisTickCount] = useState(initialMetadata.xAxis?.tickCount);
  const [xAxisRotate, setXAxisRotate] = useState(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor || defaultConfig.xAxis!.lineColor);
  const [xAxisLineWidth, setXAxisLineWidth] = useState(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor || defaultConfig.xAxis!.tickColor);
  const [xAxisTickSize, setXAxisTickSize] = useState(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
  const [xAxisScaleType, setXAxisScaleType] = useState(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
  const [xAxisMin, setXAxisMin] = useState(initialMetadata.xAxis?.min);
  const [xAxisMax, setXAxisMax] = useState(initialMetadata.xAxis?.max);

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
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

  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color || defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
  const [gridXLines, setGridXLines] = useState(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
  const [gridYLines, setGridYLines] = useState(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);

  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
  const [tooltipShowValues, setTooltipShowValues] = useState(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
  const [tooltipShowPercentage, setTooltipShowPercentage] = useState(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);
  const [tooltipShowBinRange, setTooltipShowBinRange] = useState(initialMetadata.tooltip?.showBinRange ?? defaultConfig.tooltip!.showBinRange);

  const [dataLabelsShow, setDataLabelsShow] = useState(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
  const [dataLabelsPosition, setDataLabelsPosition] = useState(initialMetadata.dataLabels?.position || defaultConfig.dataLabels!.position);
  const [dataLabelsFormat, setDataLabelsFormat] = useState(initialMetadata.dataLabels?.format || '');
  const [dataLabelsFontSize, setDataLabelsFontSize] = useState(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
  const [dataLabelsColor, setDataLabelsColor] = useState(initialMetadata.dataLabels?.color || defaultConfig.dataLabels!.color);
  const [dataLabelsOffset, setDataLabelsOffset] = useState(initialMetadata.dataLabels?.offset ?? 0);

  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [interactivitySelection, setInteractivitySelection] = useState(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
  const [interactivityClickAction, setInteractivityClickAction] = useState(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction);

  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || defaultConfig.animation!.easing);

  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(initialMetadata.exportFormats || defaultConfig.exportFormats!);

  const [accessibilityAriaLabel, setAccessibilityAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || defaultConfig.accessibility!.ariaLabel);
  const [accessibilityHighContrast, setAccessibilityHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [accessibilityFocusable, setAccessibilityFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);

  const [performanceDownsampling, setPerformanceDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [performanceProgressive, setPerformanceProgressive] = useState(initialMetadata.performance?.progressive ?? defaultConfig.performance!.progressive);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    binning: false,
    bars: false,
    axes: false,
    grid: false,
    legend: false,
    tooltip: false,
    labels: false,
    interactivity: false,
    annotations: false,
    animation: false,
    dimensions: false,
    advanced: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes (e.g., different node selected)
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setXField(initialMetadata.xField || '');
    setColorField(initialMetadata.colorField || '');
    setFacetField(initialMetadata.facetField || '');
    setBinMethod(initialMetadata.binning?.method || defaultConfig.binning.method);
    setBinCount(initialMetadata.binning?.bins ?? defaultConfig.binning.bins);
    setBinWidth(initialMetadata.binning?.binWidth);
    setBinMin(initialMetadata.binning?.binRange?.min);
    setBinMax(initialMetadata.binning?.binRange?.max);
    setAutoBinStrategy(initialMetadata.binning?.autoBinStrategy || defaultConfig.binning.autoBinStrategy);
    setOrientation(initialMetadata.orientation || defaultConfig.orientation);
    setNormalization(initialMetadata.normalization || defaultConfig.normalization);
    setCumulative(initialMetadata.cumulative ?? defaultConfig.cumulative);
    setBarFillColor(initialMetadata.barStyle?.fillColor || defaultConfig.barStyle.fillColor);
    setBarFillOpacity(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
    setBarBorderColor(initialMetadata.barStyle?.borderColor || defaultConfig.barStyle.borderColor);
    setBarBorderWidth(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
    setBarBorderRadius(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);
    setBarGap(initialMetadata.barStyle?.gap ?? defaultConfig.barStyle.gap);
    setColorScheme(initialMetadata.colorScheme || defaultConfig.colorScheme);
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
    setGradientDirection(initialMetadata.gradientDirection || defaultConfig.gradientDirection);
    setXAxisVisible(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
    setXAxisTitle(initialMetadata.xAxis?.title || defaultConfig.xAxis!.title);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat || defaultConfig.xAxis!.tickFormat);
    setXAxisTickCount(initialMetadata.xAxis?.tickCount);
    setXAxisRotate(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
    setXAxisLineColor(initialMetadata.xAxis?.lineColor || defaultConfig.xAxis!.lineColor);
    setXAxisLineWidth(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
    setXAxisTickColor(initialMetadata.xAxis?.tickColor || defaultConfig.xAxis!.tickColor);
    setXAxisTickSize(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);
    setXAxisScaleType(initialMetadata.xAxis?.scaleType || defaultConfig.xAxis!.scaleType);
    setXAxisMin(initialMetadata.xAxis?.min);
    setXAxisMax(initialMetadata.xAxis?.max);
    setYAxisVisible(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis!.visible);
    setYAxisTitle(initialMetadata.yAxis?.title || defaultConfig.yAxis!.title);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat || defaultConfig.yAxis!.tickFormat);
    setYAxisTickCount(initialMetadata.yAxis?.tickCount);
    setYAxisLineColor(initialMetadata.yAxis?.lineColor || defaultConfig.yAxis!.lineColor);
    setYAxisLineWidth(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
    setYAxisTickColor(initialMetadata.yAxis?.tickColor || defaultConfig.yAxis!.tickColor);
    setYAxisTickSize(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);
    setYAxisScaleType(initialMetadata.yAxis?.scaleType || defaultConfig.yAxis!.scaleType);
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
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
    setTooltipText(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);
    setTooltipFontSize(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
    setTooltipShowValues(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip!.showValues);
    setTooltipShowPercentage(initialMetadata.tooltip?.showPercentage ?? defaultConfig.tooltip!.showPercentage);
    setTooltipShowBinRange(initialMetadata.tooltip?.showBinRange ?? defaultConfig.tooltip!.showBinRange);
    setDataLabelsShow(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
    setDataLabelsPosition(initialMetadata.dataLabels?.position || defaultConfig.dataLabels!.position);
    setDataLabelsFormat(initialMetadata.dataLabels?.format || '');
    setDataLabelsFontSize(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
    setDataLabelsColor(initialMetadata.dataLabels?.color || defaultConfig.dataLabels!.color);
    setDataLabelsOffset(initialMetadata.dataLabels?.offset ?? 0);
    setInteractivityZoom(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
    setInteractivityPan(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
    setInteractivitySelection(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
    setInteractivityBrush(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
    setInteractivityHover(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
    setInteractivityClickAction(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction);
    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing || defaultConfig.animation!.easing);
    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable);
    setExportFormats(initialMetadata.exportFormats || defaultConfig.exportFormats!);
    setAccessibilityAriaLabel(initialMetadata.accessibility?.ariaLabel || defaultConfig.accessibility!.ariaLabel);
    setAccessibilityHighContrast(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
    setAccessibilityFocusable(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);
    setPerformanceDownsampling(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
    setPerformanceProgressive(initialMetadata.performance?.progressive ?? defaultConfig.performance!.progressive);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField) {
      alert('Please select a field for the X‑axis.');
      return;
    }

    const config: HistogramConfig = {
      title,
      xField,
      colorField,
      facetField,
      binning: {
        method: binMethod,
        bins: binMethod === 'fixedCount' ? binCount : undefined,
        binWidth: binMethod === 'fixedWidth' ? binWidth : undefined,
        binRange: { min: binMin, max: binMax },
        autoBinStrategy,
      },
      orientation,
      normalization,
      cumulative,
      barStyle: {
        fillColor: barFillColor,
        fillOpacity: barFillOpacity,
        borderColor: barBorderColor,
        borderWidth: barBorderWidth,
        borderRadius: barBorderRadius,
        gap: barGap,
      },
      colorScheme,
      colorGradient,
      gradientDirection,
      xAxis: {
        visible: xAxisVisible,
        title: xAxisTitle,
        tickFormat: xAxisTickFormat,
        tickCount: xAxisTickCount,
        tickLabelRotation: xAxisRotate,
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
        position: legendPosition as any,
        orient: legendOrient as any,
        itemGap: legendItemGap,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger as any,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: tooltipFontSize,
        showValues: tooltipShowValues,
        showPercentage: tooltipShowPercentage,
        showBinRange: tooltipShowBinRange,
      },
      dataLabels: {
        show: dataLabelsShow,
        position: dataLabelsPosition as any,
        format: dataLabelsFormat,
        fontSize: dataLabelsFontSize,
        color: dataLabelsColor,
        offset: dataLabelsOffset,
      },
      interactivity: {
        zoom: interactivityZoom,
        pan: interactivityPan,
        selection: interactivitySelection as any,
        brush: interactivityBrush,
        hoverHighlight: interactivityHover,
        clickAction: interactivityClickAction as any,
      },
      annotations: [],
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing as any,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel: accessibilityAriaLabel,
        highContrast: accessibilityHighContrast,
        focusable: accessibilityFocusable,
      },
      performance: {
        downsampling: performanceDownsampling,
        progressive: performanceProgressive,
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
            <BarChart className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Histogram</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Section */}
          <SectionHeader title="Basic Settings" icon={<Sliders className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Histogram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">X‑axis field (numeric) <span className="text-red-400">*</span></label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="">Select a numeric field</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color field (categorical, optional)</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Facet field (small multiples, optional)</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Orientation</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="vertical" checked={orientation === 'vertical'} onChange={(e) => setOrientation(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Vertical</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="horizontal" checked={orientation === 'horizontal'} onChange={(e) => setOrientation(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Horizontal</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Binning Section */}
          <SectionHeader title="Binning" icon={<Layers className="h-4 w-4" />} sectionKey="binning" />
          {sections.binning && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bin method</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="auto" checked={binMethod === 'auto'} onChange={(e) => setBinMethod(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Auto (choose best)</span>
                  </label>
                  {binMethod === 'auto' && (
                    <div className="ml-6">
                      <label className="block text-xs text-gray-400 mb-1">Strategy</label>
                      <select
                        value={autoBinStrategy}
                        onChange={(e) => setAutoBinStrategy(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                      >
                        <option value="freedman-diaconis">Freedman‑Diaconis</option>
                        <option value="scott">Scott's rule</option>
                        <option value="sqrt">Square root</option>
                      </select>
                    </div>
                  )}
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="fixedCount" checked={binMethod === 'fixedCount'} onChange={(e) => setBinMethod(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Fixed number of bins</span>
                  </label>
                  {binMethod === 'fixedCount' && (
                    <div className="ml-6">
                      <label className="block text-xs text-gray-400 mb-1">Number of bins</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={binCount}
                        onChange={(e) => setBinCount(parseInt(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm"
                      />
                    </div>
                  )}
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="fixedWidth" checked={binMethod === 'fixedWidth'} onChange={(e) => setBinMethod(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Fixed bin width</span>
                  </label>
                  {binMethod === 'fixedWidth' && (
                    <div className="ml-6">
                      <label className="block text-xs text-gray-400 mb-1">Bin width</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={binWidth}
                        onChange={(e) => setBinWidth(parseFloat(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Range min (optional)</label>
                  <input
                    type="number"
                    value={binMin ?? ''}
                    onChange={(e) => setBinMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Range max (optional)</label>
                  <input
                    type="number"
                    value={binMax ?? ''}
                    onChange={(e) => setBinMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bars Section */}
          <SectionHeader title="Bars" icon={<Wrench className="h-4 w-4" />} sectionKey="bars" />
          {sections.bars && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill color</label>
                  <input
                    type="color"
                    value={Array.isArray(barFillColor) ? '#3b82f6' : barFillColor as string}
                    onChange={(e) => setBarFillColor(e.target.value)}
                    className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill opacity</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={barFillOpacity}
                    onChange={(e) => setBarFillOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border color</label>
                  <input
                    type="color"
                    value={barBorderColor}
                    onChange={(e) => setBarBorderColor(e.target.value)}
                    className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border width</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={barBorderWidth}
                    onChange={(e) => setBarBorderWidth(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border radius (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={barBorderRadius}
                    onChange={(e) => setBarBorderRadius(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gap between bars (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={barGap}
                    onChange={(e) => setBarGap(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={cumulative}
                    onChange={(e) => setCumulative(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Cumulative distribution</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Normalization</label>
                <select
                  value={normalization}
                  onChange={(e) => setNormalization(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="count">Count</option>
                  <option value="probability">Probability (density)</option>
                  <option value="density">Density (area = 1)</option>
                  <option value="cumulative">Cumulative count</option>
                </select>
              </div>
            </div>
          )}

          {/* Axes Section */}
          <SectionHeader title="Axes" icon={<ScatterChart className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={xAxisVisible}
                    onChange={(e) => setXAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show X‑axis</span>
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
                      <label className="block text-xs text-gray-400 mb-1">Scale type</label>
                      <select
                        value={xAxisScaleType}
                        onChange={(e) => setXAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="linear">Linear</option>
                        <option value="log">Log</option>
                        <option value="time">Time</option>
                      </select>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick count</label>
                      <input
                        type="number"
                        value={xAxisTickCount ?? ''}
                        onChange={(e) => setXAxisTickCount(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Label rotation</label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        value={xAxisRotate}
                        onChange={(e) => setXAxisRotate(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line color</label>
                      <input
                        type="color"
                        value={xAxisLineColor}
                        onChange={(e) => setXAxisLineColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line width</label>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick color</label>
                      <input
                        type="color"
                        value={xAxisTickColor}
                        onChange={(e) => setXAxisTickColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick size</label>
                      <input
                        type="number"
                        min="0"
                        value={xAxisTickSize}
                        onChange={(e) => setXAxisTickSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                      <input
                        type="number"
                        value={xAxisMin ?? ''}
                        onChange={(e) => setXAxisMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                      <input
                        type="number"
                        value={xAxisMax ?? ''}
                        onChange={(e) => setXAxisMax(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                    checked={yAxisVisible}
                    onChange={(e) => setYAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show Y‑axis</span>
                </label>
                {yAxisVisible && (
                  <div className="grid grid-cols-2 gap-3">
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
                      <label className="block text-xs text-gray-400 mb-1">Scale type</label>
                      <select
                        value={yAxisScaleType}
                        onChange={(e) => setYAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="linear">Linear</option>
                        <option value="log">Log</option>
                      </select>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick count</label>
                      <input
                        type="number"
                        value={yAxisTickCount ?? ''}
                        onChange={(e) => setYAxisTickCount(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line color</label>
                      <input
                        type="color"
                        value={yAxisLineColor}
                        onChange={(e) => setYAxisLineColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line width</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={yAxisLineWidth}
                        onChange={(e) => setYAxisLineWidth(parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick color</label>
                      <input
                        type="color"
                        value={yAxisTickColor}
                        onChange={(e) => setYAxisTickColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick size</label>
                      <input
                        type="number"
                        min="0"
                        value={yAxisTickSize}
                        onChange={(e) => setYAxisTickSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 col-span-2">
                        <input
                          type="checkbox"
                          checked={yAxisZeroBaseline}
                          onChange={(e) => setYAxisZeroBaseline(e.target.checked)}
                          className="rounded border-gray-600 text-purple-500"
                        />
                        <span className="text-xs text-gray-300">Force zero baseline</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
                      <input
                        type="number"
                        value={yAxisMin ?? ''}
                        onChange={(e) => setYAxisMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
                      <input
                        type="number"
                        value={yAxisMax ?? ''}
                        onChange={(e) => setYAxisMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
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
                <span className="text-sm text-gray-200">Show grid</span>
              </label>
              {showGrid && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-md">
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
                      onChange={(e) => setGridWidth(parseFloat(e.target.value))}
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
                  <div className="col-span-2 flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={gridXLines}
                        onChange={(e) => setGridXLines(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">Vertical lines</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={gridYLines}
                        onChange={(e) => setGridYLines(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">Horizontal lines</span>
                    </label>
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
                <span className="text-sm text-gray-200">Show legend</span>
              </label>
              {showLegend && (
                <div className="grid grid-cols-3 gap-4 p-3 bg-gray-800 rounded-md">
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
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Item gap</label>
                    <input
                      type="number"
                      min="0"
                      value={legendItemGap}
                      onChange={(e) => setLegendItemGap(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tooltip Section */}
          <SectionHeader title="Tooltip" icon={<LineChart className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
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
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-md">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                    <select
                      value={tooltipTrigger}
                      onChange={(e) => setTooltipTrigger(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="item">Item (hover bar)</option>
                      <option value="axis">Axis (hover bin)</option>
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
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font size</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={tooltipFontSize}
                      onChange={(e) => setTooltipFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowValues}
                        onChange={(e) => setTooltipShowValues(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">Show values</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowPercentage}
                        onChange={(e) => setTooltipShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">Show percentage</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowBinRange}
                        onChange={(e) => setTooltipShowBinRange(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">Show bin range</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Labels Section */}
          <SectionHeader title="Data Labels" icon={<Layers className="h-4 w-4" />} sectionKey="labels" />
          {sections.labels && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dataLabelsShow}
                  onChange={(e) => setDataLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show data labels</span>
              </label>
              {dataLabelsShow && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-md">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={dataLabelsPosition}
                      onChange={(e) => setDataLabelsPosition(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font size</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={dataLabelsFontSize}
                      onChange={(e) => setDataLabelsFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                    <label className="block text-xs text-gray-400 mb-1">Offset (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={dataLabelsOffset}
                      onChange={(e) => setDataLabelsOffset(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Settings className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityZoom}
                    onChange={(e) => setInteractivityZoom(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-300">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityPan}
                    onChange={(e) => setInteractivityPan(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-300">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityBrush}
                    onChange={(e) => setInteractivityBrush(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-300">Brush selection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityHover}
                    onChange={(e) => setInteractivityHover(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-300">Hover highlight</span>
                </label>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Selection mode</label>
                  <select
                    value={interactivitySelection}
                    onChange={(e) => setInteractivitySelection(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="none">None</option>
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Click action</label>
                  <select
                    value={interactivityClickAction}
                    onChange={(e) => setInteractivityClickAction(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="none">None</option>
                    <option value="select">Select</option>
                    <option value="drilldown">Drill down</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
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
                <span className="text-sm text-gray-200">Enable animation</span>
              </label>
              {animationEnabled && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-md">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duration (ms)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={animationDuration}
                      onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
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
                  onChange={(e) => setWidth(parseInt(e.target.value))}
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
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Advanced Section (Responsive, Export, Accessibility, Performance) */}
          <SectionHeader title="Advanced" icon={<Cpu className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="p-3 bg-gray-800 rounded-md space-y-3">
                <h4 className="text-xs font-semibold text-gray-300">Responsive & Export</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responsiveEnabled}
                    onChange={(e) => setResponsiveEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Enable responsive sizing</span>
                </label>
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
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportFormats.includes('png')}
                        onChange={(e) => {
                          if (e.target.checked) setExportFormats([...exportFormats, 'png']);
                          else setExportFormats(exportFormats.filter(f => f !== 'png'));
                        }}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">PNG</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportFormats.includes('svg')}
                        onChange={(e) => {
                          if (e.target.checked) setExportFormats([...exportFormats, 'svg']);
                          else setExportFormats(exportFormats.filter(f => f !== 'svg'));
                        }}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">SVG</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportFormats.includes('pdf')}
                        onChange={(e) => {
                          if (e.target.checked) setExportFormats([...exportFormats, 'pdf']);
                          else setExportFormats(exportFormats.filter(f => f !== 'pdf'));
                        }}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-300">PDF</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-800 rounded-md space-y-3">
                <h4 className="text-xs font-semibold text-gray-300">Accessibility</h4>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                  <input
                    type="text"
                    value={accessibilityAriaLabel}
                    onChange={(e) => setAccessibilityAriaLabel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={accessibilityHighContrast}
                    onChange={(e) => setAccessibilityHighContrast(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">High contrast mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={accessibilityFocusable}
                    onChange={(e) => setAccessibilityFocusable(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Focusable (keyboard navigation)</span>
                </label>
              </div>

              <div className="p-3 bg-gray-800 rounded-md space-y-3">
                <h4 className="text-xs font-semibold text-gray-300">Performance</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={performanceDownsampling}
                    onChange={(e) => setPerformanceDownsampling(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Downsample large data</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={performanceProgressive}
                    onChange={(e) => setPerformanceProgressive(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Progressive rendering</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};