// src/components/visualization/MapConfigDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Map,
  Layers,
  Palette,
  Eye,
  Play,
  Grid,
  Sliders,
  ChevronDown,
  ChevronRight,
  Circle,
  Square,
  Triangle,
  MapPin,
  Target,
  ZoomIn,
  Hand,
  MousePointer,
  Download,
  Accessibility,
  Gauge,
} from 'lucide-react';

// Import the shared type
import { MapConfig } from '../../types/visualization-configs';

interface MapConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<MapConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: MapConfig) => void;
}

const defaultConfig: MapConfig = {
  title: '',
  description: '',
  geometryField: '',
  valueField: '',
  colorField: '',
  sizeField: '',
  labelField: '',
  baseStyle: 'light',
  projection: 'mercator',
  initialView: {
    center: [0, 0],
    zoom: 2,
  },
  minZoom: 0,
  maxZoom: 20,
  pointLayer: {
    symbol: 'circle',
    size: 8,
    color: '#3b82f6',
    opacity: 1,
    outlineColor: '#ffffff',
    outlineWidth: 1,
  },
  fillLayer: {
    color: '#3b82f6',
    opacity: 0.5,
    outlineColor: '#1e3a8a',
    outlineWidth: 1,
  },
  choropleth: {
    classification: 'quantile',
    classes: 5,
    colorScheme: 'Blues',
    opacity: 0.7,
    legend: true,
  },
  heatmap: {
    radius: 30,
    blur: 15,
    intensity: 1,
    colorRamp: ['#0000ff', '#00ffff', '#ffff00', '#ff0000'],
    opacity: 0.8,
  },
  cluster: {
    enabled: false,
    radius: 50,
    maxZoom: 14,
    color: '#51bbd6',
    textColor: '#ffffff',
  },
  showLegend: true,
  legend: {
    position: 'bottom-right',
    title: '',
    fontSize: 12,
    format: '.1f',
  },
  tooltip: {
    show: true,
    fields: [],
    format: '{{name}}: {{value}}',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
  },
  interactivity: {
    zoom: true,
    pan: true,
    selection: 'none',
    hover: true,
    clickAction: 'none',
  },
  animation: {
    enabled: false,
    duration: 300,
  },
  dimensions: {
    width: 800,
    height: 600,
  },
  responsive: {
    enabled: true,
    aspectRatio: 4 / 3,
  },
  exportable: true,
  exportFormats: ['png', 'svg', 'pdf'],
  accessibility: {
    highContrast: false,
  },
  performance: {
    downsampling: false,
    progressive: false,
  },
};

export const MapConfigDialog: React.FC<MapConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];

  // Helper to detect geometry columns (simple heuristic)
  const geometryColumns = availableColumns.filter(
    col =>
      col.type.toLowerCase().includes('geometry') ||
      col.type.toLowerCase().includes('geojson') ||
      col.type.toLowerCase() === 'json' ||
      col.name.toLowerCase().includes('geom') ||
      col.name.toLowerCase().includes('location') ||
      col.name.toLowerCase().includes('coordinates')
  );
  const numericColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar'].includes(col.type.toLowerCase())
  );

  // Basic fields
  const [title, setTitle] = useState(initialMetadata.title || defaultConfig.title);
  const [description, setDescription] = useState(initialMetadata.description || defaultConfig.description);

  // Data mapping
  const [geometryField, setGeometryField] = useState(initialMetadata.geometryField || '');
  const [valueField, setValueField] = useState(initialMetadata.valueField || '');
  const [colorField, setColorField] = useState(initialMetadata.colorField || '');
  const [sizeField, setSizeField] = useState(initialMetadata.sizeField || '');
  const [labelField, setLabelField] = useState(initialMetadata.labelField || '');

  // Map style
  const [baseStyle, setBaseStyle] = useState(initialMetadata.baseStyle || defaultConfig.baseStyle);
  const [customStyleUrl, setCustomStyleUrl] = useState(initialMetadata.customStyleUrl || '');
  const [projection, setProjection] = useState(initialMetadata.projection || defaultConfig.projection);
  const [centerLng, setCenterLng] = useState(initialMetadata.initialView?.center?.[0] ?? defaultConfig.initialView.center[0]);
  const [centerLat, setCenterLat] = useState(initialMetadata.initialView?.center?.[1] ?? defaultConfig.initialView.center[1]);
  const [zoom, setZoom] = useState(initialMetadata.initialView?.zoom ?? defaultConfig.initialView.zoom);
  const [bearing, setBearing] = useState(initialMetadata.initialView?.bearing || 0);
  const [pitch, setPitch] = useState(initialMetadata.initialView?.pitch || 0);
  const [minZoom, setMinZoom] = useState(initialMetadata.minZoom ?? defaultConfig.minZoom);
  const [maxZoom, setMaxZoom] = useState(initialMetadata.maxZoom ?? defaultConfig.maxZoom);

  // Layer type selection (we'll infer from which sections are filled, but we add a radio)
  const [layerType, setLayerType] = useState<'point' | 'fill' | 'choropleth' | 'heatmap' | 'cluster'>('point');

  // Point layer
  const [pointSymbol, setPointSymbol] = useState(initialMetadata.pointLayer?.symbol || defaultConfig.pointLayer!.symbol);
  const [pointSize, setPointSize] = useState(initialMetadata.pointLayer?.size ?? defaultConfig.pointLayer!.size);
  const [pointColor, setPointColor] = useState(initialMetadata.pointLayer?.color || defaultConfig.pointLayer!.color);
  const [pointOpacity, setPointOpacity] = useState(initialMetadata.pointLayer?.opacity ?? defaultConfig.pointLayer!.opacity);
  const [pointOutlineColor, setPointOutlineColor] = useState(initialMetadata.pointLayer?.outlineColor || defaultConfig.pointLayer!.outlineColor);
  const [pointOutlineWidth, setPointOutlineWidth] = useState(initialMetadata.pointLayer?.outlineWidth ?? defaultConfig.pointLayer!.outlineWidth);

  // Fill layer (for choropleth/fill)
  const [fillColor, setFillColor] = useState(initialMetadata.fillLayer?.color || defaultConfig.fillLayer!.color);
  const [fillOpacity, setFillOpacity] = useState(initialMetadata.fillLayer?.opacity ?? defaultConfig.fillLayer!.opacity);
  const [fillOutlineColor, setFillOutlineColor] = useState(initialMetadata.fillLayer?.outlineColor || defaultConfig.fillLayer!.outlineColor);
  const [fillOutlineWidth, setFillOutlineWidth] = useState(initialMetadata.fillLayer?.outlineWidth ?? defaultConfig.fillLayer!.outlineWidth);

  // Choropleth specific
  const [classification, setClassification] = useState(initialMetadata.choropleth?.classification || defaultConfig.choropleth!.classification);
  const [classes, setClasses] = useState(initialMetadata.choropleth?.classes ?? defaultConfig.choropleth!.classes);
  const [colorScheme, setColorScheme] = useState(initialMetadata.choropleth?.colorScheme || defaultConfig.choropleth!.colorScheme);
  const [choroplethOpacity, setChoroplethOpacity] = useState(initialMetadata.choropleth?.opacity ?? defaultConfig.choropleth!.opacity);
  const [choroplethLegend, setChoroplethLegend] = useState(initialMetadata.choropleth?.legend ?? defaultConfig.choropleth!.legend);

  // Heatmap specific
  const [heatmapRadius, setHeatmapRadius] = useState(initialMetadata.heatmap?.radius ?? defaultConfig.heatmap!.radius);
  const [heatmapBlur, setHeatmapBlur] = useState(initialMetadata.heatmap?.blur ?? defaultConfig.heatmap!.blur);
  const [heatmapIntensity, setHeatmapIntensity] = useState(initialMetadata.heatmap?.intensity ?? defaultConfig.heatmap!.intensity);
  const [heatmapColorRamp, setHeatmapColorRamp] = useState(initialMetadata.heatmap?.colorRamp || defaultConfig.heatmap!.colorRamp.join(', '));
  const [heatmapOpacity, setHeatmapOpacity] = useState(initialMetadata.heatmap?.opacity ?? defaultConfig.heatmap!.opacity);

  // Cluster
  const [clusterEnabled, setClusterEnabled] = useState(initialMetadata.cluster?.enabled ?? defaultConfig.cluster!.enabled);
  const [clusterRadius, setClusterRadius] = useState(initialMetadata.cluster?.radius ?? defaultConfig.cluster!.radius);
  const [clusterMaxZoom, setClusterMaxZoom] = useState(initialMetadata.cluster?.maxZoom ?? defaultConfig.cluster!.maxZoom);
  const [clusterColor, setClusterColor] = useState(initialMetadata.cluster?.color || defaultConfig.cluster!.color);
  const [clusterTextColor, setClusterTextColor] = useState(initialMetadata.cluster?.textColor || defaultConfig.cluster!.textColor);

  // Legend
  const [showLegend, setShowLegend] = useState(initialMetadata.showLegend ?? defaultConfig.showLegend);
  const [legendPosition, setLegendPosition] = useState(initialMetadata.legend?.position || defaultConfig.legend!.position);
  const [legendTitle, setLegendTitle] = useState(initialMetadata.legend?.title || '');
  const [legendFontSize, setLegendFontSize] = useState(initialMetadata.legend?.fontSize ?? defaultConfig.legend!.fontSize);
  const [legendFormat, setLegendFormat] = useState(initialMetadata.legend?.format || defaultConfig.legend!.format);

  // Tooltip
  const [tooltipShow, setTooltipShow] = useState(initialMetadata.tooltip?.show ?? defaultConfig.tooltip!.show);
  const [tooltipFields, setTooltipFields] = useState<string[]>(initialMetadata.tooltip?.fields || []);
  const [tooltipFormat, setTooltipFormat] = useState(initialMetadata.tooltip?.format || defaultConfig.tooltip!.format);
  const [tooltipBg, setTooltipBg] = useState(initialMetadata.tooltip?.backgroundColor || defaultConfig.tooltip!.backgroundColor);
  const [tooltipBorder, setTooltipBorder] = useState(initialMetadata.tooltip?.borderColor || defaultConfig.tooltip!.borderColor);
  const [tooltipText, setTooltipText] = useState(initialMetadata.tooltip?.textColor || defaultConfig.tooltip!.textColor);

  // Interactivity
  const [interactiveZoom, setInteractiveZoom] = useState(initialMetadata.interactivity?.zoom ?? defaultConfig.interactivity!.zoom);
  const [interactivePan, setInteractivePan] = useState(initialMetadata.interactivity?.pan ?? defaultConfig.interactivity!.pan);
  const [selectionMode, setSelectionMode] = useState(initialMetadata.interactivity?.selection || defaultConfig.interactivity!.selection);
  const [hoverEnabled, setHoverEnabled] = useState(initialMetadata.interactivity?.hover ?? defaultConfig.interactivity!.hover);
  const [clickAction, setClickAction] = useState(initialMetadata.interactivity?.clickAction || defaultConfig.interactivity!.clickAction);
  const [customClickHandler, setCustomClickHandler] = useState(initialMetadata.interactivity?.customClickHandler || '');

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(initialMetadata.animation?.enabled ?? defaultConfig.animation!.enabled);
  const [animationDuration, setAnimationDuration] = useState(initialMetadata.animation?.duration ?? defaultConfig.animation!.duration);

  // Dimensions
  const [width, setWidth] = useState(initialMetadata.dimensions?.width || defaultConfig.dimensions.width);
  const [height, setHeight] = useState(initialMetadata.dimensions?.height || defaultConfig.dimensions.height);

  // Responsive & Export
  const [responsiveEnabled, setResponsiveEnabled] = useState(initialMetadata.responsive?.enabled ?? defaultConfig.responsive!.enabled);
  const [aspectRatio, setAspectRatio] = useState(initialMetadata.responsive?.aspectRatio || defaultConfig.responsive!.aspectRatio);
  const [exportable, setExportable] = useState(initialMetadata.exportable ?? defaultConfig.exportable);
  const [exportFormats, setExportFormats] = useState<string[]>(initialMetadata.exportFormats || defaultConfig.exportFormats!);

  // Accessibility
  const [highContrast, setHighContrast] = useState(initialMetadata.accessibility?.highContrast ?? defaultConfig.accessibility!.highContrast);
  const [ariaLabel, setAriaLabel] = useState(initialMetadata.accessibility?.ariaLabel || '');
  const [ariaDescription, setAriaDescription] = useState(initialMetadata.accessibility?.ariaDescription || '');

  // Performance
  const [downsampling, setDownsampling] = useState(initialMetadata.performance?.downsampling ?? defaultConfig.performance!.downsampling);
  const [maxPoints, setMaxPoints] = useState(initialMetadata.performance?.maxPoints || 10000);
  const [progressive, setProgressive] = useState(initialMetadata.performance?.progressive ?? defaultConfig.performance!.progressive);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    dataMapping: true,
    mapStyle: false,
    layerType: false,
    pointLayer: false,
    fillLayer: false,
    choropleth: false,
    heatmap: false,
    cluster: false,
    legend: false,
    tooltip: false,
    interactivity: false,
    animation: false,
    dimensions: true,
    exportAccess: false,
    performance: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    setTitle(initialMetadata.title || defaultConfig.title);
    setDescription(initialMetadata.description || defaultConfig.description);
    setGeometryField(initialMetadata.geometryField || '');
    setValueField(initialMetadata.valueField || '');
    setColorField(initialMetadata.colorField || '');
    setSizeField(initialMetadata.sizeField || '');
    setLabelField(initialMetadata.labelField || '');
    setBaseStyle(initialMetadata.baseStyle || defaultConfig.baseStyle);
    setCustomStyleUrl(initialMetadata.customStyleUrl || '');
    setProjection(initialMetadata.projection || defaultConfig.projection);
    setCenterLng(initialMetadata.initialView?.center?.[0] ?? defaultConfig.initialView.center[0]);
    setCenterLat(initialMetadata.initialView?.center?.[1] ?? defaultConfig.initialView.center[1]);
    setZoom(initialMetadata.initialView?.zoom ?? defaultConfig.initialView.zoom);
    setBearing(initialMetadata.initialView?.bearing || 0);
    setPitch(initialMetadata.initialView?.pitch || 0);
    setMinZoom(initialMetadata.minZoom ?? defaultConfig.minZoom);
    setMaxZoom(initialMetadata.maxZoom ?? defaultConfig.maxZoom);
    // Layer type detection
    if (initialMetadata.choropleth) setLayerType('choropleth');
    else if (initialMetadata.heatmap) setLayerType('heatmap');
    else if (initialMetadata.cluster?.enabled) setLayerType('cluster');
    else if (initialMetadata.pointLayer) setLayerType('point');
    else if (initialMetadata.fillLayer) setLayerType('fill');
    // etc.
  }, [initialMetadata]);

  const handleSave = () => {
    // Validate required fields
    if (!geometryField) {
      alert('Please select a geometry field.');
      return;
    }

    // Build config object
    const config: MapConfig = {
      title,
      description,
      geometryField,
      valueField,
      colorField,
      sizeField,
      labelField,
      baseStyle,
      customStyleUrl: baseStyle === 'custom' ? customStyleUrl : undefined,
      projection,
      initialView: { center: [centerLng, centerLat], zoom, bearing, pitch },
      minZoom,
      maxZoom,
      pointLayer: layerType === 'point' || layerType === 'cluster' ? {
        symbol: pointSymbol as any,
        size: pointSize,
        color: pointColor,
        opacity: pointOpacity,
        outlineColor: pointOutlineColor,
        outlineWidth: pointOutlineWidth,
      } : defaultConfig.pointLayer,
      fillLayer: layerType === 'fill' || layerType === 'choropleth' ? {
        color: fillColor,
        opacity: fillOpacity,
        outlineColor: fillOutlineColor,
        outlineWidth: fillOutlineWidth,
      } : defaultConfig.fillLayer,
      choropleth: layerType === 'choropleth' ? {
        classification: classification as any,
        classes,
        colorScheme,
        opacity: choroplethOpacity,
        legend: choroplethLegend,
      } : defaultConfig.choropleth,
      heatmap: layerType === 'heatmap' ? {
        radius: heatmapRadius,
        blur: heatmapBlur,
        intensity: heatmapIntensity,
        colorRamp: heatmapColorRamp.split(',').map(s => s.trim()),
        opacity: heatmapOpacity,
      } : defaultConfig.heatmap,
      cluster: {
        enabled: clusterEnabled,
        radius: clusterRadius,
        maxZoom: clusterMaxZoom,
        color: clusterColor,
        textColor: clusterTextColor,
      },
      showLegend,
      legend: {
        position: legendPosition as any,
        title: legendTitle,
        fontSize: legendFontSize,
        format: legendFormat,
      },
      tooltip: {
        show: tooltipShow,
        fields: tooltipFields,
        format: tooltipFormat,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textColor: tooltipText,
      },
      interactivity: {
        zoom: interactiveZoom,
        pan: interactivePan,
        selection: selectionMode as any,
        hover: hoverEnabled,
        clickAction: clickAction as any,
        customClickHandler: clickAction === 'custom' ? customClickHandler : undefined,
      },
      animation: {
        enabled: animationEnabled,
        duration: animationDuration,
      },
      dimensions: { width, height },
      responsive: {
        enabled: responsiveEnabled,
        aspectRatio,
      },
      exportable,
      exportFormats: exportFormats as any,
      accessibility: {
        ariaLabel,
        ariaDescription,
        highContrast,
      },
      performance: {
        downsampling,
        maxPoints,
        progressive,
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

  const symbolOptions = [
    { value: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
    { value: 'square', label: 'Square', icon: <Square className="h-4 w-4" /> },
    { value: 'triangle', label: 'Triangle', icon: <Triangle className="h-4 w-4" /> },
    { value: 'pin', label: 'Pin', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Configure Map</h2>
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
                  placeholder="My Map"
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

          {/* Data Mapping Section */}
          <SectionHeader title="Data Mapping" icon={<Layers className="h-4 w-4" />} sectionKey="dataMapping" />
          {sections.dataMapping && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Geometry Field <span className="text-red-400">*</span></label>
                <select
                  value={geometryField}
                  onChange={(e) => setGeometryField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="">Select a geometry column</option>
                  {geometryColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                  ))}
                </select>
                {geometryColumns.length === 0 && (
                  <p className="text-xs text-yellow-500 mt-1">No geometry columns detected. You can still enter the column name manually.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value Field (for choropleth/heatmap)</label>
                <select
                  value={valueField}
                  onChange={(e) => setValueField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color Field (categorical or numeric)</label>
                <select
                  value={colorField}
                  onChange={(e) => setColorField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None (use fixed color)</option>
                  {categoricalColumns.concat(numericColumns).map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Size Field (for points)</label>
                <select
                  value={sizeField}
                  onChange={(e) => setSizeField(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">None (fixed size)</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Label Field</label>
                <select
                  value={labelField}
                  onChange={(e) => setLabelField(e.target.value)}
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

          {/* Map Style Section */}
          <SectionHeader title="Map Style" icon={<Map className="h-4 w-4" />} sectionKey="mapStyle" />
          {sections.mapStyle && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Base Style</label>
                <select
                  value={baseStyle}
                  onChange={(e) => setBaseStyle(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="satellite">Satellite</option>
                  <option value="streets">Streets</option>
                  <option value="outdoors">Outdoors</option>
                  <option value="custom">Custom URL</option>
                </select>
              </div>
              {baseStyle === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Custom Style URL</label>
                  <input
                    type="url"
                    value={customStyleUrl}
                    onChange={(e) => setCustomStyleUrl(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="https://example.com/style.json"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Projection</label>
                <select
                  value={projection}
                  onChange={(e) => setProjection(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="mercator">Mercator</option>
                  <option value="albers">Albers</option>
                  <option value="equalEarth">Equal Earth</option>
                  <option value="naturalEarth">Natural Earth</option>
                  <option value="winkelTripel">Winkel Tripel</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Center Lng</label>
                  <input
                    type="number"
                    step="0.01"
                    value={centerLng}
                    onChange={(e) => setCenterLng(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Center Lat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={centerLat}
                    onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Zoom</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bearing</label>
                  <input
                    type="number"
                    step="1"
                    value={bearing}
                    onChange={(e) => setBearing(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Pitch</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Zoom</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={minZoom}
                    onChange={(e) => setMinZoom(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Zoom</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={maxZoom}
                    onChange={(e) => setMaxZoom(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Layer Type Section */}
          <SectionHeader title="Layer Type" icon={<Layers className="h-4 w-4" />} sectionKey="layerType" />
          {sections.layerType && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              <div className="flex flex-wrap gap-3">
                {(['point', 'fill', 'choropleth', 'heatmap', 'cluster'] as const).map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={type}
                      checked={layerType === type}
                      onChange={(e) => setLayerType(e.target.value as any)}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Point Layer Section */}
          {(layerType === 'point' || layerType === 'cluster') && (
            <>
              <SectionHeader title="Point Layer" icon={<Circle className="h-4 w-4" />} sectionKey="pointLayer" />
              {sections.pointLayer && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                      <select
                        value={pointSymbol}
                        onChange={(e) => setPointSymbol(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        {symbolOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Size (px)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={pointSize}
                        onChange={(e) => setPointSize(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Fill Color</label>
                      <input
                        type="color"
                        value={pointColor}
                        onChange={(e) => setPointColor(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Opacity (0-1)</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={pointOpacity}
                        onChange={(e) => setPointOpacity(parseFloat(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Outline Color</label>
                      <input
                        type="color"
                        value={pointOutlineColor}
                        onChange={(e) => setPointOutlineColor(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Outline Width (px)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={pointOutlineWidth}
                        onChange={(e) => setPointOutlineWidth(parseFloat(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Fill Layer Section (for choropleth/fill) */}
          {(layerType === 'fill' || layerType === 'choropleth') && (
            <>
              <SectionHeader title="Fill Layer" icon={<Square className="h-4 w-4" />} sectionKey="fillLayer" />
              {sections.fillLayer && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Fill Color</label>
                      <input
                        type="color"
                        value={fillColor}
                        onChange={(e) => setFillColor(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Opacity (0-1)</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={fillOpacity}
                        onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Outline Color</label>
                      <input
                        type="color"
                        value={fillOutlineColor}
                        onChange={(e) => setFillOutlineColor(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Outline Width (px)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={fillOutlineWidth}
                        onChange={(e) => setFillOutlineWidth(parseFloat(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Choropleth Specific */}
          {layerType === 'choropleth' && (
            <>
              <SectionHeader title="Choropleth Options" icon={<Palette className="h-4 w-4" />} sectionKey="choropleth" />
              {sections.choropleth && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Classification Method</label>
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="equalInterval">Equal Interval</option>
                      <option value="quantile">Quantile</option>
                      <option value="jenks">Jenks (Natural Breaks)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Number of Classes</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={classes}
                      onChange={(e) => setClasses(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Color Scheme</label>
                    <input
                      type="text"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      placeholder="e.g., Blues, Reds, Viridis, or comma list"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Fill Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={choroplethOpacity}
                      onChange={(e) => setChoroplethOpacity(parseFloat(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={choroplethLegend}
                      onChange={(e) => setChoroplethLegend(e.target.checked)}
                      className="rounded border-gray-600 text-green-500"
                    />
                    <span className="text-sm text-gray-200">Show legend</span>
                  </label>
                </div>
              )}
            </>
          )}

          {/* Heatmap Specific */}
          {layerType === 'heatmap' && (
            <>
              <SectionHeader title="Heatmap Options" icon={<Gauge className="h-4 w-4" />} sectionKey="heatmap" />
              {sections.heatmap && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Radius (px)</label>
                      <input
                        type="number"
                        min="1"
                        value={heatmapRadius}
                        onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Blur (px)</label>
                      <input
                        type="number"
                        min="0"
                        value={heatmapBlur}
                        onChange={(e) => setHeatmapBlur(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Intensity</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={heatmapIntensity}
                      onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Color Ramp (comma‑separated hex colors)</label>
                    <input
                      type="text"
                      value={heatmapColorRamp}
                      onChange={(e) => setHeatmapColorRamp(e.target.value)}
                      placeholder="#0000ff, #00ffff, #ffff00, #ff0000"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={heatmapOpacity}
                      onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cluster Options */}
          {layerType === 'cluster' && (
            <>
              <SectionHeader title="Clustering" icon={<Target className="h-4 w-4" />} sectionKey="cluster" />
              {sections.cluster && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={clusterEnabled}
                      onChange={(e) => setClusterEnabled(e.target.checked)}
                      className="rounded border-gray-600 text-green-500"
                    />
                    <span className="text-sm text-gray-200">Enable clustering</span>
                  </label>
                  {clusterEnabled && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Cluster Radius (px)</label>
                          <input
                            type="number"
                            min="1"
                            value={clusterRadius}
                            onChange={(e) => setClusterRadius(parseInt(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Max Zoom (disable clustering)</label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={clusterMaxZoom}
                            onChange={(e) => setClusterMaxZoom(parseInt(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Cluster Color</label>
                          <input
                            type="color"
                            value={clusterColor}
                            onChange={(e) => setClusterColor(e.target.value)}
                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                          <input
                            type="color"
                            value={clusterTextColor}
                            onChange={(e) => setClusterTextColor(e.target.value)}
                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
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
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Show legend</span>
              </label>
              {showLegend && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                    <select
                      value={legendPosition}
                      onChange={(e) => setLegendPosition(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (optional)</label>
                    <input
                      type="text"
                      value={legendTitle}
                      onChange={(e) => setLegendTitle(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={legendFontSize}
                        onChange={(e) => setLegendFontSize(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Format</label>
                      <input
                        type="text"
                        value={legendFormat}
                        onChange={(e) => setLegendFormat(e.target.value)}
                        placeholder=".2f"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </>
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
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Show tooltip</span>
              </label>
              {tooltipShow && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Fields to display</label>
                    <select
                      multiple
                      value={tooltipFields}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                        setTooltipFields(selected);
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
                    >
                      {availableColumns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple; leave empty to show all fields.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Format template</label>
                    <input
                      type="text"
                      value={tooltipFormat}
                      onChange={(e) => setTooltipFormat(e.target.value)}
                      placeholder="{{name}}: {{value}}"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Background</label>
                      <input
                        type="color"
                        value={tooltipBg}
                        onChange={(e) => setTooltipBg(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Border</label>
                      <input
                        type="color"
                        value={tooltipBorder}
                        onChange={(e) => setTooltipBorder(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Text</label>
                      <input
                        type="color"
                        value={tooltipText}
                        onChange={(e) => setTooltipText(e.target.value)}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Interactivity Section */}
          <SectionHeader title="Interactivity" icon={<MousePointer className="h-4 w-4" />} sectionKey="interactivity" />
          {sections.interactivity && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactiveZoom}
                    onChange={(e) => setInteractiveZoom(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Zoom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactivePan}
                    onChange={(e) => setInteractivePan(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Pan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hoverEnabled}
                    onChange={(e) => setHoverEnabled(e.target.checked)}
                    className="rounded border-gray-600 text-green-500"
                  />
                  <span className="text-sm text-gray-200">Hover highlight</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Selection Mode</label>
                <select
                  value={selectionMode}
                  onChange={(e) => setSelectionMode(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="none">None</option>
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Click Action</label>
                <select
                  value={clickAction}
                  onChange={(e) => setClickAction(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="none">None</option>
                  <option value="select">Select</option>
                  <option value="drilldown">Drill Down</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {clickAction === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Custom Handler (JS expression)</label>
                  <input
                    type="text"
                    value={customClickHandler}
                    onChange={(e) => setCustomClickHandler(e.target.value)}
                    placeholder="(feature) => { ... }"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
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
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Enable animation (transitions)</span>
              </label>
              {animationEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={animationDuration}
                    onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Dimensions Section */}
          <SectionHeader title="Dimensions" icon={<Grid className="h-4 w-4" />} sectionKey="dimensions" />
          {sections.dimensions && (
            <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Width (px)</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Height (px)</label>
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

          {/* Export & Accessibility Section */}
          <SectionHeader title="Export & Accessibility" icon={<Download className="h-4 w-4" />} sectionKey="exportAccess" />
          {sections.exportAccess && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Responsive (maintain aspect ratio)</span>
              </label>
              {responsiveEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio (width/height)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportable}
                  onChange={(e) => setExportable(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Enable export</span>
              </label>
              {exportable && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Export formats</label>
                  <div className="flex space-x-3">
                    {['png', 'svg', 'pdf'].map(f => (
                      <label key={f} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          value={f}
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
                        <span className="text-sm text-gray-200 uppercase">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">High contrast mode</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ARIA Label</label>
                <input
                  type="text"
                  value={ariaLabel}
                  onChange={(e) => setAriaLabel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ARIA Description</label>
                <textarea
                  value={ariaDescription}
                  onChange={(e) => setAriaDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Performance Section */}
          <SectionHeader title="Performance" icon={<Gauge className="h-4 w-4" />} sectionKey="performance" />
          {sections.performance && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={downsampling}
                  onChange={(e) => setDownsampling(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Downsampling (reduce points for large data)</span>
              </label>
              {downsampling && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max points</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={progressive}
                  onChange={(e) => setProgressive(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Progressive rendering (stream results)</span>
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