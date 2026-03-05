import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  Grid,
  ChevronDown,
  ChevronRight,
  Eye,
  Play,
  Circle,
  Layers,
  Columns,
  ArrowUpDown,
  Maximize2,
  Brush,
  MousePointer,
  Download,
  Contrast,
  Cpu,
} from 'lucide-react';

// Import the shared type (ensure this path is correct for your project)
import { ScatterMatrixConfig, ScatterPointSymbol } from '../../types/visualization-configs';

interface ScatterMatrixConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<ScatterMatrixConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: ScatterMatrixConfig) => void;
}

// ----- Constants -----
const DEFAULT_EXPORT_FORMATS: Array<'png' | 'svg' | 'pdf'> = ['png', 'svg', 'pdf'];

const defaultConfig: ScatterMatrixConfig = {
  columns: [],
  matrix: {
    spacing: 10,
    diagonalContent: 'histogram',
    showDiagonalLabels: true,
    labelPosition: 'corner',
    sharedAxes: true,
  },
  point: {
    symbol: 'circle',
    size: 4,
    colorOpacity: 0.7,
    colorPalette: 'viridis',
    borderColor: '#ffffff',
    borderWidth: 0.5,
    borderOpacity: 1,
  },
  showGrid: true,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
  },
  showLegend: true,
  legend: {
    position: 'right',
    orient: 'vertical',
    itemGap: 10,
    symbolSize: 8,
    fontSize: 11,
    continuous: true,
  },
  tooltip: {
    show: true,
    trigger: 'item',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showAllFields: false,
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'multiple',
    brush: true,
    hoverHighlight: true,
    linkedBrushing: true,
    clickAction: 'select',
  },
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
  },
  dimensions: {
    width: 800,
    height: 600,
  },
  responsive: {
    enabled: true,
    minWidth: 400,
    minHeight: 300,
  },
  exportable: true,
  exportFormats: DEFAULT_EXPORT_FORMATS,
  accessibility: {
    ariaLabel: 'Scatter matrix',
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    maxPoints: 5000,
    progressive: false,
  },
};

const symbolOptions: { value: ScatterPointSymbol; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'cross', label: 'Cross' },
  { value: 'x', label: 'X' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'star', label: 'Star' },
  { value: 'none', label: 'None' },
];

export const ScatterMatrixConfigDialog: React.FC<ScatterMatrixConfigDialogProps> = ({
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

  // Basic
  const [title, setTitle] = useState(initialMetadata.title ?? '');
  const [description, setDescription] = useState(initialMetadata.description ?? '');
  const [columns, setColumns] = useState<string[]>(initialMetadata.columns ?? []);
  const [colorField, setColorField] = useState<string | undefined>(initialMetadata.colorField);
  const [sizeField, setSizeField] = useState<string | undefined>(initialMetadata.sizeField);

  // Matrix layout
  const [matrixSpacing, setMatrixSpacing] = useState(initialMetadata.matrix?.spacing ?? defaultConfig.matrix.spacing);
  const [diagonalContent, setDiagonalContent] = useState(initialMetadata.matrix?.diagonalContent ?? defaultConfig.matrix.diagonalContent);
  const [showDiagonalLabels, setShowDiagonalLabels] = useState(initialMetadata.matrix?.showDiagonalLabels ?? defaultConfig.matrix.showDiagonalLabels);
  const [labelPosition, setLabelPosition] = useState(initialMetadata.matrix?.labelPosition ?? defaultConfig.matrix.labelPosition);
  const [sharedAxes, setSharedAxes] = useState(initialMetadata.matrix?.sharedAxes ?? defaultConfig.matrix.sharedAxes);
  const [columnsPerRow, setColumnsPerRow] = useState<number | undefined>(initialMetadata.matrix?.columnsPerRow);

  // Point styling
  const [pointSymbol, setPointSymbol] = useState(initialMetadata.point?.symbol ?? defaultConfig.point.symbol!);
  const [pointSize, setPointSize] = useState(initialMetadata.point?.size ?? defaultConfig.point.size!);
  const [pointColor, setPointColor] = useState(initialMetadata.point?.color ?? defaultConfig.point.color);
  const [pointColorOpacity, setPointColorOpacity] = useState(initialMetadata.point?.colorOpacity ?? defaultConfig.point.colorOpacity!);
  const [pointColorPalette, setPointColorPalette] = useState(initialMetadata.point?.colorPalette ?? defaultConfig.point.colorPalette!);
  const [pointBorderColor, setPointBorderColor] = useState(initialMetadata.point?.borderColor ?? defaultConfig.point.borderColor!);
  const [pointBorderWidth, setPointBorderWidth] = useState(initialMetadata.point?.borderWidth ?? defaultConfig.point.borderWidth!);
  const [pointBorderOpacity, setPointBorderOpacity] = useState(initialMetadata.point?.borderOpacity ?? defaultConfig.point.borderOpacity!);

  // Axes
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? true);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat ?? '');
  const [xAxisTickCount, setXAxisTickCount] = useState(initialMetadata.xAxis?.tickCount);
  const [xAxisScaleType, setXAxisScaleType] = useState(initialMetadata.xAxis?.scaleType ?? 'linear');

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? true);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat ?? '');
  const [yAxisTickCount, setYAxisTickCount] = useState(initialMetadata.yAxis?.tickCount);
  const [yAxisScaleType, setYAxisScaleType] = useState(initialMetadata.yAxis?.scaleType ?? 'linear');

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid!);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash ?? defaultConfig.grid!.dash);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend!);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title ?? '');
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
  const [legendSymbolSize, setLegendSymbolSize] = useState(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
  const [legendContinuous, setLegendContinuous] = useState(initialMetadata.legend?.continuous ?? defaultConfig.legend!.continuous);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
  const [tooltipShowAllFields, setTooltipShowAllFields] = useState(initialMetadata.tooltip?.showAllFields ?? defaultConfig.tooltip!.showAllFields);

  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [interactivitySelection, setInteractivitySelection] = useState(initialMetadata.interactivity?.selection ?? defaultConfig.interactivity!.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
  const [interactivityLinkedBrushing, setInteractivityLinkedBrushing] = useState(initialMetadata.interactivity?.linkedBrushing ?? defaultConfig.interactivity!.linkedBrushing);
  const [interactivityHoverHighlight, setInteractivityHoverHighlight] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
  const [interactivityClickAction, setInteractivityClickAction] = useState(initialMetadata.interactivity?.clickAction ?? defaultConfig.interactivity!.clickAction);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable!);
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(
    initialMetadata.exportFormats ?? DEFAULT_EXPORT_FORMATS
  );

  // Accessibility
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel ?? defaultConfig.accessibility!.ariaLabel);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);

  // UI collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    columns: true,
    matrix: true,
    point: false,
    axesGrid: false,
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

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title ?? '');
    setDescription(initialMetadata.description ?? '');
    setColumns(initialMetadata.columns ?? []);
    setColorField(initialMetadata.colorField);
    setSizeField(initialMetadata.sizeField);
    setMatrixSpacing(initialMetadata.matrix?.spacing ?? defaultConfig.matrix.spacing);
    setDiagonalContent(initialMetadata.matrix?.diagonalContent ?? defaultConfig.matrix.diagonalContent);
    setShowDiagonalLabels(initialMetadata.matrix?.showDiagonalLabels ?? defaultConfig.matrix.showDiagonalLabels);
    setLabelPosition(initialMetadata.matrix?.labelPosition ?? defaultConfig.matrix.labelPosition);
    setSharedAxes(initialMetadata.matrix?.sharedAxes ?? defaultConfig.matrix.sharedAxes);
    setColumnsPerRow(initialMetadata.matrix?.columnsPerRow);
    setPointSymbol(initialMetadata.point?.symbol ?? defaultConfig.point.symbol!);
    setPointSize(initialMetadata.point?.size ?? defaultConfig.point.size!);
    setPointColor(initialMetadata.point?.color ?? defaultConfig.point.color);
    setPointColorOpacity(initialMetadata.point?.colorOpacity ?? defaultConfig.point.colorOpacity!);
    setPointColorPalette(initialMetadata.point?.colorPalette ?? defaultConfig.point.colorPalette!);
    setPointBorderColor(initialMetadata.point?.borderColor ?? defaultConfig.point.borderColor!);
    setPointBorderWidth(initialMetadata.point?.borderWidth ?? defaultConfig.point.borderWidth!);
    setPointBorderOpacity(initialMetadata.point?.borderOpacity ?? defaultConfig.point.borderOpacity!);
    setXAxisVisible(initialMetadata.xAxis?.visible ?? true);
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat ?? '');
    setXAxisTickCount(initialMetadata.xAxis?.tickCount);
    setXAxisScaleType(initialMetadata.xAxis?.scaleType ?? 'linear');
    setYAxisVisible(initialMetadata.yAxis?.visible ?? true);
    setYAxisTickFormat(initialMetadata.yAxis?.tickFormat ?? '');
    setYAxisTickCount(initialMetadata.yAxis?.tickCount);
    setYAxisScaleType(initialMetadata.yAxis?.scaleType ?? 'linear');
    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid!);
    setGridColor(initialMetadata.grid?.color ?? defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width ?? defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash ?? defaultConfig.grid!.dash);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend!);
    setLegendPosition(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
    setLegendOrient(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
    setLegendTitle(initialMetadata.legend?.title ?? '');
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
    setLegendSymbolSize(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
    setLegendContinuous(initialMetadata.legend?.continuous ?? defaultConfig.legend!.continuous);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
    setTooltipText(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
    setTooltipShowAllFields(initialMetadata.tooltip?.showAllFields ?? defaultConfig.tooltip!.showAllFields);
    setInteractivityZoom(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
    setInteractivityPan(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
    setInteractivitySelection(initialMetadata.interactivity?.selection ?? defaultConfig.interactivity!.selection);
    setInteractivityBrush(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity!.brush);
    setInteractivityLinkedBrushing(initialMetadata.interactivity?.linkedBrushing ?? defaultConfig.interactivity!.linkedBrushing);
    setInteractivityHoverHighlight(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight);
    setInteractivityClickAction(initialMetadata.interactivity?.clickAction ?? defaultConfig.interactivity!.clickAction);
    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);
    setWidth(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable!);
    setExportFormats(initialMetadata.exportFormats ?? DEFAULT_EXPORT_FORMATS);
    setHighContrast(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
    setFocusable(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);
    setAriaLabel(initialMetadata.accessibility?.ariaLabel ?? defaultConfig.accessibility!.ariaLabel);
    setDownsampling(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
    setMaxPoints(initialMetadata.performance?.maxPoints ?? defaultConfig.performance!.maxPoints);
  }, [initialMetadata]);

  const handleSave = () => {
    if (columns.length === 0) {
      alert('Please select at least one numeric column.');
      return;
    }

    const config: ScatterMatrixConfig = {
      title,
      description,
      columns,
      colorField,
      sizeField,
      matrix: {
        spacing: matrixSpacing,
        diagonalContent,
        showDiagonalLabels,
        labelPosition,
        sharedAxes,
        columnsPerRow,
      },
      point: {
        symbol: pointSymbol,
        size: pointSize,
        color: pointColor,
        colorOpacity: pointColorOpacity,
        colorPalette: pointColorPalette,
        borderColor: pointBorderColor,
        borderWidth: pointBorderWidth,
        borderOpacity: pointBorderOpacity,
      },
      xAxis: {
        visible: xAxisVisible,
        tickFormat: xAxisTickFormat,
        tickCount: xAxisTickCount,
        scaleType: xAxisScaleType,
      },
      yAxis: {
        visible: yAxisVisible,
        tickFormat: yAxisTickFormat,
        tickCount: yAxisTickCount,
        scaleType: yAxisScaleType,
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
        orient: legendOrient,
        title: legendTitle,
        itemGap: legendItemGap,
        symbolSize: legendSymbolSize,
        continuous: legendContinuous,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        showAllFields: tooltipShowAllFields,
      },
      interactivity: {
        zoom: interactivityZoom,
        pan: interactivityPan,
        selection: interactivitySelection,
        brush: interactivityBrush,
        linkedBrushing: interactivityLinkedBrushing,
        hoverHighlight: interactivityHoverHighlight,
        clickAction: interactivityClickAction,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth: defaultConfig.responsive!.minWidth,
        minHeight: defaultConfig.responsive!.minHeight,
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel,
        highContrast,
        focusable,
      },
      performance: {
        downsampling,
        maxPoints,
        progressive: defaultConfig.performance!.progressive,
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
            <Layers className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-semibold text-white">Configure Scatter Matrix</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Info */}
          <SectionHeader title="Basic Information" icon={<Layout className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Scatter Matrix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Optional description"
                />
              </div>
            </div>
          )}

          {/* Column Selection */}
          <SectionHeader title="Columns & Mapping" icon={<Columns className="h-4 w-4" />} sectionKey="columns" />
          {sections.columns && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Numeric Columns <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-800 p-2 rounded-md">
                  {numericColumns.map(col => (
                    <label key={col.name} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={columns.includes(col.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setColumns([...columns, col.name]);
                          } else {
                            setColumns(columns.filter(c => c !== col.name));
                          }
                        }}
                        className="rounded border-gray-600 text-pink-500"
                      />
                      <span className="text-gray-200">{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Field (optional)</label>
                <select
                  value={colorField || ''}
                  onChange={(e) => setColorField(e.target.value || undefined)}
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
                  value={sizeField || ''}
                  onChange={(e) => setSizeField(e.target.value || undefined)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Matrix Layout */}
          <SectionHeader title="Matrix Layout" icon={<Grid className="h-4 w-4" />} sectionKey="matrix" />
          {sections.matrix && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Columns per row</label>
                  <input
                    type="number"
                    min={1}
                    value={columnsPerRow || ''}
                    onChange={(e) => setColumnsPerRow(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cell spacing (px)</label>
                  <input
                    type="number"
                    min={0}
                    value={matrixSpacing}
                    onChange={(e) => setMatrixSpacing(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Diagonal content</label>
                <div className="flex space-x-4">
                  {(['histogram', 'density', 'none', 'scatter'] as const).map(option => (
                    <label key={option} className="flex items-center space-x-1">
                      <input
                        type="radio"
                        value={option}
                        checked={diagonalContent === option}
                        onChange={() => setDiagonalContent(option)}
                        className="text-pink-500"
                      />
                      <span className="text-sm text-gray-200 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showDiagonalLabels}
                    onChange={(e) => setShowDiagonalLabels(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Show diagonal labels</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sharedAxes}
                    onChange={(e) => setSharedAxes(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Shared axes scales</span>
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Label position</label>
                <select
                  value={labelPosition}
                  onChange={(e) => setLabelPosition(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="corner">Corner</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          )}

          {/* Point Styling */}
          <SectionHeader title="Point Styling" icon={<Circle className="h-4 w-4" />} sectionKey="point" />
          {sections.point && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                  <select
                    value={pointSymbol}
                    onChange={(e) => setPointSymbol(e.target.value as ScatterPointSymbol)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    {symbolOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fixed size (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={pointSize}
                    onChange={(e) => setPointSize(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill opacity</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={pointColorOpacity}
                    onChange={(e) => setPointColorOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Color palette</label>
                  <input
                    type="text"
                    value={pointColorPalette as string}
                    onChange={(e) => setPointColorPalette(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="viridis"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border color</label>
                  <input
                    type="color"
                    value={pointBorderColor}
                    onChange={(e) => setPointBorderColor(e.target.value)}
                    className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border width</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={pointBorderWidth}
                    onChange={(e) => setPointBorderWidth(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border opacity</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={pointBorderOpacity}
                    onChange={(e) => setPointBorderOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Axes & Grid */}
          <SectionHeader title="Axes & Grid" icon={<ArrowUpDown className="h-4 w-4" />} sectionKey="axesGrid" />
          {sections.axesGrid && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">X‑Axis</h4>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={xAxisVisible} onChange={(e) => setXAxisVisible(e.target.checked)} />
                    <span className="text-xs">Visible</span>
                  </label>
                  <div>
                    <label className="block text-xs text-gray-400">Tick format</label>
                    <input type="text" value={xAxisTickFormat} onChange={(e) => setXAxisTickFormat(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Scale</label>
                    <select value={xAxisScaleType} onChange={(e) => setXAxisScaleType(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Y‑Axis</h4>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={yAxisVisible} onChange={(e) => setYAxisVisible(e.target.checked)} />
                    <span className="text-xs">Visible</span>
                  </label>
                  <div>
                    <label className="block text-xs text-gray-400">Tick format</label>
                    <input type="text" value={yAxisTickFormat} onChange={(e) => setYAxisTickFormat(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Scale</label>
                    <select value={yAxisScaleType} onChange={(e) => setYAxisScaleType(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option value="linear">Linear</option>
                      <option value="log">Log</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                  <span className="text-sm text-gray-200">Show grid lines</span>
                </label>
                {showGrid && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400">Color</label>
                      <input type="color" value={gridColor} onChange={(e) => setGridColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Width</label>
                      <input type="number" min={0.5} step={0.5} value={gridWidth} onChange={(e) => setGridWidth(parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Dash</label>
                      <input type="text" value={gridDash} onChange={(e) => setGridDash(e.target.value)} placeholder="5,5" className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <SectionHeader title="Legend" icon={<Eye className="h-4 w-4" />} sectionKey="legend" />
          {sections.legend && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
                <span className="text-sm text-gray-200">Show legend</span>
              </label>
              {showLegend && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400">Position</label>
                    <select value={legendPosition} onChange={(e) => setLegendPosition(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
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
                    <label className="block text-xs text-gray-400">Orientation</label>
                    <select value={legendOrient} onChange={(e) => setLegendOrient(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Title</label>
                    <input type="text" value={legendTitle} onChange={(e) => setLegendTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Item gap</label>
                    <input type="number" min={0} value={legendItemGap} onChange={(e) => setLegendItemGap(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Symbol size</label>
                    <input type="number" min={4} value={legendSymbolSize} onChange={(e) => setLegendSymbolSize(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={legendContinuous} onChange={(e) => setLegendContinuous(e.target.checked)} />
                      <span className="text-xs">Continuous gradient</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tooltip */}
          <SectionHeader title="Tooltip" icon={<MousePointer className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={tooltipShow} onChange={(e) => setTooltipShow(e.target.checked)} />
                <span className="text-sm text-gray-200">Enable tooltip</span>
              </label>
              {tooltipShow && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400">Trigger</label>
                    <select value={tooltipTrigger} onChange={(e) => setTooltipTrigger(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option value="item">Item</option>
                      <option value="axis">Axis</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Background</label>
                    <input type="color" value={tooltipBg} onChange={(e) => setTooltipBg(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Border</label>
                    <input type="color" value={tooltipBorder} onChange={(e) => setTooltipBorder(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Text color</label>
                    <input type="color" value={tooltipText} onChange={(e) => setTooltipText(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded" />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={tooltipShowAllFields} onChange={(e) => setTooltipShowAllFields(e.target.checked)} />
                      <span className="text-xs">Show all fields for the point</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity */}
          <SectionHeader title="Interactivity" icon={<Brush className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={interactivityZoom} onChange={(e) => setInteractivityZoom(e.target.checked)} />
                  <span className="text-xs">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={interactivityPan} onChange={(e) => setInteractivityPan(e.target.checked)} />
                  <span className="text-xs">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={interactivityBrush} onChange={(e) => setInteractivityBrush(e.target.checked)} />
                  <span className="text-xs">Brush selection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={interactivityLinkedBrushing} onChange={(e) => setInteractivityLinkedBrushing(e.target.checked)} />
                  <span className="text-xs">Linked brushing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={interactivityHoverHighlight} onChange={(e) => setInteractivityHoverHighlight(e.target.checked)} />
                  <span className="text-xs">Hover highlight</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Selection mode</label>
                <select value={interactivitySelection} onChange={(e) => setInteractivitySelection(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                  <option value="none">None</option>
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Click action</label>
                <select value={interactivityClickAction} onChange={(e) => setInteractivityClickAction(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                  <option value="none">None</option>
                  <option value="select">Select</option>
                  <option value="drilldown">Drill down</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          )}

          {/* Animation */}
          <SectionHeader title="Animation" icon={<Play className="h-4 w-4" />} sectionKey="animation" />
          {sections.animation && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={animationEnabled} onChange={(e) => setAnimationEnabled(e.target.checked)} />
                <span className="text-sm text-gray-200">Enable animation</span>
              </label>
              {animationEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400">Duration (ms)</label>
                    <input type="number" min={0} step={50} value={animationDuration} onChange={(e) => setAnimationDuration(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Easing</label>
                    <select value={animationEasing} onChange={(e) => setAnimationEasing(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
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

          {/* Dimensions */}
          <SectionHeader title="Dimensions" icon={<Maximize2 className="h-4 w-4" />} sectionKey="dimensions" />
          {sections.dimensions && (
            <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                <input type="number" min={200} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                <input type="number" min={200} value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" />
              </div>
            </div>
          )}

          {/* Export & Responsive */}
          <SectionHeader title="Export & Responsive" icon={<Download className="h-4 w-4" />} sectionKey="export" />
          {sections.export && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={responsiveEnabled} onChange={(e) => setResponsiveEnabled(e.target.checked)} />
                <span className="text-sm text-gray-200">Responsive layout</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={exportable} onChange={(e) => setExportable(e.target.checked)} />
                <span className="text-sm text-gray-200">Allow export</span>
              </label>
              {exportable && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Export formats</label>
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
                              setExportFormats(exportFormats.filter(x => x !== f));
                            }
                          }}
                        />
                        <span className="text-xs uppercase">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accessibility */}
          <SectionHeader title="Accessibility" icon={<Contrast className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                <input type="text" value={ariaLabel} onChange={(e) => setAriaLabel(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
                  <span className="text-xs">High contrast mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={focusable} onChange={(e) => setFocusable(e.target.checked)} />
                  <span className="text-xs">Focusable</span>
                </label>
              </div>
            </div>
          )}

          {/* Performance */}
          <SectionHeader title="Performance" icon={<Cpu className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={downsampling} onChange={(e) => setDownsampling(e.target.checked)} />
                <span className="text-sm text-gray-200">Downsampling (for large data)</span>
              </label>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max points per scatter</label>
                <input type="number" min={100} value={maxPoints} onChange={(e) => setMaxPoints(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-md flex items-center space-x-2 transition-colors">
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};