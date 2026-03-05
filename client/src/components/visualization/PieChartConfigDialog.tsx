// src/components/visualization/PieChartConfigDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  ChevronDown,
  ChevronRight,
  Sliders,
  Eye,
  Play,
  Wrench,
  PieChart,
  Hash,
} from 'lucide-react';
import { PieChartConfig } from '../../types/visualization-configs';

interface PieChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<PieChartConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: PieChartConfig) => void;
}

const defaultConfig: PieChartConfig = {
  title: '',
  angleField: '',
  colorField: '',
  seriesField: '',
  multiPieMode: 'single',
  innerRadius: 0,
  outerRadius: 0.8,
  startAngle: 0,
  endAngle: 360,
  roseType: false,
  clockwise: true,
  avoidLabelOverlap: false,
  labelLine: {
    show: true,
    length: 15,
    length2: 15,
    smooth: false,
    color: '#aaa',
    width: 1,
    opacity: 1,
  },
  colorScheme: '#3b82f6',
  opacity: 1,
  labels: {
    show: true,
    position: 'outside',
    format: '',
    fontSize: 12,
    color: '#333',
    backgroundColor: 'transparent',
    offset: 30,
    showPercentage: true,
    showValue: false,
    showName: true,
    rotate: false,
  },
  showLegend: true,
  legend: {
    position: 'top',
    orient: 'horizontal',
    itemGap: 10,
    itemWidth: 20,
    itemHeight: 14,
    fontSize: 12,
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
  interactivity: {
    hoverHighlight: true,
    clickAction: 'none',
  },
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
  },
  dimensions: { width: 500, height: 400 },
  exportable: true,
  exportFormats: ['png', 'svg'],
  responsive: { enabled: true },
  accessibility: { ariaLabel: '', highContrast: false, focusable: true },
  performance: { downsampling: false },
};

export const PieChartConfigDialog: React.FC<PieChartConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const numericalColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar', 'char'].includes(col.type.toLowerCase())
  );

  // Form state
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [angleField, setAngleField] = useState(initialMetadata.angleField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [seriesField, setSeriesField] = useState(initialMetadata.seriesField || '');
  const [multiPieMode, setMultiPieMode] = useState(initialMetadata.multiPieMode || defaultConfig.multiPieMode);
  const [innerRadius, setInnerRadius] = useState(initialMetadata.innerRadius ?? defaultConfig.innerRadius!);
  const [outerRadius, setOuterRadius] = useState(initialMetadata.outerRadius ?? defaultConfig.outerRadius!);
  const [startAngle, setStartAngle] = useState(initialMetadata.startAngle ?? defaultConfig.startAngle!);
  const [endAngle, setEndAngle] = useState(initialMetadata.endAngle ?? defaultConfig.endAngle!);
  const [roseType, setRoseType] = useState(initialMetadata.roseType ?? defaultConfig.roseType!);
  const [clockwise, setClockwise] = useState(initialMetadata.clockwise ?? defaultConfig.clockwise!);
  const [avoidLabelOverlap, setAvoidLabelOverlap] = useState(initialMetadata.avoidLabelOverlap ?? defaultConfig.avoidLabelOverlap!);
  const [labelLineShow, setLabelLineShow] = useState(initialMetadata.labelLine?.show ?? defaultConfig.labelLine!.show!);
  const [labelLineLength, setLabelLineLength] = useState(initialMetadata.labelLine?.length ?? defaultConfig.labelLine!.length!);
  const [labelLineLength2, setLabelLineLength2] = useState(initialMetadata.labelLine?.length2 ?? defaultConfig.labelLine!.length2!);
  const [labelLineSmooth, setLabelLineSmooth] = useState(initialMetadata.labelLine?.smooth ?? defaultConfig.labelLine!.smooth!);
  const [labelLineColor, setLabelLineColor] = useState(initialMetadata.labelLine?.color ?? defaultConfig.labelLine!.color!);
  const [labelLineWidth, setLabelLineWidth] = useState(initialMetadata.labelLine?.width ?? defaultConfig.labelLine!.width!);
  const [labelLineOpacity, setLabelLineOpacity] = useState(initialMetadata.labelLine?.opacity ?? defaultConfig.labelLine!.opacity!);

  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScheme || defaultConfig.colorScheme!);
  const [opacity, setOpacity] = useState(initialMetadata.opacity ?? defaultConfig.opacity!);

  const [labelsShow, setLabelsShow] = useState(initialMetadata.labels?.show ?? defaultConfig.labels!.show!);
  const [labelsPosition, setLabelsPosition] = useState(initialMetadata.labels?.position || defaultConfig.labels!.position!);
  const [labelsFormat, setLabelsFormat] = useState(initialMetadata.labels?.format || defaultConfig.labels!.format!);
  const [labelsFontSize, setLabelsFontSize] = useState(initialMetadata.labels?.fontSize ?? defaultConfig.labels!.fontSize!);
  const [labelsColor, setLabelsColor] = useState(initialMetadata.labels?.color || defaultConfig.labels!.color!);
  const [labelsBackground, setLabelsBackground] = useState(initialMetadata.labels?.backgroundColor || defaultConfig.labels!.backgroundColor!);
  const [labelsOffset, setLabelsOffset] = useState(initialMetadata.labels?.offset ?? defaultConfig.labels!.offset!);
  const [labelsShowPercentage, setLabelsShowPercentage] = useState(initialMetadata.labels?.showPercentage ?? defaultConfig.labels!.showPercentage!);
  const [labelsShowValue, setLabelsShowValue] = useState(initialMetadata.labels?.showValue ?? defaultConfig.labels!.showValue!);
  const [labelsShowName, setLabelsShowName] = useState(initialMetadata.labels?.showName ?? defaultConfig.labels!.showName!);
  const [labelsRotate, setLabelsRotate] = useState(initialMetadata.labels?.rotate ?? defaultConfig.labels!.rotate!);

  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend!);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || defaultConfig.legend!.position!);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient || defaultConfig.legend!.orient!);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap!);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize!);

  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show!);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format!);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor!);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor!);
  const [tooltipTextColor, setTooltipTextColor] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor!);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize!);

  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight!);
  const [clickAction, setClickAction] = useState(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction!);

  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled!);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration!);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || defaultConfig.animation!.easing!);

  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable!);
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled!);

  const [sections, setSections] = useState({
    basic: true,
    appearance: false,
    labels: false,
    legendTooltip: false,
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
    setAngleField(initialMetadata.angleField || '');
    setColorField(initialMetadata.colorField || '');
    setSeriesField(initialMetadata.seriesField || '');
    setMultiPieMode(initialMetadata.multiPieMode || defaultConfig.multiPieMode);
    setInnerRadius(initialMetadata.innerRadius ?? defaultConfig.innerRadius!);
    setOuterRadius(initialMetadata.outerRadius ?? defaultConfig.outerRadius!);
    setStartAngle(initialMetadata.startAngle ?? defaultConfig.startAngle!);
    setEndAngle(initialMetadata.endAngle ?? defaultConfig.endAngle!);
    setRoseType(initialMetadata.roseType ?? defaultConfig.roseType!);
    setClockwise(initialMetadata.clockwise ?? defaultConfig.clockwise!);
    setAvoidLabelOverlap(initialMetadata.avoidLabelOverlap ?? defaultConfig.avoidLabelOverlap!);
    setLabelLineShow(initialMetadata.labelLine?.show ?? defaultConfig.labelLine!.show!);
    setLabelLineLength(initialMetadata.labelLine?.length ?? defaultConfig.labelLine!.length!);
    setLabelLineLength2(initialMetadata.labelLine?.length2 ?? defaultConfig.labelLine!.length2!);
    setLabelLineSmooth(initialMetadata.labelLine?.smooth ?? defaultConfig.labelLine!.smooth!);
    setLabelLineColor(initialMetadata.labelLine?.color ?? defaultConfig.labelLine!.color!);
    setLabelLineWidth(initialMetadata.labelLine?.width ?? defaultConfig.labelLine!.width!);
    setLabelLineOpacity(initialMetadata.labelLine?.opacity ?? defaultConfig.labelLine!.opacity!);
    setColorScheme(initialMetadata.colorScheme || defaultConfig.colorScheme!);
    setOpacity(initialMetadata.opacity ?? defaultConfig.opacity!);
    setLabelsShow(initialMetadata.labels?.show ?? defaultConfig.labels!.show!);
    setLabelsPosition(initialMetadata.labels?.position || defaultConfig.labels!.position!);
    setLabelsFormat(initialMetadata.labels?.format || defaultConfig.labels!.format!);
    setLabelsFontSize(initialMetadata.labels?.fontSize ?? defaultConfig.labels!.fontSize!);
    setLabelsColor(initialMetadata.labels?.color || defaultConfig.labels!.color!);
    setLabelsBackground(initialMetadata.labels?.backgroundColor || defaultConfig.labels!.backgroundColor!);
    setLabelsOffset(initialMetadata.labels?.offset ?? defaultConfig.labels!.offset!);
    setLabelsShowPercentage(initialMetadata.labels?.showPercentage ?? defaultConfig.labels!.showPercentage!);
    setLabelsShowValue(initialMetadata.labels?.showValue ?? defaultConfig.labels!.showValue!);
    setLabelsShowName(initialMetadata.labels?.showName ?? defaultConfig.labels!.showName!);
    setLabelsRotate(initialMetadata.labels?.rotate ?? defaultConfig.labels!.rotate!);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend!);
    setLegendPosition(initialMetadata.legend?.position || defaultConfig.legend!.position!);
    setLegendOrient(initialMetadata.legend?.orient || defaultConfig.legend!.orient!);
    setLegendItemGap(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap!);
    setLegendFontSize(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize!);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show!);
    setTooltipFormat(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format!);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor!);
    setTooltipBorder(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor!);
    setTooltipTextColor(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor!);
    setTooltipFontSize(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize!);
    setInteractivityHover(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity!.hoverHighlight!);
    setClickAction(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction!);
    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled!);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration!);
    setAnimationEasing(initialMetadata.animation?.easing || defaultConfig.animation!.easing!);
    setWidth(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable!);
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled!);
  }, [initialMetadata]);

  const handleRoseTypeChange = (value: string) => {
    if (value === 'false') setRoseType(false);
    else if (value === 'true') setRoseType(true);
    else setRoseType(value as 'area' | 'radius');
  };

  const handleSave = () => {
    if (!angleField) {
      alert('Please select a numerical field for slice size.');
      return;
    }

    const config: PieChartConfig = {
      title,
      angleField,
      colorField: colorField || undefined,
      seriesField: seriesField || undefined,
      multiPieMode,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      roseType,
      clockwise,
      avoidLabelOverlap,
      labelLine: {
        show: labelLineShow,
        length: labelLineLength,
        length2: labelLineLength2,
        smooth: labelLineSmooth,
        color: labelLineColor,
        width: labelLineWidth,
        opacity: labelLineOpacity,
      },
      colorScheme,
      opacity,
      labels: {
        show: labelsShow,
        position: labelsPosition,
        format: labelsFormat,
        fontSize: labelsFontSize,
        color: labelsColor,
        backgroundColor: labelsBackground,
        offset: labelsOffset,
        showPercentage: labelsShowPercentage,
        showValue: labelsShowValue,
        showName: labelsShowName,
        rotate: labelsRotate,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        itemGap: legendItemGap,
        fontSize: legendFontSize,
      },
      tooltip: {
        show: tooltipShow,
        trigger: 'item',
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipTextColor,
        fontSize: tooltipFontSize,
        showValues: true,
        showPercentage: true,
      },
      interactivity: {
        hoverHighlight: interactivityHover,
        clickAction,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      dimensions: { width, height },
      exportable,
      exportFormats: ['png', 'svg'],
      responsive: { enabled: responsiveEnabled },
      accessibility: { ariaLabel: '', highContrast: false, focusable: true },
      performance: { downsampling: false },
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
            <PieChart className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-semibold text-white">Configure Pie Chart</h2>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Pie Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Angle (Size) Field <span className="text-red-400">*</span></label>
                <select
                  value={angleField}
                  onChange={(e) => setAngleField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>Select a numerical field</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color (Slice) Field</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None (single slice per row?)</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Series (Multiple Pies) Field</label>
                <select
                  value={seriesField}
                  onChange={(e) => setSeriesField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Single pie</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                {seriesField && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-400 mb-1">Multi‑pie layout</label>
                    <select
                      value={multiPieMode}
                      onChange={(e) => setMultiPieMode(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                    >
                      <option value="multiple">Multiple separate pies</option>
                      <option value="nested">Nested (sunburst) – not yet implemented</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appearance Section */}
          <SectionHeader title="Appearance" icon={<Wrench className="h-4 w-4" />} sectionKey="appearance" />
          {sections.appearance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Inner Radius (0–1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={innerRadius}
                    onChange={(e) => setInnerRadius(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Outer Radius (0–1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={outerRadius}
                    onChange={(e) => setOuterRadius(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Angle (°)</label>
                  <input
                    type="number"
                    min="-360"
                    max="360"
                    value={startAngle}
                    onChange={(e) => setStartAngle(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Angle (°)</label>
                  <input
                    type="number"
                    min="-360"
                    max="720"
                    value={endAngle}
                    onChange={(e) => setEndAngle(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={clockwise}
                    onChange={(e) => setClockwise(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Clockwise</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={avoidLabelOverlap}
                    onChange={(e) => setAvoidLabelOverlap(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Avoid label overlap</span>
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Rose Type</label>
                <select
                  value={String(roseType)}
                  onChange={(e) => handleRoseTypeChange(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="false">None (standard pie)</option>
                  <option value="true">Radius rose</option>
                  <option value="area">Area rose</option>
                </select>
              </div>

              {/* Color Scheme */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Scheme</label>
                <input
                  type="text"
                  value={colorScheme as string}
                  onChange={(e) => setColorScheme(e.target.value)}
                  placeholder="#3b82f6 or comma separated list"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Opacity (0–1)</label>
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
            </div>
          )}

          {/* Labels & Label Line */}
          <SectionHeader title="Labels" icon={<Hash className="h-4 w-4" />} sectionKey="labels" />
          {sections.labels && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={labelsShow}
                  onChange={(e) => setLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-pink-500"
                />
                <span className="text-sm text-gray-200">Show labels</span>
              </label>
              {labelsShow && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={labelsPosition}
                        onChange={(e) => setLabelsPosition(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="outside">Outside</option>
                        <option value="inside">Inside</option>
                        <option value="center">Center</option>
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
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={labelsColor}
                        onChange={(e) => setLabelsColor(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={labelsBackground}
                        onChange={(e) => setLabelsBackground(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Offset (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={labelsOffset}
                        onChange={(e) => setLabelsOffset(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={labelsRotate}
                          onChange={(e) => setLabelsRotate(e.target.checked)}
                          className="rounded border-gray-600 text-pink-500"
                        />
                        <span className="text-xs text-gray-300">Rotate</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 block">Label Content</span>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={labelsShowName}
                          onChange={(e) => setLabelsShowName(e.target.checked)}
                          className="rounded border-gray-600 text-pink-500"
                        />
                        <span className="text-xs text-gray-300">Show name</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={labelsShowValue}
                          onChange={(e) => setLabelsShowValue(e.target.checked)}
                          className="rounded border-gray-600 text-pink-500"
                        />
                        <span className="text-xs text-gray-300">Show value</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={labelsShowPercentage}
                          onChange={(e) => setLabelsShowPercentage(e.target.checked)}
                          className="rounded border-gray-600 text-pink-500"
                        />
                        <span className="text-xs text-gray-300">Show percentage</span>
                      </label>
                    </div>
                  </div>

                  {/* Label Line (only for outside) */}
                  {labelsPosition === 'outside' && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-md">
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Label Line</h4>
                      <label className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={labelLineShow}
                          onChange={(e) => setLabelLineShow(e.target.checked)}
                          className="rounded border-gray-600 text-pink-500"
                        />
                        <span className="text-sm text-gray-200">Show label line</span>
                      </label>
                      {labelLineShow && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Length 1 (px)</label>
                            <input
                              type="number"
                              min="0"
                              value={labelLineLength}
                              onChange={(e) => setLabelLineLength(Number(e.target.value))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Length 2 (px)</label>
                            <input
                              type="number"
                              min="0"
                              value={labelLineLength2}
                              onChange={(e) => setLabelLineLength2(Number(e.target.value))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Color</label>
                            <input
                              type="color"
                              value={labelLineColor}
                              onChange={(e) => setLabelLineColor(e.target.value)}
                              className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={labelLineWidth}
                              onChange={(e) => setLabelLineWidth(Number(e.target.value))}
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
                              value={labelLineOpacity}
                              onChange={(e) => setLabelLineOpacity(Number(e.target.value))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={labelLineSmooth}
                                onChange={(e) => setLabelLineSmooth(e.target.checked)}
                                className="rounded border-gray-600 text-pink-500"
                              />
                              <span className="text-xs text-gray-300">Smooth</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
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
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Show legend</span>
                </label>
                {showLegend && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={legendPosition}
                        onChange={(e) => setLegendPosition(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
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
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
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
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={legendFontSize}
                        onChange={(e) => setLegendFontSize(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tooltipShow}
                    onChange={(e) => setTooltipShow(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Show tooltip</span>
                </label>
                {tooltipShow && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={tooltipBg}
                        onChange={(e) => setTooltipBg(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Border</label>
                      <input
                        type="color"
                        value={tooltipBorder}
                        onChange={(e) => setTooltipBorder(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Text color</label>
                      <input
                        type="color"
                        value={tooltipTextColor}
                        onChange={(e) => setTooltipTextColor(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={tooltipFontSize}
                        onChange={(e) => setTooltipFontSize(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Format (optional)</label>
                      <input
                        type="text"
                        value={tooltipFormat}
                        onChange={(e) => setTooltipFormat(e.target.value)}
                        placeholder="e.g., {name}: {value} ({percent}%)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Play className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={interactivityHover}
                  onChange={(e) => setInteractivityHover(e.target.checked)}
                  className="rounded border-gray-600 text-pink-500"
                />
                <span className="text-sm text-gray-200">Highlight on hover</span>
              </label>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Click action</label>
                <select
                  value={clickAction}
                  onChange={(e) => setClickAction(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
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
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-pink-500"
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

          {/* Dimensions & Export */}
          <SectionHeader title="Dimensions & Export" icon={<Layout className="h-4 w-4" />} sectionKey="dimensions" />
          {sections.dimensions && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportable}
                    onChange={(e) => setExportable(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Allow export (PNG/SVG)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responsiveEnabled}
                    onChange={(e) => setResponsiveEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-pink-500"
                  />
                  <span className="text-sm text-gray-200">Responsive</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};