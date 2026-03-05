import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Sigma,
  Layers,
  Filter,
  Eye,
  Plus,
  Trash2,
  Calculator,
} from 'lucide-react';
import { PercentileConfig, FilterCondition } from '../../types/analytics-configs';

interface PercentileConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<PercentileConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: PercentileConfig) => void;
}

const defaultPercentileConfig: PercentileConfig = {
  valueColumn: '',
  percentiles: [0.25, 0.5, 0.75],
  groupBy: [],
  filters: [],
  output: {
    aliasBase: 'p',
    tableName: 'percentile_output',
  },
  options: {
    distinct: false,
    limit: undefined,
    method: 'continuous',
  },
};

const defaultFilter: FilterCondition = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
};

export const PercentileConfigDialog: React.FC<PercentileConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];
  const numericColumns = initialMetadata.inputSchema
    ?.filter(col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase()))
    .map(col => col.name) || [];

  // Form state
  const [valueColumn, setValueColumn] = useState(initialMetadata.valueColumn || '');
  const [percentilesInput, setPercentilesInput] = useState(
    (initialMetadata.percentiles || defaultPercentileConfig.percentiles).join(', ')
  );
  const [groupBy, setGroupBy] = useState<string[]>(initialMetadata.groupBy || []);
  const [filters, setFilters] = useState<FilterCondition[]>(
    initialMetadata.filters?.map(f => ({ ...f, id: f.id || crypto.randomUUID() })) || []
  );
  const [aliasBase, setAliasBase] = useState(initialMetadata.output?.aliasBase || defaultPercentileConfig.output!.aliasBase!);
  const [outputTable, setOutputTable] = useState(initialMetadata.output?.tableName || defaultPercentileConfig.output!.tableName!);
  const [method, setMethod] = useState<'continuous' | 'discrete'>(
    initialMetadata.options?.method || defaultPercentileConfig.options!.method!
  );
  const [distinct, setDistinct] = useState(initialMetadata.options?.distinct || false);
  const [limit, setLimit] = useState<number | undefined>(initialMetadata.options?.limit);

  const [searchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'grouping' | 'filters' | 'advanced'>('basic');

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setValueColumn(initialMetadata.valueColumn || '');
    setPercentilesInput((initialMetadata.percentiles || defaultPercentileConfig.percentiles).join(', '));
    setGroupBy(initialMetadata.groupBy || []);
    setFilters(initialMetadata.filters?.map(f => ({ ...f, id: f.id || crypto.randomUUID() })) || []);
    setAliasBase(initialMetadata.output?.aliasBase || defaultPercentileConfig.output!.aliasBase!);
    setOutputTable(initialMetadata.output?.tableName || defaultPercentileConfig.output!.tableName!);
    setMethod(initialMetadata.options?.method || defaultPercentileConfig.options!.method!);
    setDistinct(initialMetadata.options?.distinct || false);
    setLimit(initialMetadata.options?.limit);
  }, [initialMetadata]);

  // Parse percentiles from comma-separated string
  const parsedPercentiles = useMemo(() => {
    return percentilesInput
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n) && n >= 0 && n <= 1);
  }, [percentilesInput]);

  // Output schema preview
  const outputColumns = useMemo(() => {
    const cols: string[] = [];
    // group by columns first
    cols.push(...groupBy);
    // percentile columns
    parsedPercentiles.forEach(p => {
      cols.push(`${aliasBase}${Math.round(p * 100)}`);
    });
    return cols;
  }, [groupBy, parsedPercentiles, aliasBase]);



  const handleSave = () => {
    const config: PercentileConfig = {
      valueColumn,
      percentiles: parsedPercentiles,
      groupBy: groupBy.length > 0 ? groupBy : undefined,
      filters: filters.length > 0 ? filters : undefined,
      output: {
        aliasBase,
        tableName: outputTable,
      },
      options: {
        method,
        distinct,
        limit: limit || undefined,
      },
    };
    onSave(config);
    onClose();
  };

  const addFilter = () => {
    setFilters([...filters, { ...defaultFilter, id: crypto.randomUUID() }]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, expression: string) => {
    setFilters(filters.map(f => (f.id === id ? { ...f, expression } : f)));
  };

  if (!open) return null;

  const filteredColumns = availableColumns.filter(col =>
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Sigma className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Percentile Analytics</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50 px-4">
          {[
            { id: 'basic', label: 'Basic', icon: <Sigma className="h-4 w-4" /> },
            { id: 'grouping', label: 'Grouping', icon: <Layers className="h-4 w-4" /> },
            { id: 'filters', label: 'Filters', icon: <Filter className="h-4 w-4" /> },
            { id: 'advanced', label: 'Advanced', icon: <Calculator className="h-4 w-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Value Column <span className="text-red-400">*</span>
                </label>
                <select
                  value={valueColumn}
                  onChange={(e) => setValueColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select a numeric column</option>
                  {numericColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Percentiles (comma‑separated, 0–1)
                </label>
                <input
                  type="text"
                  value={percentilesInput}
                  onChange={(e) => setPercentilesInput(e.target.value)}
                  placeholder="e.g., 0.25, 0.5, 0.75, 0.9"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: 0.25 = 25th percentile, 0.5 = median, 0.75 = 75th percentile.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Alias Base
                </label>
                <input
                  type="text"
                  value={aliasBase}
                  onChange={(e) => setAliasBase(e.target.value)}
                  placeholder="p"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Column names will be: {aliasBase}25, {aliasBase}50, etc.
                </p>
              </div>
            </div>
          )}

          {/* Grouping Tab */}
          {activeTab === 'grouping' && (
            <div className="space-y-4">
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-32"
                >
                  {filteredColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple.</p>
              </div>
              {groupBy.length === 0 && (
                <p className="text-gray-400 text-sm italic">No grouping – percentiles will be computed over all rows.</p>
              )}
            </div>
          )}

          {/* Filters Tab */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-white mb-2">Pre‑Aggregation Filters (WHERE)</h3>
              {filters.map((f) => (
                <div key={f.id} className="flex items-start space-x-2 mb-2">
                  <input
                    type="text"
                    value={f.expression}
                    onChange={(e) => updateFilter(f.id, e.target.value)}
                    placeholder="e.g., amount > 100"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => removeFilter(f.id)}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addFilter}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Filter</span>
              </button>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Percentile Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as 'continuous' | 'discrete')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="continuous">Continuous (percentile_cont)</option>
                  <option value="discrete">Discrete (percentile_disc)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Continuous interpolates between values; discrete returns an actual value from the data.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Output Table Name
                </label>
                <input
                  type="text"
                  value={outputTable}
                  onChange={(e) => setOutputTable(e.target.value)}
                  placeholder="percentile_output"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Limit Rows</label>
                  <input
                    type="number"
                    min="0"
                    value={limit || ''}
                    onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="No limit"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={distinct}
                      onChange={(e) => setDistinct(e.target.checked)}
                      className="rounded border-gray-600 text-blue-500"
                    />
                    <span className="text-sm text-gray-300">SELECT DISTINCT</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Schema Preview */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Output Schema Preview ({outputColumns.length} columns)</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
              {outputColumns.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No output columns defined</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {outputColumns.map((col, idx) => (
                    <div key={idx} className="text-gray-300 bg-gray-700 px-2 py-1 rounded truncate" title={col}>
                      {col}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};