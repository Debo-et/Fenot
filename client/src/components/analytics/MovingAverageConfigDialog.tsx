import React, { useState, useEffect } from 'react';
import { X, Save, Filter, Hash, Eye } from 'lucide-react';

interface MovingAverageConfig {
  orderByColumn: string;
  valueColumn: string;
  partitionBy?: string[];
  windowSize: number;
  alias?: string;
  filters?: Array<{ expression: string }>;
  limit?: number;
}

interface MovingAverageConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<MovingAverageConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: MovingAverageConfig) => void;
}

const defaultConfig: MovingAverageConfig = {
  orderByColumn: '',
  valueColumn: '',
  partitionBy: [],
  windowSize: 3,
  alias: 'moving_avg',
  filters: [],
  limit: undefined,
};

export const MovingAverageConfigDialog: React.FC<MovingAverageConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const numericColumns = availableColumns.filter(
    col => ['integer', 'decimal', 'float', 'double', 'number'].includes(col.type.toLowerCase())
  );
  const orderableColumns = availableColumns; // any column can be used for ordering, but typically date/numeric

  const [orderByColumn, setOrderByColumn] = useState(initialMetadata.orderByColumn || defaultConfig.orderByColumn);
  const [valueColumn, setValueColumn] = useState(initialMetadata.valueColumn || defaultConfig.valueColumn);
  const [partitionBy, setPartitionBy] = useState<string[]>(initialMetadata.partitionBy || []);
  const [windowSize, setWindowSize] = useState(initialMetadata.windowSize ?? defaultConfig.windowSize);
  const [alias, setAlias] = useState(initialMetadata.alias || defaultConfig.alias);
  const [filters, setFilters] = useState(initialMetadata.filters || []);
  const [limit, setLimit] = useState(initialMetadata.limit);

  // Sync with incoming initialMetadata when it changes (e.g., different node)
  useEffect(() => {
    setOrderByColumn(initialMetadata.orderByColumn || '');
    setValueColumn(initialMetadata.valueColumn || '');
    setPartitionBy(initialMetadata.partitionBy || []);
    setWindowSize(initialMetadata.windowSize ?? 3);
    setAlias(initialMetadata.alias || 'moving_avg');
    setFilters(initialMetadata.filters || []);
    setLimit(initialMetadata.limit);
  }, [initialMetadata]);

  const handleSave = () => {
    if (!orderByColumn || !valueColumn) {
      alert('Please select both an order column and a value column.');
      return;
    }
    const config: MovingAverageConfig = {
      orderByColumn,
      valueColumn,
      partitionBy: partitionBy.length > 0 ? partitionBy : undefined,
      windowSize,
      alias: alias || 'moving_avg',
      filters,
      limit,
    };
    onSave(config);
    onClose();
  };

  const addFilter = () => {
    setFilters([...filters, { expression: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, expression: string) => {
    const newFilters = [...filters];
    newFilters[index].expression = expression;
    setFilters(newFilters);
  };

  if (!open) return null;

  // Output schema preview
  const outputColumns = [
    ...(partitionBy || []),
    orderByColumn,
    valueColumn,
    alias,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Moving Average</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Order By Column */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Order By Column <span className="text-red-400">*</span>
            </label>
            <select
              value={orderByColumn}
              onChange={(e) => setOrderByColumn(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            >
              <option value="">Select column</option>
              {orderableColumns.map(col => (
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
            >
              <option value="">Select numeric column</option>
              {numericColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
              ))}
            </select>
          </div>

          {/* Partition By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Partition By (optional, for grouped moving averages)
            </label>
            <select
              multiple
              value={partitionBy}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                setPartitionBy(selected);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
            >
              {availableColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple</p>
          </div>

          {/* Window Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Window Size (number of preceding rows)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={windowSize}
              onChange={(e) => setWindowSize(parseInt(e.target.value) || 3)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
          </div>

          {/* Alias */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Output Column Alias
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              placeholder="moving_avg"
            />
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Filters (WHERE)</label>
              <button
                onClick={addFilter}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
              >
                <Filter className="h-3 w-3" />
                <span>Add Filter</span>
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {filters.map((filter, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={filter.expression}
                    onChange={(e) => updateFilter(idx, e.target.value)}
                    placeholder="e.g., amount > 100"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
                  />
                  <button
                    onClick={() => removeFilter(idx)}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Limit Rows (optional)
            </label>
            <input
              type="number"
              min="0"
              value={limit || ''}
              onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
          </div>

          {/* Output Schema Preview */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Output Schema Preview</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-24 overflow-y-auto">
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