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
  BarChart,
  Target,
  Percent,
} from 'lucide-react';
import { ParetoChartConfig } from '../../types/visualization-configs';

interface ParetoChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<ParetoChartConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: ParetoChartConfig) => void;
}

// Default configuration (matching the interface)
const defaultConfig: ParetoChartConfig = {
  title: '',
  barField: '',
  valueField: '',
  sortOrder: 'descending',
  showCumulativeLine: true,
  cumulativeLineStyle: {
    color: '#ff0000',
    width: 2,
    dash: '',
    opacity: 1,
  },
  secondaryAxis: {
    visible: true,
    title: 'Cumulative Percentage',
    tickFormat: '.1%',
    min: 0,
    max: 1,
  },
  showPercentageLabels: false,
  barStyle: {
    fillColor: '#3b82f6',
    fillOpacity: 0.7,
    borderColor: '#1e3a8a',
    borderWidth: 1,
    borderRadius: 0,
    gap: 2,
  },
  colorScheme: '#3b82f6',
  colorGradient: false,
  gradientDirection: 'vertical',
  xAxis: {
    visible: true,
    position: 'bottom',
    title: '',
    tickLabelRotation: 0,
    tickFormat: '',
    tickCount: undefined,
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
    scaleType: 'band',
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
    showPercentage: true,
  },
  dataLabels: {
    show: false,
    position: 'top',
    format: '.2f',
    fontSize: 11,
    color: '#000000',
    backgroundColor: 'transparent',
    offset: 5,
    showPercentage: false,
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
  },
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
    minWidth: 300,
    minHeight: 200,
    aspectRatio: 1.5,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    ariaLabel: 'Pareto chart',
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

export const ParetoChartConfigDialog: React.FC<ParetoChartConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar'].includes(col.type.toLowerCase())
  );
  const numericalColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );

  // State for all configurable fields
  const [title, setTitle] = useState(initialMetadata.title ?? defaultConfig.title);
  const [barField, setBarField] = useState(initialMetadata.barField ?? '');
  const [valueField, setValueField] = useState(initialMetadata.valueField ?? '');
  const [sortOrder, setSortOrder] = useState(initialMetadata.sortOrder ?? defaultConfig.sortOrder);
  const [customSortOrderInput, setCustomSortOrderInput] = useState(
    initialMetadata.customSortOrder?.join(', ') ?? ''
  );
  const [showCumulativeLine, setShowCumulativeLine] = useState(
    initialMetadata.showCumulativeLine ?? defaultConfig.showCumulativeLine
  );
  const [cumulativeLineColor, setCumulativeLineColor] = useState(
    initialMetadata.cumulativeLineStyle?.color ?? defaultConfig.cumulativeLineStyle!.color
  );
  const [cumulativeLineWidth, setCumulativeLineWidth] = useState(
    initialMetadata.cumulativeLineStyle?.width ?? defaultConfig.cumulativeLineStyle!.width
  );
  const [cumulativeLineDash, setCumulativeLineDash] = useState(
    initialMetadata.cumulativeLineStyle?.dash ?? defaultConfig.cumulativeLineStyle!.dash
  );
  const [cumulativeLineOpacity, setCumulativeLineOpacity] = useState(
    initialMetadata.cumulativeLineStyle?.opacity ?? defaultConfig.cumulativeLineStyle!.opacity
  );
  const [secondaryAxisVisible, setSecondaryAxisVisible] = useState(
    initialMetadata.secondaryAxis?.visible ?? defaultConfig.secondaryAxis!.visible
  );
  const [secondaryAxisTitle, setSecondaryAxisTitle] = useState(
    initialMetadata.secondaryAxis?.title ?? defaultConfig.secondaryAxis!.title
  );
  const [secondaryAxisTickFormat, setSecondaryAxisTickFormat] = useState(
    initialMetadata.secondaryAxis?.tickFormat ?? defaultConfig.secondaryAxis!.tickFormat
  );
  const [secondaryAxisMin, setSecondaryAxisMin] = useState(
    initialMetadata.secondaryAxis?.min ?? defaultConfig.secondaryAxis!.min
  );
  const [secondaryAxisMax, setSecondaryAxisMax] = useState(
    initialMetadata.secondaryAxis?.max ?? defaultConfig.secondaryAxis!.max
  );
  const [showPercentageLabels, setShowPercentageLabels] = useState(
    initialMetadata.showPercentageLabels ?? defaultConfig.showPercentageLabels
  );
  const [targetLineShow, setTargetLineShow] = useState(
    initialMetadata.targetLine?.show ?? false
  );
  const [targetLineValue, setTargetLineValue] = useState(
    initialMetadata.targetLine?.value ?? 80
  );
  const [targetLineColor, setTargetLineColor] = useState(
    initialMetadata.targetLine?.color ?? '#ffaa00'
  );
  const [targetLineWidth, setTargetLineWidth] = useState(
    initialMetadata.targetLine?.width ?? 2
  );
  const [targetLineDash, setTargetLineDash] = useState(
    initialMetadata.targetLine?.dash ?? ''
  );

  // Bar styling
  const [barFillColor, setBarFillColor] = useState(
    Array.isArray(initialMetadata.barStyle?.fillColor)
      ? (initialMetadata.barStyle?.fillColor as string[]).join(', ')
      : (initialMetadata.barStyle?.fillColor as string) ?? defaultConfig.barStyle.fillColor
  );
  const [barFillOpacity, setBarFillOpacity] = useState(
    initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity
  );
  const [barBorderColor, setBarBorderColor] = useState(
    initialMetadata.barStyle?.borderColor ?? defaultConfig.barStyle.borderColor
  );
  const [barBorderWidth, setBarBorderWidth] = useState(
    initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth
  );
  const [barBorderRadius, setBarBorderRadius] = useState(
    initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius
  );
  const [barGap, setBarGap] = useState(
    initialMetadata.barStyle?.gap ?? defaultConfig.barStyle.gap
  );
  const [colorScheme, setColorScheme] = useState(
    Array.isArray(initialMetadata.colorScheme)
      ? (initialMetadata.colorScheme as string[]).join(', ')
      : (initialMetadata.colorScheme as string) ?? defaultConfig.colorScheme
  );
  const [colorGradient, setColorGradient] = useState(
    initialMetadata.colorGradient ?? defaultConfig.colorGradient
  );
  const [gradientDirection, setGradientDirection] = useState(
    initialMetadata.gradientDirection ?? defaultConfig.gradientDirection
  );

  // Axes & Grid – simplified for brevity (similar to BoxPlotConfigDialog)
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title ?? defaultConfig.xAxis!.title);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat ?? defaultConfig.xAxis!.tickFormat);
  const [xAxisRotate, setXAxisRotate] = useState(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title ?? defaultConfig.yAxis!.title);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat ?? defaultConfig.yAxis!.tickFormat);
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash ?? defaultConfig.grid!.dash);

  // Legend & Tooltip
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);

  // Data labels
  const [dataLabelsShow, setDataLabelsShow] = useState(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
  const [dataLabelsPosition, setDataLabelsPosition] = useState(initialMetadata.dataLabels?.position ?? defaultConfig.dataLabels!.position);
  const [dataLabelsFormat, setDataLabelsFormat] = useState(initialMetadata.dataLabels?.format ?? defaultConfig.dataLabels!.format);
  const [dataLabelsFontSize, setDataLabelsFontSize] = useState(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
  const [dataLabelsShowPercentage, setDataLabelsShowPercentage] = useState(
    initialMetadata.dataLabels?.showPercentage ?? defaultConfig.dataLabels!.showPercentage
  );

  // Animation & Dimensions
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    paretoSpecific: false,
    barStyling: false,
    axesGrid: false,
    labels: false,
    legendTooltip: false,
    animation: false,
    dimensions: true,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title ?? defaultConfig.title);
    setBarField(initialMetadata.barField ?? '');
    setValueField(initialMetadata.valueField ?? '');
    setSortOrder(initialMetadata.sortOrder ?? defaultConfig.sortOrder);
    setCustomSortOrderInput(initialMetadata.customSortOrder?.join(', ') ?? '');
    setShowCumulativeLine(initialMetadata.showCumulativeLine ?? defaultConfig.showCumulativeLine);
    setCumulativeLineColor(initialMetadata.cumulativeLineStyle?.color ?? defaultConfig.cumulativeLineStyle!.color);
    setCumulativeLineWidth(initialMetadata.cumulativeLineStyle?.width ?? defaultConfig.cumulativeLineStyle!.width);
    setCumulativeLineDash(initialMetadata.cumulativeLineStyle?.dash ?? defaultConfig.cumulativeLineStyle!.dash);
    setCumulativeLineOpacity(initialMetadata.cumulativeLineStyle?.opacity ?? defaultConfig.cumulativeLineStyle!.opacity);
    setSecondaryAxisVisible(initialMetadata.secondaryAxis?.visible ?? defaultConfig.secondaryAxis!.visible);
    setSecondaryAxisTitle(initialMetadata.secondaryAxis?.title ?? defaultConfig.secondaryAxis!.title);
    setSecondaryAxisTickFormat(initialMetadata.secondaryAxis?.tickFormat ?? defaultConfig.secondaryAxis!.tickFormat);
    setSecondaryAxisMin(initialMetadata.secondaryAxis?.min ?? defaultConfig.secondaryAxis!.min);
    setSecondaryAxisMax(initialMetadata.secondaryAxis?.max ?? defaultConfig.secondaryAxis!.max);
    setShowPercentageLabels(initialMetadata.showPercentageLabels ?? defaultConfig.showPercentageLabels);
    setTargetLineShow(initialMetadata.targetLine?.show ?? false);
    setTargetLineValue(initialMetadata.targetLine?.value ?? 80);
    setTargetLineColor(initialMetadata.targetLine?.color ?? '#ffaa00');
    setTargetLineWidth(initialMetadata.targetLine?.width ?? 2);
    setTargetLineDash(initialMetadata.targetLine?.dash ?? '');

    setBarFillColor(
      Array.isArray(initialMetadata.barStyle?.fillColor)
        ? (initialMetadata.barStyle?.fillColor as string[]).join(', ')
        : (initialMetadata.barStyle?.fillColor as string) ?? defaultConfig.barStyle.fillColor
    );
    setBarFillOpacity(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
    setBarBorderColor(initialMetadata.barStyle?.borderColor ?? defaultConfig.barStyle.borderColor);
    setBarBorderWidth(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
    setBarBorderRadius(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);
    setBarGap(initialMetadata.barStyle?.gap ?? defaultConfig.barStyle.gap);
    setColorScheme(
      Array.isArray(initialMetadata.colorScheme)
        ? (initialMetadata.colorScheme as string[]).join(', ')
        : (initialMetadata.colorScheme as string) ?? defaultConfig.colorScheme
    );
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
    setGradientDirection(initialMetadata.gradientDirection ?? defaultConfig.gradientDirection);

    setXAxisTitle(initialMetadata.xAxis?.title ?? defaultConfig.xAxis!.title);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat ?? defaultConfig.xAxis!.tickFormat);
    setXAxisRotate(initialMetadata.xAxis?.tickLabelRotation ?? defaultConfig.xAxis!.tickLabelRotation);
    setYAxisTitle(initialMetadata.yAxis?.title ?? defaultConfig.yAxis!.title);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat ?? defaultConfig.yAxis!.tickFormat);
    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setGridColor(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash ?? defaultConfig.grid!.dash);

    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
    setTooltipText(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);

    setDataLabelsShow(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
    setDataLabelsPosition(initialMetadata.dataLabels?.position ?? defaultConfig.dataLabels!.position);
    setDataLabelsFormat(initialMetadata.dataLabels?.format ?? defaultConfig.dataLabels!.format);
    setDataLabelsFontSize(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
    setDataLabelsShowPercentage(initialMetadata.dataLabels?.showPercentage ?? defaultConfig.dataLabels!.showPercentage);

    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!barField || !valueField) {
      alert('Please select both a category field and a value field.');
      return;
    }

    // Parse multi‑value inputs
    const parseColorArray = (input: string): string | string[] => {
      if (input.includes(',')) {
        return input.split(',').map(s => s.trim());
      }
      return input.trim() || defaultConfig.barStyle.fillColor as string;
    };

    const config: ParetoChartConfig = {
      title,
      barField,
      valueField,
      sortOrder,
      customSortOrder: sortOrder === 'custom' ? customSortOrderInput.split(',').map(s => s.trim()) : undefined,
      showCumulativeLine,
      cumulativeLineStyle: {
        color: cumulativeLineColor,
        width: cumulativeLineWidth,
        dash: cumulativeLineDash,
        opacity: cumulativeLineOpacity,
      },
      secondaryAxis: secondaryAxisVisible ? {
        visible: true,
        title: secondaryAxisTitle,
        tickFormat: secondaryAxisTickFormat,
        min: secondaryAxisMin,
        max: secondaryAxisMax,
      } : { visible: false },
      showPercentageLabels,
      targetLine: targetLineShow ? {
        show: true,
        value: targetLineValue,
        color: targetLineColor,
        width: targetLineWidth,
        dash: targetLineDash,
      } : undefined,
      barStyle: {
        fillColor: parseColorArray(barFillColor),
        fillOpacity: barFillOpacity,
        borderColor: barBorderColor,
        borderWidth: barBorderWidth,
        borderRadius: barBorderRadius,
        gap: barGap,
      },
      colorScheme: parseColorArray(colorScheme),
      colorGradient,
      gradientDirection,
      xAxis: {
        visible: true,
        title: xAxisTitle,
        tickFormat: xAxisTickFormat,
        tickLabelRotation: xAxisRotate,
        lineColor: defaultConfig.xAxis!.lineColor,
        lineWidth: defaultConfig.xAxis!.lineWidth,
        tickColor: defaultConfig.xAxis!.tickColor,
        tickSize: defaultConfig.xAxis!.tickSize,
        scaleType: 'band',
      },
      yAxis: {
        visible: true,
        title: yAxisTitle,
        tickFormat: yAxisTickFormat,
        lineColor: defaultConfig.yAxis!.lineColor,
        lineWidth: defaultConfig.yAxis!.lineWidth,
        tickColor: defaultConfig.yAxis!.tickColor,
        tickSize: defaultConfig.yAxis!.tickSize,
        scaleType: 'linear',
        zeroBaseline: true,
      },
      showGrid,
      grid: {
        color: gridColor,
        width: gridWidth,
        dash: gridDash,
        xLines: false,
        yLines: true,
      },
      showLegend,
      legend: {
        position: legendPosition as any,
        orient: defaultConfig.legend!.orient,
        itemGap: defaultConfig.legend!.itemGap,
      },
      tooltip: {
        show: tooltipShow,
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: defaultConfig.tooltip!.fontSize,
        showValues: true,
        showPercentage: true,
      },
      dataLabels: {
        show: dataLabelsShow,
        position: dataLabelsPosition as any,
        format: dataLabelsFormat,
        fontSize: dataLabelsFontSize,
        color: defaultConfig.dataLabels!.color,
        backgroundColor: defaultConfig.dataLabels!.backgroundColor,
        offset: defaultConfig.dataLabels!.offset,
        showPercentage: dataLabelsShowPercentage,
      },
      interactivity: defaultConfig.interactivity,
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: defaultConfig.animation!.easing,
      },
      dimensions: { width, height },
      responsive: defaultConfig.responsive,
      exportable: defaultConfig.exportable,
      exportFormats: defaultConfig.exportFormats,
      accessibility: defaultConfig.accessibility,
      performance: defaultConfig.performance,
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Pareto Chart</h2>
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
                  placeholder="My Pareto Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category Field (Bars)</label>
                <select
                  value={barField}
                  onChange={(e) => setBarField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select a category</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value Field (Bar Height)</label>
                <select
                  value={valueField}
                  onChange={(e) => setValueField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select a numeric field</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="descending">Descending (largest first)</option>
                  <option value="ascending">Ascending (smallest first)</option>
                  <option value="custom">Custom</option>
                </select>
                {sortOrder === 'custom' && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-400 mb-1">Custom order (comma‑separated)</label>
                    <input
                      type="text"
                      value={customSortOrderInput}
                      onChange={(e) => setCustomSortOrderInput(e.target.value)}
                      placeholder="e.g., Category A, Category B, Category C"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pareto‑Specific Section */}
          <SectionHeader title="Pareto Options" icon={<Target className="h-4 w-4" />} sectionKey="paretoSpecific" />
          {sections.paretoSpecific && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showCumulativeLine}
                    onChange={(e) => setShowCumulativeLine(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show cumulative percentage line</span>
                </label>
              </div>
              {showCumulativeLine && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <h4 className="text-xs font-semibold text-gray-300">Cumulative Line Style</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={cumulativeLineColor}
                        onChange={(e) => setCumulativeLineColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={cumulativeLineWidth}
                        onChange={(e) => setCumulativeLineWidth(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                      <input
                        type="text"
                        value={cumulativeLineDash}
                        onChange={(e) => setCumulativeLineDash(e.target.value)}
                        placeholder="e.g., 5,5"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Opacity (0-1)</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={cumulativeLineOpacity}
                        onChange={(e) => setCumulativeLineOpacity(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={secondaryAxisVisible}
                    onChange={(e) => setSecondaryAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show secondary axis (percentage)</span>
                </label>
              </div>
              {secondaryAxisVisible && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Axis title</label>
                      <input
                        type="text"
                        value={secondaryAxisTitle}
                        onChange={(e) => setSecondaryAxisTitle(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick format</label>
                      <input
                        type="text"
                        value={secondaryAxisTickFormat}
                        onChange={(e) => setSecondaryAxisTickFormat(e.target.value)}
                        placeholder=".1%"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={secondaryAxisMin ?? 0}
                        onChange={(e) => setSecondaryAxisMin(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={secondaryAxisMax ?? 1}
                        onChange={(e) => setSecondaryAxisMax(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPercentageLabels}
                    onChange={(e) => setShowPercentageLabels(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show percentage labels on bars</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={targetLineShow}
                    onChange={(e) => setTargetLineShow(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show target line</span>
                </label>
              </div>
              {targetLineShow && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target value (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={targetLineValue}
                        onChange={(e) => setTargetLineValue(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={targetLineColor}
                        onChange={(e) => setTargetLineColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={targetLineWidth}
                        onChange={(e) => setTargetLineWidth(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                      <input
                        type="text"
                        value={targetLineDash}
                        onChange={(e) => setTargetLineDash(e.target.value)}
                        placeholder="e.g., 5,5"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bar Styling Section */}
          <SectionHeader title="Bar Styling" icon={<Palette className="h-4 w-4" />} sectionKey="barStyling" />
          {sections.barStyling && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill color(s)</label>
                  <input
                    type="text"
                    value={barFillColor}
                    onChange={(e) => setBarFillColor(e.target.value)}
                    placeholder="#3b82f6 or #f00, #0f0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
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
                    onChange={(e) => setBarFillOpacity(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border color</label>
                  <input
                    type="color"
                    value={barBorderColor}
                    onChange={(e) => setBarBorderColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border width</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={barBorderWidth}
                    onChange={(e) => setBarBorderWidth(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border radius (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={barBorderRadius}
                    onChange={(e) => setBarBorderRadius(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gap between bars (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={barGap}
                    onChange={(e) => setBarGap(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Color scheme (palette or list)</label>
                <input
                  type="text"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  placeholder="category10 or #f00, #0f0, #00f"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
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
                  <span className="text-sm text-gray-200">Use gradient fill</span>
                </label>
                {colorGradient && (
                  <select
                    value={gradientDirection}
                    onChange={(e) => setGradientDirection(e.target.value as any)}
                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Axes & Grid Section (simplified – similar to BoxPlot) */}
          <SectionHeader title="Axes & Grid" icon={<Grid className="h-4 w-4" />} sectionKey="axesGrid" />
          {sections.axesGrid && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X‑Axis title</label>
                  <input
                    type="text"
                    value={xAxisTitle}
                    onChange={(e) => setXAxisTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X tick format</label>
                  <input
                    type="text"
                    value={xAxisTickFormat}
                    onChange={(e) => setXAxisTickFormat(e.target.value)}
                    placeholder=".2f"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X label rotation</label>
                  <input
                    type="number"
                    min="-90"
                    max="90"
                    value={xAxisRotate}
                    onChange={(e) => setXAxisRotate(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Y‑Axis title</label>
                  <input
                    type="text"
                    value={yAxisTitle}
                    onChange={(e) => setYAxisTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Y tick format</label>
                  <input
                    type="text"
                    value={yAxisTickFormat}
                    onChange={(e) => setYAxisTickFormat(e.target.value)}
                    placeholder=".2f"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
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
                  <div className="grid grid-cols-3 gap-3">
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Labels Section */}
          <SectionHeader title="Data Labels" icon={<Percent className="h-4 w-4" />} sectionKey="labels" />
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
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800 rounded-md">
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
                      onChange={(e) => setDataLabelsFontSize(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dataLabelsShowPercentage}
                      onChange={(e) => setDataLabelsShowPercentage(e.target.checked)}
                      id="showPercentage"
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <label htmlFor="showPercentage" className="text-xs text-gray-400">Show % instead of value</label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend & Tooltip Section */}
          <SectionHeader title="Legend & Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="legendTooltip" />
          {sections.legendTooltip && (
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