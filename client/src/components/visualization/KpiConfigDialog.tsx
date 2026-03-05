import React, { useState, useEffect } from 'react';
import {
  X, Save, Palette, Type, Grid, Eye, MousePointer, Sparkles,
  ChevronDown, ChevronRight, Hash, Minus
} from 'lucide-react';
import { KpiConfig, KpiComparisonType, KpiTrendIcon } from '../../types/visualization-configs';

interface KpiConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<KpiConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: KpiConfig) => void;
}

const defaultConfig: KpiConfig = {
  primaryValueField: '',
  title: '',
  description: '',
  numberFormat: ',.0f',
  prefix: '',
  suffix: '',
  decimalPlaces: 2,
  comparison: {
    type: 'none',
    label: 'vs previous',
    colorPositive: '#10b981',
    colorNegative: '#ef4444',
    showIcon: true,
    iconType: 'arrow'
  },
  primaryColor: '#111827',
  labelColor: '#6b7280',
  backgroundColor: '#ffffff',
  border: {
    color: '#e5e7eb',
    width: 1,
    radius: 8,
    style: 'solid'
  },
  shadow: true,
  padding: { top: 16, right: 16, bottom: 16, left: 16 },
  typography: {
    primaryFontSize: 36,
    primaryFontWeight: 'bold',
    labelFontSize: 14,
    comparisonFontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  sparkline: {
    enabled: false,
    color: '#3b82f6',
    width: 80,
    height: 40
  },
  tooltip: {
    show: true,
    backgroundColor: '#1f2937',
    textColor: '#f9fafb'
  },
  clickAction: 'none',
  hoverEffect: true,
  responsive: {
    enabled: true,
    minWidth: 100,
    minHeight: 80
  },
  exportable: true,
  exportFormats: ['png', 'svg'],
  accessibility: {
    ariaLabel: '',
    highContrast: false,
    focusable: true
  },
  dimensions: { width: 240, height: 140 }
};

export const KpiConfigDialog: React.FC<KpiConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];
  const numericColumns = availableColumns.filter(name =>
    initialMetadata.inputSchema?.find(c => c.name === name)?.type.match(/int|float|double|decimal|number/i)
  );

  // Form state – all fields from KpiConfig
  const [title, setTitle] = useState(initialMetadata.title ?? defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description ?? defaultConfig.description);
  const [primaryValueField, setPrimaryValueField] = useState(initialMetadata.primaryValueField ?? '');
  const [secondaryValueField, setSecondaryValueField] = useState(initialMetadata.secondaryValueField ?? '');
  const [labelField, setLabelField] = useState(initialMetadata.labelField ?? '');
  const [numberFormat, setNumberFormat] = useState(initialMetadata.numberFormat ?? defaultConfig.numberFormat);
  const [prefix, setPrefix] = useState(initialMetadata.prefix ?? defaultConfig.prefix);
  const [suffix, setSuffix] = useState(initialMetadata.suffix ?? defaultConfig.suffix);
  const [decimalPlaces, setDecimalPlaces] = useState(initialMetadata.decimalPlaces ?? defaultConfig.decimalPlaces);

  // Comparison – use a fully typed default object to avoid undefined issues
  const defaultComparison = {
    type: 'none' as KpiComparisonType,
    label: 'vs previous',
    colorPositive: '#10b981',
    colorNegative: '#ef4444',
    showIcon: true,
    iconType: 'arrow' as KpiTrendIcon
  };

  const [comparisonType, setComparisonType] = useState<KpiComparisonType>(
    initialMetadata.comparison?.type ?? defaultComparison.type
  );
  const [comparisonLabel, setComparisonLabel] = useState(
    initialMetadata.comparison?.label ?? defaultComparison.label
  );
  const [comparisonColorPositive, setComparisonColorPositive] = useState(
    initialMetadata.comparison?.colorPositive ?? defaultComparison.colorPositive
  );
  const [comparisonColorNegative, setComparisonColorNegative] = useState(
    initialMetadata.comparison?.colorNegative ?? defaultComparison.colorNegative
  );
  const [comparisonShowIcon, setComparisonShowIcon] = useState(
    initialMetadata.comparison?.showIcon ?? defaultComparison.showIcon
  );
  const [comparisonIconType, setComparisonIconType] = useState<KpiTrendIcon>(
    initialMetadata.comparison?.iconType ?? defaultComparison.iconType
  );

  // Visual
  const [primaryColor, setPrimaryColor] = useState(initialMetadata.primaryColor ?? defaultConfig.primaryColor);
  const [labelColor, setLabelColor] = useState(initialMetadata.labelColor ?? defaultConfig.labelColor);
  const [backgroundColor, setBackgroundColor] = useState(initialMetadata.backgroundColor ?? defaultConfig.backgroundColor);
  const [borderColor, setBorderColor] = useState(initialMetadata.border?.color ?? defaultConfig.border!.color);
  const [borderWidth, setBorderWidth] = useState(initialMetadata.border?.width ?? defaultConfig.border!.width);
  const [borderRadius, setBorderRadius] = useState(initialMetadata.border?.radius ?? defaultConfig.border!.radius);
  const [borderStyle, setBorderStyle] = useState(initialMetadata.border?.style ?? defaultConfig.border!.style);
  const [shadow, setShadow] = useState(initialMetadata.shadow ?? defaultConfig.shadow);
  const [paddingTop, setPaddingTop] = useState(initialMetadata.padding?.top ?? defaultConfig.padding!.top);
  const [paddingRight, setPaddingRight] = useState(initialMetadata.padding?.right ?? defaultConfig.padding!.right);
  const [paddingBottom, setPaddingBottom] = useState(initialMetadata.padding?.bottom ?? defaultConfig.padding!.bottom);
  const [paddingLeft, setPaddingLeft] = useState(initialMetadata.padding?.left ?? defaultConfig.padding!.left);

  // Typography
  const [primaryFontSize, setPrimaryFontSize] = useState(initialMetadata.typography?.primaryFontSize ?? defaultConfig.typography!.primaryFontSize);
  const [primaryFontWeight, setPrimaryFontWeight] = useState(initialMetadata.typography?.primaryFontWeight ?? defaultConfig.typography!.primaryFontWeight);
  const [labelFontSize, setLabelFontSize] = useState(initialMetadata.typography?.labelFontSize ?? defaultConfig.typography!.labelFontSize);
  const [comparisonFontSize, setComparisonFontSize] = useState(initialMetadata.typography?.comparisonFontSize ?? defaultConfig.typography!.comparisonFontSize);
  const [fontFamily, setFontFamily] = useState(initialMetadata.typography?.fontFamily ?? defaultConfig.typography!.fontFamily);

  // Sparkline
  const [sparklineEnabled, setSparklineEnabled] = useState(initialMetadata.sparkline?.enabled ?? defaultConfig.sparkline!.enabled);
  const [sparklineField, setSparklineField] = useState(initialMetadata.sparkline?.field ?? '');
  const [sparklineColor, setSparklineColor] = useState(initialMetadata.sparkline?.color ?? defaultConfig.sparkline!.color);
  const [sparklineWidth, setSparklineWidth] = useState(initialMetadata.sparkline?.width ?? defaultConfig.sparkline!.width);
  const [sparklineHeight, setSparklineHeight] = useState(initialMetadata.sparkline?.height ?? defaultConfig.sparkline!.height);

  // Interactivity
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipBackground, setTooltipBackground] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipTextColor, setTooltipTextColor] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
  const [clickAction, setClickAction] = useState(initialMetadata.clickAction ?? defaultConfig.clickAction);
  const [customClickHandler, setCustomClickHandler] = useState(initialMetadata.customClickHandler ?? '');
  const [hoverEffect, setHoverEffect] = useState(initialMetadata.hoverEffect ?? defaultConfig.hoverEffect);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [minWidth, setMinWidth] = useState(initialMetadata.responsive?.minWidth ?? defaultConfig.responsive!.minWidth);
  const [minHeight, setMinHeight] = useState(initialMetadata.responsive?.minHeight ?? defaultConfig.responsive!.minHeight);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  const [exportFormats, setExportFormats] = useState<Array<'png'|'svg'>>(initialMetadata.exportFormats ?? defaultConfig.exportFormats!);

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel ?? defaultConfig.accessibility!.ariaLabel);
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription ?? defaultConfig.accessibility!.ariaDescription);
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);

  // UI collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    dataMapping: true,
    formatting: false,
    comparison: false,
    appearance: false,
    typography: false,
    sparkline: false,
    interactivity: false,
    export: false,
    accessibility: false,
    dimensions: true
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title ?? defaultConfig.title);
    setDescription(initialMetadata.description ?? defaultConfig.description);
    setPrimaryValueField(initialMetadata.primaryValueField ?? '');
    setSecondaryValueField(initialMetadata.secondaryValueField ?? '');
    setLabelField(initialMetadata.labelField ?? '');
    setNumberFormat(initialMetadata.numberFormat ?? defaultConfig.numberFormat);
    setPrefix(initialMetadata.prefix ?? defaultConfig.prefix);
    setSuffix(initialMetadata.suffix ?? defaultConfig.suffix);
    setDecimalPlaces(initialMetadata.decimalPlaces ?? defaultConfig.decimalPlaces);

    // Comparison (using defaultComparison)
    setComparisonType(initialMetadata.comparison?.type ?? defaultComparison.type);
    setComparisonLabel(initialMetadata.comparison?.label ?? defaultComparison.label);
    setComparisonColorPositive(initialMetadata.comparison?.colorPositive ?? defaultComparison.colorPositive);
    setComparisonColorNegative(initialMetadata.comparison?.colorNegative ?? defaultComparison.colorNegative);
    setComparisonShowIcon(initialMetadata.comparison?.showIcon ?? defaultComparison.showIcon);
    setComparisonIconType(initialMetadata.comparison?.iconType ?? defaultComparison.iconType);

    // Visual
    setPrimaryColor(initialMetadata.primaryColor ?? defaultConfig.primaryColor);
    setLabelColor(initialMetadata.labelColor ?? defaultConfig.labelColor);
    setBackgroundColor(initialMetadata.backgroundColor ?? defaultConfig.backgroundColor);
    setBorderColor(initialMetadata.border?.color ?? defaultConfig.border!.color);
    setBorderWidth(initialMetadata.border?.width ?? defaultConfig.border!.width);
    setBorderRadius(initialMetadata.border?.radius ?? defaultConfig.border!.radius);
    setBorderStyle(initialMetadata.border?.style ?? defaultConfig.border!.style);
    setShadow(initialMetadata.shadow ?? defaultConfig.shadow);
    setPaddingTop(initialMetadata.padding?.top ?? defaultConfig.padding!.top);
    setPaddingRight(initialMetadata.padding?.right ?? defaultConfig.padding!.right);
    setPaddingBottom(initialMetadata.padding?.bottom ?? defaultConfig.padding!.bottom);
    setPaddingLeft(initialMetadata.padding?.left ?? defaultConfig.padding!.left);

    // Typography
    setPrimaryFontSize(initialMetadata.typography?.primaryFontSize ?? defaultConfig.typography!.primaryFontSize);
    setPrimaryFontWeight(initialMetadata.typography?.primaryFontWeight ?? defaultConfig.typography!.primaryFontWeight);
    setLabelFontSize(initialMetadata.typography?.labelFontSize ?? defaultConfig.typography!.labelFontSize);
    setComparisonFontSize(initialMetadata.typography?.comparisonFontSize ?? defaultConfig.typography!.comparisonFontSize);
    setFontFamily(initialMetadata.typography?.fontFamily ?? defaultConfig.typography!.fontFamily);

    // Sparkline
    setSparklineEnabled(initialMetadata.sparkline?.enabled ?? defaultConfig.sparkline!.enabled);
    setSparklineField(initialMetadata.sparkline?.field ?? '');
    setSparklineColor(initialMetadata.sparkline?.color ?? defaultConfig.sparkline!.color);
    setSparklineWidth(initialMetadata.sparkline?.width ?? defaultConfig.sparkline!.width);
    setSparklineHeight(initialMetadata.sparkline?.height ?? defaultConfig.sparkline!.height);

    // Interactivity
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipBackground(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipTextColor(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
    setClickAction(initialMetadata.clickAction ?? defaultConfig.clickAction);
    setCustomClickHandler(initialMetadata.customClickHandler ?? '');
    setHoverEffect(initialMetadata.hoverEffect ?? defaultConfig.hoverEffect);

    // Responsive & Export
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
    setMinWidth(initialMetadata.responsive?.minWidth ?? defaultConfig.responsive!.minWidth);
    setMinHeight(initialMetadata.responsive?.minHeight ?? defaultConfig.responsive!.minHeight);
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable);
    setExportFormats(initialMetadata.exportFormats ?? defaultConfig.exportFormats!);

    // Accessibility
    setAriaLabel(initialMetadata.accessibility?.ariaLabel ?? defaultConfig.accessibility!.ariaLabel);
    setAriaDescription(initialMetadata.accessibility?.ariaDescription ?? defaultConfig.accessibility!.ariaDescription);
    setHighContrast(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
    setFocusable(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);

    // Dimensions
    setWidth(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!primaryValueField) {
      alert('Please select a primary value field.');
      return;
    }

    const config: KpiConfig = {
      title,
      description,
      primaryValueField,
      secondaryValueField: secondaryValueField || undefined,
      labelField: labelField || undefined,
      numberFormat,
      prefix,
      suffix,
      decimalPlaces,
      comparison: {
        type: comparisonType,
        label: comparisonLabel,
        colorPositive: comparisonColorPositive,
        colorNegative: comparisonColorNegative,
        showIcon: comparisonShowIcon,
        iconType: comparisonIconType
      },
      primaryColor,
      labelColor,
      backgroundColor,
      border: {
        color: borderColor,
        width: borderWidth,
        radius: borderRadius,
        style: borderStyle
      },
      shadow,
      padding: {
        top: paddingTop,
        right: paddingRight,
        bottom: paddingBottom,
        left: paddingLeft
      },
      typography: {
        primaryFontSize,
        primaryFontWeight,
        labelFontSize,
        comparisonFontSize,
        fontFamily
      },
      sparkline: sparklineEnabled ? {
        enabled: true,
        field: sparklineField || undefined,
        color: sparklineColor,
        width: sparklineWidth,
        height: sparklineHeight
      } : { enabled: false },
      tooltip: {
        show: tooltipShow,
        backgroundColor: tooltipBackground,
        textColor: tooltipTextColor
      },
      clickAction,
      customClickHandler: clickAction === 'custom' ? customClickHandler : undefined,
      hoverEffect,
      responsive: {
        enabled: responsiveEnabled,
        minWidth,
        minHeight
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel,
        ariaDescription,
        highContrast,
        focusable
      },
      dimensions: { width, height }
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
            <Hash className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-semibold text-white">Configure KPI Card</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Section */}
          <SectionHeader title="Basic Info" icon={<Type className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title (optional)</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="Revenue KPI" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="Short description" />
              </div>
            </div>
          )}

          {/* Data Mapping */}
          <SectionHeader title="Data Mapping" icon={<Grid className="h-4 w-4" />} sectionKey="dataMapping" />
          {sections.dataMapping && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Primary Value <span className="text-red-400">*</span></label>
                <select value={primaryValueField} onChange={e => setPrimaryValueField(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  <option value="">Select numeric field</option>
                  {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Secondary Value (comparison)</label>
                <select value={secondaryValueField} onChange={e => setSecondaryValueField(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  <option value="">None</option>
                  {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Label Field (overrides title)</label>
                <select value={labelField} onChange={e => setLabelField(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  <option value="">Use title</option>
                  {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Formatting */}
          <SectionHeader title="Number Formatting" icon={<Hash className="h-4 w-4" />} sectionKey="formatting" />
          {sections.formatting && (
            <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Number format (d3)</label>
                <input type="text" value={numberFormat} onChange={e => setNumberFormat(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder=",.0f" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Prefix</label>
                <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder="$" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Suffix</label>
                <input type="text" value={suffix} onChange={e => setSuffix(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder="units" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Decimal places</label>
                <input type="number" min="0" max="10" value={decimalPlaces} onChange={e => setDecimalPlaces(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
              </div>
            </div>
          )}

          {/* Comparison */}
          <SectionHeader title="Comparison" icon={<Minus className="h-4 w-4" />} sectionKey="comparison" />
          {sections.comparison && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Comparison type</label>
                <select value={comparisonType} onChange={e => setComparisonType(e.target.value as KpiComparisonType)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm">
                  <option value="none">None</option>
                  <option value="percentChange">Percent change</option>
                  <option value="absoluteDifference">Absolute difference</option>
                  <option value="targetRatio">Target ratio</option>
                </select>
              </div>
              {comparisonType !== 'none' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Label (e.g., "vs previous")</label>
                    <input type="text" value={comparisonLabel} onChange={e => setComparisonLabel(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Positive color</label>
                      <input type="color" value={comparisonColorPositive} onChange={e => setComparisonColorPositive(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Negative color</label>
                      <input type="color" value={comparisonColorNegative} onChange={e => setComparisonColorNegative(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={comparisonShowIcon} onChange={e => setComparisonShowIcon(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                      <span className="text-xs text-gray-300">Show trend icon</span>
                    </label>
                    {comparisonShowIcon && (
                      <select value={comparisonIconType} onChange={e => setComparisonIconType(e.target.value as KpiTrendIcon)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm">
                        <option value="arrow">Arrow</option>
                        <option value="triangle">Triangle</option>
                        <option value="none">None</option>
                      </select>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appearance */}
          <SectionHeader title="Appearance" icon={<Palette className="h-4 w-4" />} sectionKey="appearance" />
          {sections.appearance && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Primary value color</label>
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Label color</label>
                  <input type="color" value={labelColor} onChange={e => setLabelColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Background color</label>
                  <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                </div>
              </div>
              <h4 className="text-xs font-semibold text-gray-300 mt-2">Border</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Color</label>
                  <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                  <input type="number" min="0" step="0.5" value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Radius (px)</label>
                  <input type="number" min="0" value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Style</label>
                  <select value={borderStyle} onChange={e => setBorderStyle(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm">
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={shadow} onChange={e => setShadow(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                  <span className="text-xs text-gray-300">Drop shadow</span>
                </label>
              </div>
              <h4 className="text-xs font-semibold text-gray-300 mt-2">Padding (px)</h4>
              <div className="grid grid-cols-4 gap-2">
                <div><label className="block text-xs text-gray-400">Top</label><input type="number" value={paddingTop} onChange={e => setPaddingTop(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400">Right</label><input type="number" value={paddingRight} onChange={e => setPaddingRight(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400">Bottom</label><input type="number" value={paddingBottom} onChange={e => setPaddingBottom(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400">Left</label><input type="number" value={paddingLeft} onChange={e => setPaddingLeft(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" /></div>
              </div>
            </div>
          )}

          {/* Typography */}
          <SectionHeader title="Typography" icon={<Type className="h-4 w-4" />} sectionKey="typography" />
          {sections.typography && (
            <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Primary font size (px)</label>
                <input type="number" min="8" max="96" value={primaryFontSize} onChange={e => setPrimaryFontSize(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Primary font weight</label>
                <select value={primaryFontWeight} onChange={e => setPrimaryFontWeight(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Lighter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Label font size (px)</label>
                <input type="number" min="8" max="48" value={labelFontSize} onChange={e => setLabelFontSize(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Comparison font size</label>
                <input type="number" min="8" max="48" value={comparisonFontSize} onChange={e => setComparisonFontSize(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Font family</label>
                <input type="text" value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder="Inter, system-ui, sans-serif" />
              </div>
            </div>
          )}

          {/* Sparkline */}
          <SectionHeader title="Sparkline" icon={<Sparkles className="h-4 w-4" />} sectionKey="sparkline" />
          {sections.sparkline && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={sparklineEnabled} onChange={e => setSparklineEnabled(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                <span className="text-sm text-gray-300">Show mini sparkline</span>
              </label>
              {sparklineEnabled && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Field (numeric array)</label>
                    <select value={sparklineField} onChange={e => setSparklineField(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm">
                      <option value="">Select field</option>
                      {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input type="color" value={sparklineColor} onChange={e => setSparklineColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                      <input type="number" min="20" value={sparklineWidth} onChange={e => setSparklineWidth(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                      <input type="number" min="10" value={sparklineHeight} onChange={e => setSparklineHeight(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Interactivity */}
          <SectionHeader title="Interactivity" icon={<MousePointer className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tooltip</label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={tooltipShow} onChange={e => setTooltipShow(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                  <span className="text-xs text-gray-300">Show tooltip on hover</span>
                </label>
                {tooltipShow && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-xs text-gray-400">Background</label>
                      <input type="color" value={tooltipBackground} onChange={e => setTooltipBackground(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Text color</label>
                      <input type="color" value={tooltipTextColor} onChange={e => setTooltipTextColor(e.target.value)} className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Click action</label>
                <select value={clickAction} onChange={e => setClickAction(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm">
                  <option value="none">None</option>
                  <option value="drilldown">Drill down</option>
                  <option value="url">Open URL</option>
                  <option value="custom">Custom handler</option>
                </select>
              </div>
              {clickAction === 'custom' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Custom handler function name</label>
                  <input type="text" value={customClickHandler} onChange={e => setCustomClickHandler(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder="handleKpiClick" />
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={hoverEffect} onChange={e => setHoverEffect(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                <span className="text-xs text-gray-300">Enable hover effect (scale/glow)</span>
              </label>
            </div>
          )}

          {/* Export */}
          <SectionHeader title="Export & Responsive" icon={<Eye className="h-4 w-4" />} sectionKey="export" />
          {sections.export && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={exportable} onChange={e => setExportable(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                <span className="text-xs text-gray-300">Allow export (PNG/SVG)</span>
              </label>
              {exportable && (
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1">
                    <input type="checkbox" checked={exportFormats.includes('png')} onChange={e => {
                      if (e.target.checked) setExportFormats([...exportFormats, 'png']);
                      else setExportFormats(exportFormats.filter(f => f !== 'png'));
                    }} className="rounded border-gray-600 text-pink-500" />
                    <span className="text-xs text-gray-300">PNG</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="checkbox" checked={exportFormats.includes('svg')} onChange={e => {
                      if (e.target.checked) setExportFormats([...exportFormats, 'svg']);
                      else setExportFormats(exportFormats.filter(f => f !== 'svg'));
                    }} className="rounded border-gray-600 text-pink-500" />
                    <span className="text-xs text-gray-300">SVG</span>
                  </label>
                </div>
              )}
              <div className="border-t border-gray-700 pt-2">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Responsive</h4>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={responsiveEnabled} onChange={e => setResponsiveEnabled(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                  <span className="text-xs text-gray-300">Enable responsive resizing</span>
                </label>
                {responsiveEnabled && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-xs text-gray-400">Min width (px)</label>
                      <input type="number" min="50" value={minWidth} onChange={e => setMinWidth(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Min height (px)</label>
                      <input type="number" min="50" value={minHeight} onChange={e => setMinHeight(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility */}
          <SectionHeader title="Accessibility" icon={<Eye className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                <input type="text" value={ariaLabel} onChange={e => setAriaLabel(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder="KPI card showing revenue" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA description</label>
                <input type="text" value={ariaDescription} onChange={e => setAriaDescription(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" placeholder="Detailed description" />
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                <span className="text-xs text-gray-300">High contrast mode</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={focusable} onChange={e => setFocusable(e.target.checked)} className="rounded border-gray-600 text-pink-500" />
                <span className="text-xs text-gray-300">Focusable with keyboard</span>
              </label>
            </div>
          )}

          {/* Dimensions */}
          <SectionHeader title="Dimensions" icon={<Grid className="h-4 w-4" />} sectionKey="dimensions" />
          {sections.dimensions && (
            <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                <input type="number" min="80" max="800" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                <input type="number" min="60" max="600" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-md flex items-center space-x-2 transition-colors">
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};