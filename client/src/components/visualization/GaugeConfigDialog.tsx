// src/components/visualization/GaugeConfigDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Layout,
  ChevronDown,
  ChevronRight,
  Sliders,
  Palette,
  Eye,
  Play,
  Hash,
  Circle,
  Gauge,
  Plus,
  Trash2,
  Move,
} from 'lucide-react';
import { GaugeConfig, GaugeSegment, GaugeType } from '../../types/visualization-configs';

interface GaugeConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<GaugeConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: GaugeConfig) => void;
}

const defaultConfig: GaugeConfig = {
  title: '',
  valueField: '',
  type: 'arc',
  segments: [
    { id: crypto.randomUUID(), min: 0, max: 33, color: '#ef4444', label: 'Low' },
    { id: crypto.randomUUID(), min: 33, max: 66, color: '#f59e0b', label: 'Medium' },
    { id: crypto.randomUUID(), min: 66, max: 100, color: '#10b981', label: 'High' },
  ],
  needle: {
    color: '#000000',
    width: 4,
    length: 0.9,
  },
  ticks: {
    show: true,
    step: 10,
    format: '.0f',
    fontSize: 10,
    color: '#666666',
  },
  valueLabel: {
    show: true,
    fontSize: 16,
    color: '#ffffff',
    format: '.1f',
  },
  animation: {
    enabled: true,
    duration: 500,
    easing: 'ease',
  },
  tooltip: {
    show: true,
    format: '{{value}}',
    backgroundColor: '#333333',
    textColor: '#ffffff',
  },
  clickAction: 'none',
  dimensions: {
    width: 220,
    height: 180,
  },
  accessibility: {
    ariaLabel: 'Gauge chart',
    highContrast: false,
    focusable: true,
  },
};

export const GaugeConfigDialog: React.FC<GaugeConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];
  const numericColumns = availableColumns.filter(col => {
    const type = initialMetadata.inputSchema?.find(c => c.name === col)?.type.toLowerCase() || '';
    return ['number', 'integer', 'float', 'double', 'decimal'].includes(type);
  });

  // Basic fields
  const [title, setTitle] = useState(initialMetadata.title ?? defaultConfig.title);
  const [valueField, setValueField] = useState(initialMetadata.valueField ?? '');
  const [min, setMin] = useState<number | undefined>(initialMetadata.min);
  const [max, setMax] = useState<number | undefined>(initialMetadata.max);
  const [units, setUnits] = useState(initialMetadata.units ?? '');
  const [type, setType] = useState<GaugeType>(initialMetadata.type ?? defaultConfig.type);

  // Segments
  const [segments, setSegments] = useState<GaugeSegment[]>(
    initialMetadata.segments && initialMetadata.segments.length > 0
      ? initialMetadata.segments
      : defaultConfig.segments.map(s => ({ ...s, id: crypto.randomUUID() }))
  );

  // Needle
  const [needleColor, setNeedleColor] = useState(initialMetadata.needle?.color ?? defaultConfig.needle!.color);
  const [needleWidth, setNeedleWidth] = useState(initialMetadata.needle?.width ?? defaultConfig.needle!.width);
  const [needleLength, setNeedleLength] = useState(initialMetadata.needle?.length ?? defaultConfig.needle!.length);

  // Ticks
  const [ticksShow, setTicksShow] = useState(initialMetadata.ticks?.show ?? defaultConfig.ticks!.show);
  const [ticksStep, setTicksStep] = useState(initialMetadata.ticks?.step ?? defaultConfig.ticks!.step);
  const [ticksFormat, setTicksFormat] = useState(initialMetadata.ticks?.format ?? defaultConfig.ticks!.format);
  const [ticksFontSize, setTicksFontSize] = useState(initialMetadata.ticks?.fontSize ?? defaultConfig.ticks!.fontSize);
  const [ticksColor, setTicksColor] = useState(initialMetadata.ticks?.color ?? defaultConfig.ticks!.color);

  // Value label
  const [valueLabelShow, setValueLabelShow] = useState(initialMetadata.valueLabel?.show ?? defaultConfig.valueLabel!.show);
  const [valueLabelFontSize, setValueLabelFontSize] = useState(initialMetadata.valueLabel?.fontSize ?? defaultConfig.valueLabel!.fontSize);
  const [valueLabelColor, setValueLabelColor] = useState(initialMetadata.valueLabel?.color ?? defaultConfig.valueLabel!.color);
  const [valueLabelFormat, setValueLabelFormat] = useState(initialMetadata.valueLabel?.format ?? defaultConfig.valueLabel!.format);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format ?? defaultConfig.tooltip!.format);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);

  // Click action
  const [clickAction, setClickAction] = useState(initialMetadata.clickAction ?? defaultConfig.clickAction);
  const [customClickHandler, setCustomClickHandler] = useState(initialMetadata.customClickHandler ?? '');

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel ?? defaultConfig.accessibility!.ariaLabel);
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription ?? '');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    segments: false,
    needle: false,
    ticks: false,
    valueLabel: false,
    animation: false,
    tooltip: false,
    dimensions: true,
    accessibility: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title ?? defaultConfig.title);
    setValueField(initialMetadata.valueField ?? '');
    setMin(initialMetadata.min);
    setMax(initialMetadata.max);
    setUnits(initialMetadata.units ?? '');
    setType(initialMetadata.type ?? defaultConfig.type);
    setSegments(
      initialMetadata.segments && initialMetadata.segments.length > 0
        ? initialMetadata.segments.map(s => ({ ...s, id: s.id || crypto.randomUUID() }))
        : defaultConfig.segments.map(s => ({ ...s, id: crypto.randomUUID() }))
    );
    setNeedleColor(initialMetadata.needle?.color ?? defaultConfig.needle!.color);
    setNeedleWidth(initialMetadata.needle?.width ?? defaultConfig.needle!.width);
    setNeedleLength(initialMetadata.needle?.length ?? defaultConfig.needle!.length);
    setTicksShow(initialMetadata.ticks?.show ?? defaultConfig.ticks!.show);
    setTicksStep(initialMetadata.ticks?.step ?? defaultConfig.ticks!.step);
    setTicksFormat(initialMetadata.ticks?.format ?? defaultConfig.ticks!.format);
    setTicksFontSize(initialMetadata.ticks?.fontSize ?? defaultConfig.ticks!.fontSize);
    setTicksColor(initialMetadata.ticks?.color ?? defaultConfig.ticks!.color);
    setValueLabelShow(initialMetadata.valueLabel?.show ?? defaultConfig.valueLabel!.show);
    setValueLabelFontSize(initialMetadata.valueLabel?.fontSize ?? defaultConfig.valueLabel!.fontSize);
    setValueLabelColor(initialMetadata.valueLabel?.color ?? defaultConfig.valueLabel!.color);
    setValueLabelFormat(initialMetadata.valueLabel?.format ?? defaultConfig.valueLabel!.format);
    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipFormat(initialMetadata.tooltip?.format ?? defaultConfig.tooltip!.format);
    setTooltipBg(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
    setTooltipText(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
    setClickAction(initialMetadata.clickAction ?? defaultConfig.clickAction);
    setCustomClickHandler(initialMetadata.customClickHandler ?? '');
    setWidth(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);
    setAriaLabel(initialMetadata.accessibility?.ariaLabel ?? defaultConfig.accessibility!.ariaLabel);
    setAriaDescription(initialMetadata.accessibility?.ariaDescription ?? '');
    setHighContrast(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
    setFocusable(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility!.focusable);
  }, [initialMetadata]);

  const handleAddSegment = () => {
    const newSegment: GaugeSegment = {
      id: crypto.randomUUID(),
      min: 0,
      max: 100,
      color: '#888888',
      label: '',
    };
    setSegments([...segments, newSegment]);
  };

  const handleRemoveSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id));
  };

  const handleUpdateSegment = (id: string, updates: Partial<GaugeSegment>) => {
    setSegments(segments.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleSave = () => {
    if (!valueField) {
      alert('Please select a value field.');
      return;
    }

    const config: GaugeConfig = {
      title: title || undefined,
      valueField,
      min: min || undefined,
      max: max || undefined,
      units: units || undefined,
      type,
      segments,
      needle: {
        color: needleColor,
        width: needleWidth,
        length: needleLength,
      },
      ticks: {
        show: ticksShow,
        step: ticksStep,
        format: ticksFormat,
        fontSize: ticksFontSize,
        color: ticksColor,
      },
      valueLabel: {
        show: valueLabelShow,
        fontSize: valueLabelFontSize,
        color: valueLabelColor,
        format: valueLabelFormat,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      tooltip: {
        show: tooltipShow,
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        textColor: tooltipText,
      },
      clickAction,
      ...(clickAction === 'custom' && { customClickHandler }),
      dimensions: { width, height },
      accessibility: {
        ariaLabel: ariaLabel || undefined,
        ariaDescription: ariaDescription || undefined,
        highContrast,
        focusable,
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
            <Gauge className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Gauge</h2>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Gauge"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value Field <span className="text-red-400">*</span></label>
                <select
                  value={valueField}
                  onChange={(e) => setValueField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>Select a numeric field</option>
                  {numericColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min (auto if empty)</label>
                  <input
                    type="number"
                    value={min ?? ''}
                    onChange={(e) => setMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max (auto if empty)</label>
                  <input
                    type="number"
                    value={max ?? ''}
                    onChange={(e) => setMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="Auto"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Units (optional)</label>
                <input
                  type="text"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g., km/h"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gauge Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="arc" checked={type === 'arc'} onChange={(e) => setType(e.target.value as GaugeType)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Arc</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="bullet" checked={type === 'bullet'} onChange={(e) => setType(e.target.value as GaugeType)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Bullet</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="dial" checked={type === 'dial'} onChange={(e) => setType(e.target.value as GaugeType)} className="text-purple-500" />
                    <span className="text-sm text-gray-200">Dial</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Segments Section */}
          <SectionHeader title="Segments / Thresholds" icon={<Palette className="h-4 w-4" />} sectionKey="segments" />
          {sections.segments && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="flex justify-end">
                <button
                  onClick={handleAddSegment}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Segment</span>
                </button>
              </div>
              {segments.map((seg, _index) => (
                <div key={seg.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 relative">
                  <button
                    onClick={() => handleRemoveSegment(seg.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        value={seg.min}
                        onChange={(e) => handleUpdateSegment(seg.id, { min: parseFloat(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        value={seg.max}
                        onChange={(e) => handleUpdateSegment(seg.id, { max: parseFloat(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={seg.color}
                        onChange={(e) => handleUpdateSegment(seg.id, { color: e.target.value })}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Label (optional)</label>
                      <input
                        type="text"
                        value={seg.label || ''}
                        onChange={(e) => handleUpdateSegment(seg.id, { label: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        placeholder="Low"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Needle Section */}
          <SectionHeader title="Needle Styling" icon={<Move className="h-4 w-4" />} sectionKey="needle" />
          {sections.needle && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={needleColor}
                    onChange={(e) => setNeedleColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={needleWidth}
                    onChange={(e) => setNeedleWidth(parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Length (0–1)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={needleLength}
                    onChange={(e) => setNeedleLength(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ticks Section */}
          <SectionHeader title="Ticks & Labels" icon={<Hash className="h-4 w-4" />} sectionKey="ticks" />
          {sections.ticks && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={ticksShow}
                  onChange={(e) => setTicksShow(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show tick marks</span>
              </label>
              {ticksShow && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Step (interval)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={ticksStep}
                      onChange={(e) => setTicksStep(parseFloat(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={ticksFormat}
                      onChange={(e) => setTicksFormat(e.target.value)}
                      placeholder=".0f"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font size (px)</label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={ticksFontSize}
                      onChange={(e) => setTicksFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={ticksColor}
                      onChange={(e) => setTicksColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Value Label Section */}
          <SectionHeader title="Value Display" icon={<Eye className="h-4 w-4" />} sectionKey="valueLabel" />
          {sections.valueLabel && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={valueLabelShow}
                  onChange={(e) => setValueLabelShow(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Show current value</span>
              </label>
              {valueLabelShow && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font size (px)</label>
                    <input
                      type="number"
                      min="8"
                      max="30"
                      value={valueLabelFontSize}
                      onChange={(e) => setValueLabelFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={valueLabelColor}
                      onChange={(e) => setValueLabelColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={valueLabelFormat}
                      onChange={(e) => setValueLabelFormat(e.target.value)}
                      placeholder=".1f"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
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
                      onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Easing</label>
                    <select
                      value={animationEasing}
                      onChange={(e) => setAnimationEasing(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
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

          {/* Tooltip Section */}
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
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={tooltipFormat}
                      onChange={(e) => setTooltipFormat(e.target.value)}
                      placeholder="{{value}}"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background</label>
                    <input
                      type="color"
                      value={tooltipBg}
                      onChange={(e) => setTooltipBg(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text color</label>
                    <input
                      type="color"
                      value={tooltipText}
                      onChange={(e) => setTooltipText(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Click Action */}
          <SectionHeader title="Click Action" icon={<Circle className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <div>
                <label className="block text-sm text-gray-300 mb-1">On click</label>
                <select
                  value={clickAction}
                  onChange={(e) => setClickAction(e.target.value as any)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="none">None</option>
                  <option value="drilldown">Drill down</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {clickAction === 'custom' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Custom handler (JS)</label>
                  <textarea
                    value={customClickHandler}
                    onChange={(e) => setCustomClickHandler(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm font-mono"
                    placeholder="(value, context) => { ... }"
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
                  min="100"
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
                  min="100"
                  max="2000"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Accessibility Section */}
          <SectionHeader title="Accessibility" icon={<Eye className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA Label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  placeholder="Gauge chart"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA Description</label>
                <textarea
                  value={ariaDescription}
                  onChange={(e) => setAriaDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  placeholder="Description of what this gauge displays"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">High contrast mode</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={focusable}
                  onChange={(e) => setFocusable(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Focusable (keyboard navigation)</span>
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