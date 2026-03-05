import React, { useState, useEffect } from 'react';
import { X, Save, Sliders } from 'lucide-react';
import { SliceConfig } from '../../types/analytics-configs';

interface SliceConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<SliceConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: SliceConfig) => void;
}

const defaultConfig: SliceConfig = {
  column: '',
  operator: 'IN',
  values: [],
  includeNulls: false,
  caseSensitive: false,
};

export const SliceConfigDialog: React.FC<SliceConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  const categoricalColumns = availableColumns.filter(
    col => ['string', 'text', 'varchar', 'char'].includes(col.type.toLowerCase())
  );

  const [column, setColumn] = useState(initialMetadata.column || defaultConfig.column);
  const [operator, setOperator] = useState(initialMetadata.operator || defaultConfig.operator);
  const [valuesInput, setValuesInput] = useState(
    initialMetadata.values ? initialMetadata.values.join(', ') : ''
  );
  const [includeNulls, setIncludeNulls] = useState(initialMetadata.includeNulls ?? defaultConfig.includeNulls);
  const [caseSensitive, setCaseSensitive] = useState(initialMetadata.caseSensitive ?? defaultConfig.caseSensitive);

  // Parse comma‑separated input into trimmed array
  const parseValues = (input: string): string[] => {
    return input.split(',').map(v => v.trim()).filter(v => v !== '');
  };

  // Validate and save
  const handleSave = () => {
    if (!column) {
      alert('Please select a column to slice on.');
      return;
    }

    const parsedValues = parseValues(valuesInput);
    if (parsedValues.length === 0 && operator !== 'LIKE' && operator !== 'NOT LIKE') {
      alert('Please enter at least one value.');
      return;
    }

    const config: SliceConfig = {
      column,
      operator,
      values: parsedValues,
      includeNulls,
      caseSensitive,
    };
    onSave(config);
    onClose();
  };

  // Sync with initialMetadata when it changes (e.g., different node selected)
  useEffect(() => {
    setColumn(initialMetadata.column || defaultConfig.column);
    setOperator(initialMetadata.operator || defaultConfig.operator);
    setValuesInput(initialMetadata.values ? initialMetadata.values.join(', ') : '');
    setIncludeNulls(initialMetadata.includeNulls ?? defaultConfig.includeNulls);
    setCaseSensitive(initialMetadata.caseSensitive ?? defaultConfig.caseSensitive);
  }, [initialMetadata]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[500px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Slice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Column Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Column <span className="text-red-400">*</span>
            </label>
            <select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              required
            >
              <option value="" disabled>Select a categorical column</option>
              {categoricalColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Operator</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as SliceConfig['operator'])}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            >
              <option value="IN">IN (include any of)</option>
              <option value="NOT IN">NOT IN (exclude any of)</option>
              <option value="=">Equals (=)</option>
              <option value="!=">Not equals (!=)</option>
              <option value="LIKE">LIKE (pattern)</option>
              <option value="NOT LIKE">NOT LIKE (pattern)</option>
            </select>
          </div>

          {/* Values */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {operator === 'IN' || operator === 'NOT IN'
                ? 'Values (comma‑separated)'
                : 'Value'}
            </label>
            <textarea
              value={valuesInput}
              onChange={(e) => setValuesInput(e.target.value)}
              placeholder={operator === 'IN' || operator === 'NOT IN'
                ? 'e.g., North, South, East'
                : 'e.g., North'}
              rows={operator === 'IN' || operator === 'NOT IN' ? 3 : 1}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNulls}
                onChange={(e) => setIncludeNulls(e.target.checked)}
                className="rounded border-gray-600 text-purple-500"
              />
              <span className="text-sm text-gray-300">Include rows where column is NULL</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-gray-600 text-purple-500"
              />
              <span className="text-sm text-gray-300">Case‑sensitive comparison</span>
            </label>
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