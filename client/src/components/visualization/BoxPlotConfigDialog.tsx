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
} from 'lucide-react';

// Import the shared type
import { BoxPlotConfig } from '../../types/visualization-configs';



interface BoxPlotConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<BoxPlotConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: BoxPlotConfig) => void;
}

const defaultConfig: BoxPlotConfig = {
  title: '',
  categoryField: '',
  valueField: '',
  orientation: 'vertical',
  showOutliers: true,
  whiskerType: 'tukey',
  iqrMultiplier: 1.5,
  percentileRange: { lower: 5, upper: 95 },
  boxWidth: 40,
  colors: '#3b82f6',
  median: {
    show: true,
    color: '#000000',
    width: 2,
    dash: '',
  },
  whisker: {
    color: '#666666',
    width: 1.5,
    dash: '',
  },
  outlier: {
    symbol: 'circle',
    size: 6,
    color: '#ff0000',
    opacity: 1,
  },
  box: {
    fillColor: '#3b82f6',
    fillOpacity: 0.3,
    borderColor: '#1e3a8a',
    borderWidth: 1,
  },
  mean: {
    show: false,
    symbol: 'diamond',
    size: 8,
    color: '#000000',
  },
  notches: {
    show: false,
    width: 0.5,
    confidenceLevel: 0.95,
  },
  xAxis: {
    label: '',
    rotateLabels: 0,
    tickFormat: '',
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
  },
  yAxis: {
    label: '',
    tickFormat: '',
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
  },
  showGrid: true,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
  },
  showLegend: false,
  legend: {
    position: 'top',
    orientation: 'horizontal',
    itemGap: 10,
  },
  tooltip: {
    show: true,
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    format: '',
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
};

// Helper to parse comma‑separated colors into array

// Helper to stringify color array
const stringifyColors = (colors?: string | string[]): string => {
  if (!colors) return '';
  if (Array.isArray(colors)) return colors.join(', ');
  return colors;
};

export const BoxPlotConfigDialog: React.FC<BoxPlotConfigDialogProps> = ({
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

  // Basic fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [categoryField, setCategoryField] = useState(initialMetadata.categoryField || '');
  const [valueField, setValueField] = useState(initialMetadata.valueField || '');
  const [orientation, setOrientation] = useState(initialMetadata.orientation || defaultConfig.orientation);
  const [showOutliers, setShowOutliers] = useState(initialMetadata.showOutliers ?? defaultConfig.showOutliers);
  const [whiskerType, setWhiskerType] = useState(initialMetadata.whiskerType || defaultConfig.whiskerType);
  const [iqrMultiplier, setIqrMultiplier] = useState(initialMetadata.iqrMultiplier ?? defaultConfig.iqrMultiplier);
  const [percentileLower, setPercentileLower] = useState(initialMetadata.percentileRange?.lower || defaultConfig.percentileRange!.lower);
  const [percentileUpper, setPercentileUpper] = useState(initialMetadata.percentileRange?.upper || defaultConfig.percentileRange!.upper);
  const [boxWidth, setBoxWidth] = useState(initialMetadata.boxWidth || defaultConfig.boxWidth);
  const [colorsInput, setColorsInput] = useState(stringifyColors(initialMetadata.colors ?? defaultConfig.colors));
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Median
  const [medianShow, setMedianShow] = useState(initialMetadata.median?.show ?? defaultConfig.median!.show);
  const [medianColor, setMedianColor] = useState(initialMetadata.median?.color ?? defaultConfig.median!.color);
  const [medianWidth, setMedianWidth] = useState(initialMetadata.median?.width ?? defaultConfig.median!.width);
  const [medianDash, setMedianDash] = useState(initialMetadata.median?.dash ?? defaultConfig.median!.dash);

  // Whisker
  const [whiskerColor, setWhiskerColor] = useState(initialMetadata.whisker?.color ?? defaultConfig.whisker!.color);
  const [whiskerWidth, setWhiskerWidth] = useState(initialMetadata.whisker?.width ?? defaultConfig.whisker!.width);
  const [whiskerDash, setWhiskerDash] = useState(initialMetadata.whisker?.dash ?? defaultConfig.whisker!.dash);

  // Outlier
  const [outlierSymbol, setOutlierSymbol] = useState(initialMetadata.outlier?.symbol ?? defaultConfig.outlier!.symbol);
  const [outlierSize, setOutlierSize] = useState(initialMetadata.outlier?.size ?? defaultConfig.outlier!.size);
  const [outlierColor, setOutlierColor] = useState(initialMetadata.outlier?.color ?? defaultConfig.outlier!.color);
  const [outlierOpacity, setOutlierOpacity] = useState(initialMetadata.outlier?.opacity ?? defaultConfig.outlier!.opacity);

  // Box
  const [boxFillColor, setBoxFillColor] = useState(initialMetadata.box?.fillColor ?? defaultConfig.box!.fillColor);
  const [boxFillOpacity, setBoxFillOpacity] = useState(initialMetadata.box?.fillOpacity ?? defaultConfig.box!.fillOpacity);
  const [boxBorderColor, setBoxBorderColor] = useState(initialMetadata.box?.borderColor ?? defaultConfig.box!.borderColor);
  const [boxBorderWidth, setBoxBorderWidth] = useState(initialMetadata.box?.borderWidth ?? defaultConfig.box!.borderWidth);

  // Mean
  const [meanShow, setMeanShow] = useState(initialMetadata.mean?.show ?? defaultConfig.mean!.show);
  const [meanSymbol, setMeanSymbol] = useState(initialMetadata.mean?.symbol ?? defaultConfig.mean!.symbol);
  const [meanSize, setMeanSize] = useState(initialMetadata.mean?.size ?? defaultConfig.mean!.size);
  const [meanColor, setMeanColor] = useState(initialMetadata.mean?.color ?? defaultConfig.mean!.color);

  // Notches
  const [notchesShow, setNotchesShow] = useState(initialMetadata.notches?.show ?? defaultConfig.notches!.show);
  const [notchesWidth, setNotchesWidth] = useState(initialMetadata.notches?.width ?? defaultConfig.notches!.width);
  const [notchesConfidence, setNotchesConfidence] = useState(initialMetadata.notches?.confidenceLevel ?? defaultConfig.notches!.confidenceLevel);

  // X Axis
  const [xAxisLabel, setXAxisLabel] = useState(initialMetadata.xAxis?.label ?? defaultConfig.xAxis!.label);
  const [xAxisRotate, setXAxisRotate] = useState(initialMetadata.xAxis?.rotateLabels ?? defaultConfig.xAxis!.rotateLabels);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat ?? defaultConfig.xAxis!.tickFormat);
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor ?? defaultConfig.xAxis!.lineColor);
  const [xAxisLineWidth, setXAxisLineWidth] = useState(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor ?? defaultConfig.xAxis!.tickColor);
  const [xAxisTickSize, setXAxisTickSize] = useState(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);

  // Y Axis
  const [yAxisLabel, setYAxisLabel] = useState(initialMetadata.yAxis?.label ?? defaultConfig.yAxis!.label);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat ?? defaultConfig.yAxis!.tickFormat);
  const [yAxisLineColor, setYAxisLineColor] = useState(initialMetadata.yAxis?.lineColor ?? defaultConfig.yAxis!.lineColor);
  const [yAxisLineWidth, setYAxisLineWidth] = useState(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
  const [yAxisTickColor, setYAxisTickColor] = useState(initialMetadata.yAxis?.tickColor ?? defaultConfig.yAxis!.tickColor);
  const [yAxisTickSize, setYAxisTickSize] = useState(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);

  // Grid
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash ?? defaultConfig.grid!.dash);

  // Legend
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
  const [legendOrientation, setLegendOrientation] = useState(initialMetadata.legend?.orientation ?? defaultConfig.legend!.orientation);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format ?? defaultConfig.tooltip!.format);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    whiskerOutliers: false,
    boxMedian: false,
    colors: false,
    axesGrid: false,
    legendTooltip: false,
    animation: false,
    dimensions: true,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setCategoryField(initialMetadata.categoryField || '');
    setValueField(initialMetadata.valueField || '');
    setOrientation(initialMetadata.orientation || defaultConfig.orientation);
    setShowOutliers(initialMetadata.showOutliers ?? defaultConfig.showOutliers);
    setWhiskerType(initialMetadata.whiskerType || defaultConfig.whiskerType);
    setIqrMultiplier(initialMetadata.iqrMultiplier ?? defaultConfig.iqrMultiplier);
    setPercentileLower(initialMetadata.percentileRange?.lower || defaultConfig.percentileRange!.lower);
    setPercentileUpper(initialMetadata.percentileRange?.upper || defaultConfig.percentileRange!.upper);
    setBoxWidth(initialMetadata.boxWidth || defaultConfig.boxWidth);
    setColorsInput(stringifyColors(initialMetadata.colors ?? defaultConfig.colors));
    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

    setMedianShow(initialMetadata.median?.show ?? defaultConfig.median!.show);
    setMedianColor(initialMetadata.median?.color ?? defaultConfig.median!.color);
    setMedianWidth(initialMetadata.median?.width ?? defaultConfig.median!.width);
    setMedianDash(initialMetadata.median?.dash ?? defaultConfig.median!.dash);

    setWhiskerColor(initialMetadata.whisker?.color ?? defaultConfig.whisker!.color);
    setWhiskerWidth(initialMetadata.whisker?.width ?? defaultConfig.whisker!.width);
    setWhiskerDash(initialMetadata.whisker?.dash ?? defaultConfig.whisker!.dash);

    setOutlierSymbol(initialMetadata.outlier?.symbol ?? defaultConfig.outlier!.symbol);
    setOutlierSize(initialMetadata.outlier?.size ?? defaultConfig.outlier!.size);
    setOutlierColor(initialMetadata.outlier?.color ?? defaultConfig.outlier!.color);
    setOutlierOpacity(initialMetadata.outlier?.opacity ?? defaultConfig.outlier!.opacity);

    setBoxFillColor(initialMetadata.box?.fillColor ?? defaultConfig.box!.fillColor);
    setBoxFillOpacity(initialMetadata.box?.fillOpacity ?? defaultConfig.box!.fillOpacity);
    setBoxBorderColor(initialMetadata.box?.borderColor ?? defaultConfig.box!.borderColor);
    setBoxBorderWidth(initialMetadata.box?.borderWidth ?? defaultConfig.box!.borderWidth);

    setMeanShow(initialMetadata.mean?.show ?? defaultConfig.mean!.show);
    setMeanSymbol(initialMetadata.mean?.symbol ?? defaultConfig.mean!.symbol);
    setMeanSize(initialMetadata.mean?.size ?? defaultConfig.mean!.size);
    setMeanColor(initialMetadata.mean?.color ?? defaultConfig.mean!.color);

    setNotchesShow(initialMetadata.notches?.show ?? defaultConfig.notches!.show);
    setNotchesWidth(initialMetadata.notches?.width ?? defaultConfig.notches!.width);
    setNotchesConfidence(initialMetadata.notches?.confidenceLevel ?? defaultConfig.notches!.confidenceLevel);

    setXAxisLabel(initialMetadata.xAxis?.label ?? defaultConfig.xAxis!.label);
    setXAxisRotate(initialMetadata.xAxis?.rotateLabels ?? defaultConfig.xAxis!.rotateLabels);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat ?? defaultConfig.xAxis!.tickFormat);
    setXAxisLineColor(initialMetadata.xAxis?.lineColor ?? defaultConfig.xAxis!.lineColor);
    setXAxisLineWidth(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis!.lineWidth);
    setXAxisTickColor(initialMetadata.xAxis?.tickColor ?? defaultConfig.xAxis!.tickColor);
    setXAxisTickSize(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis!.tickSize);

    setYAxisLabel(initialMetadata.yAxis?.label ?? defaultConfig.yAxis!.label);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat ?? defaultConfig.yAxis!.tickFormat);
    setYAxisLineColor(initialMetadata.yAxis?.lineColor ?? defaultConfig.yAxis!.lineColor);
    setYAxisLineWidth(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis!.lineWidth);
    setYAxisTickColor(initialMetadata.yAxis?.tickColor ?? defaultConfig.yAxis!.tickColor);
    setYAxisTickSize(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis!.tickSize);

    setGridColor(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash ?? defaultConfig.grid!.dash);

    setLegendPosition(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
    setLegendOrientation(initialMetadata.legend?.orientation ?? defaultConfig.legend!.orientation);
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);

    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
    setTooltipText(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
    setTooltipFormat(initialMetadata.tooltip?.format ?? defaultConfig.tooltip!.format);

    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!valueField) {
      alert('Please select a numerical field for the box plot.');
      return;
    }

    // Parse colors input
    let colors: string | string[] = colorsInput;
    if (colorsInput.includes(',')) {
      colors = colorsInput.split(',').map(s => s.trim());
    }

    const config: BoxPlotConfig = {
      title,
      categoryField,
      valueField,
      orientation,
      showOutliers,
      whiskerType,
      percentileRange: whiskerType === 'percentile' ? { lower: percentileLower, upper: percentileUpper } : undefined,
      iqrMultiplier: whiskerType === 'tukey' ? iqrMultiplier : undefined,
      boxWidth,
      colors,
      median: {
        show: medianShow,
        color: medianColor,
        width: medianWidth,
        dash: medianDash,
      },
      whisker: {
        color: whiskerColor,
        width: whiskerWidth,
        dash: whiskerDash,
      },
      outlier: {
        symbol: outlierSymbol,
        size: outlierSize,
        color: outlierColor,
        opacity: outlierOpacity,
      },
      box: {
        fillColor: boxFillColor,
        fillOpacity: boxFillOpacity,
        borderColor: boxBorderColor,
        borderWidth: boxBorderWidth,
      },
      mean: {
        show: meanShow,
        symbol: meanSymbol,
        size: meanSize,
        color: meanColor,
      },
      notches: {
        show: notchesShow,
        width: notchesWidth,
        confidenceLevel: notchesConfidence,
      },
      xAxis: {
        label: xAxisLabel,
        rotateLabels: xAxisRotate,
        tickFormat: xAxisTickFormat,
        lineColor: xAxisLineColor,
        lineWidth: xAxisLineWidth,
        tickColor: xAxisTickColor,
        tickSize: xAxisTickSize,
      },
      yAxis: {
        label: yAxisLabel,
        tickFormat: yAxisTickFormat,
        lineColor: yAxisLineColor,
        lineWidth: yAxisLineWidth,
        tickColor: yAxisTickColor,
        tickSize: yAxisTickSize,
      },
      showGrid,
      grid: {
        color: gridColor,
        width: gridWidth,
        dash: gridDash,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orientation: legendOrientation,
        itemGap: legendItemGap,
      },
      tooltip: {
        show: tooltipShow,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        format: tooltipFormat,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      dimensions: { width, height },
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Box Plot</h2>
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
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Box Plot"
                />
              </div>
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category (X‑axis)</label>
                <select
                  value={categoryField}
                  onChange={(e) => setCategoryField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None (single box)</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              {/* Value Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value (Y‑axis) <span className="text-red-400">*</span></label>
                <select
                  value={valueField}
                  onChange={(e) => setValueField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>Select a numerical field</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Orientation</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="vertical" checked={orientation === 'vertical'} onChange={(e) => setOrientation(e.target.value as 'vertical')} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Vertical</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="horizontal" checked={orientation === 'horizontal'} onChange={(e) => setOrientation(e.target.value as 'horizontal')} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Horizontal</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Whisker & Outliers Section */}
          <SectionHeader title="Whiskers & Outliers" icon={<BarChart className="h-4 w-4" />} sectionKey="whiskerOutliers" />
          {sections.whiskerOutliers && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Whisker Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Whisker Calculation</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="tukey" checked={whiskerType === 'tukey'} onChange={(e) => setWhiskerType(e.target.value as 'tukey')} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Tukey (IQR × multiplier)</span>
                  </label>
                  {whiskerType === 'tukey' && (
                    <div className="ml-6">
                      <label className="block text-xs text-gray-400 mb-1">IQR Multiplier</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={iqrMultiplier}
                        onChange={(e) => setIqrMultiplier(parseFloat(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm"
                      />
                    </div>
                  )}
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="minmax" checked={whiskerType === 'minmax'} onChange={(e) => setWhiskerType(e.target.value as 'minmax')} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Min / Max</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="percentile" checked={whiskerType === 'percentile'} onChange={(e) => setWhiskerType(e.target.value as 'percentile')} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Percentile range</span>
                  </label>
                </div>
                {whiskerType === 'percentile' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Lower %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentileLower}
                        onChange={(e) => setPercentileLower(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Upper %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentileUpper}
                        onChange={(e) => setPercentileUpper(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Outlier toggle */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showOutliers}
                    onChange={(e) => setShowOutliers(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show outliers</span>
                </label>
              </div>

              {/* Outlier styling (conditional) */}
              {showOutliers && (
                <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                  <h4 className="text-xs font-semibold text-gray-300">Outlier Styling</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                      <select
                        value={outlierSymbol}
                        onChange={(e) => setOutlierSymbol(e.target.value as any)}
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
                        value={outlierSize}
                        onChange={(e) => setOutlierSize(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={outlierColor}
                        onChange={(e) => setOutlierColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Opacity (0-1)</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={outlierOpacity}
                        onChange={(e) => setOutlierOpacity(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Whisker styling */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">Whisker Line Styling</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={whiskerColor}
                      onChange={(e) => setWhiskerColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={whiskerWidth}
                      onChange={(e) => setWhiskerWidth(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                    <input
                      type="text"
                      value={whiskerDash}
                      onChange={(e) => setWhiskerDash(e.target.value)}
                      placeholder="e.g., 5,5"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Box & Median Section */}
          <SectionHeader title="Box & Median" icon={<Wrench className="h-4 w-4" />} sectionKey="boxMedian" />
          {sections.boxMedian && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Box styling */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">Box Fill</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
                    <input
                      type="color"
                      value={boxFillColor}
                      onChange={(e) => setBoxFillColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Opacity (0-1)</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={boxFillOpacity}
                      onChange={(e) => setBoxFillOpacity(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-gray-300 mt-2">Box Border</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={boxBorderColor}
                      onChange={(e) => setBoxBorderColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={boxBorderWidth}
                      onChange={(e) => setBoxBorderWidth(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Median line styling */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={medianShow}
                    onChange={(e) => setMedianShow(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show Median Line</span>
                </label>
                {medianShow && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={medianColor}
                        onChange={(e) => setMedianColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={medianWidth}
                        onChange={(e) => setMedianWidth(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                      <input
                        type="text"
                        value={medianDash}
                        onChange={(e) => setMedianDash(e.target.value)}
                        placeholder="e.g., 5,5"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mean marker */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={meanShow}
                    onChange={(e) => setMeanShow(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show Mean Marker</span>
                </label>
                {meanShow && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                      <select
                        value={meanSymbol}
                        onChange={(e) => setMeanSymbol(e.target.value as any)}
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
                        value={meanSize}
                        onChange={(e) => setMeanSize(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={meanColor}
                        onChange={(e) => setMeanColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notches */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notchesShow}
                    onChange={(e) => setNotchesShow(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show Notches (confidence interval)</span>
                </label>
                {notchesShow && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width (relative to box)</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={notchesWidth}
                        onChange={(e) => setNotchesWidth(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Confidence level</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={notchesConfidence}
                        onChange={(e) => setNotchesConfidence(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Colors Section */}
          <SectionHeader title="Colors" icon={<Palette className="h-4 w-4" />} sectionKey="colors" />
          {sections.colors && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Color(s) <span className="text-xs text-gray-500">(single color or comma‑separated list)</span>
                </label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="#3b82f6, #ef4444, #10b981"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For multiple categories, list colors in order. If fewer colors than categories, they will repeat.
                </p>
              </div>
            </div>
          )}

          {/* Axes & Grid Section */}
          <SectionHeader title="Axes & Grid" icon={<Grid className="h-4 w-4" />} sectionKey="axesGrid" />
          {sections.axesGrid && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* X Axis */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">X‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={xAxisLabel}
                      onChange={(e) => setXAxisLabel(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rotate labels (°)</label>
                    <input
                      type="number"
                      min="-90"
                      max="90"
                      value={xAxisRotate}
                      onChange={(e) => setXAxisRotate(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick format</label>
                    <input
                      type="text"
                      value={xAxisTickFormat}
                      onChange={(e) => setXAxisTickFormat(e.target.value)}
                      placeholder="e.g., .2f"
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
                      onChange={(e) => setXAxisLineWidth(Number(e.target.value))}
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
                    <label className="block text-xs text-gray-400 mb-1">Tick size (px)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={xAxisTickSize}
                      onChange={(e) => setXAxisTickSize(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Y Axis */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">Y‑Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={yAxisLabel}
                      onChange={(e) => setYAxisLabel(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tick format</label>
                    <input
                      type="text"
                      value={yAxisTickFormat}
                      onChange={(e) => setYAxisTickFormat(e.target.value)}
                      placeholder="e.g., .2f"
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
                      onChange={(e) => setYAxisLineWidth(Number(e.target.value))}
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
                    <label className="block text-xs text-gray-400 mb-1">Tick size (px)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={yAxisTickSize}
                      onChange={(e) => setYAxisTickSize(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Grid */}
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

          {/* Legend & Tooltip Section */}
          <SectionHeader title="Legend & Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="legendTooltip" />
          {sections.legendTooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Legend */}
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
                  <div className="grid grid-cols-3 gap-3">
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
                        value={legendOrientation}
                        onChange={(e) => setLegendOrientation(e.target.value as any)}
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

              {/* Tooltip */}
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
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Format</label>
                      <input
                        type="text"
                        value={tooltipFormat}
                        onChange={(e) => setTooltipFormat(e.target.value)}
                        placeholder="e.g., {{min}}–{{max}}"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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
                </div>
              )}
            </div>
          )}

          {/* Dimensions Section (always open) */}
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