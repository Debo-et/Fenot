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
} from 'lucide-react';

import { HeatmapConfig } from '../../types/visualization-configs';

interface HeatmapConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<HeatmapConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: HeatmapConfig) => void;
}

const defaultConfig: HeatmapConfig = {
  title: '',
  xField: '',
  yField: '',
  valueField: '',
  colorScale: {
    type: 'sequential',
    scheme: 'viridis',
    interpolator: 'linear',
    opacity: 0.8,
    missingValueColor: '#cccccc',
    missingValueBehavior: 'ignore',
    reverse: false,
  },
  cell: {
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 0,
    spacing: 0,
    showValues: false,
    valueFormat: '.2f',
    valueFontSize: 10,
    valueColor: '#000000',
  },
  xAxis: {
    visible: true,
    title: '',
    tickLabelRotation: 0,
    scaleType: 'categorical',
    sort: 'none',
    tickColor: '#999999',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
  },
  yAxis: {
    visible: true,
    title: '',
    tickLabelRotation: 0,
    scaleType: 'categorical',
    sort: 'none',
    tickColor: '#999999',
    tickSize: 6,
    lineColor: '#cccccc',
    lineWidth: 1,
  },
  showLegend: true,
  legend: {
    position: 'right',
    orient: 'vertical',
    title: '',
    fontSize: 12,
    continuous: true,
    format: '.2f',
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
  showGrid: false,
  grid: {
    color: '#e5e5e5',
    width: 0.5,
    dash: '',
    showXLines: false,
    showYLines: false,
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    brush: false,
    hoverHighlight: true,
    clickAction: 'none',
    keyboardNavigation: false,
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
  accessibility: {
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    maxCells: 10000,
    progressive: false,
    virtualization: false,
  },
};

export const HeatmapConfigDialog: React.FC<HeatmapConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar', 'char'].includes(col.type.toLowerCase())
  );
  const numericalColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );

  // Basic fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [xField, setXField] = useState(initialMetadata.xField || '');
  const [yField, setYField] = useState(initialMetadata.yField || '');
  const [valueField, setValueField] = useState(initialMetadata.valueField || '');
  const [groupField, setGroupField] = useState(initialMetadata.groupField || '');

  // Color scale
  const [colorType, setColorType] = useState(initialMetadata.colorScale?.type || defaultConfig.colorScale.type);
  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScale?.scheme || defaultConfig.colorScale.scheme);
  const [colorInterpolator, setColorInterpolator] = useState(initialMetadata.colorScale?.interpolator || defaultConfig.colorScale.interpolator);
  const [colorMin, setColorMin] = useState(initialMetadata.colorScale?.min);
  const [colorMax, setColorMax] = useState(initialMetadata.colorScale?.max);
  const [colorSteps, setColorSteps] = useState(initialMetadata.colorScale?.steps);
  const [colorOpacity, setColorOpacity] = useState(initialMetadata.colorScale?.opacity ?? defaultConfig.colorScale.opacity);
  const [missingValueColor, setMissingValueColor] = useState(initialMetadata.colorScale?.missingValueColor || defaultConfig.colorScale.missingValueColor);
  const [missingValueBehavior, setMissingValueBehavior] = useState(initialMetadata.colorScale?.missingValueBehavior || defaultConfig.colorScale.missingValueBehavior);
  const [reverseColors, setReverseColors] = useState(initialMetadata.colorScale?.reverse ?? defaultConfig.colorScale.reverse);

  // Cell styling
  const [cellBorderColor, setCellBorderColor] = useState(initialMetadata.cell?.borderColor || defaultConfig.cell.borderColor);
  const [cellBorderWidth, setCellBorderWidth] = useState(initialMetadata.cell?.borderWidth ?? defaultConfig.cell.borderWidth);
  const [cellBorderRadius, setCellBorderRadius] = useState(initialMetadata.cell?.borderRadius ?? defaultConfig.cell.borderRadius);
  const [cellSpacing, setCellSpacing] = useState(initialMetadata.cell?.spacing ?? defaultConfig.cell.spacing);
  const [showCellValues, setShowCellValues] = useState(initialMetadata.cell?.showValues ?? defaultConfig.cell.showValues);
  const [cellValueFormat, setCellValueFormat] = useState(initialMetadata.cell?.valueFormat || defaultConfig.cell.valueFormat);
  const [cellValueFontSize, setCellValueFontSize] = useState(initialMetadata.cell?.valueFontSize ?? defaultConfig.cell.valueFontSize);
  const [cellValueColor, setCellValueColor] = useState(initialMetadata.cell?.valueColor || defaultConfig.cell.valueColor);

  // Axes
  const [xAxisVisible, setXAxisVisible] = useState(initialMetadata.xAxis?.visible ?? defaultConfig.xAxis.visible);
  const [xAxisTitle, setXAxisTitle] = useState(initialMetadata.xAxis?.title || '');
  const [xAxisTickRotation, setXAxisTickRotation] = useState(initialMetadata.xAxis?.tickLabelRotation ?? 0);
  const [xAxisTickFormat, setXAxisTickFormat] = useState(initialMetadata.xAxis?.tickFormat || '');
  const [xAxisScaleType, setXAxisScaleType] = useState(initialMetadata.xAxis?.scaleType || 'categorical');
  const [xAxisSort, setXAxisSort] = useState(initialMetadata.xAxis?.sort || 'none');
  const [xAxisLineColor, setXAxisLineColor] = useState(initialMetadata.xAxis?.lineColor || defaultConfig.xAxis.lineColor);
  const [xAxisLineWidth, setXAxisLineWidth] = useState(initialMetadata.xAxis?.lineWidth ?? defaultConfig.xAxis.lineWidth);
  const [xAxisTickColor, setXAxisTickColor] = useState(initialMetadata.xAxis?.tickColor || defaultConfig.xAxis.tickColor);
  const [xAxisTickSize, setXAxisTickSize] = useState(initialMetadata.xAxis?.tickSize ?? defaultConfig.xAxis.tickSize);

  const [yAxisVisible, setYAxisVisible] = useState(initialMetadata.yAxis?.visible ?? defaultConfig.yAxis.visible);
  const [yAxisTitle, setYAxisTitle] = useState(initialMetadata.yAxis?.title || '');
  const [yAxisTickRotation, setYAxisTickRotation] = useState(initialMetadata.yAxis?.tickLabelRotation ?? 0);
  const [yAxisTickFormat, setYAxisTickFormat] = useState(initialMetadata.yAxis?.tickFormat || '');
  const [yAxisScaleType, setYAxisScaleType] = useState(initialMetadata.yAxis?.scaleType || 'categorical');
  const [yAxisSort, setYAxisSort] = useState(initialMetadata.yAxis?.sort || 'none');
  const [yAxisLineColor, setYAxisLineColor] = useState(initialMetadata.yAxis?.lineColor || defaultConfig.yAxis.lineColor);
  const [yAxisLineWidth, setYAxisLineWidth] = useState(initialMetadata.yAxis?.lineWidth ?? defaultConfig.yAxis.lineWidth);
  const [yAxisTickColor, setYAxisTickColor] = useState(initialMetadata.yAxis?.tickColor || defaultConfig.yAxis.tickColor);
  const [yAxisTickSize, setYAxisTickSize] = useState(initialMetadata.yAxis?.tickSize ?? defaultConfig.yAxis.tickSize);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || defaultConfig.legend?.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient || defaultConfig.legend?.orient);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title || '');
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend?.fontSize);
  const [legendContinuous, setLegendContinuous] = useState(initialMetadata.legend?.continuous ?? defaultConfig.legend?.continuous);
  const [legendFormat, setLegendFormat] = useState(initialMetadata.legend?.format || defaultConfig.legend?.format);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger || defaultConfig.tooltip.trigger);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip.fontSize);
  const [tooltipShowValues, setTooltipShowValues] = useState(initialMetadata.tooltip?.showValues ?? defaultConfig.tooltip.showValues);

  // Grid
  const [showGrid, setShowGrid] = useState(initialMetadata.showGrid ?? defaultConfig.showGrid);
  const [gridColor, setGridColor] = useState(initialMetadata.grid?.color || defaultConfig.grid?.color);
  const [gridWidth, setGridWidth] = useState(initialMetadata.grid?.width ?? defaultConfig.grid?.width);
  const [gridDash, setGridDash] = useState(initialMetadata.grid?.dash || '');

  // Interactivity
  const [interactivityZoom, setInteractivityZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity.zoom);
  const [interactivityPan, setInteractivityPan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity.pan);
  const [interactivitySelection, setInteractivitySelection] = useState(initialMetadata.interactivity?.selection || defaultConfig.interactivity.selection);
  const [interactivityBrush, setInteractivityBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity.brush);
  const [interactivityHover, setInteractivityHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity.hoverHighlight);
  const [interactivityClick, setInteractivityClick] = useState(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity.clickAction);
  const [keyboardNav, setKeyboardNav] = useState(initialMetadata.interactivity?.keyboardNavigation ?? defaultConfig.interactivity.keyboardNavigation);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation?.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation?.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || defaultConfig.animation?.easing);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive?.enabled);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);

  // Accessibility
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility?.highContrast);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? defaultConfig.accessibility?.focusable);
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || '');

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance?.downsampling);
  const [maxCells, setMaxCells] = useState(initialMetadata.performance?.maxCells ?? defaultConfig.performance?.maxCells);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive ?? defaultConfig.performance?.progressive);
  const [virtualization, setVirtualization] = useState(initialMetadata.performance?.virtualization ?? defaultConfig.performance?.virtualization);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    colorScale: false,
    cellStyling: false,
    axes: false,
    legend: false,
    tooltip: false,
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
    setXField(initialMetadata.xField || '');
    setYField(initialMetadata.yField || '');
    setValueField(initialMetadata.valueField || '');
    setGroupField(initialMetadata.groupField || '');

    if (initialMetadata.colorScale) {
      setColorType(initialMetadata.colorScale.type ?? defaultConfig.colorScale.type);
      setColorScheme(initialMetadata.colorScale.scheme ?? defaultConfig.colorScale.scheme);
      setColorInterpolator(initialMetadata.colorScale.interpolator ?? defaultConfig.colorScale.interpolator);
      setColorMin(initialMetadata.colorScale.min);
      setColorMax(initialMetadata.colorScale.max);
      setColorSteps(initialMetadata.colorScale.steps);
      setColorOpacity(initialMetadata.colorScale.opacity ?? defaultConfig.colorScale.opacity);
      setMissingValueColor(initialMetadata.colorScale.missingValueColor || defaultConfig.colorScale.missingValueColor);
      setMissingValueBehavior(initialMetadata.colorScale.missingValueBehavior || defaultConfig.colorScale.missingValueBehavior);
      setReverseColors(initialMetadata.colorScale.reverse ?? defaultConfig.colorScale.reverse);
    }

    if (initialMetadata.cell) {
      setCellBorderColor(initialMetadata.cell.borderColor || defaultConfig.cell.borderColor);
      setCellBorderWidth(initialMetadata.cell.borderWidth ?? defaultConfig.cell.borderWidth);
      setCellBorderRadius(initialMetadata.cell.borderRadius ?? defaultConfig.cell.borderRadius);
      setCellSpacing(initialMetadata.cell.spacing ?? defaultConfig.cell.spacing);
      setShowCellValues(initialMetadata.cell.showValues ?? defaultConfig.cell.showValues);
      setCellValueFormat(initialMetadata.cell.valueFormat || defaultConfig.cell.valueFormat);
      setCellValueFontSize(initialMetadata.cell.valueFontSize ?? defaultConfig.cell.valueFontSize);
      setCellValueColor(initialMetadata.cell.valueColor || defaultConfig.cell.valueColor);
    }

    if (initialMetadata.xAxis) {
      setXAxisVisible(initialMetadata.xAxis.visible ?? defaultConfig.xAxis.visible);
      setXAxisTitle(initialMetadata.xAxis.title || '');
      setXAxisTickRotation(initialMetadata.xAxis.tickLabelRotation ?? 0);
      setXAxisTickFormat(initialMetadata.xAxis.tickFormat || '');
      setXAxisScaleType(initialMetadata.xAxis.scaleType || 'categorical');
      setXAxisSort(initialMetadata.xAxis.sort || 'none');
      setXAxisLineColor(initialMetadata.xAxis.lineColor || defaultConfig.xAxis.lineColor);
      setXAxisLineWidth(initialMetadata.xAxis.lineWidth ?? defaultConfig.xAxis.lineWidth);
      setXAxisTickColor(initialMetadata.xAxis.tickColor || defaultConfig.xAxis.tickColor);
      setXAxisTickSize(initialMetadata.xAxis.tickSize ?? defaultConfig.xAxis.tickSize);
    }

    if (initialMetadata.yAxis) {
      setYAxisVisible(initialMetadata.yAxis.visible ?? defaultConfig.yAxis.visible);
      setYAxisTitle(initialMetadata.yAxis.title || '');
      setYAxisTickRotation(initialMetadata.yAxis.tickLabelRotation ?? 0);
      setYAxisTickFormat(initialMetadata.yAxis.tickFormat || '');
      setYAxisScaleType(initialMetadata.yAxis.scaleType || 'categorical');
      setYAxisSort(initialMetadata.yAxis.sort || 'none');
      setYAxisLineColor(initialMetadata.yAxis.lineColor || defaultConfig.yAxis.lineColor);
      setYAxisLineWidth(initialMetadata.yAxis.lineWidth ?? defaultConfig.yAxis.lineWidth);
      setYAxisTickColor(initialMetadata.yAxis.tickColor || defaultConfig.yAxis.tickColor);
      setYAxisTickSize(initialMetadata.yAxis.tickSize ?? defaultConfig.yAxis.tickSize);
    }

    if (initialMetadata.legend) {
      setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
      setLegendPosition(initialMetadata.legend.position || defaultConfig.legend?.position);
      setLegendOrient(initialMetadata.legend.orient || defaultConfig.legend?.orient);
      setLegendTitle(initialMetadata.legend.title || '');
      setLegendFontSize(initialMetadata.legend.fontSize ?? defaultConfig.legend?.fontSize);
      setLegendContinuous(initialMetadata.legend.continuous ?? defaultConfig.legend?.continuous);
      setLegendFormat(initialMetadata.legend.format || defaultConfig.legend?.format);
    }

    if (initialMetadata.tooltip) {
      setTooltipShow(initialMetadata.tooltip.show ?? defaultConfig.tooltip.show);
      setTooltipTrigger(initialMetadata.tooltip.trigger || defaultConfig.tooltip.trigger);
      setTooltipBg(initialMetadata.tooltip.backgroundColor || defaultConfig.tooltip.backgroundColor);
      setTooltipBorder(initialMetadata.tooltip.borderColor || defaultConfig.tooltip.borderColor);
      setTooltipText(initialMetadata.tooltip.textColor || defaultConfig.tooltip.textColor);
      setTooltipFontSize(initialMetadata.tooltip.fontSize ?? defaultConfig.tooltip.fontSize);
      setTooltipShowValues(initialMetadata.tooltip.showValues ?? defaultConfig.tooltip.showValues);
    }

    if (initialMetadata.grid) {
      setShowGrid(initialMetadata.showGrid ?? defaultConfig.showGrid);
      setGridColor(initialMetadata.grid.color || defaultConfig.grid?.color);
      setGridWidth(initialMetadata.grid.width ?? defaultConfig.grid?.width);
      setGridDash(initialMetadata.grid.dash || '');
    }

    if (initialMetadata.interactivity) {
      setInteractivityZoom(initialMetadata.interactivity.zoom ?? defaultConfig.interactivity.zoom);
      setInteractivityPan(initialMetadata.interactivity.pan ?? defaultConfig.interactivity.pan);
      setInteractivitySelection(initialMetadata.interactivity.selection || defaultConfig.interactivity.selection);
      setInteractivityBrush(initialMetadata.interactivity.brush ?? defaultConfig.interactivity.brush);
      setInteractivityHover(initialMetadata.interactivity.hoverHighlight ?? defaultConfig.interactivity.hoverHighlight);
      setInteractivityClick(initialMetadata.interactivity.clickAction || defaultConfig.interactivity.clickAction);
      setKeyboardNav(initialMetadata.interactivity.keyboardNavigation ?? defaultConfig.interactivity.keyboardNavigation);
    }

    if (initialMetadata.animation) {
      setAnimationEnabled(initialMetadata.animation.enabled ?? defaultConfig.animation?.enabled);
      setAnimationDuration(initialMetadata.animation.duration ?? defaultConfig.animation?.duration);
      setAnimationEasing(initialMetadata.animation.easing || defaultConfig.animation?.easing);
    }

    if (initialMetadata.dimensions) {
      setWidth(initialMetadata.dimensions.width || defaultConfig.dimensions.width);
      setHeight(initialMetadata.dimensions.height || defaultConfig.dimensions.height);
    }

    if (initialMetadata.responsive) {
      setResponsiveEnabled(initialMetadata.responsive.enabled ?? defaultConfig.responsive?.enabled);
    }
    setExportable(initialMetadata.exportable ?? defaultConfig.exportable);

    if (initialMetadata.accessibility) {
      setHighContrast(initialMetadata.accessibility.highContrast ?? defaultConfig.accessibility?.highContrast);
      setFocusable(initialMetadata.accessibility.focusable ?? defaultConfig.accessibility?.focusable);
      setAriaLabel(initialMetadata.accessibility.ariaLabel || '');
    }

    if (initialMetadata.performance) {
      setDownsampling(initialMetadata.performance.downsampling ?? defaultConfig.performance?.downsampling);
      setMaxCells(initialMetadata.performance.maxCells ?? defaultConfig.performance?.maxCells);
      setProgressive(initialMetadata.performance.progressive ?? defaultConfig.performance?.progressive);
      setVirtualization(initialMetadata.performance.virtualization ?? defaultConfig.performance?.virtualization);
    }
  }, [initialMetadata]);

  const handleSave = () => {
    if (!valueField) {
      alert('Please select a value field for the heatmap.');
      return;
    }
    if (!xField) {
      alert('Please select an X‑axis field.');
      return;
    }
    if (!yField) {
      alert('Please select a Y‑axis field.');
      return;
    }

    const config: HeatmapConfig = {
      title: title || undefined,
      xField,
      yField,
      valueField,
      groupField: groupField || undefined,
      colorScale: {
        type: colorType,
        scheme: colorScheme,
        interpolator: colorInterpolator,
        min: colorMin,
        max: colorMax,
        steps: colorSteps,
        opacity: colorOpacity,
        missingValueColor,
        missingValueBehavior,
        reverse: reverseColors,
      },
      cell: {
        borderColor: cellBorderColor,
        borderWidth: cellBorderWidth,
        borderRadius: cellBorderRadius,
        spacing: cellSpacing,
        showValues: showCellValues,
        valueFormat: cellValueFormat,
        valueFontSize: cellValueFontSize,
        valueColor: cellValueColor,
      },
      xAxis: {
        visible: xAxisVisible,
        title: xAxisTitle || undefined,
        tickLabelRotation: xAxisTickRotation,
        tickFormat: xAxisTickFormat || undefined,
        scaleType: xAxisScaleType,
        sort: xAxisSort,
        lineColor: xAxisLineColor,
        lineWidth: xAxisLineWidth,
        tickColor: xAxisTickColor,
        tickSize: xAxisTickSize,
      },
      yAxis: {
        visible: yAxisVisible,
        title: yAxisTitle || undefined,
        tickLabelRotation: yAxisTickRotation,
        tickFormat: yAxisTickFormat || undefined,
        scaleType: yAxisScaleType,
        sort: yAxisSort,
        lineColor: yAxisLineColor,
        lineWidth: yAxisLineWidth,
        tickColor: yAxisTickColor,
        tickSize: yAxisTickSize,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        title: legendTitle || undefined,
        fontSize: legendFontSize,
        continuous: legendContinuous,
        format: legendFormat || undefined,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: tooltipFontSize,
        showValues: tooltipShowValues,
      },
      showGrid,
      grid: {
        color: gridColor,
        width: gridWidth,
        dash: gridDash || undefined,
      },
      interactivity: {
        zoom: interactivityZoom,
        pan: interactivityPan,
        selection: interactivitySelection,
        brush: interactivityBrush,
        hoverHighlight: interactivityHover,
        clickAction: interactivityClick,
        keyboardNavigation: keyboardNav,
      },
      animation: animationEnabled
        ? {
            enabled: animationEnabled,
            duration: animationDuration,
            easing: animationEasing,
          }
        : undefined,
      dimensions: { width, height },
      responsive: responsiveEnabled ? { enabled: true } : undefined,
      exportable,
      exportFormats: defaultConfig.exportFormats,
      accessibility: {
        highContrast,
        focusable,
        ariaLabel: ariaLabel || undefined,
      },
      performance: {
        downsampling,
        maxCells,
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

  const colorSchemeOptions = [
    { value: 'viridis', label: 'Viridis' },
    { value: 'plasma', label: 'Plasma' },
    { value: 'inferno', label: 'Inferno' },
    { value: 'magma', label: 'Magma' },
    { value: 'cividis', label: 'Cividis' },
    { value: 'turbo', label: 'Turbo' },
    { value: 'blues', label: 'Blues' },
    { value: 'greens', label: 'Greens' },
    { value: 'greys', label: 'Greys' },
    { value: 'oranges', label: 'Oranges' },
    { value: 'purples', label: 'Purples' },
    { value: 'reds', label: 'Reds' },
    { value: 'spectral', label: 'Spectral' },
    { value: 'rdylbu', label: 'RdYlBu' },
    { value: 'rdylgn', label: 'RdYlGn' },
    { value: 'piyg', label: 'PiYG' },
    { value: 'prgn', label: 'PRGn' },
    { value: 'brbg', label: 'BrBG' },
  ];

  const scaleTypeOptions = [
    { value: 'categorical', label: 'Categorical' },
    { value: 'linear', label: 'Linear' },
    { value: 'log', label: 'Log' },
    { value: 'time', label: 'Time' },
  ];

  const sortOptions = [
    { value: 'none', label: 'None' },
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Configure Heatmap</h2>
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
                  placeholder="My Heatmap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">X‑Axis Field (categories) <span className="text-red-400">*</span></label>
                <select
                  value={xField}
                  onChange={(e) => setXField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select a field</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Y‑Axis Field (categories) <span className="text-red-400">*</span></label>
                <select
                  value={yField}
                  onChange={(e) => setYField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select a field</option>
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value Field (numeric intensity) <span className="text-red-400">*</span></label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Group Field (facets) – optional</label>
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
            </div>
          )}

          {/* Color Scale Section */}
          <SectionHeader title="Color Scale" icon={<Palette className="h-4 w-4" />} sectionKey="colorScale" />
          {sections.colorScale && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Type</label>
                  <select
                    value={colorType}
                    onChange={(e) => setColorType(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="sequential">Sequential</option>
                    <option value="diverging">Diverging</option>
                    <option value="categorical">Categorical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Scheme / Palette</label>
                  <select
                    value={colorScheme as string}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    {colorSchemeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Interpolation</label>
                  <select
                    value={colorInterpolator}
                    onChange={(e) => setColorInterpolator(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="linear">Linear</option>
                    <option value="log">Log</option>
                    <option value="sqrt">Square Root</option>
                    <option value="pow">Power</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opacity</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={colorOpacity}
                    onChange={(e) => setColorOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Value (auto if empty)</label>
                  <input
                    type="number"
                    value={colorMin ?? ''}
                    onChange={(e) => setColorMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Value (auto if empty)</label>
                  <input
                    type="number"
                    value={colorMax ?? ''}
                    onChange={(e) => setColorMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Steps (discrete)</label>
                  <input
                    type="number"
                    min="1"
                    value={colorSteps ?? ''}
                    onChange={(e) => setColorSteps(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    placeholder="continuous"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Missing Value Color</label>
                  <input
                    type="color"
                    value={missingValueColor}
                    onChange={(e) => setMissingValueColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Missing Behavior</label>
                  <select
                    value={missingValueBehavior}
                    onChange={(e) => setMissingValueBehavior(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="ignore">Ignore (hide cell)</option>
                    <option value="zero">Treat as zero</option>
                    <option value="hide">Hide</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={reverseColors}
                  onChange={(e) => setReverseColors(e.target.checked)}
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Reverse color scheme</span>
              </label>
            </div>
          )}

          {/* Cell Styling Section */}
          <SectionHeader title="Cell Styling" icon={<Wrench className="h-4 w-4" />} sectionKey="cellStyling" />
          {sections.cellStyling && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={cellBorderColor}
                    onChange={(e) => setCellBorderColor(e.target.value)}
                    className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Width (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={cellBorderWidth}
                    onChange={(e) => setCellBorderWidth(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Radius (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={cellBorderRadius}
                    onChange={(e) => setCellBorderRadius(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cell Spacing (px)</label>
                  <input
                    type="number"
                    min="0"
                    value={cellSpacing}
                    onChange={(e) => setCellSpacing(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCellValues}
                  onChange={(e) => setShowCellValues(e.target.checked)}
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Show values inside cells</span>
              </label>
              {showCellValues && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format (d3)</label>
                    <input
                      type="text"
                      value={cellValueFormat}
                      onChange={(e) => setCellValueFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size (px)</label>
                    <input
                      type="number"
                      min="8"
                      max="30"
                      value={cellValueFontSize}
                      onChange={(e) => setCellValueFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={cellValueColor}
                      onChange={(e) => setCellValueColor(e.target.value)}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Axes Section */}
          <SectionHeader title="Axes" icon={<Grid className="h-4 w-4" />} sectionKey="axes" />
          {sections.axes && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* X‑Axis */}
              <div className="p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={xAxisVisible}
                    onChange={(e) => setXAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-200">Show X‑Axis</span>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick Rotation (°)</label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        value={xAxisTickRotation}
                        onChange={(e) => setXAxisTickRotation(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                      <input
                        type="text"
                        value={xAxisTickFormat}
                        onChange={(e) => setXAxisTickFormat(e.target.value)}
                        placeholder="e.g., .2f"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                      <select
                        value={xAxisScaleType}
                        onChange={(e) => setXAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        {scaleTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Sort Categories</label>
                      <select
                        value={xAxisSort}
                        onChange={(e) => setXAxisSort(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        {sortOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
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
                      <label className="block text-xs text-gray-400 mb-1">Line Width</label>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick Color</label>
                      <input
                        type="color"
                        value={xAxisTickColor}
                        onChange={(e) => setXAxisTickColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Size (px)</label>
                      <input
                        type="number"
                        min="0"
                        value={xAxisTickSize}
                        onChange={(e) => setXAxisTickSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Y‑Axis */}
              <div className="p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={yAxisVisible}
                    onChange={(e) => setYAxisVisible(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-200">Show Y‑Axis</span>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick Rotation (°)</label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        value={yAxisTickRotation}
                        onChange={(e) => setYAxisTickRotation(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Format</label>
                      <input
                        type="text"
                        value={yAxisTickFormat}
                        onChange={(e) => setYAxisTickFormat(e.target.value)}
                        placeholder="e.g., .2f"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Scale Type</label>
                      <select
                        value={yAxisScaleType}
                        onChange={(e) => setYAxisScaleType(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        {scaleTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Sort Categories</label>
                      <select
                        value={yAxisSort}
                        onChange={(e) => setYAxisSort(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      >
                        {sortOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line Color</label>
                      <input
                        type="color"
                        value={yAxisLineColor}
                        onChange={(e) => setYAxisLineColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Line Width</label>
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
                      <label className="block text-xs text-gray-400 mb-1">Tick Color</label>
                      <input
                        type="color"
                        value={yAxisTickColor}
                        onChange={(e) => setYAxisTickColor(e.target.value)}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tick Size (px)</label>
                      <input
                        type="number"
                        min="0"
                        value={yAxisTickSize}
                        onChange={(e) => setYAxisTickSize(parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
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
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Show Legend</span>
              </label>
              {showLegend && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800 rounded-md">
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
                      <option value="top-left">Top‑Left</option>
                      <option value="top-right">Top‑Right</option>
                      <option value="bottom-left">Bottom‑Left</option>
                      <option value="bottom-right">Bottom‑Right</option>
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
                    <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      value={legendFontSize}
                      onChange={(e) => setLegendFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <input
                      type="text"
                      value={legendFormat}
                      onChange={(e) => setLegendFormat(e.target.value)}
                      placeholder=".2f"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={legendContinuous}
                      onChange={(e) => setLegendContinuous(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">Continuous gradient</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Tooltip Section */}
          <SectionHeader title="Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tooltipShow}
                  onChange={(e) => setTooltipShow(e.target.checked)}
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Show Tooltip</span>
              </label>
              {tooltipShow && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800 rounded-md">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                    <select
                      value={tooltipTrigger}
                      onChange={(e) => setTooltipTrigger(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    >
                      <option value="item">Item (hover cell)</option>
                      <option value="axis">Axis (hover line/row)</option>
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
                      onChange={(e) => setTooltipFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <label className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      checked={tooltipShowValues}
                      onChange={(e) => setTooltipShowValues(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">Show values</span>
                  </label>
                </div>
              )}
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
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Show Grid</span>
              </label>
              {showGrid && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-800 rounded-md">
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
                </div>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Sliders className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800 rounded-md">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityZoom}
                    onChange={(e) => setInteractivityZoom(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityPan}
                    onChange={(e) => setInteractivityPan(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityBrush}
                    onChange={(e) => setInteractivityBrush(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Brush selection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivityHover}
                    onChange={(e) => setInteractivityHover(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Hover highlight</span>
                </label>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Selection Mode</label>
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
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Click Action</label>
                  <select
                    value={interactivityClick}
                    onChange={(e) => setInteractivityClick(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="none">None</option>
                    <option value="select">Select</option>
                    <option value="drilldown">Drill down</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2 col-span-2">
                  <input
                    type="checkbox"
                    checked={keyboardNav}
                    onChange={(e) => setKeyboardNav(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Keyboard navigation</span>
                </label>
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
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Enable Animation</span>
              </label>
              {animationEnabled && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800 rounded-md">
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

          {/* Advanced Section */}
          <SectionHeader title="Advanced (Responsive, Export, Accessibility)" icon={<Wrench className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Responsive</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportable}
                  onChange={(e) => setExportable(e.target.checked)}
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-200">Exportable (PNG/SVG/PDF)</span>
              </label>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Accessibility</label>
                <div className="space-y-2 p-3 bg-gray-800 rounded-md">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">High Contrast Mode</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={focusable}
                      onChange={(e) => setFocusable(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">Focusable (keyboard)</span>
                  </label>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ARIA Label (optional)</label>
                    <input
                      type="text"
                      value={ariaLabel}
                      onChange={(e) => setAriaLabel(e.target.value)}
                      placeholder="Describe the heatmap"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Performance</label>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800 rounded-md">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={downsampling}
                      onChange={(e) => setDownsampling(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">Downsampling</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={progressive}
                      onChange={(e) => setProgressive(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">Progressive</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={virtualization}
                      onChange={(e) => setVirtualization(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500"
                    />
                    <span className="text-sm text-gray-200">Virtualization</span>
                  </label>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max Cells</label>
                    <input
                      type="number"
                      min="1"
                      value={maxCells}
                      onChange={(e) => setMaxCells(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
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
            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};