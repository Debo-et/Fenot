import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  Sliders,
  Palette,
  Grid,
  Eye,
  Play,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart,
  Tag,
} from 'lucide-react';
import { FunnelConfig } from '../../types/visualization-configs';

interface FunnelConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<FunnelConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: FunnelConfig) => void;
}

const defaultConfig: FunnelConfig = {
  title: '',
  stageField: '',
  valueField: '',
  groupField: '',
  orientation: 'vertical',
  shape: 'trapezoid',
  barWidth: undefined,
  barGap: 2,
  barStyle: {
    fillColor: '#3b82f6',
    fillOpacity: 0.8,
    borderColor: '#1e3a8a',
    borderWidth: 1,
    borderRadius: 0,
  },
  colorScheme: '#3b82f6',
  colorGradient: false,
  gradientDirection: 'vertical',
  stageOrder: 'descending', // usually highest first
  customStageOrder: [],
  xAxis: {
    visible: true,
    title: '',
    tickLabelRotation: 0,
    tickFormat: '',
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
  },
  yAxis: {
    visible: true,
    title: '',
    tickFormat: '',
    lineColor: '#cccccc',
    lineWidth: 1,
    tickColor: '#999999',
    tickSize: 6,
    zeroBaseline: true,
  },
  dataLabels: {
    show: true,
    position: 'inside',
    format: '',
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: 'transparent',
    offset: 0,
    showPercentage: true,
    showStageName: true,
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
    showPercentage: true,
  },
  showLegend: false,
  legend: {
    position: 'top',
    orient: 'horizontal',
    itemGap: 10,
    fontSize: 12,
  },
  showGrid: true,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
    xLines: false,
    yLines: true,
  },
  interactivity: {
    zoom: false,
    pan: false,
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
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    ariaLabel: 'Funnel chart',
    focusable: true,
  },
};

// Helper to stringify array colors
const stringifyColors = (colors?: string | string[]): string => {
  if (!colors) return '';
  if (Array.isArray(colors)) return colors.join(', ');
  return colors;
};

export const FunnelConfigDialog: React.FC<FunnelConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar', 'char', 'category'].includes(col.type.toLowerCase())
  );
  const numericalColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );

  // Basic fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [stageField, setStageField] = useState(initialMetadata.stageField || '');
  const [valueField, setValueField] = useState(initialMetadata.valueField || '');
  const [groupField, setGroupField] = useState(initialMetadata.groupField || '');
  const [orientation, setOrientation] = useState(initialMetadata.orientation || defaultConfig.orientation);
  const [shape, setShape] = useState(initialMetadata.shape || defaultConfig.shape);
  const [barWidth, setBarWidth] = useState(initialMetadata.barWidth);
  const [barGap, setBarGap] = useState(initialMetadata.barGap ?? defaultConfig.barGap);
  const [stageOrder, setStageOrder] = useState(initialMetadata.stageOrder || defaultConfig.stageOrder);
  const [customStageOrder, setCustomStageOrder] = useState(initialMetadata.customStageOrder || []);
  const [colorsInput, setColorsInput] = useState(stringifyColors(initialMetadata.colorScheme ?? defaultConfig.colorScheme));
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
  const [gradientDirection, setGradientDirection] = useState(initialMetadata.gradientDirection || defaultConfig.gradientDirection);
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Bar style
  const [barFillColor, setBarFillColor] = useState(initialMetadata.barStyle?.fillColor ?? defaultConfig.barStyle.fillColor);
  const [barFillOpacity, setBarFillOpacity] = useState(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
  const [barBorderColor, setBarBorderColor] = useState(initialMetadata.barStyle?.borderColor ?? defaultConfig.barStyle.borderColor);
  const [barBorderWidth, setBarBorderWidth] = useState(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
  const [barBorderRadius, setBarBorderRadius] = useState(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);

  // Labels
  const [labelsShow, setLabelsShow] = useState(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
  const [labelsPosition, setLabelsPosition] = useState(initialMetadata.dataLabels?.position ?? defaultConfig.dataLabels!.position);
  const [labelsFormat, setLabelsFormat] = useState(initialMetadata.dataLabels?.format ?? '');
  const [labelsFontSize, setLabelsFontSize] = useState(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
  const [labelsColor, setLabelsColor] = useState(initialMetadata.dataLabels?.color ?? defaultConfig.dataLabels!.color);
  const [labelsBg, setLabelsBg] = useState(initialMetadata.dataLabels?.backgroundColor ?? defaultConfig.dataLabels!.backgroundColor);
  const [labelsOffset, setLabelsOffset] = useState(initialMetadata.dataLabels?.offset ?? 0);
  const [labelsShowPercentage, setLabelsShowPercentage] = useState(initialMetadata.dataLabels?.showPercentage ?? true);
  const [labelsShowStageName, setLabelsShowStageName] = useState(initialMetadata.dataLabels?.showStageName ?? true);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format ?? '');
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
  const [tooltipShowValues, setTooltipShowValues] = useState(initialMetadata.tooltip?.showValues ?? true);
  const [tooltipShowPercentage, setTooltipShowPercentage] = useState(initialMetadata.tooltip?.showPercentage ?? true);

  // Legend
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);

  // Axes (simplified – only xAxis shown here, similar for yAxis)
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title ?? '');
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat ?? '');
  const [xAxisTickRotate, setXAxisTickRotate] = useState(initialMetadata.xAxis?.tickLabelRotation ?? 0);
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor ?? defaultConfig.xAxis!.lineColor);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor ?? defaultConfig.xAxis!.tickColor);

  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? false);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? false);
  const [interactivitySelection, setInteractivitySelection] = useState(initialMetadata.interactivity?.selection || 'none');
  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? true);
  const [interactivityClick, setInteractivityClick] = useState(initialMetadata.interactivity?.clickAction || 'none');

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? true);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? 300);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || 'ease');

  // Responsive/Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? true);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? true);
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(
  initialMetadata.exportFormats || (['png', 'svg', 'pdf'] as Array<'png' | 'svg' | 'pdf'>)
);

  // Sections collapse state
  const [sections, setSections] = useState({
    basic: true,
    mapping: true,
    styling: false,
    axes: false,
    labels: false,
    tooltip: false,
    legend: false,
    grid: false,
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
    setTitle(initialMetadata.title || defaultConfig.title);
    setStageField(initialMetadata.stageField || '');
    setValueField(initialMetadata.valueField || '');
    setGroupField(initialMetadata.groupField || '');
    setOrientation(initialMetadata.orientation || defaultConfig.orientation);
    setShape(initialMetadata.shape || defaultConfig.shape);
    setBarWidth(initialMetadata.barWidth);
    setBarGap(initialMetadata.barGap ?? defaultConfig.barGap);
    setStageOrder(initialMetadata.stageOrder || defaultConfig.stageOrder);
    setCustomStageOrder(initialMetadata.customStageOrder || []);
    setColorsInput(stringifyColors(initialMetadata.colorScheme ?? defaultConfig.colorScheme));
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
    setGradientDirection(initialMetadata.gradientDirection || defaultConfig.gradientDirection);
    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

    setBarFillColor(initialMetadata.barStyle?.fillColor ?? defaultConfig.barStyle.fillColor);
    setBarFillOpacity(initialMetadata.barStyle?.fillOpacity ?? defaultConfig.barStyle.fillOpacity);
    setBarBorderColor(initialMetadata.barStyle?.borderColor ?? defaultConfig.barStyle.borderColor);
    setBarBorderWidth(initialMetadata.barStyle?.borderWidth ?? defaultConfig.barStyle.borderWidth);
    setBarBorderRadius(initialMetadata.barStyle?.borderRadius ?? defaultConfig.barStyle.borderRadius);

    setLabelsShow(initialMetadata.dataLabels?.show ?? defaultConfig.dataLabels!.show);
    setLabelsPosition(initialMetadata.dataLabels?.position ?? defaultConfig.dataLabels!.position);
    setLabelsFormat(initialMetadata.dataLabels?.format ?? '');
    setLabelsFontSize(initialMetadata.dataLabels?.fontSize ?? defaultConfig.dataLabels!.fontSize);
    setLabelsColor(initialMetadata.dataLabels?.color ?? defaultConfig.dataLabels!.color);
    setLabelsBg(initialMetadata.dataLabels?.backgroundColor ?? defaultConfig.dataLabels!.backgroundColor);
    setLabelsOffset(initialMetadata.dataLabels?.offset ?? 0);
    setLabelsShowPercentage(initialMetadata.dataLabels?.showPercentage ?? true);
    setLabelsShowStageName(initialMetadata.dataLabels?.showStageName ?? true);

    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
    setTooltipFormat(initialMetadata.tooltip?.format ?? '');
    setTooltipBg(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipBorder(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
    setTooltipText(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
    setTooltipFontSize(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
    setTooltipShowValues(initialMetadata.tooltip?.showValues ?? true);
    setTooltipShowPercentage(initialMetadata.tooltip?.showPercentage ?? true);

    setLegendPosition(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
    setLegendOrient(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
    setLegendFontSize(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);

    setXAxisVisible(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis!.visible);
    setXAxisTitle(initialMetadata.xAxis?.title ?? '');
    setXAxisTickFormat(initialMetadata.xAxis?.tickFormat ?? '');
    setXAxisTickRotate(initialMetadata.xAxis?.tickLabelRotation ?? 0);
    setXAxisLineColor(initialMetadata.xAxis?.lineColor ?? defaultConfig.xAxis!.lineColor);
    setXAxisTickColor(initialMetadata.xAxis?.tickColor ?? defaultConfig.xAxis!.tickColor);

    setInteractivityZoom(initialMetadata.interactivity?.zoom ?? false);
    setInteractivityPan(initialMetadata.interactivity?.pan ?? false);
    setInteractivitySelection(initialMetadata.interactivity?.selection || 'none');
    setInteractivityHover(initialMetadata.interactivity?.hoverHighlight ?? true);
    setInteractivityClick(initialMetadata.interactivity?.clickAction || 'none');

    setAnimationEnabled(initialMetadata.animation?.enabled ?? true);
    setAnimationDuration(initialMetadata.animation?.duration ?? 300);
    setAnimationEasing(initialMetadata.animation?.easing || 'ease');

    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? true);
    setExportable(initialMetadata.exportable ?? true);
    setExportFormats(initialMetadata.exportFormats || ['png', 'svg', 'pdf']);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!stageField) {
      alert('Please select a stage field.');
      return;
    }
    if (!valueField) {
      alert('Please select a value field.');
      return;
    }

    // Parse colors
    let colorScheme: string | string[] = colorsInput;
    if (colorsInput.includes(',')) {
      colorScheme = colorsInput.split(',').map(s => s.trim());
    }

    const config: FunnelConfig = {
      title,
      stageField,
      valueField,
      groupField: groupField || undefined,
      orientation,
      shape,
      barWidth: barWidth || undefined,
      barGap,
      stageOrder,
      customStageOrder: stageOrder === 'custom' ? customStageOrder : undefined,
      barStyle: {
        fillColor: barFillColor,
        fillOpacity: barFillOpacity,
        borderColor: barBorderColor,
        borderWidth: barBorderWidth,
        borderRadius: barBorderRadius,
      },
      colorScheme,
      colorGradient,
      gradientDirection,
      xAxis: {
        visible: xAxisVisible,
        title: xAxisTitle,
        tickLabelRotation: xAxisTickRotate,
        tickFormat: xAxisTickFormat,
        lineColor: xAxisLineColor,
        lineWidth: 1, // default, could be added
        tickColor: xAxisTickColor,
        tickSize: 6,
      },
      yAxis: {
        visible: true, // for simplicity, keep visible
        title: '',
        tickFormat: '',
        lineColor: '#cccccc',
        lineWidth: 1,
        tickColor: '#999999',
        tickSize: 6,
        zeroBaseline: true,
      },
      dataLabels: {
        show: labelsShow,
        position: labelsPosition,
        format: labelsFormat,
        fontSize: labelsFontSize,
        color: labelsColor,
        backgroundColor: labelsBg,
        offset: labelsOffset,
        showPercentage: labelsShowPercentage,
        showStageName: labelsShowStageName,
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
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        itemGap: legendItemGap,
        fontSize: legendFontSize,
      },
      showGrid,
      grid: {
        color: '#e5e5e5',
        width: 0.5,
        dash: '',
        xLines: false,
        yLines: true,
      },
      interactivity: {
        zoom: interactivityZoom,
        pan: interactivityPan,
        selection: interactivitySelection as any,
        brush: false,
        hoverHighlight: interactivityHover,
        clickAction: interactivityClick as any,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
      },
      exportable,
      exportFormats,
      accessibility: defaultConfig.accessibility,
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
            <h2 className="text-lg font-semibold text-white">Configure Funnel Chart</h2>
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
                  placeholder="My Funnel"
                />
              </div>
            </div>
          )}

          {/* Data Mapping */}
          <SectionHeader title="Data Mapping" icon={<Tag className="h-4 w-4" />} sectionKey="mapping" />
          {sections.mapping && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Stage Field *</label>
                <select
                  value={stageField}
                  onChange={(e) => setStageField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select a categorical field</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value Field *</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Group Field (optional)</label>
                <select
                  value={groupField}
                  onChange={(e) => setGroupField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Stage Order</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="ascending" checked={stageOrder === 'ascending'} onChange={(e) => setStageOrder(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Ascending</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="descending" checked={stageOrder === 'descending'} onChange={(e) => setStageOrder(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Descending (largest first)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="custom" checked={stageOrder === 'custom'} onChange={(e) => setStageOrder(e.target.value as any)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Custom</span>
                  </label>
                </div>
                {stageOrder === 'custom' && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-400 mb-1">Custom stage order (comma‑separated, e.g. "Visitors, Signups, Purchases")</label>
                    <input
                      type="text"
                      value={customStageOrder.join(', ')}
                      onChange={(e) => setCustomStageOrder(e.target.value.split(',').map(s => s.trim()))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Styling Section */}
          <SectionHeader title="Styling" icon={<Palette className="h-4 w-4" />} sectionKey="styling" />
          {sections.styling && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Shape</label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="trapezoid">Trapezoid</option>
                    <option value="bar">Bar</option>
                    <option value="pyramid">Pyramid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bar Width (px, auto if blank)</label>
                  <input
                    type="number"
                    min="10"
                    value={barWidth || ''}
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
              </div>

              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">Fill</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color(s)</label>
                    <input
                      type="text"
                      value={colorsInput}
                      onChange={(e) => setColorsInput(e.target.value)}
                      placeholder="#3b82f6, #ef4444, ..."
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
                      value={barFillOpacity}
                      onChange={(e) => setBarFillOpacity(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Gradient</label>
                    <input
                      type="checkbox"
                      checked={colorGradient}
                      onChange={(e) => setColorGradient(e.target.checked)}
                      className="rounded border-gray-600 text-purple-500"
                    />
                  </div>
                  {colorGradient && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Direction</label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
                <h4 className="text-xs font-semibold text-gray-300">Border</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={barBorderColor}
                      onChange={(e) => setBarBorderColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
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
                    <label className="block text-xs text-gray-400 mb-1">Border Radius</label>
                    <input
                      type="number"
                      min="0"
                      value={barBorderRadius}
                      onChange={(e) => setBarBorderRadius(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Axes & Grid */}
          <SectionHeader title="Axes & Grid" icon={<Grid className="h-4 w-4" />} sectionKey="axes" />
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
                      <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                      <input
                        type="text"
                        value={xAxisTickFormat}
                        onChange={(e) => setXAxisTickFormat(e.target.value)}
                        placeholder="e.g. .2f"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Label Rotation</label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        value={xAxisTickRotate}
                        onChange={(e) => setXAxisTickRotate(Number(e.target.value))}
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
                      <label className="block text-xs text-gray-400 mb-1">Tick Color</label>
                      <input
                        type="color"
                        value={xAxisTickColor}
                        onChange={(e) => setXAxisTickColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Show grid lines</span>
                </label>
              </div>
            </div>
          )}

          {/* Labels */}
          <SectionHeader title="Data Labels" icon={<Tag className="h-4 w-4" />} sectionKey="labels" />
          {sections.labels && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={labelsShow}
                  onChange={(e) => setLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show data labels</span>
              </label>
              {labelsShow && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <select
                      value={labelsPosition}
                      onChange={(e) => setLabelsPosition(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="inside">Inside</option>
                      <option value="outside">Outside</option>
                      <option value="top">Top</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      max="48"
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
                    <label className="block text-xs text-gray-400 mb-1">Background</label>
                    <input
                      type="color"
                      value={labelsBg}
                      onChange={(e) => setLabelsBg(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Offset (px)</label>
                    <input
                      type="number"
                      value={labelsOffset}
                      onChange={(e) => setLabelsOffset(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelsShowPercentage}
                        onChange={(e) => setLabelsShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Show percentage</span>
                    </label>
                    <label className="flex items-center space-x-2 mt-1">
                      <input
                        type="checkbox"
                        checked={labelsShowStageName}
                        onChange={(e) => setLabelsShowStageName(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Show stage name</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tooltip */}
          <SectionHeader title="Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
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
                      <option value="item">Item</option>
                      <option value="axis">Axis</option>
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
                    <label className="block text-xs text-gray-400 mb-1">Text Color</label>
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
                      value={tooltipFontSize}
                      onChange={(e) => setTooltipFontSize(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowValues}
                        onChange={(e) => setTooltipShowValues(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Show values</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowPercentage}
                        onChange={(e) => setTooltipShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">Show percentage</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <SectionHeader title="Legend" icon={<Layout className="h-4 w-4" />} sectionKey="legend" />
          {sections.legend && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
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
                      onChange={(e) => setLegendItemGap(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font size</label>
                    <input
                      type="number"
                      min="8"
                      value={legendFontSize}
                      onChange={(e) => setLegendFontSize(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity */}
          <SectionHeader title="Interactivity" icon={<Play className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
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
                <div>
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
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityHover}
                    onChange={(e) => setInteractivityHover(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-xs text-gray-200">Hover highlight</span>
                </label>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Click action</label>
                  <select
                    value={interactivityClick}
                    onChange={(e) => setInteractivityClick(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="none">None</option>
                    <option value="select">Select</option>
                    <option value="drilldown">Drilldown</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Animation */}
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

          {/* Advanced (Responsive/Export) */}
          <SectionHeader title="Advanced" icon={<Settings className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responsiveEnabled}
                    onChange={(e) => setResponsiveEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Responsive (adjust to container)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportable}
                    onChange={(e) => setExportable(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Allow export</span>
                </label>
              </div>
              {exportable && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Export formats</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={exportFormats.includes('png')}
                        onChange={(e) => {
                          if (e.target.checked) setExportFormats([...exportFormats, 'png']);
                          else setExportFormats(exportFormats.filter(f => f !== 'png'));
                        }}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">PNG</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={exportFormats.includes('svg')}
                        onChange={(e) => {
                          if (e.target.checked) setExportFormats([...exportFormats, 'svg']);
                          else setExportFormats(exportFormats.filter(f => f !== 'svg'));
                        }}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">SVG</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={exportFormats.includes('pdf')}
                        onChange={(e) => {
                          if (e.target.checked) setExportFormats([...exportFormats, 'pdf']);
                          else setExportFormats(exportFormats.filter(f => f !== 'pdf'));
                        }}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-xs text-gray-200">PDF</span>
                    </label>
                  </div>
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