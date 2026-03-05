// src/components/analytics/CorrelationConfigDialog.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Activity,
  Eye,
  ChevronDown,
  ChevronRight,
  Filter,
  Sliders,
} from 'lucide-react';
import { CorrelationConfig } from '../../types/analytics-configs';

interface CorrelationConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<CorrelationConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: CorrelationConfig) => void;
}

const defaultConfig: CorrelationConfig = {
  columns: [],
  method: 'pearson',
  missingHandling: 'pairwise',
  outputFormat: 'pairs',
  includePValues: false,
  alias: 'correlation_output',
};

export const CorrelationConfigDialog: React.FC<CorrelationConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = useMemo(
    () => initialMetadata.inputSchema || [],
    [initialMetadata.inputSchema]
  );

  // Only numeric columns are eligible for correlation
  const numericColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );

  // Form state – with explicit boolean cast to satisfy TypeScript
  const [columns, setColumns] = useState<string[]>(initialMetadata.columns || []);
  const [method, setMethod] = useState<CorrelationConfig['method']>(
    initialMetadata.method || defaultConfig.method
  );
  const [missingHandling, setMissingHandling] = useState<CorrelationConfig['missingHandling']>(
    initialMetadata.missingHandling || defaultConfig.missingHandling
  );
  const [outputFormat, setOutputFormat] = useState<CorrelationConfig['outputFormat']>(
    initialMetadata.outputFormat || defaultConfig.outputFormat
  );
  const [includePValues, setIncludePValues] = useState<boolean>(
    (initialMetadata.includePValues ?? defaultConfig.includePValues) as boolean
  );
  const [pValueThreshold, setPValueThreshold] = useState<number | undefined>(
    initialMetadata.pValueThreshold
  );
  const [alias, setAlias] = useState<string>(initialMetadata.alias || defaultConfig.alias!);

  // UI sections
  const [sections, setSections] = useState({
    basic: true,
    advanced: false,
    preview: true,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setColumns(initialMetadata.columns || []);
    setMethod(initialMetadata.method || defaultConfig.method);
    setMissingHandling(initialMetadata.missingHandling || defaultConfig.missingHandling);
    setOutputFormat(initialMetadata.outputFormat || defaultConfig.outputFormat);

    // ✅ Cast to boolean to avoid 'undefined' type error
    setIncludePValues((initialMetadata.includePValues ?? defaultConfig.includePValues) as boolean);

    setPValueThreshold(initialMetadata.pValueThreshold);
    setAlias(initialMetadata.alias || defaultConfig.alias!);
  }, [initialMetadata]);

  const handleSave = () => {
    if (columns.length < 2) {
      alert('Please select at least two numeric columns for correlation.');
      return;
    }

    const config: CorrelationConfig = {
      columns,
      method,
      missingHandling,
      outputFormat,
      includePValues,
      pValueThreshold: includePValues ? pValueThreshold : undefined,
      alias: alias || undefined,
    };

    onSave(config);
    onClose();
  };

  if (!open) return null;

  // Helper to toggle column selection
  const toggleColumn = (colName: string) => {
    setColumns(prev =>
      prev.includes(colName)
        ? prev.filter(c => c !== colName)
        : [...prev, colName]
    );
  };

  // Preview output schema based on configuration
  const outputColumns = useMemo(() => {
    if (outputFormat === 'matrix') {
      // Matrix: one column per selected column (plus maybe p‑value columns)
      const cols: string[] = [];
      columns.forEach(c1 => {
        columns.forEach(c2 => {
          if (c1 === c2) return; // diagonal (corr = 1) might be omitted
          cols.push(`${c1}_${c2}_corr`);
          if (includePValues) cols.push(`${c1}_${c2}_pval`);
        });
      });
      return cols;
    } else {
      // Pairs: three columns (col1, col2, correlation) + optional p‑value
      return ['col1', 'col2', 'correlation', ...(includePValues ? ['p_value'] : [])];
    }
  }, [columns, outputFormat, includePValues]);

  const SectionHeader = ({
    title,
    icon,
    sectionKey,
  }: {
    title: string;
    icon: React.ReactNode;
    sectionKey: keyof typeof sections;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-2 text-gray-200">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      {sections[sectionKey] ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Correlation Analysis</h2>
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
              {/* Column Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Numeric Columns <span className="text-red-400">* (select at least 2)</span>
                </label>
                <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-40 overflow-y-auto">
                  {numericColumns.length === 0 ? (
                    <p className="text-gray-500 text-sm">No numeric columns available.</p>
                  ) : (
                    numericColumns.map(col => (
                      <label key={col.name} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={columns.includes(col.name)}
                          onChange={() => toggleColumn(col.name)}
                          className="rounded border-gray-600 text-blue-500"
                        />
                        <span className="text-sm text-gray-200">{col.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({col.type})</span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {columns.length} column{columns.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Correlation Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Method</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as CorrelationConfig['method'])}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="pearson">Pearson (parametric)</option>
                  <option value="spearman">Spearman (rank)</option>
                  <option value="kendall">Kendall (tau)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Spearman and Kendall require custom SQL; only Pearson is currently implemented.
                </p>
              </div>

              {/* Missing Handling */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Missing Values</label>
                <select
                  value={missingHandling}
                  onChange={e => setMissingHandling(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="pairwise">Pairwise (omit only pairs with nulls)</option>
                  <option value="listwise">Listwise (omit entire row if any column null)</option>
                  <option value="omit">Omit all nulls (same as pairwise)</option>
                </select>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Output Format</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="pairs"
                      checked={outputFormat === 'pairs'}
                      onChange={() => setOutputFormat('pairs')}
                      className="text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Pairs (col1, col2, corr)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="matrix"
                      checked={outputFormat === 'matrix'}
                      onChange={() => setOutputFormat('matrix')}
                      className="text-blue-500"
                    />
                    <span className="text-sm text-gray-200">Matrix (pivoted)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <SectionHeader title="Advanced" icon={<Filter className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* Include P‑Values */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includePValues}
                  onChange={e => setIncludePValues(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500"
                />
                <span className="text-sm text-gray-200">Include p‑values (significance test)</span>
              </label>

              {includePValues && (
                <div className="ml-6">
                  <label className="block text-xs text-gray-400 mb-1">P‑value threshold (optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={pValueThreshold || ''}
                    onChange={e => setPValueThreshold(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g., 0.05"
                    className="w-32 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If set, only correlations with p‑value ≤ threshold are returned.
                  </p>
                </div>
              )}

              {/* Alias */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Output Alias (optional)</label>
                <input
                  type="text"
                  value={alias}
                  onChange={e => setAlias(e.target.value)}
                  placeholder="correlation_output"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Output Schema Preview */}
          <SectionHeader title="Output Schema Preview" icon={<Eye className="h-4 w-4" />} sectionKey="preview" />
          {sections.preview && (
            <div className="pl-2 border-l-2 border-gray-700">
              <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
                {outputColumns.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Select columns to see preview</p>
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
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};