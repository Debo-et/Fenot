// src/components/visualization/DualAxisConfigDialog.tsx
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
  Wrench,
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  ArrowLeft,
  Layers,
  Settings,
  Globe,
  Zap,
  Accessibility,
  Maximize2,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableItem } from '../ui/SortableItem';
import { DualAxisConfig, AxisConfig, DualAxisSeries } from '../../types/visualization-configs';

interface DualAxisConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<DualAxisConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: DualAxisConfig) => void;
}

const defaultAxisConfig: AxisConfig = {
  visible: true,
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
};

const defaultSeries: Omit<DualAxisSeries, 'id'> = {
  field: '',
  type: 'line',
  axis: 'left',
  name: '',
  color: '#3b82f6',
  lineStyle: { width: 2, dash: '', opacity: 1 },
  marker: { symbol: 'none', size: 4 },
  barStyle: { fillOpacity: 0.7, borderColor: '#1e3a8a', borderWidth: 1 },
  areaStyle: { fillOpacity: 0.3 },
};

const defaultConfig: DualAxisConfig = {
  title: '',
  description: '',
  xField: '',
  series: [],
  leftAxis: { ...defaultAxisConfig, title: 'Left Axis' },
  rightAxis: { ...defaultAxisConfig, title: 'Right Axis' },
  showGrid: true,
  grid: { color: '#e5e5e5', width: 0.5, dash: '', xLines: false, yLines: true },
  showLegend: true,
  legend: {
    position: 'top',
    orient: 'horizontal',
    title: '',
    titleFontSize: 12,
    itemGap: 10,
    symbolSize: 8,
    fontSize: 11,
    color: '#333333',
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    format: '',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showAllSeries: true,
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
    customClickHandler: '',
  },
  annotations: [],
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
  },
  dimensions: { width: 600, height: 400 },
  responsive: {
    enabled: true,
    minWidth: 300,
    minHeight: 200,
    aspectRatio: undefined,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: { ariaLabel: 'Dual‑axis chart', highContrast: false, focusable: true },
  performance: { downsampling: false, maxPoints: 5000, progressive: false, virtualization: false },
};

export const DualAxisConfigDialog: React.FC<DualAxisConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];

  // ===== State =====
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description || '');
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [series, setSeries] = useState<DualAxisSeries[]>(() => {
    if (initialMetadata.series && initialMetadata.series.length > 0) {
      return initialMetadata.series.map(s => ({
        ...defaultSeries,
        ...s,
        id: s.id || crypto.randomUUID(),
      }));
    }
    return [];
  });

  // Axis configs
  const [leftAxis, setLeftAxis] = useState<AxisConfig>({
    ...defaultAxisConfig,
    ...initialMetadata.leftAxis,
    title: initialMetadata.leftAxis?.title || 'Left Axis',
  });
  const [rightAxis, setRightAxis] = useState<AxisConfig>({
    ...defaultAxisConfig,
    ...initialMetadata.rightAxis,
    title: initialMetadata.rightAxis?.title || 'Right Axis',
  });

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color || defaultConfig.grid!.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width || defaultConfig.grid!.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
  const [gridXLines, setGridXLines] = useState(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
  const [gridYLines, setGridYLines] = useState(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title || '');
  const [legendTitleFontSize, setLegendTitleFontSize] = useState(initialMetadata.legend?.titleFontSize || 12);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap || 10);
  const [legendSymbolSize, setLegendSymbolSize] = useState(initialMetadata.legend?.symbolSize || 8);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize || 11);
  const [legendColor, setLegendColor] = useState(initialMetadata.legend?.color || '#333333');

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format || '');
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || '#ffffff');
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || '#cccccc');
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor || '#333333');
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize || 12);
  const [tooltipShowAll, setTooltipShowAll] = useState(initialMetadata.tooltip?.showAllSeries ?? true);

  // Interactivity
  const [zoom, setZoom] = useState(initialMetadata.interactivity?.zoom ?? true);
  const [pan, setPan] = useState(initialMetadata.interactivity?.pan ?? true);
  const [selection, setSelection] = useState(initialMetadata.interactivity?.selection || 'none');
  const [brush, setBrush] = useState(initialMetadata.interactivity?.brush ?? false);
  const [hoverHighlight, setHoverHighlight] = useState(initialMetadata.interactivity?.hoverHighlight ?? true);
  const [clickAction, setClickAction] = useState(initialMetadata.interactivity?.clickAction || 'none');
  const [customClickHandler, setCustomClickHandler] = useState(initialMetadata.interactivity?.customClickHandler || '');

  // Annotations (simplified – can be expanded)
  const [annotations, setAnnotations] = useState(initialMetadata.annotations || []);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? true);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration || 300);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || 'ease');

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || 600);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || 400);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? true);
  const [minWidth, setMinWidth] = useState(initialMetadata.responsive?.minWidth || 300);
  const [minHeight, setMinHeight] = useState(initialMetadata.responsive?.minHeight || 200);
  const [aspectRatio, setAspectRatio] = useState<string>(
    String(initialMetadata.responsive?.aspectRatio ?? '')
  );
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? true);
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(
    (initialMetadata.exportFormats as Array<'png' | 'svg' | 'pdf'>) || ['png', 'svg', 'pdf']
  );

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || 'Dual‑axis chart');
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription || '');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast || false);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? true);

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling || false);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints || 5000);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive || false);
  const [virtualization, setVirtualization] = useState(initialMetadata.performance?.virtualization || false);

  // UI sections
  const [sections, setSections] = useState({
    basic: true,
    series: true,
    leftAxis: false,
    rightAxis: false,
    gridLegend: false,
    tooltip: false,
    interactivity: false,
    annotations: false,
    animation: false,
    dimensions: false,
    responsive: false,
    export: false,
    accessibility: false,
    performance: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes (e.g., different node selected)
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setDescription(initialMetadata.description || '');
    setXField(initialMetadata.xField || '');
    setSeries(
      initialMetadata.series?.map(s => ({ ...defaultSeries, ...s, id: s.id || crypto.randomUUID() })) || []
    );
    setLeftAxis({
      ...defaultAxisConfig,
      ...initialMetadata.leftAxis,
      title: initialMetadata.leftAxis?.title || 'Left Axis',
    });
    setRightAxis({
      ...defaultAxisConfig,
      ...initialMetadata.rightAxis,
      title: initialMetadata.rightAxis?.title || 'Right Axis',
    });
    setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
    setGridColor(initialMetadata.grid?.color || defaultConfig.grid!.color);
    setGridWidth(initialMetadata.grid?.width || defaultConfig.grid!.width);
    setGridDash(initialMetadata.grid?.dash || defaultConfig.grid!.dash);
    setGridXLines(initialMetadata.grid?.xLines ?? defaultConfig.grid!.xLines);
    setGridYLines(initialMetadata.grid?.yLines ?? defaultConfig.grid!.yLines);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position || defaultConfig.legend!.position);
    setLegendOrient(initialMetadata.legend?.orient || defaultConfig.legend!.orient);
    setLegendTitle(initialMetadata.legend?.title || '');
    setLegendTitleFontSize(initialMetadata.legend?.titleFontSize || 12);
    setLegendItemGap(initialMetadata.legend?.itemGap || 10);
    setLegendSymbolSize(initialMetadata.legend?.symbolSize || 8);
    setLegendFontSize(initialMetadata.legend?.fontSize || 11);
    setLegendColor(initialMetadata.legend?.color || '#333333');
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
    setTooltipTrigger(initialMetadata.tooltip?.trigger || defaultConfig.tooltip!.trigger);
    setTooltipFormat(initialMetadata.tooltip?.format || '');
    setTooltipBg(initialMetadata.tooltip?.backgroundColor || '#ffffff');
    setTooltipBorder(initialMetadata.tooltip?.borderColor || '#cccccc');
    setTooltipText(initialMetadata.tooltip?.textColor || '#333333');
    setTooltipFontSize(initialMetadata.tooltip?.fontSize || 12);
    setTooltipShowAll(initialMetadata.tooltip?.showAllSeries ?? true);
    setZoom(initialMetadata.interactivity?.zoom ?? true);
    setPan(initialMetadata.interactivity?.pan ?? true);
    setSelection(initialMetadata.interactivity?.selection || 'none');
    setBrush(initialMetadata.interactivity?.brush ?? false);
    setHoverHighlight(initialMetadata.interactivity?.hoverHighlight ?? true);
    setClickAction(initialMetadata.interactivity?.clickAction || 'none');
    setCustomClickHandler(initialMetadata.interactivity?.customClickHandler || '');
    setAnnotations(initialMetadata.annotations || []);
    setAnimationEnabled(initialMetadata.animation?.enabled ?? true);
    setAnimationDuration(initialMetadata.animation?.duration || 300);
    setAnimationEasing(initialMetadata.animation?.easing || 'ease');
    setWidth(initialMetadata.dimensions?.width || 600);
    setHeight(initialMetadata.dimensions?.height || 400);
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? true);
    setMinWidth(initialMetadata.responsive?.minWidth || 300);
    setMinHeight(initialMetadata.responsive?.minHeight || 200);
    setAspectRatio(String(initialMetadata.responsive?.aspectRatio ?? ''));
    setExportable(initialMetadata.exportable ?? true);
    setExportFormats(
      (initialMetadata.exportFormats as Array<'png' | 'svg' | 'pdf'>) || ['png', 'svg', 'pdf']
    );
    setAriaLabel(initialMetadata.accessibility?.ariaLabel || 'Dual‑axis chart');
    setAriaDescription(initialMetadata.accessibility?.ariaDescription || '');
    setHighContrast(initialMetadata.accessibility?.highContrast || false);
    setFocusable(initialMetadata.accessibility?.focusable ?? true);
    setDownsampling(initialMetadata.performance?.downsampling || false);
    setMaxPoints(initialMetadata.performance?.maxPoints || 5000);
    setProgressive(initialMetadata.performance?.progressive || false);
    setVirtualization(initialMetadata.performance?.virtualization || false);
  }, [initialMetadata]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSeries(prev => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over?.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addSeries = () => {
    const newSeries: DualAxisSeries = {
      ...defaultSeries,
      id: crypto.randomUUID(),
      field: availableColumns[0]?.name || '',
    };
    setSeries([...series, newSeries]);
  };

  const removeSeries = (id: string) => {
    setSeries(series.filter(s => s.id !== id));
  };

  const updateSeries = (id: string, updater: Partial<DualAxisSeries>) => {
    setSeries(series.map(s => (s.id === id ? { ...s, ...updater } : s)));
  };

  const handleSave = () => {
    if (!xField) {
      alert('Please select an X‑axis field.');
      return;
    }
    if (series.length === 0) {
      alert('Add at least one series.');
      return;
    }

    const config: DualAxisConfig = {
      title,
      description,
      xField,
      series,
      leftAxis,
      rightAxis,
      showGrid,
      grid: { color: gridColor, width: gridWidth, dash: gridDash, xLines: gridXLines, yLines: gridYLines },
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        title: legendTitle,
        titleFontSize: legendTitleFontSize,
        itemGap: legendItemGap,
        symbolSize: legendSymbolSize,
        fontSize: legendFontSize,
        color: legendColor,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger as any,
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: tooltipFontSize,
        showAllSeries: tooltipShowAll,
      },
      interactivity: {
        zoom,
        pan,
        selection,
        brush,
        hoverHighlight,
        clickAction,
        customClickHandler,
      },
      annotations,
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth,
        minHeight,
        aspectRatio: aspectRatio ? parseFloat(aspectRatio) : undefined,
      },
      exportable,
      exportFormats,
      accessibility: {
        ariaLabel,
        ariaDescription,
        highContrast,
        focusable,
      },
      performance: {
        downsampling,
        maxPoints,
        progressive,
        virtualization,
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

  const renderAxisConfig = (_axis: 'left' | 'right', config: AxisConfig, setter: (c: AxisConfig) => void) => (
    <div className="space-y-3 p-3 bg-gray-800 rounded-md">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.visible}
              onChange={(e) => setter({ ...config, visible: e.target.checked })}
              className="rounded border-gray-600 text-purple-500"
            />
            <span className="text-sm text-gray-200">Visible</span>
          </label>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => setter({ ...config, title: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Title size</label>
          <input
            type="number"
            min="8"
            max="24"
            value={config.titleFontSize}
            onChange={(e) => setter({ ...config, titleFontSize: parseInt(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Title color</label>
          <input
            type="color"
            value={config.titleColor}
            onChange={(e) => setter({ ...config, titleColor: e.target.value })}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tick format</label>
          <input
            type="text"
            value={config.tickFormat || ''}
            onChange={(e) => setter({ ...config, tickFormat: e.target.value })}
            placeholder="e.g., .2f"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tick count</label>
          <input
            type="number"
            min="0"
            value={config.tickCount || ''}
            onChange={(e) => setter({ ...config, tickCount: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tick color</label>
          <input
            type="color"
            value={config.tickColor}
            onChange={(e) => setter({ ...config, tickColor: e.target.value })}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tick size</label>
          <input
            type="number"
            min="0"
            value={config.tickSize}
            onChange={(e) => setter({ ...config, tickSize: parseInt(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Line color</label>
          <input
            type="color"
            value={config.lineColor}
            onChange={(e) => setter({ ...config, lineColor: e.target.value })}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Line width</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={config.lineWidth}
            onChange={(e) => setter({ ...config, lineWidth: parseFloat(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Scale type</label>
          <select
            value={config.scaleType}
            onChange={(e) => setter({ ...config, scaleType: e.target.value as any })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          >
            <option value="linear">Linear</option>
            <option value="log">Log</option>
            <option value="time">Time</option>
            <option value="categorical">Categorical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min (optional)</label>
          <input
            type="text"
            value={config.min !== undefined ? config.min : ''}
            onChange={(e) => setter({ ...config, min: e.target.value || undefined })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max (optional)</label>
          <input
            type="text"
            value={config.max !== undefined ? config.max : ''}
            onChange={(e) => setter({ ...config, max: e.target.value || undefined })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.zeroBaseline}
              onChange={(e) => setter({ ...config, zeroBaseline: e.target.checked })}
              className="rounded border-gray-600 text-purple-500"
            />
            <span className="text-sm text-gray-200">Force zero baseline</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Dual‑Axis Chart</h2>
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
          <SectionHeader title="Basic Settings" icon={<Settings className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Dual‑Axis Chart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">X‑Axis Field <span className="text-red-400">*</span></label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select field</option>
                  {availableColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Series Section */}
          <SectionHeader title="Series" icon={<Layers className="h-4 w-4" />} sectionKey="series" />
          {sections.series && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Series List</h3>
                <button
                  onClick={addSeries}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Series</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={series.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {series.map((s) => (
                      <SortableItem key={s.id} id={s.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeSeries(s.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-start space-x-3">
                            <div className="cursor-grab text-gray-500 mt-2">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Field</label>
                                <select
                                  value={s.field}
                                  onChange={(e) => updateSeries(s.id, { field: e.target.value })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="">Select field</option>
                                  {availableColumns.map(col => (
                                    <option key={col.name} value={col.name}>{col.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Chart Type</label>
                                <select
                                  value={s.type}
                                  onChange={(e) => updateSeries(s.id, { type: e.target.value as any })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="line">Line</option>
                                  <option value="bar">Bar</option>
                                  <option value="area">Area</option>
                                  <option value="scatter">Scatter</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Axis</label>
                                <div className="flex space-x-2">
                                  <label className="flex items-center space-x-1">
                                    <input
                                      type="radio"
                                      value="left"
                                      checked={s.axis === 'left'}
                                      onChange={(e) => updateSeries(s.id, { axis: e.target.value as any })}
                                      className="text-purple-500"
                                    />
                                    <span className="text-xs text-gray-300">Left</span>
                                  </label>
                                  <label className="flex items-center space-x-1">
                                    <input
                                      type="radio"
                                      value="right"
                                      checked={s.axis === 'right'}
                                      onChange={(e) => updateSeries(s.id, { axis: e.target.value as any })}
                                      className="text-purple-500"
                                    />
                                    <span className="text-xs text-gray-300">Right</span>
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Name (legend)</label>
                                <input
                                  type="text"
                                  value={s.name || ''}
                                  onChange={(e) => updateSeries(s.id, { name: e.target.value })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                  placeholder="Auto"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Color</label>
                                <input
                                  type="color"
                                  value={s.color || '#3b82f6'}
                                  onChange={(e) => updateSeries(s.id, { color: e.target.value })}
                                  className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                                />
                              </div>
                              {(s.type === 'line' || s.type === 'area') && (
                                <>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Line width</label>
                                    <input
                                      type="number"
                                      min="0.5"
                                      step="0.5"
                                      value={s.lineStyle?.width}
                                      onChange={(e) => updateSeries(s.id, { lineStyle: { ...s.lineStyle, width: parseFloat(e.target.value) } })}
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Line dash</label>
                                    <input
                                      type="text"
                                      value={s.lineStyle?.dash || ''}
                                      onChange={(e) => updateSeries(s.id, { lineStyle: { ...s.lineStyle, dash: e.target.value } })}
                                      placeholder="e.g., 5,5"
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                    />
                                  </div>
                                </>
                              )}
                              {s.type === 'bar' && (
                                <>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Fill opacity</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="1"
                                      step="0.1"
                                      value={s.barStyle?.fillOpacity}
                                      onChange={(e) => updateSeries(s.id, { barStyle: { ...s.barStyle, fillOpacity: parseFloat(e.target.value) } })}
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Border color</label>
                                    <input
                                      type="color"
                                      value={s.barStyle?.borderColor}
                                      onChange={(e) => updateSeries(s.id, { barStyle: { ...s.barStyle, borderColor: e.target.value } })}
                                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                                    />
                                  </div>
                                </>
                              )}
                              {s.type === 'area' && (
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Area opacity</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={s.areaStyle?.fillOpacity}
                                    onChange={(e) => updateSeries(s.id, { areaStyle: { ...s.areaStyle, fillOpacity: parseFloat(e.target.value) } })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                  />
                                </div>
                              )}
                              {s.type !== 'bar' && s.type !== 'area' && (
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Marker symbol</label>
                                  <select
                                    value={s.marker?.symbol}
                                    onChange={(e) => updateSeries(s.id, { marker: { ...s.marker, symbol: e.target.value as any } })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                  >
                                    <option value="none">None</option>
                                    <option value="circle">Circle</option>
                                    <option value="square">Square</option>
                                    <option value="diamond">Diamond</option>
                                    <option value="cross">Cross</option>
                                    <option value="x">X</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {series.length === 0 && (
                <p className="text-gray-500 text-sm italic">No series defined. Add one to start.</p>
              )}
            </div>
          )}

          {/* Left Axis Section */}
          <SectionHeader title="Left Axis" icon={<ArrowLeft className="h-4 w-4" />} sectionKey="leftAxis" />
          {sections.leftAxis && renderAxisConfig('left', leftAxis, setLeftAxis)}

          {/* Right Axis Section */}
          <SectionHeader title="Right Axis" icon={<ArrowRight className="h-4 w-4" />} sectionKey="rightAxis" />
          {sections.rightAxis && renderAxisConfig('right', rightAxis, setRightAxis)}

          {/* Grid & Legend Section */}
          <SectionHeader title="Grid & Legend" icon={<Grid className="h-4 w-4" />} sectionKey="gridLegend" />
          {sections.gridLegend && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Grid */}
              <div className="space-y-3 p-3 bg-gray-800 rounded-md">
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
                      <label className="block text-xs text-gray-400 mb-1">Dash</label>
                      <input
                        type="text"
                        value={gridDash}
                        onChange={(e) => setGridDash(e.target.value)}
                        placeholder="e.g., 5,5"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={gridXLines}
                          onChange={(e) => setGridXLines(e.target.checked)}
                          className="rounded border-gray-600 text-purple-500"
                        />
                        <span className="text-xs text-gray-300">X lines</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={gridYLines}
                          onChange={(e) => setGridYLines(e.target.checked)}
                          className="rounded border-gray-600 text-purple-500"
                        />
                        <span className="text-xs text-gray-300">Y lines</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

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
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={legendTitle}
                        onChange={(e) => setLegendTitle(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={legendTitleFontSize}
                        onChange={(e) => setLegendTitleFontSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
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
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Symbol size</label>
                      <input
                        type="number"
                        min="4"
                        max="20"
                        value={legendSymbolSize}
                        onChange={(e) => setLegendSymbolSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font size</label>
                      <input
                        type="number"
                        min="8"
                        max="20"
                        value={legendFontSize}
                        onChange={(e) => setLegendFontSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Text color</label>
                      <input
                        type="color"
                        value={legendColor}
                        onChange={(e) => setLegendColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
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
                    <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                    <select
                      value={tooltipTrigger}
                      onChange={(e) => setTooltipTrigger(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="item">Item</option>
                      <option value="axis">Axis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={tooltipFormat}
                      onChange={(e) => setTooltipFormat(e.target.value)}
                      placeholder="e.g., {{series}}: {{value}}"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
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
                      max="20"
                      value={tooltipFontSize}
                      onChange={(e) => setTooltipFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowAll}
                        onChange={(e) => setTooltipShowAll(e.target.checked)}
                        className="rounded border-gray-600 text-purple-500"
                      />
                      <span className="text-sm text-gray-200">Show all series at same x</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Wrench className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={zoom}
                    onChange={(e) => setZoom(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pan}
                    onChange={(e) => setPan(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hoverHighlight}
                    onChange={(e) => setHoverHighlight(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Hover highlight</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={brush}
                    onChange={(e) => setBrush(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Brush selection</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Selection mode</label>
                <select
                  value={selection}
                  onChange={(e) => setSelection(e.target.value as any)}
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
                  value={clickAction}
                  onChange={(e) => setClickAction(e.target.value as any)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                >
                  <option value="none">None</option>
                  <option value="select">Select</option>
                  <option value="drilldown">Drill‑down</option>
                  <option value="custom">Custom</option>
                </select>
                {clickAction === 'custom' && (
                  <input
                    type="text"
                    value={customClickHandler}
                    onChange={(e) => setCustomClickHandler(e.target.value)}
                    placeholder="Custom handler name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm mt-2"
                  />
                )}
              </div>
            </div>
          )}

          {/* Annotations Section (simplified) */}
          <SectionHeader title="Annotations" icon={<Wrench className="h-4 w-4" />} sectionKey="annotations" />
          {sections.annotations && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              <p className="text-xs text-gray-400">(Advanced configuration can be added here)</p>
              {/* Placeholder – can expand later */}
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
          <SectionHeader title="Dimensions" icon={<Maximize2 className="h-4 w-4" />} sectionKey="dimensions" />
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

          {/* Responsive & Export Section */}
          <SectionHeader title="Responsive & Export" icon={<Globe className="h-4 w-4" />} sectionKey="responsive" />
          {sections.responsive && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Responsive</span>
              </label>
              {responsiveEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min width</label>
                    <input
                      type="number"
                      min="100"
                      value={minWidth}
                      onChange={(e) => setMinWidth(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min height</label>
                    <input
                      type="number"
                      min="100"
                      value={minHeight}
                      onChange={(e) => setMinHeight(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Aspect ratio</label>
                    <input
                      type="text"
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      placeholder="e.g., 16/9"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportable}
                    onChange={(e) => setExportable(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Exportable</span>
                </label>
                {exportable && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-400 mb-1">Export formats</label>
                    <div className="flex space-x-4">
                      {(['png', 'svg', 'pdf'] as const).map(fmt => (
                        <label key={fmt} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            value={fmt}
                            checked={exportFormats.includes(fmt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFormats([...exportFormats, fmt]);
                              } else {
                                setExportFormats(exportFormats.filter(f => f !== fmt));
                              }
                            }}
                            className="rounded border-gray-600 text-purple-500"
                          />
                          <span className="text-xs text-gray-300 uppercase">{fmt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility Section */}
          <SectionHeader title="Accessibility" icon={<Accessibility className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA description</label>
                <input
                  type="text"
                  value={ariaDescription}
                  onChange={(e) => setAriaDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
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

          {/* Performance Section */}
          <SectionHeader title="Performance" icon={<Zap className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700 p-3 bg-gray-800 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={downsampling}
                  onChange={(e) => setDownsampling(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Downsampling (reduce points)</span>
              </label>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max points</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={progressive}
                  onChange={(e) => setProgressive(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Progressive rendering</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={virtualization}
                  onChange={(e) => setVirtualization(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Virtualization (viewport‑only)</span>
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