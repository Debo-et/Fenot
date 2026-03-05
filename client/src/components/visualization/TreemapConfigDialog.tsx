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
  Layers,
  Type,
  MousePointer,
  Download,
  Accessibility,
  Zap,
  Square,
} from 'lucide-react';
import { TreemapConfig, TreemapLabelPosition } from '../../types/visualization-configs';

interface TreemapConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<TreemapConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: TreemapConfig) => void;
}

const defaultConfig: TreemapConfig = {
  title: '',
  hierarchy: [],
  sizeField: '',
  colorField: '',
  labelField: '',
  tileAlgorithm: 'squarify',
  padding: 1,
  paddingInner: 1,
  paddingOuter: 2,
  round: true,
  aspectRatio: (1 + Math.sqrt(5)) / 2, // golden ratio
  colorScale: {
    type: 'sequential',
    scheme: 'viridis',
    interpolator: 'linear',
    opacity: 1,
    missingValueColor: '#cccccc',
    reverse: false,
  },
  border: {
    color: '#ffffff',
    width: 1,
    dash: '',
    opacity: 1,
  },
  labels: {
    show: true,
    position: 'center',
    fontFamily: 'sans-serif',
    fontSize: 12,
    color: '#000000',
    backgroundColor: 'rgba(255,255,255,0.7)',
    backgroundOpacity: 0.7,
    padding: 2,
    format: '',
    showName: true,
    showValue: false,
    showPercentage: false,
    truncate: true,
    maxLength: 15,
    textShadow: false,
  },
  tooltip: {
    show: true,
    trigger: 'hover',
    format: '',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showAllFields: false,
    showHierarchy: true,
    showSize: true,
    showColorValue: true,
  },
  showLegend: true,
  legend: {
    position: 'bottom',
    orient: 'horizontal',
    title: '',
    titleFontSize: 12,
    itemGap: 10,
    itemWidth: 20,
    itemHeight: 14,
    symbolSize: 12,
    fontSize: 11,
    color: '#333333',
    continuous: false,
  },
  interactivity: {
    zoomToRect: false,
    drillDown: false,
    hoverHighlight: true,
    clickAction: 'none',
    selection: 'none',
    brush: false,
    keyboardNavigation: false,
  },
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease',
    stagger: false,
  },
  dimensions: {
    width: 600,
    height: 400,
  },
  responsive: {
    enabled: true,
    minWidth: 300,
    minHeight: 200,
    aspectRatio: undefined,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    ariaLabel: '',
    ariaDescription: '',
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    maxNodes: 10000,
    progressive: false,
    virtualization: false,
  },
};

export const TreemapConfigDialog: React.FC<TreemapConfigDialogProps> = ({
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
  const allColumns = availableColumns.map(col => col.name);

  // ========== State ==========
  const [title, setTitle] = useState(initialMetadata.title ?? defaultConfig.title);
  const [hierarchy, setHierarchy] = useState<string[]>(initialMetadata.hierarchy ?? []);
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField ?? '');
  const [colorField, setColorField] = useState(initialMetadata.colorField ?? '');
  const [labelField, setLabelField] = useState(initialMetadata.labelField ?? '');

  // Layout
  const [tileAlgorithm, setTileAlgorithm] = useState<TreemapConfig['tileAlgorithm']>(
    initialMetadata.tileAlgorithm ?? defaultConfig.tileAlgorithm
  );
  const [padding, setPadding] = useState(initialMetadata.padding ?? defaultConfig.padding);
  const [paddingInner, setPaddingInner] = useState(initialMetadata.paddingInner ?? defaultConfig.paddingInner);
  const [paddingOuter, setPaddingOuter] = useState(initialMetadata.paddingOuter ?? defaultConfig.paddingOuter);
  const [round, setRound] = useState(initialMetadata.round ?? defaultConfig.round);
  const [aspectRatio, setAspectRatio] = useState(initialMetadata.aspectRatio ?? defaultConfig.aspectRatio);

  // Color scale
  const [colorScaleType, setColorScaleType] = useState<TreemapConfig['colorScale']['type']>(
    initialMetadata.colorScale?.type ?? defaultConfig.colorScale.type
  );
  const [colorScheme, setColorScheme] = useState(initialMetadata.colorScale?.scheme ?? defaultConfig.colorScale.scheme);
  const [colorInterpolator, setColorInterpolator] = useState<TreemapConfig['colorScale']['interpolator']>(
    initialMetadata.colorScale?.interpolator ?? defaultConfig.colorScale.interpolator
  );
  const [colorMin, setColorMin] = useState<number | undefined>(initialMetadata.colorScale?.min);
  const [colorMax, setColorMax] = useState<number | undefined>(initialMetadata.colorScale?.max);
  const [colorSteps, setColorSteps] = useState<number | undefined>(initialMetadata.colorScale?.steps);
  const [colorOpacity, setColorOpacity] = useState(initialMetadata.colorScale?.opacity ?? defaultConfig.colorScale.opacity);
  const [missingValueColor, setMissingValueColor] = useState(
    initialMetadata.colorScale?.missingValueColor ?? defaultConfig.colorScale.missingValueColor
  );
  const [colorReverse, setColorReverse] = useState(initialMetadata.colorScale?.reverse ?? defaultConfig.colorScale.reverse);

  // Border
  const [borderColor, setBorderColor] = useState(initialMetadata.border?.color ?? defaultConfig.border!.color);
  const [borderWidth, setBorderWidth] = useState(initialMetadata.border?.width ?? defaultConfig.border!.width);
  const [borderDash, setBorderDash] = useState(initialMetadata.border?.dash ?? defaultConfig.border!.dash);
  const [borderOpacity, setBorderOpacity] = useState(initialMetadata.border?.opacity ?? defaultConfig.border!.opacity);

  // Labels
  const [labelsShow, setLabelsShow] = useState(initialMetadata.labels?.show ?? defaultConfig.labels.show);
  // Fixed: use type assertion to ensure no undefined
  const [labelPosition, setLabelPosition] = useState<TreemapLabelPosition>(
    (initialMetadata.labels?.position ?? defaultConfig.labels.position) as TreemapLabelPosition
  );
  const [labelFontFamily, setLabelFontFamily] = useState(initialMetadata.labels?.fontFamily ?? defaultConfig.labels.fontFamily);
  const [labelFontSize, setLabelFontSize] = useState(initialMetadata.labels?.fontSize ?? defaultConfig.labels.fontSize);
  const [labelColor, setLabelColor] = useState(initialMetadata.labels?.color ?? defaultConfig.labels.color);
  const [labelBgColor, setLabelBgColor] = useState(initialMetadata.labels?.backgroundColor ?? defaultConfig.labels.backgroundColor);
  const [labelBgOpacity, setLabelBgOpacity] = useState(initialMetadata.labels?.backgroundOpacity ?? defaultConfig.labels.backgroundOpacity);
  const [labelPadding, setLabelPadding] = useState(initialMetadata.labels?.padding ?? defaultConfig.labels.padding);
  const [labelFormat, setLabelFormat] = useState(initialMetadata.labels?.format ?? defaultConfig.labels.format);
  const [labelShowName, setLabelShowName] = useState(initialMetadata.labels?.showName ?? defaultConfig.labels.showName);
  const [labelShowValue, setLabelShowValue] = useState(initialMetadata.labels?.showValue ?? defaultConfig.labels.showValue);
  const [labelShowPercentage, setLabelShowPercentage] = useState(initialMetadata.labels?.showPercentage ?? defaultConfig.labels.showPercentage);
  const [labelTruncate, setLabelTruncate] = useState(initialMetadata.labels?.truncate ?? defaultConfig.labels.truncate);
  const [labelMaxLength, setLabelMaxLength] = useState(initialMetadata.labels?.maxLength ?? defaultConfig.labels.maxLength);
  const [labelTextShadow, setLabelTextShadow] = useState(initialMetadata.labels?.textShadow ?? defaultConfig.labels.textShadow);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipTrigger, setTooltipTrigger] = useState(initialMetadata.tooltip?.trigger ?? defaultConfig.tooltip!.trigger);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format ?? defaultConfig.tooltip!.format);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor ?? defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor ?? defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor ?? defaultConfig.tooltip!.textColor);
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? defaultConfig.tooltip!.fontSize);
  const [tooltipShowAllFields, setTooltipShowAllFields] = useState(initialMetadata.tooltip?.showAllFields ?? defaultConfig.tooltip!.showAllFields);
  const [tooltipShowHierarchy, setTooltipShowHierarchy] = useState(initialMetadata.tooltip?.showHierarchy ?? defaultConfig.tooltip!.showHierarchy);
  const [tooltipShowSize, setTooltipShowSize] = useState(initialMetadata.tooltip?.showSize ?? defaultConfig.tooltip!.showSize);
  const [tooltipShowColorValue, setTooltipShowColorValue] = useState(initialMetadata.tooltip?.showColorValue ?? defaultConfig.tooltip!.showColorValue);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position ?? defaultConfig.legend!.position);
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient ?? defaultConfig.legend!.orient);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title ?? defaultConfig.legend!.title);
  const [legendTitleFontSize] = useState(initialMetadata.legend?.titleFontSize ?? defaultConfig.legend!.titleFontSize);
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? defaultConfig.legend!.itemGap);
  const [legendItemWidth] = useState(initialMetadata.legend?.itemWidth ?? defaultConfig.legend!.itemWidth);
  const [legendItemHeight] = useState(initialMetadata.legend?.itemHeight ?? defaultConfig.legend!.itemHeight);
  const [legendSymbolSize, setLegendSymbolSize] = useState(initialMetadata.legend?.symbolSize ?? defaultConfig.legend!.symbolSize);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);
  const [legendColor] = useState(initialMetadata.legend?.color ?? defaultConfig.legend!.color);
  const [legendContinuous, setLegendContinuous] = useState(initialMetadata.legend?.continuous ?? defaultConfig.legend!.continuous);

  // Interactivity
  const [interactiveZoom, setInteractiveZoom] = useState(initialMetadata.interactivity?.zoomToRect ?? defaultConfig.interactivity.zoomToRect);
  const [interactiveDrill, setInteractiveDrill] = useState(initialMetadata.interactivity?.drillDown ?? defaultConfig.interactivity.drillDown);
  const [interactiveHover, setInteractiveHover] = useState(initialMetadata.interactivity?.hoverHighlight ?? defaultConfig.interactivity.hoverHighlight);
  const [interactiveClick, setInteractiveClick] = useState(initialMetadata.interactivity?.clickAction ?? defaultConfig.interactivity.clickAction);
  const [interactiveSelection, setInteractiveSelection] = useState(initialMetadata.interactivity?.selection ?? defaultConfig.interactivity.selection);
  const [interactiveBrush, setInteractiveBrush] = useState(initialMetadata.interactivity?.brush ?? defaultConfig.interactivity.brush);
  const [interactiveKeyboard, setInteractiveKeyboard] = useState(initialMetadata.interactivity?.keyboardNavigation ?? defaultConfig.interactivity.keyboardNavigation);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing ?? defaultConfig.animation!.easing);
  const [animationStagger, setAnimationStagger] = useState(initialMetadata.animation?.stagger ?? defaultConfig.animation!.stagger);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [responsiveMinWidth, setResponsiveMinWidth] = useState(initialMetadata.responsive?.minWidth ?? defaultConfig.responsive!.minWidth);
  const [responsiveMinHeight, setResponsiveMinHeight] = useState(initialMetadata.responsive?.minHeight ?? defaultConfig.responsive!.minHeight);
  const [responsiveAspectRatio, setResponsiveAspectRatio] = useState(initialMetadata.responsive?.aspectRatio);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  // Fixed: use type assertion to ensure no undefined
  const [exportFormats, setExportFormats] = useState<Array<'png' | 'svg' | 'pdf'>>(
    (initialMetadata.exportFormats ?? defaultConfig.exportFormats) as Array<'png' | 'svg' | 'pdf'>
  );

  // Accessibility
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel ?? '');
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription ?? '');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? false);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? true);

  // Performance
  const [perfDownsampling, setPerfDownsampling] = useState(initialMetadata.performance?.downsampling ?? false);
  const [perfMaxNodes, setPerfMaxNodes] = useState(initialMetadata.performance?.maxNodes ?? 10000);
  const [perfProgressive, setPerfProgressive] = useState(initialMetadata.performance?.progressive ?? false);
  const [perfVirtualization, setPerfVirtualization] = useState(initialMetadata.performance?.virtualization ?? false);

  // UI sections
  const [sections, setSections] = useState({
    basic: true,
    hierarchy: true,
    layout: false,
    color: false,
    border: false,
    labels: false,
    tooltip: false,
    legend: false,
    interactivity: false,
    animation: false,
    dimensions: true,
    responsive: false,
    accessibility: false,
    performance: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata (optional, but included for completeness)
  useEffect(() => {
    if (!initialMetadata) return;
    setTitle(initialMetadata.title ?? defaultConfig.title);
    setHierarchy(initialMetadata.hierarchy ?? []);
    setSizeField(initialMetadata.sizeField ?? '');
    setColorField(initialMetadata.colorField ?? '');
    setLabelField(initialMetadata.labelField ?? '');
    // ... other fields are already initialized via useState; this effect is only needed if you want to reset the form when initialMetadata changes.
  }, [initialMetadata]);

  const handleSave = () => {
    if (!sizeField) {
      alert('Please select a size field.');
      return;
    }
    if (hierarchy.length === 0) {
      alert('Please define at least one hierarchy level.');
      return;
    }

    const config: TreemapConfig = {
      title,
      hierarchy,
      sizeField,
      colorField,
      labelField,
      tileAlgorithm,
      padding,
      paddingInner,
      paddingOuter,
      round,
      aspectRatio,
      colorScale: {
        type: colorScaleType,
        scheme: colorScheme,
        interpolator: colorInterpolator,
        min: colorMin,
        max: colorMax,
        steps: colorSteps,
        opacity: colorOpacity,
        missingValueColor,
        reverse: colorReverse,
      },
      border: {
        color: borderColor,
        width: borderWidth,
        dash: borderDash,
        opacity: borderOpacity,
      },
      labels: {
        show: labelsShow,
        position: labelPosition,
        fontFamily: labelFontFamily,
        fontSize: labelFontSize,
        color: labelColor,
        backgroundColor: labelBgColor,
        backgroundOpacity: labelBgOpacity,
        padding: labelPadding,
        format: labelFormat,
        showName: labelShowName,
        showValue: labelShowValue,
        showPercentage: labelShowPercentage,
        truncate: labelTruncate,
        maxLength: labelMaxLength,
        textShadow: labelTextShadow,
      },
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: tooltipFontSize,
        showAllFields: tooltipShowAllFields,
        showHierarchy: tooltipShowHierarchy,
        showSize: tooltipShowSize,
        showColorValue: tooltipShowColorValue,
      },
      showLegend,
      legend: {
        position: legendPosition,
        orient: legendOrient,
        title: legendTitle,
        titleFontSize: legendTitleFontSize,
        itemGap: legendItemGap,
        itemWidth: legendItemWidth,
        itemHeight: legendItemHeight,
        symbolSize: legendSymbolSize,
        fontSize: legendFontSize,
        color: legendColor,
        continuous: legendContinuous,
      },
      interactivity: {
        zoomToRect: interactiveZoom,
        drillDown: interactiveDrill,
        hoverHighlight: interactiveHover,
        clickAction: interactiveClick,
        selection: interactiveSelection,
        brush: interactiveBrush,
        keyboardNavigation: interactiveKeyboard,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing,
        stagger: animationStagger,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth: responsiveMinWidth,
        minHeight: responsiveMinHeight,
        aspectRatio: responsiveAspectRatio,
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
        downsampling: perfDownsampling,
        maxNodes: perfMaxNodes,
        progressive: perfProgressive,
        virtualization: perfVirtualization,
      },
    };

    onSave(config);
    onClose();
  };

  if (!open) return null;

  // Helper to render a section header
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[1000px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Configure Treemap</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Settings */}
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
                  placeholder="My Treemap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Size Field *</label>
                <select
                  value={sizeField}
                  onChange={(e) => setSizeField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select numeric field</option>
                  {numericalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Field (optional)</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {numericalColumns.concat(categoricalColumns).map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                {colorField && colorScaleType !== 'categorical' && numericalColumns.find(c => c.name === colorField) && (
                  <p className="text-xs text-gray-400 mt-1">Numeric field – using sequential/diverging scale.</p>
                )}
                {colorField && colorScaleType !== 'categorical' && categoricalColumns.find(c => c.name === colorField) && (
                  <p className="text-xs text-yellow-400 mt-1">Categorical field – set color scale type to 'categorical' for best results.</p>
                )}
              </div>
            </div>
          )}

          {/* Hierarchy */}
          <SectionHeader title="Hierarchy Levels" icon={<Layers className="h-4 w-4" />} sectionKey="hierarchy" />
          {sections.hierarchy && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hierarchy Fields (from broadest to finest)</label>
                <select
                  multiple
                  value={hierarchy}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setHierarchy(selected);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-32"
                >
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl to select multiple. Order determines nesting depth.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Label Field (optional, defaults to last hierarchy level)</label>
                <select
                  value={labelField}
                  onChange={(e) => setLabelField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Auto (last level)</option>
                  {allColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Layout */}
          <SectionHeader title="Layout & Padding" icon={<Grid className="h-4 w-4" />} sectionKey="layout" />
          {sections.layout && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tile Algorithm</label>
                <select
                  value={tileAlgorithm}
                  onChange={(e) => setTileAlgorithm(e.target.value as TreemapConfig['tileAlgorithm'])}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="squarify">Squarify (optimal aspect ratio)</option>
                  <option value="slice">Slice (vertical strips)</option>
                  <option value="dice">Dice (horizontal strips)</option>
                  <option value="slicedice">Slice‑Dice (alternating)</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Padding (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={padding}
                    onChange={(e) => setPadding(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Inner Padding (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={paddingInner}
                    onChange={(e) => setPaddingInner(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Outer Padding (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={paddingOuter}
                    onChange={(e) => setPaddingOuter(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Aspect Ratio (for squarify)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={round}
                  onChange={(e) => setRound(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Round pixel values (crisp edges)</span>
              </label>
            </div>
          )}

          {/* Color Scale */}
          <SectionHeader title="Color Scale" icon={<Palette className="h-4 w-4" />} sectionKey="color" />
          {sections.color && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Scale Type</label>
                <select
                  value={colorScaleType}
                  onChange={(e) => setColorScaleType(e.target.value as TreemapConfig['colorScale']['type'])}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="sequential">Sequential (single hue progression)</option>
                  <option value="diverging">Diverging (two‑hue with midpoint)</option>
                  <option value="categorical">Categorical (distinct colors)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Scheme</label>
                <input
                  type="text"
                  value={typeof colorScheme === 'string' ? colorScheme : colorScheme.join(', ')}
                  onChange={(e) => setColorScheme(e.target.value)}
                  placeholder="viridis, plasma, or custom hex list"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              {colorScaleType !== 'categorical' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Interpolator</label>
                    <select
                      value={colorInterpolator}
                      onChange={(e) => setColorInterpolator(e.target.value as TreemapConfig['colorScale']['interpolator'])}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="linear">Linear</option>
                      <option value="log">Logarithmic</option>
                      <option value="sqrt">Square root</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (auto if empty)</label>
                      <input
                        type="number"
                        value={colorMin ?? ''}
                        onChange={(e) => setColorMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (auto if empty)</label>
                      <input
                        type="number"
                        value={colorMax ?? ''}
                        onChange={(e) => setColorMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Steps (for discrete colors)</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={colorSteps ?? ''}
                      onChange={(e) => setColorSteps(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Missing Value Color</label>
                <input
                  type="color"
                  value={missingValueColor}
                  onChange={(e) => setMissingValueColor(e.target.value)}
                  className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opacity (0-1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={colorOpacity}
                    onChange={(e) => setColorOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={colorReverse}
                    onChange={(e) => setColorReverse(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Reverse scheme</span>
                </div>
              </div>
            </div>
          )}

          {/* Border */}
          <SectionHeader title="Border" icon={<Square className="h-4 w-4" />} sectionKey="border" />
          {sections.border && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Dash pattern</label>
                  <input
                    type="text"
                    value={borderDash}
                    onChange={(e) => setBorderDash(e.target.value)}
                    placeholder="e.g., 5,5"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opacity (0-1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={borderOpacity}
                    onChange={(e) => setBorderOpacity(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Labels */}
          <SectionHeader title="Labels" icon={<Type className="h-4 w-4" />} sectionKey="labels" />
          {sections.labels && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={labelsShow}
                  onChange={(e) => setLabelsShow(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Show labels</span>
              </label>
              {labelsShow && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={labelPosition}
                        onChange={(e) => setLabelPosition(e.target.value as TreemapLabelPosition)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font Family</label>
                      <input
                        type="text"
                        value={labelFontFamily}
                        onChange={(e) => setLabelFontFamily(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font Size (px)</label>
                      <input
                        type="number"
                        min="6"
                        max="48"
                        value={labelFontSize}
                        onChange={(e) => setLabelFontSize(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={labelColor}
                        onChange={(e) => setLabelColor(e.target.value)}
                        className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={labelBgColor}
                      onChange={(e) => setLabelBgColor(e.target.value)}
                      className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background Opacity</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={labelBgOpacity}
                        onChange={(e) => setLabelBgOpacity(parseFloat(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Padding (px)</label>
                      <input
                        type="number"
                        min="0"
                        value={labelPadding}
                        onChange={(e) => setLabelPadding(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format (d3)</label>
                    <input
                      type="text"
                      value={labelFormat}
                      onChange={(e) => setLabelFormat(e.target.value)}
                      placeholder="e.g., .2f"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelShowName}
                        onChange={(e) => setLabelShowName(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show name</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelShowValue}
                        onChange={(e) => setLabelShowValue(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show value</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelShowPercentage}
                        onChange={(e) => setLabelShowPercentage(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show percentage</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Truncate after</label>
                      <input
                        type="number"
                        min="1"
                        value={labelMaxLength}
                        onChange={(e) => setLabelMaxLength(parseInt(e.target.value))}
                        disabled={!labelTruncate}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelTruncate}
                        onChange={(e) => setLabelTruncate(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Truncate long names</span>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={labelTextShadow}
                      onChange={(e) => setLabelTextShadow(e.target.checked)}
                      className="rounded border-gray-600 text-green-500"
                    />
                    <span className="text-sm text-gray-200">Add text shadow (improves contrast)</span>
                  </label>
                </>
              )}
            </div>
          )}

          {/* Tooltip */}
          <SectionHeader title="Tooltip" icon={<Eye className="h-4 w-4" />} sectionKey="tooltip" />
          {sections.tooltip && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tooltipShow}
                  onChange={(e) => setTooltipShow(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Show tooltip</span>
              </label>
              {tooltipShow && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Trigger</label>
                    <select
                      value={tooltipTrigger}
                      onChange={(e) => setTooltipTrigger(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="hover">Hover</option>
                      <option value="click">Click</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format (template)</label>
                    <input
                      type="text"
                      value={tooltipFormat}
                      onChange={(e) => setTooltipFormat(e.target.value)}
                      placeholder="e.g., {{name}}: {{value}}"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={tooltipBg}
                        onChange={(e) => setTooltipBg(e.target.value)}
                        className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Border</label>
                      <input
                        type="color"
                        value={tooltipBorder}
                        onChange={(e) => setTooltipBorder(e.target.value)}
                        className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Text color</label>
                      <input
                        type="color"
                        value={tooltipText}
                        onChange={(e) => setTooltipText(e.target.value)}
                        className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={tooltipFontSize}
                        onChange={(e) => setTooltipFontSize(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowAllFields}
                        onChange={(e) => setTooltipShowAllFields(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show all fields</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowHierarchy}
                        onChange={(e) => setTooltipShowHierarchy(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show hierarchy path</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowSize}
                        onChange={(e) => setTooltipShowSize(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show size</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowColorValue}
                        onChange={(e) => setTooltipShowColorValue(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Show color value</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Legend */}
          <SectionHeader title="Legend" icon={<Layers className="h-4 w-4" />} sectionKey="legend" />
          {sections.legend && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Item gap (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={legendItemGap}
                      onChange={(e) => setLegendItemGap(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Symbol size</label>
                    <input
                      type="number"
                      min="4"
                      value={legendSymbolSize}
                      onChange={(e) => setLegendSymbolSize(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font size</label>
                    <input
                      type="number"
                      min="8"
                      value={legendFontSize}
                      onChange={(e) => setLegendFontSize(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={legendContinuous}
                        onChange={(e) => setLegendContinuous(e.target.checked)}
                        className="rounded border-gray-600 text-green-500"
                      />
                      <span className="text-sm text-gray-200">Continuous gradient (for sequential scales)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactivity */}
          <SectionHeader title="Interactivity" icon={<MousePointer className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactiveZoom}
                    onChange={(e) => setInteractiveZoom(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Zoom to rectangle (click to zoom)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactiveDrill}
                    onChange={(e) => setInteractiveDrill(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Drill down (double‑click)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactiveHover}
                    onChange={(e) => setInteractiveHover(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Hover highlight</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Click action</label>
                <select
                  value={interactiveClick}
                  onChange={(e) => setInteractiveClick(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="none">None</option>
                  <option value="select">Select</option>
                  <option value="drilldown">Drill down</option>
                  <option value="zoom">Zoom to rect</option>
                  <option value="custom">Custom (advanced)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Selection mode</label>
                <select
                  value={interactiveSelection}
                  onChange={(e) => setInteractiveSelection(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="none">None</option>
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactiveBrush}
                    onChange={(e) => setInteractiveBrush(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Enable brush selection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactiveKeyboard}
                    onChange={(e) => setInteractiveKeyboard(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Keyboard navigation</span>
                </label>
              </div>
            </div>
          )}

          {/* Animation */}
          <SectionHeader title="Animation" icon={<Play className="h-4 w-4" />} sectionKey="animation" />
          {sections.animation && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Enable animation</span>
              </label>
              {animationEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Duration (ms)</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={animationDuration}
                        onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Easing</label>
                      <select
                        value={animationEasing}
                        onChange={(e) => setAnimationEasing(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="linear">Linear</option>
                        <option value="ease">Ease</option>
                        <option value="ease-in">Ease‑in</option>
                        <option value="ease-out">Ease‑out</option>
                        <option value="ease-in-out">Ease‑in‑out</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={animationStagger}
                      onChange={(e) => setAnimationStagger(e.target.checked)}
                      className="rounded border-gray-600 text-green-500"
                    />
                    <span className="text-sm text-gray-200">Stagger hierarchy levels</span>
                  </label>
                </>
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
                  max="4000"
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
                  max="4000"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Responsive & Export */}
          <SectionHeader title="Responsive & Export" icon={<Download className="h-4 w-4" />} sectionKey="responsive" />
          {sections.responsive && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Enable responsive resizing</span>
              </label>
              {responsiveEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min width (px)</label>
                    <input
                      type="number"
                      min="100"
                      value={responsiveMinWidth}
                      onChange={(e) => setResponsiveMinWidth(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min height (px)</label>
                    <input
                      type="number"
                      min="100"
                      value={responsiveMinHeight}
                      onChange={(e) => setResponsiveMinHeight(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Aspect ratio (optional)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={responsiveAspectRatio ?? ''}
                      onChange={(e) => setResponsiveAspectRatio(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g., 1.6"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportable}
                    onChange={(e) => setExportable(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Allow export</span>
                </label>
                {exportable && (
                  <div className="flex space-x-2">
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
                          className="rounded border-gray-600 text-green-500"
                        />
                        <span className="text-xs text-gray-300 uppercase">{f}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility */}
          <SectionHeader title="Accessibility" icon={<Accessibility className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA Label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA Description</label>
                <textarea
                  value={ariaDescription}
                  onChange={(e) => setAriaDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">High contrast mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={focusable}
                    onChange={(e) => setFocusable(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Focusable (keyboard)</span>
                </label>
              </div>
            </div>
          )}

          {/* Performance */}
          <SectionHeader title="Performance" icon={<Zap className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={perfDownsampling}
                    onChange={(e) => setPerfDownsampling(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Downsampling (aggregate small cells)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={perfProgressive}
                    onChange={(e) => setPerfProgressive(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Progressive rendering</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={perfVirtualization}
                    onChange={(e) => setPerfVirtualization(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Virtualization</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max nodes (approx)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={perfMaxNodes}
                  onChange={(e) => setPerfMaxNodes(parseInt(e.target.value))}
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
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};