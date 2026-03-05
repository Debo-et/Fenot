import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Layers,
  Filter,
  TrendingUp,
  Activity,
  Eye,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sliders,
  Gauge,
  FunctionSquare,
} from 'lucide-react';

// Import the shared type
import { ForecastConfig, FilterCondition } from '../../types/analytics-configs';

interface ForecastConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<ForecastConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: ForecastConfig) => void;
}

// Default configuration
const defaultConfig: ForecastConfig = {
  timeColumn: '',
  valueColumn: '',
  horizon: 12,
  groupBy: [],
  seasonality: { enabled: true, period: 'auto' },
  confidenceLevel: 0.95,
  model: 'linear',
  customSql: '',
  transformations: [],
  output: {
    includeHistorical: true,
    includeConfidence: true,
    forecastAlias: 'forecast',
  },
  filters: [],
  inputLimit: undefined,
};

export const ForecastConfigDialog: React.FC<ForecastConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];

  // Filter columns by type
  const dateColumns = useMemo(
    () => availableColumns.filter(col => 
      ['date', 'timestamp', 'datetime', 'time'].includes(col.type.toLowerCase())
    ),
    [availableColumns]
  );
  const numericColumns = useMemo(
    () => availableColumns.filter(col => 
      ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
    ),
    [availableColumns]
  );
  const categoricalColumns = useMemo(
    () => availableColumns.filter(col => 
      !dateColumns.includes(col) && !numericColumns.includes(col)
    ),
    [availableColumns, dateColumns, numericColumns]
  );

  // Form state
  const [timeColumn, setTimeColumn] = useState(initialMetadata.timeColumn || defaultConfig.timeColumn);
  const [valueColumn, setValueColumn] = useState(initialMetadata.valueColumn || defaultConfig.valueColumn);
  const [horizon, setHorizon] = useState(initialMetadata.horizon ?? defaultConfig.horizon);
  const [groupBy, setGroupBy] = useState<string[]>(initialMetadata.groupBy || []);
  const [seasonalityEnabled, setSeasonalityEnabled] = useState(
    initialMetadata.seasonality?.enabled ?? defaultConfig.seasonality!.enabled
  );
  const [seasonalityPeriod, setSeasonalityPeriod] = useState<'auto' | number>(
    initialMetadata.seasonality?.period ?? defaultConfig.seasonality!.period
  );
  const [confidenceLevel, setConfidenceLevel] = useState(
    initialMetadata.confidenceLevel ?? defaultConfig.confidenceLevel
  );
  const [model, setModel] = useState(initialMetadata.model || defaultConfig.model);
  const [customSql, setCustomSql] = useState(initialMetadata.customSql || '');
  const [transformations, setTransformations] = useState(initialMetadata.transformations || []);
  const [includeHistorical, setIncludeHistorical] = useState(
    initialMetadata.output?.includeHistorical ?? defaultConfig.output.includeHistorical
  );
  const [includeConfidence, setIncludeConfidence] = useState(
    initialMetadata.output?.includeConfidence ?? defaultConfig.output.includeConfidence
  );
  const [forecastAlias, setForecastAlias] = useState(
    initialMetadata.output?.forecastAlias || defaultConfig.output.forecastAlias
  );
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [inputLimit, setInputLimit] = useState(initialMetadata.inputLimit);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    grouping: false,
    seasonality: false,
    model: false,
    transformations: false,
    output: false,
    filters: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    setTimeColumn(initialMetadata.timeColumn || defaultConfig.timeColumn);
    setValueColumn(initialMetadata.valueColumn || defaultConfig.valueColumn);
    setHorizon(initialMetadata.horizon ?? defaultConfig.horizon);
    setGroupBy(initialMetadata.groupBy || []);
    setSeasonalityEnabled(initialMetadata.seasonality?.enabled ?? defaultConfig.seasonality!.enabled);
    setSeasonalityPeriod(initialMetadata.seasonality?.period ?? defaultConfig.seasonality!.period);
    setConfidenceLevel(initialMetadata.confidenceLevel ?? defaultConfig.confidenceLevel);
    setModel(initialMetadata.model || defaultConfig.model);
    setCustomSql(initialMetadata.customSql || '');
    setTransformations(initialMetadata.transformations || []);
    setIncludeHistorical(initialMetadata.output?.includeHistorical ?? defaultConfig.output.includeHistorical);
    setIncludeConfidence(initialMetadata.output?.includeConfidence ?? defaultConfig.output.includeConfidence);
    setForecastAlias(initialMetadata.output?.forecastAlias || defaultConfig.output.forecastAlias);
    setFilters(initialMetadata.filters || []);
    setInputLimit(initialMetadata.inputLimit);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!timeColumn) {
      alert('Please select a time column.');
      return;
    }
    if (!valueColumn) {
      alert('Please select a value column.');
      return;
    }

    const config: ForecastConfig = {
      timeColumn,
      valueColumn,
      horizon,
      groupBy: groupBy.length ? groupBy : undefined,
      seasonality: seasonalityEnabled
        ? { enabled: true, period: seasonalityPeriod }
        : undefined,
      confidenceLevel,
      model,
      customSql: model === 'custom' ? customSql : undefined,
      transformations,
      output: {
        includeHistorical,
        includeConfidence,
        forecastAlias: forecastAlias || undefined,
      },
      filters: filters.length ? filters : undefined,
      inputLimit: inputLimit || undefined,
    };

    onSave(config);
    onClose();
  };

  if (!open) return null;

  // Section header component
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Configure Forecast (Analytics)</h2>
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
          {/* Basic Settings */}
          <SectionHeader title="Basic Settings" icon={<Sliders className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Time Column */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time Column <span className="text-red-400">*</span>
                </label>
                <select
                  value={timeColumn}
                  onChange={(e) => setTimeColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>Select a date/time column</option>
                  {dateColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                  ))}
                </select>
              </div>
              {/* Value Column */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Value Column <span className="text-red-400">*</span>
                </label>
                <select
                  value={valueColumn}
                  onChange={(e) => setValueColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>Select a numeric column</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                  ))}
                </select>
              </div>
              {/* Horizon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Forecast Horizon (number of periods)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={horizon}
                  onChange={(e) => setHorizon(parseInt(e.target.value) || 12)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              {/* Input limit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Limit Input Rows (optional, e.g., last N records)
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputLimit || ''}
                  onChange={(e) => setInputLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No limit"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Grouping */}
          <SectionHeader title="Grouping (Multiple Time Series)" icon={<Layers className="h-4 w-4" />} sectionKey="grouping" />
          {sections.grouping && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Group By Columns
                </label>
                <select
                  multiple
                  value={groupBy}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setGroupBy(selected);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
                >
                  {categoricalColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple. Each combination will produce a separate forecast.</p>
              </div>
            </div>
          )}

          {/* Seasonality */}
          <SectionHeader title="Seasonality" icon={<Activity className="h-4 w-4" />} sectionKey="seasonality" />
          {sections.seasonality && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={seasonalityEnabled}
                  onChange={(e) => setSeasonalityEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Enable seasonality</span>
              </label>
              {seasonalityEnabled && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Period</label>
                  <div className="flex space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        value="auto"
                        checked={seasonalityPeriod === 'auto'}
                        onChange={() => setSeasonalityPeriod('auto')}
                        className="text-green-500"
                      />
                      <span className="text-sm text-gray-200">Auto-detect</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        value="custom"
                        checked={typeof seasonalityPeriod === 'number'}
                        onChange={() => setSeasonalityPeriod(7)}
                        className="text-green-500"
                      />
                      <span className="text-sm text-gray-200">Custom</span>
                    </label>
                  </div>
                  {typeof seasonalityPeriod === 'number' && (
                    <input
                      type="number"
                      min="1"
                      value={seasonalityPeriod}
                      onChange={(e) => setSeasonalityPeriod(parseInt(e.target.value) || 7)}
                      className="w-24 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <SectionHeader title="Forecast Model" icon={<Gauge className="h-4 w-4" />} sectionKey="model" />
          {sections.model && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="linear"
                      checked={model === 'linear'}
                      onChange={(e) => setModel(e.target.value as any)}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200">Linear Regression</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="exponential_smoothing"
                      checked={model === 'exponential_smoothing'}
                      onChange={(e) => setModel(e.target.value as any)}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200">Exponential Smoothing</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="arima"
                      checked={model === 'arima'}
                      onChange={(e) => setModel(e.target.value as any)}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200">ARIMA</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="custom"
                      checked={model === 'custom'}
                      onChange={(e) => setModel(e.target.value as any)}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200">Custom SQL</span>
                  </label>
                </div>
              </div>
              {model === 'custom' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Custom SQL Expression</label>
                  <textarea
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white font-mono text-sm"
                    placeholder="-- Write your own forecast logic here"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Confidence Level</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                  className="w-24 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* Transformations */}
          <SectionHeader title="Transformations" icon={<FunctionSquare className="h-4 w-4" />} sectionKey="transformations" />
          {sections.transformations && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <p className="text-sm text-gray-400 italic">(Placeholder – transformation builder can be added here)</p>
              <button
                type="button"
                onClick={() => setTransformations([...transformations, { type: 'log' }])}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transformation</span>
              </button>
              {transformations.map((t, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                  <span className="text-sm text-gray-200">{t.type}</span>
                  <button
                    onClick={() => setTransformations(transformations.filter((_, i) => i !== idx))}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Output Options */}
          <SectionHeader title="Output Configuration" icon={<Eye className="h-4 w-4" />} sectionKey="output" />
          {sections.output && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeHistorical}
                  onChange={(e) => setIncludeHistorical(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Include historical data</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeConfidence}
                  onChange={(e) => setIncludeConfidence(e.target.checked)}
                  className="rounded border-gray-600 text-green-500"
                />
                <span className="text-sm text-gray-200">Include confidence intervals</span>
              </label>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Forecast Column Alias</label>
                <input
                  type="text"
                  value={forecastAlias}
                  onChange={(e) => setForecastAlias(e.target.value)}
                  placeholder="forecast"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Filters */}
          <SectionHeader title="Pre‑Forecast Filters (WHERE)" icon={<Filter className="h-4 w-4" />} sectionKey="filters" />
          {sections.filters && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              {filters.map((f, idx) => (
                <div key={f.id} className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={f.expression}
                    onChange={(e) => {
                      const newFilters = [...filters];
                      newFilters[idx].expression = e.target.value;
                      setFilters(newFilters);
                    }}
                    placeholder="e.g., date > '2020-01-01'"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => setFilters(filters.filter((_, i) => i !== idx))}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFilters([...filters, { id: crypto.randomUUID(), expression: '', type: 'where' }])}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Filter</span>
              </button>
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