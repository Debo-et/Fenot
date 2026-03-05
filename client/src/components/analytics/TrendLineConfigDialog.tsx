import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sliders,
  Layers,
  Filter,
  Hash,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Import the shared type
import { TrendLineConfig, TrendModelType, FilterCondition } from '../../types/analytics-configs';

interface TrendLineConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<TrendLineConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: TrendLineConfig) => void;
}

const defaultConfig: TrendLineConfig = {
  xColumn: '',
  yColumn: '',
  groupBy: [],
  model: 'linear',
  polynomialDegree: 2,
  customSql: '',
  includeConfidence: false,
  confidenceLevel: 0.95,
  output: {
    fittedValues: true,
    includeStatistics: true,
    fittedAlias: 'trend_value',
    lowerBoundAlias: 'lower_bound',
    upperBoundAlias: 'upper_bound',
    alias: 'trend_output',
  },
  filters: [],
  inputLimit: undefined,
};

// Helper to extract available columns from inputSchema
const getAvailableColumns = (inputSchema: Array<{ name: string; type: string }> = []) => inputSchema || [];

export const TrendLineConfigDialog: React.FC<TrendLineConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = getAvailableColumns(initialMetadata.inputSchema);
  const numericColumns = availableColumns.filter(col =>
    ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  const allColumns = availableColumns.map(col => col.name);

  // Form state
  const [xColumn, setXColumn] = useState(initialMetadata.xColumn || defaultConfig.xColumn);
  const [yColumn, setYColumn] = useState(initialMetadata.yColumn || defaultConfig.yColumn);
  const [groupBy, setGroupBy] = useState<string[]>(initialMetadata.groupBy || defaultConfig.groupBy!);
  const [model, setModel] = useState<TrendModelType>(initialMetadata.model || defaultConfig.model);
  const [polynomialDegree, setPolynomialDegree] = useState(initialMetadata.polynomialDegree || defaultConfig.polynomialDegree);
  const [customSql, setCustomSql] = useState(initialMetadata.customSql || defaultConfig.customSql);
  const [includeConfidence, setIncludeConfidence] = useState(initialMetadata.includeConfidence ?? defaultConfig.includeConfidence);
  const [confidenceLevel, setConfidenceLevel] = useState(initialMetadata.confidenceLevel ?? defaultConfig.confidenceLevel);
  const [outputFittedValues, setOutputFittedValues] = useState(initialMetadata.output?.fittedValues ?? defaultConfig.output.fittedValues);
  const [outputIncludeStats, setOutputIncludeStats] = useState(initialMetadata.output?.includeStatistics ?? defaultConfig.output.includeStatistics);
  const [fittedAlias, setFittedAlias] = useState(initialMetadata.output?.fittedAlias || defaultConfig.output.fittedAlias!);
  const [lowerBoundAlias, setLowerBoundAlias] = useState(initialMetadata.output?.lowerBoundAlias || defaultConfig.output.lowerBoundAlias!);
  const [upperBoundAlias, setUpperBoundAlias] = useState(initialMetadata.output?.upperBoundAlias || defaultConfig.output.upperBoundAlias!);
  const [outputAlias, setOutputAlias] = useState(initialMetadata.output?.alias || defaultConfig.output.alias!);
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || defaultConfig.filters!);
  const [inputLimit, setInputLimit] = useState(initialMetadata.inputLimit);

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    basic: true,
    model: false,
    output: false,
    filters: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes (e.g., different node selected)
  useEffect(() => {
    setXColumn(initialMetadata.xColumn || defaultConfig.xColumn);
    setYColumn(initialMetadata.yColumn || defaultConfig.yColumn);
    setGroupBy(initialMetadata.groupBy || defaultConfig.groupBy!);
    setModel(initialMetadata.model || defaultConfig.model);
    setPolynomialDegree(initialMetadata.polynomialDegree || defaultConfig.polynomialDegree);
    setCustomSql(initialMetadata.customSql || defaultConfig.customSql);
    setIncludeConfidence(initialMetadata.includeConfidence ?? defaultConfig.includeConfidence);
    setConfidenceLevel(initialMetadata.confidenceLevel ?? defaultConfig.confidenceLevel);
    setOutputFittedValues(initialMetadata.output?.fittedValues ?? defaultConfig.output.fittedValues);
    setOutputIncludeStats(initialMetadata.output?.includeStatistics ?? defaultConfig.output.includeStatistics);
    setFittedAlias(initialMetadata.output?.fittedAlias || defaultConfig.output.fittedAlias!);
    setLowerBoundAlias(initialMetadata.output?.lowerBoundAlias || defaultConfig.output.lowerBoundAlias!);
    setUpperBoundAlias(initialMetadata.output?.upperBoundAlias || defaultConfig.output.upperBoundAlias!);
    setOutputAlias(initialMetadata.output?.alias || defaultConfig.output.alias!);
    setFilters(initialMetadata.filters || defaultConfig.filters!);
    setInputLimit(initialMetadata.inputLimit);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!xColumn || !yColumn) {
      alert('Please select both X and Y columns.');
      return;
    }

    const config: TrendLineConfig = {
      xColumn,
      yColumn,
      groupBy: groupBy.length > 0 ? groupBy : undefined,
      model,
      polynomialDegree: model === 'polynomial' ? polynomialDegree : undefined,
      customSql: model === 'custom' ? customSql : undefined,
      includeConfidence: includeConfidence || undefined,
      confidenceLevel: includeConfidence ? confidenceLevel : undefined,
      output: {
        fittedValues: outputFittedValues,
        includeStatistics: outputIncludeStats,
        fittedAlias,
        lowerBoundAlias: includeConfidence ? lowerBoundAlias : undefined,
        upperBoundAlias: includeConfidence ? upperBoundAlias : undefined,
        alias: outputAlias,
      },
      filters: filters.length > 0 ? filters : undefined,
      inputLimit: inputLimit || undefined,
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

  // Preview output columns
  const previewColumns = () => {
    const cols: string[] = [];
    if (groupBy) cols.push(...groupBy);
    cols.push(xColumn);
    cols.push(yColumn);
    if (outputFittedValues) cols.push(fittedAlias);
    if (outputIncludeStats) cols.push('slope', 'intercept', 'r_squared');
    if (includeConfidence) {
      cols.push(lowerBoundAlias);
      cols.push(upperBoundAlias);
    }
    return cols;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Trend Line (Analytics)</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Settings */}
          <SectionHeader title="Basic Settings" icon={<Sliders className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  X‑Axis Column <span className="text-red-400">*</span>
                </label>
                <select
                  value={xColumn}
                  onChange={(e) => setXColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select numeric/time column</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Y‑Axis Column <span className="text-red-400">*</span>
                </label>
                <select
                  value={yColumn}
                  onChange={(e) => setYColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select numeric column</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Group By (optional)</label>
                <select
                  multiple
                  value={groupBy}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setGroupBy(selected);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
                >
                  {allColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple series.</p>
              </div>
            </div>
          )}

          {/* Model Configuration */}
          <SectionHeader title="Model" icon={<Layers className="h-4 w-4" />} sectionKey="model" />
          {sections.model && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Model Type</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as TrendModelType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="linear">Linear</option>
                  <option value="logarithmic">Logarithmic</option>
                  <option value="exponential">Exponential</option>
                  <option value="power">Power</option>
                  <option value="polynomial">Polynomial</option>
                  <option value="custom">Custom SQL</option>
                </select>
              </div>
              {model === 'polynomial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={polynomialDegree}
                    onChange={(e) => setPolynomialDegree(parseInt(e.target.value) || 2)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
              {model === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Custom SQL Expression</label>
                  <textarea
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    rows={3}
                    placeholder="e.g., slope * x + intercept"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeConfidence}
                    onChange={(e) => setIncludeConfidence(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Include confidence intervals</span>
                </label>
              </div>
              {includeConfidence && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confidence Level</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Output Options */}
          <SectionHeader title="Output" icon={<Hash className="h-4 w-4" />} sectionKey="output" />
          {sections.output && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={outputFittedValues}
                    onChange={(e) => setOutputFittedValues(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Include fitted values</span>
                </label>
              </div>
              {outputFittedValues && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fitted value alias</label>
                  <input
                    type="text"
                    value={fittedAlias}
                    onChange={(e) => setFittedAlias(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={outputIncludeStats}
                    onChange={(e) => setOutputIncludeStats(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Include statistics (slope, intercept, R²)</span>
                </label>
              </div>
              {includeConfidence && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Lower bound alias</label>
                    <input
                      type="text"
                      value={lowerBoundAlias}
                      onChange={(e) => setLowerBoundAlias(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Upper bound alias</label>
                    <input
                      type="text"
                      value={upperBoundAlias}
                      onChange={(e) => setUpperBoundAlias(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Output alias (table/view name)</label>
                <input
                  type="text"
                  value={outputAlias}
                  onChange={(e) => setOutputAlias(e.target.value)}
                  placeholder="trend_output"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Filters */}
          <SectionHeader title="Filters" icon={<Filter className="h-4 w-4" />} sectionKey="filters" />
          {sections.filters && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              {filters.map((filter, idx) => (
                <div key={filter.id || idx} className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={filter.expression}
                    onChange={(e) => {
                      const newFilters = [...filters];
                      newFilters[idx] = { ...filter, expression: e.target.value };
                      setFilters(newFilters);
                    }}
                    placeholder="e.g., amount > 100"
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
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add WHERE Condition</span>
              </button>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Input row limit</label>
                <input
                  type="number"
                  min="0"
                  value={inputLimit || ''}
                  onChange={(e) => setInputLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No limit"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Schema Preview */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Output Schema Preview ({previewColumns().length} columns)</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-24 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 text-xs">
                {previewColumns().map((col, idx) => (
                  <div key={idx} className="text-gray-300 bg-gray-700 px-2 py-1 rounded truncate" title={col}>
                    {col}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
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