import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Hash,
  Calculator,
  Eye,
  Search,
  Sigma,
  Activity,
  Percent,
  Minus,
  Maximize2,
} from 'lucide-react';
import { StatisticalSummaryConfig, FilterCondition } from '../../types/analytics-configs';

interface StatisticalSummaryConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<StatisticalSummaryConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: StatisticalSummaryConfig) => void;
}

const defaultStatistics = {
  count: true,
  sum: true,
  avg: true,
  min: true,
  max: true,
  stddev: false,
  variance: false,
  skewness: false,
  kurtosis: false,
  median: false,
  percentiles: [] as number[],
};

const defaultFilter: FilterCondition = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
};

export const StatisticalSummaryConfigDialog: React.FC<StatisticalSummaryConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];

  // Form state
  const [columns, setColumns] = useState<string[]>(initialMetadata.columns || []);
  const [statistics, setStatistics] = useState(initialMetadata.statistics || defaultStatistics);
  const [groupBy, setGroupBy] = useState<string[]>(initialMetadata.groupBy || []);
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [outputTable, setOutputTable] = useState(initialMetadata.outputTable || 'statistical_summary');
  const [options, setOptions] = useState({
    decimalPlaces: initialMetadata.options?.decimalPlaces ?? 2,
    includeNulls: initialMetadata.options?.includeNulls ?? false,
    distinct: initialMetadata.options?.distinct ?? false,
    limit: initialMetadata.options?.limit,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [percentileInput, setPercentileInput] = useState(
    statistics.percentiles?.map(p => p * 100).join(', ') || ''
  );

  // Sync with initialMetadata
  useEffect(() => {
    setColumns(initialMetadata.columns || []);
    setStatistics(initialMetadata.statistics || defaultStatistics);
    setGroupBy(initialMetadata.groupBy || []);
    setFilters(initialMetadata.filters || []);
    setOutputTable(initialMetadata.outputTable || 'statistical_summary');
    setOptions({
      decimalPlaces: initialMetadata.options?.decimalPlaces ?? 2,
      includeNulls: initialMetadata.options?.includeNulls ?? false,
      distinct: initialMetadata.options?.distinct ?? false,
      limit: initialMetadata.options?.limit,
    });
    setPercentileInput(initialMetadata.statistics?.percentiles?.map(p => p * 100).join(', ') || '');
  }, [initialMetadata]);

  const filteredColumns = useMemo(() => {
    return availableColumns.filter(col =>
      col.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableColumns, searchTerm]);

  const handlePercentileChange = (value: string) => {
    setPercentileInput(value);
    const parts = value.split(',').map(s => parseFloat(s.trim()) / 100).filter(n => !isNaN(n) && n >= 0 && n <= 1);
    setStatistics(prev => ({ ...prev, percentiles: parts }));
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

  const handleSave = () => {
    onSave({
      columns: columns.length ? columns : undefined,
      statistics,
      groupBy: groupBy.length ? groupBy : undefined,
      filters: filters.length ? filters : undefined,
      outputTable: outputTable || undefined,
      options,
    });
    onClose();
  };

  if (!open) return null;

  // Output schema preview
  const outputColumns = useMemo(() => {
    const cols: string[] = [];
    if (groupBy.length) cols.push(...groupBy);
    if (columns.length) {
      columns.forEach(col => {
        if (statistics.count) cols.push(`${col}_count`);
        if (statistics.sum) cols.push(`${col}_sum`);
        if (statistics.avg) cols.push(`${col}_avg`);
        if (statistics.min) cols.push(`${col}_min`);
        if (statistics.max) cols.push(`${col}_max`);
        if (statistics.stddev) cols.push(`${col}_stddev`);
        if (statistics.variance) cols.push(`${col}_variance`);
        if (statistics.skewness) cols.push(`${col}_skewness`);
        if (statistics.kurtosis) cols.push(`${col}_kurtosis`);
        if (statistics.median) cols.push(`${col}_median`);
        if (statistics.percentiles?.length) {
          statistics.percentiles.forEach(p => {
            cols.push(`${col}_p${Math.round(p * 100)}`);
          });
        }
      });
    } else {
      // If no columns selected, show generic placeholders
      cols.push('... (all numeric columns)');
    }
    return cols;
  }, [columns, statistics, groupBy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Sigma className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Statistical Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Global column search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Columns to analyze */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Columns to Analyze (leave empty for all numeric columns)
            </label>
            <select
              multiple
              value={columns}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                setColumns(selected);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {filteredColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Hold Ctrl to select multiple</p>
          </div>

          {/* Statistics */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Statistics</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-800 p-3 rounded-md border border-gray-700">
              {[
                { key: 'count', label: 'Count', icon: <Hash className="h-4 w-4" /> },
                { key: 'sum', label: 'Sum', icon: <Calculator className="h-4 w-4" /> },
                { key: 'avg', label: 'Average', icon: <Activity className="h-4 w-4" /> },
                { key: 'min', label: 'Minimum', icon: <Minus className="h-4 w-4" /> },
                { key: 'max', label: 'Maximum', icon: <Maximize2 className="h-4 w-4" /> },
                { key: 'stddev', label: 'StdDev', icon: <Sigma className="h-4 w-4" /> },
                { key: 'variance', label: 'Variance', icon: <Activity className="h-4 w-4" /> },
                { key: 'skewness', label: 'Skewness', icon: <Activity className="h-4 w-4" /> },
                { key: 'kurtosis', label: 'Kurtosis', icon: <Activity className="h-4 w-4" /> },
                { key: 'median', label: 'Median', icon: <Percent className="h-4 w-4" /> },
              ].map(stat => (
                <label key={stat.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statistics[stat.key as keyof typeof statistics] as boolean}
                    onChange={(e) => setStatistics(prev => ({ ...prev, [stat.key]: e.target.checked }))}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-300 flex items-center space-x-1">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Percentiles */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Percentiles (comma‑separated, e.g. 25, 50, 75)
              </label>
              <input
                type="text"
                value={percentileInput}
                onChange={(e) => handlePercentileChange(e.target.value)}
                placeholder="e.g., 25, 50, 75, 90, 95"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Group By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Group By (dimensions)</label>
            <select
              multiple
              value={groupBy}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                setGroupBy(selected);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {filteredColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Filters (WHERE)</label>
              <button
                onClick={addFilter}
                className="flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
              >
                <Plus className="h-3 w-3" />
                <span>Add Filter</span>
              </button>
            </div>
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-start space-x-2">
                <input
                  type="text"
                  value={filter.expression}
                  onChange={(e) => updateFilter(filter.id, e.target.value)}
                  placeholder="e.g., amount > 100"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                />
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {filters.length === 0 && (
              <p className="text-gray-500 text-sm italic">No filters – all rows will be included</p>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-3 p-3 bg-gray-800/50 rounded-md border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 flex items-center space-x-1">
              <Calculator className="h-4 w-4" />
              <span>Advanced Options</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Decimal Places</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={options.decimalPlaces}
                  onChange={(e) => setOptions({ ...options, decimalPlaces: parseInt(e.target.value) || 2 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Limit Rows</label>
                <input
                  type="number"
                  min="0"
                  value={options.limit || ''}
                  onChange={(e) => setOptions({ ...options, limit: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="No limit"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeNulls}
                  onChange={(e) => setOptions({ ...options, includeNulls: e.target.checked })}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-300">Include null counts in summary</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.distinct}
                  onChange={(e) => setOptions({ ...options, distinct: e.target.checked })}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-300">Select DISTINCT rows (before aggregation)</span>
              </label>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Output Table Name (optional)</label>
              <input
                type="text"
                value={outputTable}
                onChange={(e) => setOutputTable(e.target.value)}
                placeholder="statistical_summary"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>

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