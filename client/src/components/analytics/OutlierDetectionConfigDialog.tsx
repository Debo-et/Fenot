// src/components/analytics/OutlierDetectionConfigDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Filter,
  Layers,
  Settings,
  Eye,
  AlertTriangle,
  Hash,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// ----------------------------------------------------------------------
// Types for outlier detection configuration (to be moved to analytics-configs.ts)
// ----------------------------------------------------------------------

export type OutlierMethod = 'zscore' | 'iqr' | 'modified_zscore' | 'percentile';

export interface TargetColumnConfig {
  id: string;
  column: string;
  method?: OutlierMethod;            // override global method
  threshold?: number;                 // e.g., 3 for zscore, 1.5 for iqr
  lowerPercentile?: number;           // for percentile method
  upperPercentile?: number;
  useMAD?: boolean;                   // for modified zscore (median absolute deviation)
}

export interface OutlierDetectionConfig {
  targetColumns: TargetColumnConfig[];
  method: OutlierMethod;               // global method (used if per‑column not set)
  threshold: number;                    // global threshold (zscore, iqr multiplier)
  percentileRange?: { lower: number; upper: number }; // for percentile method
  groupBy?: string[];                    // columns to group statistics
  action: 'flag' | 'filter' | 'stats';   // what to do with outliers
  keepOutliers?: boolean;                 // for filter action: true = keep outliers, false = keep normal
  flagColumnName?: string;                // for flag action
  handleNulls?: 'ignore' | 'treat_as_outlier' | 'treat_as_normal';
  options?: {
    decimalPlaces?: number;
    limit?: number;
    distinct?: boolean;
  };
}

// ----------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------

interface OutlierDetectionConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<OutlierDetectionConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: OutlierDetectionConfig) => void;
}

// ----------------------------------------------------------------------
// Default values
// ----------------------------------------------------------------------

const defaultTargetColumn = (): TargetColumnConfig => ({
  id: crypto.randomUUID(),
  column: '',
  method: undefined,
  threshold: undefined,
});

const defaultConfig: OutlierDetectionConfig = {
  targetColumns: [],
  method: 'zscore',
  threshold: 3,
  percentileRange: { lower: 5, upper: 95 },
  groupBy: [],
  action: 'flag',
  keepOutliers: true,
  flagColumnName: 'is_outlier',
  handleNulls: 'ignore',
  options: {
    decimalPlaces: 2,
    limit: undefined,
    distinct: false,
  },
};

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

export const OutlierDetectionConfigDialog: React.FC<OutlierDetectionConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];
  // Only numeric columns can be used for outlier detection (target columns)
  const numericColumns = availableColumns.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  );
  // All columns can be used for grouping
  const allColumnNames = availableColumns.map(col => col.name);

  // Form state
  const [targetColumns, setTargetColumns] = useState<TargetColumnConfig[]>(
    initialMetadata.targetColumns || []
  );
  const [method, setMethod] = useState<OutlierMethod>(initialMetadata.method || defaultConfig.method);
  const [threshold, setThreshold] = useState<number>(initialMetadata.threshold ?? defaultConfig.threshold);
  const [percentileLower, setPercentileLower] = useState<number>(
    initialMetadata.percentileRange?.lower ?? defaultConfig.percentileRange!.lower
  );
  const [percentileUpper, setPercentileUpper] = useState<number>(
    initialMetadata.percentileRange?.upper ?? defaultConfig.percentileRange!.upper
  );
  const [groupBy, setGroupBy] = useState<string[]>(initialMetadata.groupBy || []);
  const [action, setAction] = useState<'flag' | 'filter' | 'stats'>(
    initialMetadata.action || defaultConfig.action
  );
  const [keepOutliers, setKeepOutliers] = useState<boolean>(
  initialMetadata.keepOutliers ?? defaultConfig.keepOutliers ?? true
);

// In the useEffect sync block:
setKeepOutliers(initialMetadata.keepOutliers ?? defaultConfig.keepOutliers ?? true);
  const [flagColumnName, setFlagColumnName] = useState<string>(
    initialMetadata.flagColumnName || defaultConfig.flagColumnName!
  );
  const [handleNulls, setHandleNulls] = useState<'ignore' | 'treat_as_outlier' | 'treat_as_normal'>(
    initialMetadata.handleNulls || defaultConfig.handleNulls!
  );
  const [decimalPlaces, setDecimalPlaces] = useState<number>(
    initialMetadata.options?.decimalPlaces ?? defaultConfig.options!.decimalPlaces!
  );
  const [limit, setLimit] = useState<number | undefined>(
    initialMetadata.options?.limit ?? defaultConfig.options!.limit
  );
  const [distinct, setDistinct] = useState<boolean>(
    initialMetadata.options?.distinct ?? defaultConfig.options!.distinct!
  );

  // UI state for collapsible sections
  const [sections, setSections] = useState({
    targetColumns: true,
    globalMethod: false,
    grouping: false,
    outputAction: false,
    advanced: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes (e.g., different node selected)
useEffect(() => {
  setTargetColumns(initialMetadata.targetColumns || []);
  setMethod(initialMetadata.method || defaultConfig.method);
  setThreshold(initialMetadata.threshold ?? defaultConfig.threshold);
  setPercentileLower(initialMetadata.percentileRange?.lower ?? defaultConfig.percentileRange!.lower);
  setPercentileUpper(initialMetadata.percentileRange?.upper ?? defaultConfig.percentileRange!.upper);
  setGroupBy(initialMetadata.groupBy || []);
  setAction(initialMetadata.action || defaultConfig.action);
  setKeepOutliers(initialMetadata.keepOutliers ?? defaultConfig.keepOutliers ?? true);
  setFlagColumnName(initialMetadata.flagColumnName || defaultConfig.flagColumnName!);
  setHandleNulls(initialMetadata.handleNulls ?? defaultConfig.handleNulls!);
  setDecimalPlaces(initialMetadata.options?.decimalPlaces ?? defaultConfig.options!.decimalPlaces!);
  setLimit(initialMetadata.options?.limit ?? defaultConfig.options!.limit);
  setDistinct(initialMetadata.options?.distinct ?? defaultConfig.options!.distinct!);
}, [initialMetadata]);

  const handleSave = () => {
    if (targetColumns.length === 0) {
      alert('Please add at least one target column for outlier detection.');
      return;
    }

    const config: OutlierDetectionConfig = {
      targetColumns,
      method,
      threshold,
      percentileRange: method === 'percentile' ? { lower: percentileLower, upper: percentileUpper } : undefined,
      groupBy: groupBy.length > 0 ? groupBy : undefined,
      action,
      keepOutliers: action === 'filter' ? keepOutliers : undefined,
      flagColumnName: action === 'flag' ? flagColumnName : undefined,
      handleNulls,
      options: {
        decimalPlaces,
        limit,
        distinct,
      },
    };
    onSave(config);
    onClose();
  };

  const addTargetColumn = () => {
    setTargetColumns([...targetColumns, defaultTargetColumn()]);
  };

  const removeTargetColumn = (id: string) => {
    setTargetColumns(targetColumns.filter(tc => tc.id !== id));
  };

  const updateTargetColumn = (id: string, updater: Partial<TargetColumnConfig>) => {
    setTargetColumns(targetColumns.map(tc => (tc.id === id ? { ...tc, ...updater } : tc)));
  };

  const addGroupByColumn = (col: string) => {
    if (!groupBy.includes(col)) {
      setGroupBy([...groupBy, col]);
    }
  };

  const removeGroupByColumn = (col: string) => {
    setGroupBy(groupBy.filter(g => g !== col));
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Configure Outlier Detection</h2>
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
          {/* Target Columns Section */}
          <SectionHeader title="Target Columns" icon={<Hash className="h-4 w-4" />} sectionKey="targetColumns" />
          {sections.targetColumns && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <p className="text-xs text-gray-400">Select numeric columns to analyze for outliers. You can override method/parameters per column.</p>
              {targetColumns.map((tc) => (
                <div key={tc.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                  <button
                    onClick={() => removeTargetColumn(tc.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Column</label>
                      <select
                        value={tc.column}
                        onChange={(e) => updateTargetColumn(tc.id, { column: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="">Select column</option>
                        {numericColumns.map(col => (
                          <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Method (override)</label>
                      <select
                        value={tc.method || ''}
                        onChange={(e) => updateTargetColumn(tc.id, { method: e.target.value as OutlierMethod || undefined })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="">Use global method</option>
                        <option value="zscore">Z‑Score</option>
                        <option value="iqr">IQR</option>
                        <option value="modified_zscore">Modified Z‑Score</option>
                        <option value="percentile">Percentile</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Threshold (override)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tc.threshold ?? ''}
                        onChange={(e) => updateTargetColumn(tc.id, { threshold: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="Global"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    {(tc.method === 'percentile' || (!tc.method && method === 'percentile')) && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Lower %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tc.lowerPercentile ?? percentileLower}
                            onChange={(e) => updateTargetColumn(tc.id, { lowerPercentile: parseInt(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Upper %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tc.upperPercentile ?? percentileUpper}
                            onChange={(e) => updateTargetColumn(tc.id, { upperPercentile: parseInt(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                      </>
                    )}
                    {tc.method === 'modified_zscore' && (
                      <div className="md:col-span-2 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`useMAD-${tc.id}`}
                          checked={tc.useMAD ?? true}
                          onChange={(e) => updateTargetColumn(tc.id, { useMAD: e.target.checked })}
                          className="rounded border-gray-600 text-orange-500"
                        />
                        <label htmlFor={`useMAD-${tc.id}`} className="text-xs text-gray-300">Use MAD (Median Absolute Deviation)</label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={addTargetColumn}
                className="flex items-center space-x-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Target Column</span>
              </button>
            </div>
          )}

          {/* Global Method & Parameters Section */}
          <SectionHeader title="Global Method & Parameters" icon={<Settings className="h-4 w-4" />} sectionKey="globalMethod" />
          {sections.globalMethod && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as OutlierMethod)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  >
                    <option value="zscore">Z‑Score</option>
                    <option value="iqr">IQR (Tukey's fences)</option>
                    <option value="modified_zscore">Modified Z‑Score</option>
                    <option value="percentile">Percentile‑based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {method === 'zscore' ? 'Number of standard deviations' : method === 'iqr' ? 'IQR multiplier' : method === 'percentile' ? 'Percentile range used below' : 'Threshold for modified Z‑score'}
                  </p>
                </div>
                {method === 'percentile' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Lower Percentile</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentileLower}
                        onChange={(e) => setPercentileLower(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Upper Percentile</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentileUpper}
                        onChange={(e) => setPercentileUpper(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </>
                )}
                {method === 'modified_zscore' && (
                  <div className="col-span-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="globalUseMAD"
                      checked={true} // fixed for now, can be extended
                      disabled
                      className="rounded border-gray-600 text-orange-500 opacity-50"
                    />
                    <label htmlFor="globalUseMAD" className="text-xs text-gray-500">Use MAD (always on for modified Z‑score)</label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grouping Section */}
          <SectionHeader title="Grouping (Optional)" icon={<Layers className="h-4 w-4" />} sectionKey="grouping" />
          {sections.grouping && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <p className="text-xs text-gray-400">Group by these columns to detect outliers within each group (statistics computed per group).</p>
              <div className="flex flex-wrap gap-2">
                {groupBy.map(col => (
                  <span key={col} className="inline-flex items-center space-x-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-sm text-gray-300">
                    <span>{col}</span>
                    <button onClick={() => removeGroupByColumn(col)} className="ml-1 text-gray-500 hover:text-red-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => addGroupByColumn(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
              >
                <option value="">Add group by column...</option>
                {allColumnNames.filter(col => !groupBy.includes(col)).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {/* Output Action Section */}
          <SectionHeader title="Output Action" icon={<Filter className="h-4 w-4" />} sectionKey="outputAction" />
          {sections.outputAction && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="flag"
                    checked={action === 'flag'}
                    onChange={() => setAction('flag')}
                    className="text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Add outlier flag column</span>
                </label>
                {action === 'flag' && (
                  <div className="ml-6">
                    <label className="block text-xs text-gray-400 mb-1">Flag column name</label>
                    <input
                      type="text"
                      value={flagColumnName}
                      onChange={(e) => setFlagColumnName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="filter"
                    checked={action === 'filter'}
                    onChange={() => setAction('filter')}
                    className="text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Filter rows</span>
                </label>
                {action === 'filter' && (
                  <div className="ml-6 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={keepOutliers}
                        onChange={() => setKeepOutliers(true)}
                        className="text-orange-500"
                      />
                      <span className="text-sm text-gray-200">Keep only outliers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={!keepOutliers}
                        onChange={() => setKeepOutliers(false)}
                        className="text-orange-500"
                      />
                      <span className="text-sm text-gray-200">Keep only normal (non‑outlier) rows</span>
                    </label>
                  </div>
                )}

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="stats"
                    checked={action === 'stats'}
                    onChange={() => setAction('stats')}
                    className="text-orange-500"
                  />
                  <span className="text-sm text-gray-200">Output outlier statistics (summary)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Null handling</label>
                <select
                  value={handleNulls}
                  onChange={(e) => setHandleNulls(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                >
                  <option value="ignore">Ignore nulls (exclude from outlier calculation)</option>
                  <option value="treat_as_outlier">Treat nulls as outliers</option>
                  <option value="treat_as_normal">Treat nulls as normal</option>
                </select>
              </div>
            </div>
          )}

          {/* Advanced Options Section */}
          <SectionHeader title="Advanced Options" icon={<Settings className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Decimal places</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={decimalPlaces}
                    onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Limit rows</label>
                  <input
                    type="number"
                    min="0"
                    value={limit || ''}
                    onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="No limit"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={distinct}
                  onChange={(e) => setDistinct(e.target.checked)}
                  className="rounded border-gray-600 text-orange-500"
                />
                <span className="text-sm text-gray-300">Select DISTINCT rows</span>
              </label>
            </div>
          )}

          {/* Schema Preview (simplified) */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Output Preview</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-3 text-xs text-gray-400">
              {action === 'flag' && (
                <p>Input columns + <span className="text-orange-400">{flagColumnName}</span> (boolean)</p>
              )}
              {action === 'filter' && (
                <p>Filtered rows ({keepOutliers ? 'outliers only' : 'normal only'}) with all original columns.</p>
              )}
              {action === 'stats' && (
                <p>Statistics per column/group: count, outlier count, percentage, etc.</p>
              )}
              {groupBy.length > 0 && <p>Grouped by: {groupBy.join(', ')}</p>}
              {targetColumns.length > 0 && <p>Analyzing: {targetColumns.map(tc => tc.column).join(', ')}</p>}
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
            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};