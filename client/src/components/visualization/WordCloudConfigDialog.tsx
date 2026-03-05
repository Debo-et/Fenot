import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Grid,
  ChevronDown,
  ChevronRight,
  Palette,
  Sliders,
  Eye,
  Play,
  Type,
  Layers,
  Filter,
  Settings,
} from 'lucide-react';
import { WordCloudConfig } from '../../types/visualization-configs';

interface WordCloudConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<WordCloudConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: WordCloudConfig) => void;
}

const defaultConfig: WordCloudConfig = {
  wordField: '',
  sizeField: undefined,
  colorField: undefined,
  groupField: undefined,
  fontFamily: 'Arial, sans-serif',
  fontSizeRange: { min: 12, max: 72 },
  fontWeight: 'normal',
  fontStyle: 'normal',
  rotation: {
    enabled: false,
    mode: 'none',
    angles: [0],
    range: [-90, 90],
  },
  padding: 2,
  wordCase: 'original',
  colorScheme: '#3b82f6',
  colorGradient: false,
  opacity: 1,
  randomColors: false,
  layoutAlgorithm: 'spiral',
  spiral: 'archimedean',
  scale: 'linear',
  minSize: 8,
  maxSize: 72,
  maxWords: 100,
  minFrequency: 1,
  stopwords: [],
  usePredefinedStopwords: true,
  removeNumbers: true,
  removePunctuation: true,
  stemWords: false,
  caseSensitive: false,
  tooltip: {
    show: true,
    trigger: 'item',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    fontSize: 12,
    showWord: true,
    showWeight: true,
  },
  interactivity: {
    hoverHighlight: true,
    clickAction: 'none',
    selection: 'none',
    zoom: false,
    pan: false,
  },
  showLegend: false,
  legend: {
    position: 'top',
    orient: 'horizontal',
    itemGap: 10,
    symbolSize: 14,
    fontSize: 12,
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
    ariaLabel: 'Word cloud visualization',
    highContrast: false,
    focusable: true,
  },
  performance: {
    downsampling: false,
    progressive: false,
    virtualization: false,
  },
};

// Common stopwords list (English)

export const WordCloudConfigDialog: React.FC<WordCloudConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const textColumns = availableColumns.filter(
    col => col.type.toLowerCase() === 'string' || col.type.toLowerCase() === 'text' || col.type.toLowerCase() === 'varchar'
  );
  const numericColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const allColumns = availableColumns.map(col => col.name);

  // Form state
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description || defaultConfig.description);
  const [wordField, setWordField] = useState(initialMetadata.wordField || '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [groupField, setGroupField] = useState(initialMetadata.groupField || '');

  const [fontFamily, setFontFamily] = useState(initialMetadata.fontFamily || defaultConfig.fontFamily);
  const [fontSizeMin, setFontSizeMin] = useState(initialMetadata.fontSizeRange?.min ?? defaultConfig.fontSizeRange.min);
  const [fontSizeMax, setFontSizeMax] = useState(initialMetadata.fontSizeRange?.max ?? defaultConfig.fontSizeRange.max);
  const [fontWeight, setFontWeight] = useState(initialMetadata.fontWeight || defaultConfig.fontWeight);
  const [fontStyle, setFontStyle] = useState(initialMetadata.fontStyle || defaultConfig.fontStyle);

  const [rotationEnabled, setRotationEnabled] = useState(initialMetadata.rotation?.enabled ?? defaultConfig.rotation.enabled);
  const [rotationMode, setRotationMode] = useState(initialMetadata.rotation?.mode || defaultConfig.rotation.mode);
  const [rotationAngles, setRotationAngles] = useState(
    initialMetadata.rotation?.angles?.join(', ') || (defaultConfig.rotation.angles?.join(', ') ?? '0')
  );
  const [rotationRangeMin, setRotationRangeMin] = useState(initialMetadata.rotation?.range?.[0] ?? defaultConfig.rotation.range?.[0] ?? -90);
  const [rotationRangeMax, setRotationRangeMax] = useState(initialMetadata.rotation?.range?.[1] ?? defaultConfig.rotation.range?.[1] ?? 90);

  const [padding, setPadding] = useState(initialMetadata.padding ?? defaultConfig.padding);
  const [wordCase, setWordCase] = useState(initialMetadata.wordCase || defaultConfig.wordCase);

  const [colorScheme, setColorScheme] = useState(
    Array.isArray(initialMetadata.colorScheme) ? initialMetadata.colorScheme.join(', ') : initialMetadata.colorScheme || defaultConfig.colorScheme?.toString() || '#3b82f6'
  );
  const [colorGradient, setColorGradient] = useState(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
  const [opacity, setOpacity] = useState(initialMetadata.opacity ?? defaultConfig.opacity);
  const [randomColors, setRandomColors] = useState(initialMetadata.randomColors ?? defaultConfig.randomColors);

  const [layoutAlgorithm, setLayoutAlgorithm] = useState(initialMetadata.layoutAlgorithm || defaultConfig.layoutAlgorithm);
  const [spiral, setSpiral] = useState(initialMetadata.spiral || defaultConfig.spiral || 'archimedean');
  const [scale, setScale] = useState(initialMetadata.scale || defaultConfig.scale);
  const [minSize, setMinSize] = useState(initialMetadata.minSize ?? defaultConfig.minSize);
  const [maxSize, setMaxSize] = useState(initialMetadata.maxSize ?? defaultConfig.maxSize);
  const [maxWords, setMaxWords] = useState(initialMetadata.maxWords ?? defaultConfig.maxWords);
  const [minFrequency, setMinFrequency] = useState(initialMetadata.minFrequency ?? defaultConfig.minFrequency);

  const [stopwordsInput, setStopwordsInput] = useState((initialMetadata.stopwords || []).join(', '));
  const [usePredefinedStopwords, setUsePredefinedStopwords] = useState(initialMetadata.usePredefinedStopwords ?? defaultConfig.usePredefinedStopwords);
  const [removeNumbers, setRemoveNumbers] = useState(initialMetadata.removeNumbers ?? defaultConfig.removeNumbers);
  const [removePunctuation, setRemovePunctuation] = useState(initialMetadata.removePunctuation ?? defaultConfig.removePunctuation);
  const [stemWords, setStemWords] = useState(initialMetadata.stemWords ?? defaultConfig.stemWords);
  const [caseSensitive, setCaseSensitive] = useState(initialMetadata.caseSensitive ?? defaultConfig.caseSensitive);

  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || 'top');
  const [legendOrient, setLegendOrient] = useState(initialMetadata.legend?.orient || 'horizontal');
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title || '');
  const [legendItemGap, setLegendItemGap] = useState(initialMetadata.legend?.itemGap ?? 10);
  const [legendSymbolSize, setLegendSymbolSize] = useState(initialMetadata.legend?.symbolSize ?? 14);
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? 12);
  const [legendColor, setLegendColor] = useState(initialMetadata.legend?.color || '#000000');
  const [legendContinuous, setLegendContinuous] = useState(initialMetadata.legend?.continuous ?? false);

  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip?.show ?? true);
  const [tooltipTrigger, setTooltipTrigger] = useState<'item' | 'none'>(initialMetadata.tooltip?.trigger || 'item');
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format || '');
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || '#ffffff');
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || '#cccccc');
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor || '#333333');
  const [tooltipFontSize, setTooltipFontSize] = useState(initialMetadata.tooltip?.fontSize ?? 12);
  const [tooltipShowWord, setTooltipShowWord] = useState(initialMetadata.tooltip?.showWord ?? true);
  const [tooltipShowWeight, setTooltipShowWeight] = useState(initialMetadata.tooltip?.showWeight ?? true);

  const [hoverHighlight, setHoverHighlight] = useState(initialMetadata.interactivity?.hoverHighlight ?? true);
  const [clickAction, setClickAction] = useState(initialMetadata.interactivity?.clickAction || 'none');
  const [customClickHandler, setCustomClickHandler] = useState(initialMetadata.interactivity?.customClickHandler || '');
  const [selectionMode, setSelectionMode] = useState(initialMetadata.interactivity?.selection || 'none');
  const [zoomEnabled, setZoomEnabled] = useState(initialMetadata.interactivity?.zoom ?? false);
  const [panEnabled, setPanEnabled] = useState(initialMetadata.interactivity?.pan ?? false);

  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
  const [animationEasing, setAnimationEasing] = useState(initialMetadata.animation?.easing || defaultConfig.animation!.easing);

  const [width, setWidth] = useState(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);

  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? true);
  const [responsiveMinWidth, setResponsiveMinWidth] = useState(initialMetadata.responsive?.minWidth);
  const [responsiveMinHeight, setResponsiveMinHeight] = useState(initialMetadata.responsive?.minHeight);
  const [responsiveAspectRatio, setResponsiveAspectRatio] = useState(initialMetadata.responsive?.aspectRatio);

  const [exportable, setExportable] = useState(initialMetadata.exportable ?? true);
  const [exportFormats, setExportFormats] = useState(
    (initialMetadata.exportFormats || ['png', 'svg', 'pdf']).join(', ')
  );

  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || 'Word cloud visualization');
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? false);
  const [focusable, setFocusable] = useState(initialMetadata.accessibility?.focusable ?? true);

  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? false);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive ?? false);
  const [virtualization, setVirtualization] = useState(initialMetadata.performance?.virtualization ?? false);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    dataMapping: false,
    textAppearance: false,
    color: false,
    layout: false,
    preprocessing: false,
    tooltip: false,
    legend: false,
    interactivity: false,
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

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setDescription(initialMetadata.description || defaultConfig.description);
    setWordField(initialMetadata.wordField || '');
    setSizeField(initialMetadata.sizeField || '');
    setColorField(initialMetadata.colorField || '');
    setGroupField(initialMetadata.groupField || '');
    setFontFamily(initialMetadata.fontFamily || defaultConfig.fontFamily);
    setFontSizeMin(initialMetadata.fontSizeRange?.min ?? defaultConfig.fontSizeRange.min);
    setFontSizeMax(initialMetadata.fontSizeRange?.max ?? defaultConfig.fontSizeRange.max);
    setFontWeight(initialMetadata.fontWeight || defaultConfig.fontWeight);
    setFontStyle(initialMetadata.fontStyle || defaultConfig.fontStyle);
    setRotationEnabled(initialMetadata.rotation?.enabled ?? defaultConfig.rotation.enabled);
    setRotationMode(initialMetadata.rotation?.mode || defaultConfig.rotation.mode);
    setRotationAngles(initialMetadata.rotation?.angles?.join(', ') || (defaultConfig.rotation.angles?.join(', ') ?? '0'));
    setRotationRangeMin(initialMetadata.rotation?.range?.[0] ?? defaultConfig.rotation.range?.[0] ?? -90);
    setRotationRangeMax(initialMetadata.rotation?.range?.[1] ?? defaultConfig.rotation.range?.[1] ?? 90);
    setPadding(initialMetadata.padding ?? defaultConfig.padding);
    setWordCase(initialMetadata.wordCase || defaultConfig.wordCase);
    setColorScheme(
      Array.isArray(initialMetadata.colorScheme) ? initialMetadata.colorScheme.join(', ') : initialMetadata.colorScheme || defaultConfig.colorScheme?.toString() || '#3b82f6'
    );
    setColorGradient(initialMetadata.colorGradient ?? defaultConfig.colorGradient);
    setOpacity(initialMetadata.opacity ?? defaultConfig.opacity);
    setRandomColors(initialMetadata.randomColors ?? defaultConfig.randomColors);
    setLayoutAlgorithm(initialMetadata.layoutAlgorithm || defaultConfig.layoutAlgorithm);
    setSpiral(initialMetadata.spiral || defaultConfig.spiral || 'archimedean');
    setScale(initialMetadata.scale || defaultConfig.scale);
    setMinSize(initialMetadata.minSize ?? defaultConfig.minSize);
    setMaxSize(initialMetadata.maxSize ?? defaultConfig.maxSize);
    setMaxWords(initialMetadata.maxWords ?? defaultConfig.maxWords);
    setMinFrequency(initialMetadata.minFrequency ?? defaultConfig.minFrequency);
    setStopwordsInput((initialMetadata.stopwords || []).join(', '));
    setUsePredefinedStopwords(initialMetadata.usePredefinedStopwords ?? defaultConfig.usePredefinedStopwords);
    setRemoveNumbers(initialMetadata.removeNumbers ?? defaultConfig.removeNumbers);
    setRemovePunctuation(initialMetadata.removePunctuation ?? defaultConfig.removePunctuation);
    setStemWords(initialMetadata.stemWords ?? defaultConfig.stemWords);
    setCaseSensitive(initialMetadata.caseSensitive ?? defaultConfig.caseSensitive);
    setShowLegend(initialMetadata.showLegend ?? defaultConfig.showLegend);
    setLegendPosition(initialMetadata.legend?.position || 'top');
    setLegendOrient(initialMetadata.legend?.orient || 'horizontal');
    setLegendTitle(initialMetadata.legend?.title || '');
    setLegendItemGap(initialMetadata.legend?.itemGap ?? 10);
    setLegendSymbolSize(initialMetadata.legend?.symbolSize ?? 14);
    setLegendFontSize(initialMetadata.legend?.fontSize ?? 12);
    setLegendColor(initialMetadata.legend?.color || '#000000');
    setLegendContinuous(initialMetadata.legend?.continuous ?? false);
    setTooltipShow(initialMetadata.tooltip?.show ?? defaultConfig.tooltip?.show ?? true);
    setTooltipTrigger(initialMetadata.tooltip?.trigger || 'item');
    setTooltipFormat(initialMetadata.tooltip?.format || '');
    setTooltipBg(initialMetadata.tooltip?.backgroundColor || '#ffffff');
    setTooltipBorder(initialMetadata.tooltip?.borderColor || '#cccccc');
    setTooltipText(initialMetadata.tooltip?.textColor || '#333333');
    setTooltipFontSize(initialMetadata.tooltip?.fontSize ?? 12);
    setTooltipShowWord(initialMetadata.tooltip?.showWord ?? true);
    setTooltipShowWeight(initialMetadata.tooltip?.showWeight ?? true);
    setHoverHighlight(initialMetadata.interactivity?.hoverHighlight ?? true);
    setClickAction(initialMetadata.interactivity?.clickAction || 'none');
    setCustomClickHandler(initialMetadata.interactivity?.customClickHandler || '');
    setSelectionMode(initialMetadata.interactivity?.selection || 'none');
    setZoomEnabled(initialMetadata.interactivity?.zoom ?? false);
    setPanEnabled(initialMetadata.interactivity?.pan ?? false);
    setAnimationEnabled(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
    setAnimationDuration(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);
    setAnimationEasing(initialMetadata.animation?.easing || defaultConfig.animation!.easing);
    setWidth(initialMetadata.dimensions?.width ?? defaultConfig.dimensions.width);
    setHeight(initialMetadata.dimensions?.height ?? defaultConfig.dimensions.height);
    setResponsiveEnabled(initialMetadata.responsive?.enabled ?? true);
    setResponsiveMinWidth(initialMetadata.responsive?.minWidth);
    setResponsiveMinHeight(initialMetadata.responsive?.minHeight);
    setResponsiveAspectRatio(initialMetadata.responsive?.aspectRatio);
    setExportable(initialMetadata.exportable ?? true);
    setExportFormats((initialMetadata.exportFormats || ['png', 'svg', 'pdf']).join(', '));
    setAriaLabel(initialMetadata.accessibility?.ariaLabel || 'Word cloud visualization');
    setHighContrast(initialMetadata.accessibility?.highContrast ?? false);
    setFocusable(initialMetadata.accessibility?.focusable ?? true);
    setDownsampling(initialMetadata.performance?.downsampling ?? false);
    setProgressive(initialMetadata.performance?.progressive ?? false);
    setVirtualization(initialMetadata.performance?.virtualization ?? false);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!wordField) {
      alert('Please select a word field.');
      return;
    }

    // Parse color scheme (could be comma-separated list)
    let parsedColorScheme: string | string[] = colorScheme;
    if (colorScheme.includes(',')) {
      parsedColorScheme = colorScheme.split(',').map(s => s.trim());
    }

    // Parse stopwords
    const stopwordsArray = stopwordsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Parse rotation angles
    const angles = rotationAngles.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    // Parse rotation range
    const range: [number, number] = [rotationRangeMin, rotationRangeMax];

    // Parse export formats
    const exportFormatsArray = exportFormats
      .split(',')
      .map(s => s.trim().toLowerCase() as 'png' | 'svg' | 'pdf')
      .filter(f => ['png', 'svg', 'pdf'].includes(f));

    const config: WordCloudConfig = {
      title,
      description,
      wordField,
      sizeField: sizeField || undefined,
      colorField: colorField || undefined,
      groupField: groupField || undefined,
      fontFamily,
      fontSizeRange: { min: fontSizeMin, max: fontSizeMax },
      fontWeight: fontWeight as any,
      fontStyle: fontStyle as any,
      rotation: {
        enabled: rotationEnabled,
        mode: rotationMode as any,
        angles: rotationMode === 'steps' ? angles : undefined,
        range: rotationMode === 'random' ? range : undefined,
      },
      padding,
      wordCase: wordCase as any,
      colorScheme: parsedColorScheme,
      colorGradient,
      opacity,
      randomColors,
      layoutAlgorithm: layoutAlgorithm as any,
      spiral: layoutAlgorithm === 'spiral' ? (spiral as any) : undefined,
      scale: scale as any,
      minSize,
      maxSize,
      maxWords,
      minFrequency,
      stopwords: stopwordsArray,
      usePredefinedStopwords,
      removeNumbers,
      removePunctuation,
      stemWords,
      caseSensitive,
      tooltip: {
        show: tooltipShow,
        trigger: tooltipTrigger,
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
        fontSize: tooltipFontSize,
        showWord: tooltipShowWord,
        showWeight: tooltipShowWeight,
      },
      interactivity: {
        hoverHighlight,
        clickAction: clickAction as any,
        customClickHandler: clickAction === 'custom' ? customClickHandler : undefined,
        selection: selectionMode as any,
        zoom: zoomEnabled,
        pan: panEnabled,
      },
      showLegend,
      legend: showLegend
        ? {
            position: legendPosition as any,
            orient: legendOrient as any,
            title: legendTitle,
            itemGap: legendItemGap,
            symbolSize: legendSymbolSize,
            fontSize: legendFontSize,
            color: legendColor,
            continuous: legendContinuous,
          }
        : undefined,
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
        easing: animationEasing as any,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        minWidth: responsiveMinWidth,
        minHeight: responsiveMinHeight,
        aspectRatio: responsiveAspectRatio,
      },
      exportable,
      exportFormats: exportFormatsArray,
      accessibility: {
        ariaLabel,
        highContrast,
        focusable,
      },
      performance: {
        downsampling,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Type className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Configure Word Cloud</h2>
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
          <SectionHeader title="Basic Information" icon={<Settings className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Title (optional)</label>
                <input
                  type="text"
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="My Word Cloud"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Brief description"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Data Mapping Section */}
          <SectionHeader title="Data Mapping" icon={<Layers className="h-4 w-4" />} sectionKey="dataMapping" />
          {sections.dataMapping && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Word Field <span className="text-red-400">*</span></label>
                <select
                  value={wordField}
                  onChange={(e) => setWordField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="" disabled>Select a text column</option>
                  {textColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Size Field (weight)</label>
                <select
                  value={sizeField}
                  onChange={(e) => setSizeField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None (uniform size)</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Field</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {allColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Group Field (facet)</label>
                <select
                  value={groupField}
                  onChange={(e) => setGroupField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {allColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Text Appearance Section */}
          <SectionHeader title="Text Appearance" icon={<Type className="h-4 w-4" />} sectionKey="textAppearance" />
          {sections.textAppearance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Font Family</label>
                  <input
                    type="text"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    placeholder="Arial, sans-serif"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value as typeof fontWeight)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                    <option value="800">800</option>
                    <option value="900">900</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Font Style</label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value as typeof fontStyle)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                    <option value="oblique">Oblique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Word Case</label>
                  <select
                    value={wordCase}
                    onChange={(e) => setWordCase(e.target.value as typeof wordCase)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="original">Original</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Font Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={fontSizeMin}
                    onChange={(e) => setFontSizeMin(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Font Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={fontSizeMax}
                    onChange={(e) => setFontSizeMax(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rotationEnabled}
                    onChange={(e) => setRotationEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Enable rotation</span>
                </label>
                {rotationEnabled && (
                  <div className="mt-2 space-y-3 pl-4 border-l border-gray-600">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Rotation Mode</label>
                      <select
                        value={rotationMode}
                        onChange={(e) => setRotationMode(e.target.value as typeof rotationMode)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="none">None</option>
                        <option value="random">Random</option>
                        <option value="steps">Steps</option>
                      </select>
                    </div>
                    {rotationMode === 'steps' && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Angles (comma separated, e.g., 0,90)</label>
                        <input
                          type="text"
                          value={rotationAngles}
                          onChange={(e) => setRotationAngles(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                    )}
                    {rotationMode === 'random' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Min Angle (°)</label>
                          <input
                            type="number"
                            value={rotationRangeMin}
                            onChange={(e) => setRotationRangeMin(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Max Angle (°)</label>
                          <input
                            type="number"
                            value={rotationRangeMax}
                            onChange={(e) => setRotationRangeMax(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Padding (px)</label>
                <input
                  type="number"
                  min="0"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Color Section */}
          <SectionHeader title="Color" icon={<Palette className="h-4 w-4" />} sectionKey="color" />
          {sections.color && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Color Scheme (single color or comma-separated list)
                </label>
                <input
                  type="text"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  placeholder="#3b82f6, #ef4444, #10b981"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={colorGradient}
                    onChange={(e) => setColorGradient(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Use gradient fill</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={randomColors}
                    onChange={(e) => setRandomColors(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Random colors (ignores color field)</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Opacity (0-1)</label>
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

          {/* Layout Section */}
          <SectionHeader title="Layout" icon={<Grid className="h-4 w-4" />} sectionKey="layout" />
          {sections.layout && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Layout Algorithm</label>
                <select
                  value={layoutAlgorithm}
                  onChange={(e) => setLayoutAlgorithm(e.target.value as typeof layoutAlgorithm)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="spiral">Spiral</option>
                  <option value="grid">Grid</option>
                  <option value="random">Random</option>
                  <option value="archimedean">Archimedean</option>
                  <option value="rectangular">Rectangular</option>
                </select>
              </div>
              {layoutAlgorithm === 'spiral' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Spiral Type</label>
                  <select
                    value={spiral}
                    onChange={(e) => setSpiral(e.target.value as typeof spiral)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="archimedean">Archimedean</option>
                    <option value="rectangular">Rectangular</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Size Scale</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(e.target.value as typeof scale)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="linear">Linear</option>
                  <option value="log">Logarithmic</option>
                  <option value="sqrt">Square Root</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={minSize}
                    onChange={(e) => setMinSize(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Size (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxSize}
                    onChange={(e) => setMaxSize(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Words</label>
                  <input
                    type="number"
                    min="1"
                    value={maxWords}
                    onChange={(e) => setMaxWords(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Frequency</label>
                  <input
                    type="number"
                    min="1"
                    value={minFrequency}
                    onChange={(e) => setMinFrequency(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preprocessing Section */}
          <SectionHeader title="Preprocessing" icon={<Filter className="h-4 w-4" />} sectionKey="preprocessing" />
          {sections.preprocessing && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={usePredefinedStopwords}
                    onChange={(e) => setUsePredefinedStopwords(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Use common English stopwords</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Custom stopwords (comma separated)</label>
                <input
                  type="text"
                  value={stopwordsInput}
                  onChange={(e) => setStopwordsInput(e.target.value)}
                  placeholder="and, or, the, ..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={removeNumbers}
                    onChange={(e) => setRemoveNumbers(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Remove numbers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={removePunctuation}
                    onChange={(e) => setRemovePunctuation(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Remove punctuation</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stemWords}
                    onChange={(e) => setStemWords(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Stem words</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Case sensitive</span>
                </label>
              </div>
            </div>
          )}

          {/* Legend Section (if colorField or groupField used) */}
          {(colorField || groupField) && (
            <>
              <SectionHeader title="Legend" icon={<Eye className="h-4 w-4" />} sectionKey="legend" />
              {sections.legend && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showLegend}
                      onChange={(e) => setShowLegend(e.target.checked)}
                      className="rounded border-gray-600 text-indigo-500"
                    />
                    <span className="text-sm text-gray-200">Show legend</span>
                  </label>
                  {showLegend && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Position</label>
                          <select
                            value={legendPosition}
                            onChange={(e) => setLegendPosition(e.target.value as typeof legendPosition)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
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
                            onChange={(e) => setLegendOrient(e.target.value as typeof legendOrient)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          >
                            <option value="horizontal">Horizontal</option>
                            <option value="vertical">Vertical</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Title (optional)</label>
                        <input
                          type="text"
                          value={legendTitle}
                          onChange={(e) => setLegendTitle(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
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
                          <label className="block text-xs text-gray-400 mb-1">Symbol size (px)</label>
                          <input
                            type="number"
                            min="1"
                            value={legendSymbolSize}
                            onChange={(e) => setLegendSymbolSize(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Font size</label>
                          <input
                            type="number"
                            min="1"
                            value={legendFontSize}
                            onChange={(e) => setLegendFontSize(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Text color</label>
                          <input
                            type="color"
                            value={legendColor}
                            onChange={(e) => setLegendColor(e.target.value)}
                            className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                          />
                        </div>
                      </div>
                      {colorField && numericColumns.some(col => col.name === colorField) && (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={legendContinuous}
                            onChange={(e) => setLegendContinuous(e.target.checked)}
                            className="rounded border-gray-600 text-indigo-500"
                          />
                          <span className="text-sm text-gray-200">Continuous legend (for numeric color field)</span>
                        </label>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
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
                  className="rounded border-gray-600 text-indigo-500"
                />
                <span className="text-sm text-gray-200">Show tooltip</span>
              </label>
              {tooltipShow && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                      <select
                        value={tooltipTrigger}
                        onChange={(e) => setTooltipTrigger(e.target.value as 'item' | 'none')}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="item">Item</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font size</label>
                      <input
                        type="number"
                        min="1"
                        value={tooltipFontSize}
                        onChange={(e) => setTooltipFontSize(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background color</label>
                      <input
                        type="color"
                        value={tooltipBg}
                        onChange={(e) => setTooltipBg(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Border color</label>
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
                        value={tooltipText}
                        onChange={(e) => setTooltipText(e.target.value)}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Custom format template</label>
                    <input
                      type="text"
                      value={tooltipFormat}
                      onChange={(e) => setTooltipFormat(e.target.value)}
                      placeholder="{{word}}: {{weight}}"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowWord}
                        onChange={(e) => setTooltipShowWord(e.target.checked)}
                        className="rounded border-gray-600 text-indigo-500"
                      />
                      <span className="text-sm text-gray-200">Show word</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tooltipShowWeight}
                        onChange={(e) => setTooltipShowWeight(e.target.checked)}
                        className="rounded border-gray-600 text-indigo-500"
                      />
                      <span className="text-sm text-gray-200">Show weight</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<Sliders className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hoverHighlight}
                  onChange={(e) => setHoverHighlight(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-500"
                />
                <span className="text-sm text-gray-200">Hover highlight</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Click action</label>
                  <select
                    value={clickAction}
                    onChange={(e) => setClickAction(e.target.value as typeof clickAction)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="none">None</option>
                    <option value="select">Select</option>
                    <option value="drilldown">Drill down</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Selection mode</label>
                  <select
                    value={selectionMode}
                    onChange={(e) => setSelectionMode(e.target.value as typeof selectionMode)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="none">None</option>
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>
              </div>
              {clickAction === 'custom' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Custom click handler</label>
                  <input
                    type="text"
                    value={customClickHandler}
                    onChange={(e) => setCustomClickHandler(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={zoomEnabled}
                    onChange={(e) => setZoomEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={panEnabled}
                    onChange={(e) => setPanEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Pan</span>
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
                  className="rounded border-gray-600 text-indigo-500"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Easing</label>
                    <select
                      value={animationEasing}
                      onChange={(e) => setAnimationEasing(e.target.value as typeof animationEasing)}
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

          {/* Responsive Section */}
          <SectionHeader title="Responsive" icon={<Settings className="h-4 w-4" />} sectionKey="responsive" />
          {sections.responsive && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-500"
                />
                <span className="text-sm text-gray-200">Enable responsive sizing</span>
              </label>
              {responsiveEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min width (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={responsiveMinWidth || ''}
                      onChange={(e) => setResponsiveMinWidth(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min height (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={responsiveMinHeight || ''}
                      onChange={(e) => setResponsiveMinHeight(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Aspect ratio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={responsiveAspectRatio || ''}
                      onChange={(e) => setResponsiveAspectRatio(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      placeholder="e.g., 1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Section */}
          <SectionHeader title="Export" icon={<Save className="h-4 w-4" />} sectionKey="export" />
          {sections.export && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportable}
                  onChange={(e) => setExportable(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-500"
                />
                <span className="text-sm text-gray-200">Allow export</span>
              </label>
              {exportable && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Export formats (comma separated)</label>
                  <input
                    type="text"
                    value={exportFormats}
                    onChange={(e) => setExportFormats(e.target.value)}
                    placeholder="png, svg, pdf"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Accessibility Section */}
          <SectionHeader title="Accessibility" icon={<Eye className="h-4 w-4" />} sectionKey="accessibility" />
          {sections.accessibility && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ARIA description</label>
                <textarea
                  value={initialMetadata.accessibility?.ariaDescription || ''}
                  onChange={() => {
                    // we don't have a dedicated state for description, but can store in local state if needed
                    // for simplicity, we skip; it can be added if required
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  rows={2}
                />
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">High contrast mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={focusable}
                    onChange={(e) => setFocusable(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Focusable</span>
                </label>
              </div>
            </div>
          )}

          {/* Performance Section */}
          <SectionHeader title="Performance" icon={<Sliders className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={downsampling}
                    onChange={(e) => setDownsampling(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Downsampling</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={progressive}
                    onChange={(e) => setProgressive(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Progressive rendering</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={virtualization}
                    onChange={(e) => setVirtualization(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-200">Virtualization</span>
                </label>
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
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};