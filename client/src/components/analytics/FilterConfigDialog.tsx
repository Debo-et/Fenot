// src/components/analytics/FilterConfigDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Filter,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import {
  FilterConfig,
  FilterRule,
  FilterOperator,
} from '../../types/analytics-configs';

interface FilterConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<FilterConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: FilterConfig) => void;
}

const defaultRule: FilterRule = {
  id: crypto.randomUUID(),
  column: '',
  operator: '=',
  value: '',
};

const defaultConfig: FilterConfig = {
  logicalOperator: 'AND',
  conditions: [],
  outputColumns: [],
  options: {
    limit: undefined,
    caseSensitive: false,
    parameterize: false,
    nullHandling: 'include',
  },
};

export const FilterConfigDialog: React.FC<FilterConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const inputColumns = initialMetadata.inputSchema || [];

  // Main state – options can be undefined (as per FilterConfig)
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>(
    initialMetadata.logicalOperator || defaultConfig.logicalOperator
  );
  const [conditions, setConditions] = useState<FilterRule[]>(
    initialMetadata.conditions?.length
      ? initialMetadata.conditions.map(c => ({ ...c, id: c.id || crypto.randomUUID() }))
      : []
  );
  const [outputColumns, setOutputColumns] = useState<string[]>(
    initialMetadata.outputColumns || []
  );
  const [options, setOptions] = useState<FilterConfig['options']>(
    initialMetadata.options || defaultConfig.options
  );

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    rules: true,
    output: true,
    advanced: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with incoming metadata
  useEffect(() => {
    setLogicalOperator(initialMetadata.logicalOperator || defaultConfig.logicalOperator);
    setConditions(
      initialMetadata.conditions?.length
        ? initialMetadata.conditions.map(c => ({ ...c, id: c.id || crypto.randomUUID() }))
        : []
    );
    setOutputColumns(initialMetadata.outputColumns || []);
    setOptions(initialMetadata.options || defaultConfig.options);
  }, [initialMetadata]);

  const addRule = () => {
    setConditions([...conditions, { ...defaultRule, id: crypto.randomUUID() }]);
  };

  const removeRule = (id: string) => {
    setConditions(conditions.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<FilterRule>) => {
    setConditions(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const toggleAllOutputColumns = (checked: boolean) => {
    if (checked) {
      setOutputColumns(inputColumns.map(col => col.name));
    } else {
      setOutputColumns([]);
    }
  };

  const handleSave = () => {
    // Validate: at least one rule with column and valid operator/value
    const validConditions = conditions.filter(
      c => c.column && c.operator
    );
    if (validConditions.length === 0) {
      alert('Please add at least one valid filter condition.');
      return;
    }

    const config: FilterConfig = {
      logicalOperator,
      conditions: validConditions,
      outputColumns,
      options,
    };
    onSave(config);
    onClose();
  };

  // Helper to generate SQL preview
  const generateSQLPreview = (): string => {
    const columnMap = inputColumns.reduce<Record<string, string>>((acc, col) => {
      acc[col.name] = col.type;
      return acc;
    }, {});
    const parts = conditions
      .filter(c => c.column && c.operator)
      .map(c => {
        const col = `"${c.column}"`;
        const op = c.operator;
        // Format value based on column type (simple heuristic)
        const colType = columnMap[c.column]?.toLowerCase() || '';
        const isString = ['string', 'text', 'varchar', 'char'].some(t => colType.includes(t));

        switch (op) {
          case 'IS NULL':
          case 'IS NOT NULL':
            return `${col} ${op}`;
          case 'IN':
          case 'NOT IN': {
            if (Array.isArray(c.value)) {
              const list = (c.value as any[]).map(v => (isString ? `'${v}'` : v)).join(', ');
              return `${col} ${op} (${list})`;
            }
            return `${col} ${op} (${c.value})`;
          }
          case 'BETWEEN': {
            const v1 = isString ? `'${c.value}'` : c.value;
            const v2 = isString ? `'${c.value2}'` : c.value2;
            return `${col} ${op} ${v1} AND ${v2}`;
          }
          default: {
            const formatted = isString ? `'${c.value}'` : c.value;
            return `${col} ${op} ${formatted}`;
          }
        }
      });

    if (parts.length === 0) return '-- No conditions --';
    if (parts.length === 1) return `WHERE ${parts[0]}`;
    return `WHERE ${parts.join(`\n  ${logicalOperator} `)}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Configure Filter</h2>
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
          {/* Rules Section */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('rules')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">Filter Rules</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                  {conditions.length}
                </span>
              </div>
              {sections.rules ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {sections.rules && (
              <div className="p-3 space-y-3 bg-gray-800/50">
                {/* Logical operator selector */}
                <div className="flex items-center space-x-4 pb-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Combine rules with:</span>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      value="AND"
                      checked={logicalOperator === 'AND'}
                      onChange={(e) => setLogicalOperator(e.target.value as 'AND')}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200">AND</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      value="OR"
                      checked={logicalOperator === 'OR'}
                      onChange={(e) => setLogicalOperator(e.target.value as 'OR')}
                      className="text-green-500"
                    />
                    <span className="text-sm text-gray-200">OR</span>
                  </label>
                </div>

                {/* Rules list */}
                {conditions.map((rule) => (
                  <div key={rule.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                      title="Remove rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-12 gap-2 items-start">
                      {/* Column select */}
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-400 mb-1">Column</label>
                        <select
                          value={rule.column}
                          onChange={(e) => updateRule(rule.id, { column: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                        >
                          <option value="">Select column</option>
                          {inputColumns.map(col => (
                            <option key={col.name} value={col.name}>
                              {col.name} ({col.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operator select */}
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Operator</label>
                        <select
                          value={rule.operator}
                          onChange={(e) => updateRule(rule.id, { operator: e.target.value as FilterOperator })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                        >
                          <option value="=">=</option>
                          <option value="!=">!=</option>
                          <option value="<">{'<'}</option>
                          <option value=">">{'>'}</option>
                          <option value="<=">{'<='}</option>
                          <option value=">=">{'>='}</option>
                          <option value="LIKE">LIKE</option>
                          <option value="NOT LIKE">NOT LIKE</option>
                          <option value="IN">IN</option>
                          <option value="NOT IN">NOT IN</option>
                          <option value="IS NULL">IS NULL</option>
                          <option value="IS NOT NULL">IS NOT NULL</option>
                          <option value="BETWEEN">BETWEEN</option>
                        </select>
                      </div>

                      {/* Value input(s) – conditional */}
                      <div className="col-span-7">
                        <label className="block text-xs text-gray-400 mb-1">Value</label>
                        {rule.operator === 'IS NULL' || rule.operator === 'IS NOT NULL' ? (
                          <div className="h-9 flex items-center text-sm text-gray-400 italic">
                            No value needed
                          </div>
                        ) : rule.operator === 'IN' || rule.operator === 'NOT IN' ? (
                          <input
                            type="text"
                            value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value || ''}
                            onChange={(e) => {
                              const vals = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                              updateRule(rule.id, { value: vals });
                            }}
                            placeholder="value1, value2, ..."
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                          />
                        ) : rule.operator === 'BETWEEN' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={rule.value || ''}
                              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                              placeholder="lower"
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                            />
                            <span className="text-gray-400">and</span>
                            <input
                              type="text"
                              value={rule.value2 || ''}
                              onChange={(e) => updateRule(rule.id, { value2: e.target.value })}
                              placeholder="upper"
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={rule.value || ''}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            placeholder="value"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add rule button */}
                <button
                  onClick={addRule}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Rule</span>
                </button>

                {/* SQL Preview */}
                <div className="mt-4 p-3 bg-gray-900 border border-gray-700 rounded-md">
                  <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-medium">SQL Preview</span>
                  </div>
                  <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                    {generateSQLPreview()}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Output Columns Section */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('output')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Output Columns</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                  {outputColumns.length} / {inputColumns.length}
                </span>
              </div>
              {sections.output ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {sections.output && (
              <div className="p-3 bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Select columns to include in output</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleAllOutputColumns(true)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => toggleAllOutputColumns(false)}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {inputColumns.map(col => (
                    <label key={col.name} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={outputColumns.includes(col.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOutputColumns([...outputColumns, col.name]);
                          } else {
                            setOutputColumns(outputColumns.filter(c => c !== col.name));
                          }
                        }}
                        className="rounded border-gray-600 text-blue-500"
                      />
                      <span className="text-sm text-gray-300 truncate" title={col.name}>
                        {col.name}
                      </span>
                    </label>
                  ))}
                </div>
                {outputColumns.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No columns selected – all columns will be passed through.</p>
                )}
              </div>
            )}
          </div>

          {/* Advanced Options Section */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('advanced')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Advanced Options</span>
              </div>
              {sections.advanced ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {sections.advanced && (
              <div className="p-3 bg-gray-800/50 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Limit rows</label>
                    <input
                      type="number"
                      min="0"
                      value={options?.limit ?? ''}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          limit: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="No limit"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Null handling</label>
                    <select
                      value={options?.nullHandling ?? 'include'}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          nullHandling: e.target.value as 'include' | 'exclude',
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm"
                    >
                      <option value="include">Include NULLs</option>
                      <option value="exclude">Exclude NULLs</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options?.caseSensitive ?? false}
                      onChange={(e) =>
                        setOptions({ ...options, caseSensitive: e.target.checked })
                      }
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-300">Case‑sensitive string comparison</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options?.parameterize ?? false}
                      onChange={(e) =>
                        setOptions({ ...options, parameterize: e.target.checked })
                      }
                      className="rounded border-gray-600 text-purple-500"
                    />
                    <span className="text-sm text-gray-300">Use parameterized query (prepared statement)</span>
                  </label>
                </div>
              </div>
            )}
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