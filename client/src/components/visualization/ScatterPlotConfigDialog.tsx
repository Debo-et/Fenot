// src/components/visualization/ScatterPlotConfigDialog.tsx

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
  Wrench,
  BarChart,
  Circle,
  Square,
  Diamond,
  X as XIcon,
} from 'lucide-react';
import { ScatterPlotConfig, ScatterPointSymbol } from '../../types/visualization-configs';

interface ScatterPlotConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<ScatterPlotConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: ScatterPlotConfig) => void;
}

const defaultConfig: ScatterPlotConfig = {
  title: '',
  xField: '',
  yField: '',
  point: {
    symbol: 'circle',
    size: 6,
    color: '#3b82f6',
    colorOpacity: 1,
    borderColor: '#000000',
    borderWidth: 0,
    borderOpacity: 1,
    blendMode: 'normal',
    sizeMin: 2,
    sizeMax: 20,
  },
  showGrid: true,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
    xLines: true,
    yLines: true,
  },
  showLegend: true,
  legend: {
    position: 'top',
    orient: 'horizontal',
    itemGap: 10,
    symbolSize: 8,
  },
  tooltip: {
    show: true,
    trigger: 'item',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showValues: true,
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'single',
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
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  performance: {
    downsampling: false,
    maxPoints: 10000,
    progressive: false,
    virtualization: false,
  },
};

const symbolOptions: { value: ScatterPointSymbol; label: string; icon: React.ReactNode }[] = [
  { value: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
  { value: 'square', label: 'Square', icon: <Square className="h-4 w-4" /> },
  { value: 'diamond', label: 'Diamond', icon: <Diamond className="h-4 w-4" /> },
  { value: 'cross', label: 'Cross', icon: <XIcon className="h-4 w-4" /> },
  { value: 'x', label: 'X', icon: <XIcon className="h-4 w-4" /> },
  { value: 'triangle', label: 'Triangle', icon: <div className="h-4 w-4">▲</div> },
  { value: 'star', label: 'Star', icon: <div className="h-4 w-4">★</div> },
];

export const ScatterPlotConfigDialog: React.FC<ScatterPlotConfigDialogProps> = ({
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
    col => ['string', 'text', 'varchar', 'char'].includes(col.type.toLowerCase())
  );

  // State for all config fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [yField, setYField] = useState(initialMetadata.yField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || '');
  const [shapeField, setShapeField] = useState(initialMetadata.shapeField || '');
  const [facetField, setFacetField] = useState(initialMetadata.facetField || '');

  // Point styling
  const [pointSymbol, setPointSymbol] = useState<ScatterPointSymbol>(
    initialMetadata.point?.symbol || defaultConfig.point.symbol!
  );
  const [pointSize, setPointSize] = useState(initialMetadata.point?.size || defaultConfig.point.size!);
  const [pointColor, setPointColor] = useState(initialMetadata.point?.color || defaultConfig.point.color!);
  const [pointColorOpacity, setPointColorOpacity] = useState(
    initialMetadata.point?.colorOpacity ?? defaultConfig.point.colorOpacity!
  );
  const [pointBorderColor, setPointBorderColor] = useState(
    initialMetadata.point?.borderColor || defaultConfig.point.borderColor!
  );
  const [pointBorderWidth, setPointBorderWidth] = useState(
    initialMetadata.point?.borderWidth ?? defaultConfig.point.borderWidth!
  );
  const [pointBorderOpacity, setPointBorderOpacity] = useState(
    initialMetadata.point?.borderOpacity ?? defaultConfig.point.borderOpacity!
  );

  // Axes – with explicit union types
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || '');
  const [xAxisScale, setXAxisScale] = useState<'linear' | 'log' | 'time' | 'categorical'>(
    initialMetadata.xAxis?.scaleType || 'linear'
  );
  const [xAxisMin, setXAxisMin] = useState(initialMetadata.xAxis?.min?.toString() || '');
  const [xAxisMax, setXAxisMax] = useState(initialMetadata.xAxis?.max?.toString() || '');
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || '');

  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title || '');
  const [yAxisScale, setYAxisScale] = useState<'linear' | 'log' | 'time' | 'categorical'>(
    initialMetadata.yAxis?.scaleType || 'linear'
  );
  const [yAxisMin, setYAxisMin] = useState(initialMetadata.yAxis?.min?.toString() || '');
  const [yAxisMax, setYAxisMax] = useState(initialMetadata.yAxis?.max?.toString() || '');
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat || '');

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color || defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>(
    initialMetadata.legend?.position || defaultConfig.legend!.position!
  );

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    point: false,
    axes: false,
    grid: false,
    legendTooltip: false,
    interactivity: false,
    animation: false,
    dimensions: true,
    performance: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setXField(initialMetadata.xField || '');
    setYField(initialMetadata.yField || '');
    setColorField(initialMetadata.colorField || '');
    setSizeField(initialMetadata.sizeField || '');
    setShapeField(initialMetadata.shapeField || '');
    setFacetField(initialMetadata.facetField || '');

    setPointSymbol(initialMetadata.point?.symbol || defaultConfig.point.symbol!);
    setPointSize(initialMetadata.point?.size || defaultConfig.point.size!);
    setPointColor(initialMetadata.point?.color || defaultConfig.point.color!);
    setPointColorOpacity(initialMetadata.point?.colorOpacity ?? defaultConfig.point.colorOpacity!);
    setPointBorderColor(initialMetadata.point?.borderColor || defaultConfig.point.borderColor!);
    setPointBorderWidth(initialMetadata.point?.borderWidth ?? defaultConfig.point.borderWidth!);
    setPointBorderOpacity(initialMetadata.point?.borderOpacity ?? defaultConfig.point.borderOpacity!);

    setXAxisTitle(initialMetadata.xAxis?.title || '');
    setXAxisScale(initialMetadata.xAxis?.scaleType || 'linear');
    setXAxisMin(initialMetadata.xAxis?.min?.toString() || '');
    setXAxisMax(initialMetadata.xAxis?.max?.toString() || '');
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat || '');
    setYAxisTitle(initialMetadata.yAxis?.title || '');
    setYAxisScale(initialMetadata.yAxis?.scaleType || 'linear');
    setYAxisMin(initialMetadata.yAxis?.min?.toString() || '');
    setYAxisMax(initialMetadata.yAxis?.max?.toString() || '');
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat || '');

    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setGridColor(initialMetadata.grid?.color || defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position || defaultConfig.legend!.position!);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);
    setDownsampling(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
    setMaxPoints(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xField || !yField) {
      alert('Please select both X and Y fields.');
      return;
    }

    const config: ScatterPlotConfig = {
      title: title || undefined,
      xField,
      yField,
      colorField: colorField || undefined,
      sizeField: sizeField || undefined,
      shapeField: shapeField || undefined,
      facetField: facetField || undefined,
      point: {
        symbol: pointSymbol,
        size: pointSize,
        color: pointColor,
        colorOpacity: pointColorOpacity,
        borderColor: pointBorderColor,
        borderWidth: pointBorderWidth,
        borderOpacity: pointBorderOpacity,
      },
      xAxis: {
        visible: true,
        title: xAxisTitle || undefined,
        scaleType: xAxisScale,
        min: xAxisMin ? Number(xAxisMin) : undefined,
        max: xAxisMax ? Number(xAxisMax) : undefined,
        tickFormat: xAxisTickFormat || undefined,
      },
      yAxis: {
        visible: true,
        title: yAxisTitle || undefined,
        scaleType: yAxisScale,
        min: yAxisMin ? Number(yAxisMin) : undefined,
        max: yAxisMax ? Number(yAxisMax) : undefined,
        tickFormat: yAxisTickFormat || undefined,
      },
      showGrid,
      grid: {
        color: gridColor,
        width: gridWidth,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orient: 'horizontal',
        itemGap: 10,
        symbolSize: 8,
      },
      tooltip: {
        show: tooltipShow,
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        textColor: '#333333',
        fontSize: 12,
        showValues: true,
      },
      interactivity: defaultConfig.interactivity,
      animation: defaultConfig.animation,
      dimensions: { width, height },
      exportable: defaultConfig.exportable,
      exportFormats: defaultConfig.exportFormats,
      performance: {
        downsampling,
        maxPoints,
        progressive: false,
        virtualization: false,
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Scatter Plot</h2>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Scatter Plot"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">X‑Field *</label>
                  <select
                    value={xField}
                    onChange={(e) => setXField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Select numeric field</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Y‑Field *</label>
                  <select
                    value={yField}
                    onChange={(e) => setYField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Select numeric field</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color by (optional)</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Size by (optional)</label>
                  <select
                    value={sizeField}
                    onChange={(e) => setSizeField(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">None</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Shape by (optional)</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Facet by (optional)</label>
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                  <select
                    value={pointSymbol}
                    onChange={(e) => setPointSymbol(e.target.value as ScatterPointSymbol)}
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
                    max="50"
                    value={pointSize}
                    onChange={(e) => setPointSize(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
                  <input
                    type="color"
                    value={pointColor}
                    onChange={(e) => setPointColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill Opacity</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={pointColorOpacity}
                    onChange={(e) => setPointColorOpacity(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={pointBorderColor}
                    onChange={(e) => setPointBorderColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Width</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={pointBorderWidth}
                    onChange={(e) => setPointBorderWidth(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Opacity</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={pointBorderOpacity}
                    onChange={(e) => setPointBorderOpacity(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Axes Section */}
          <SectionHeader title="Axes & Scales" icon={<BarChart className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-300">X‑Axis</h4>
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
                    <label className="block text-xs text-gray-400 mb-1">Scale</label>
                    <select
                      value={xAxisScale}
                      onChange={(e) => setXAxisScale(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                      <option value="categorical">Categorical</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        value={xAxisMin}
                        onChange={(e) => setXAxisMin(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        value={xAxisMax}
                        onChange={(e) => setXAxisMax(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
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
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-300">Y‑Axis</h4>
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
                    <label className="block text-xs text-gray-400 mb-1">Scale</label>
                    <select
                      value={yAxisScale}
                      onChange={(e) => setYAxisScale(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                      <option value="categorical">Categorical</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        value={yAxisMin}
                        onChange={(e) => setYAxisMin(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        value={yAxisMax}
                        onChange={(e) => setYAxisMax(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
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
                </div>
              </div>
            </div>
          )}

          {/* Grid Section */}
          <SectionHeader title="Grid" icon={<Grid className="h-4 w-4" />} sectionKey="grid" />
          {sections.grid && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
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
                </div>
              )}
            </div>
          )}

          {/* Legend & Tooltip Section */}
          <SectionHeader title="Legend & Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="legendTooltip" />
          {sections.legendTooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
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
                  <div className="mt-2">
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
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tooltipShow}
                    onChange={(e) => setTooltipShow(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-200">Show tooltip</span>
                </label>
              </div>
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

          {/* Performance Section */}
          <SectionHeader title="Performance" icon={<Wrench className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={downsampling}
                  onChange={(e) => setDownsampling(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Enable downsampling (for large datasets)</span>
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