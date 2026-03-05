import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sliders,
  Grid,
  Layers,
  Filter,
  Activity,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ClusterConfig, FilterCondition } from '../../types/analytics-configs';

interface ClusterConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<ClusterConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: ClusterConfig) => void;
}

const defaultConfig: ClusterConfig = {
  columns: [],
  method: 'kmeans',
  numberOfClusters: 3,
  distanceMetric: 'euclidean',
  scaling: true,
  scalingMethod: 'standard',
  parameters: {
    maxIterations: 100,
    tolerance: 0.0001,
    initialization: 'kmeans++',
  },
  output: {
    clusterColumn: 'cluster_id',
    includeCentroids: false,
    outputStatistics: false,
    alias: 'clustering_output',
  },
  filters: [],
};

export const ClusterConfigDialog: React.FC<ClusterConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.filter(
    col => ['number', 'integer', 'float', 'double', 'decimal'].includes(col.type.toLowerCase())
  ).map(col => col.name) || [];

  // Basic parameters
  const [columns, setColumns] = useState<string[]>(initialMetadata.columns || defaultConfig.columns);
  const [method, setMethod] = useState(initialMetadata.method || defaultConfig.method);
  const [numberOfClusters, setNumberOfClusters] = useState(
    initialMetadata.numberOfClusters ?? defaultConfig.numberOfClusters
  );
  const [distanceMetric, setDistanceMetric] = useState(
    initialMetadata.distanceMetric || defaultConfig.distanceMetric
  );
  const [scaling, setScaling] = useState(initialMetadata.scaling ?? defaultConfig.scaling);
  const [scalingMethod, setScalingMethod] = useState(
    initialMetadata.scalingMethod || defaultConfig.scalingMethod
  );

  // Advanced parameters
  const [maxIterations, setMaxIterations] = useState(
    initialMetadata.parameters?.maxIterations ?? defaultConfig.parameters!.maxIterations
  );
  const [tolerance, setTolerance] = useState(
    initialMetadata.parameters?.tolerance ?? defaultConfig.parameters!.tolerance
  );
  const [initialization, setInitialization] = useState(
    initialMetadata.parameters?.initialization ?? defaultConfig.parameters!.initialization
  );
  const [linkage, setLinkage] = useState<'ward' | 'complete' | 'average' | 'single'>(
    initialMetadata.parameters?.linkage || 'ward'
  );
  const [eps, setEps] = useState(initialMetadata.parameters?.eps ?? 0.5);
  const [minPoints, setMinPoints] = useState(initialMetadata.parameters?.minPoints ?? 5);

  // Output
  const [clusterColumn, setClusterColumn] = useState(
    initialMetadata.output?.clusterColumn ?? defaultConfig.output.clusterColumn
  );
  const [includeCentroids, setIncludeCentroids] = useState(
    initialMetadata.output?.includeCentroids ?? defaultConfig.output.includeCentroids
  );
  const [outputStatistics, setOutputStatistics] = useState(
    initialMetadata.output?.outputStatistics ?? defaultConfig.output.outputStatistics
  );
  const [alias, setAlias] = useState(initialMetadata.output?.alias ?? defaultConfig.output.alias);

  // Filters
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [inputLimit, setInputLimit] = useState(initialMetadata.inputLimit);

  // UI sections
  const [sections, setSections] = useState({
    basic: true,
    advanced: false,
    output: false,
    filters: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setColumns(initialMetadata.columns || defaultConfig.columns);
    setMethod(initialMetadata.method || defaultConfig.method);
    setNumberOfClusters(initialMetadata.numberOfClusters ?? defaultConfig.numberOfClusters);
    setDistanceMetric(initialMetadata.distanceMetric || defaultConfig.distanceMetric);
    setScaling(initialMetadata.scaling ?? defaultConfig.scaling);
    setScalingMethod(initialMetadata.scalingMethod || defaultConfig.scalingMethod);
    setMaxIterations(initialMetadata.parameters?.maxIterations ?? defaultConfig.parameters!.maxIterations);
    setTolerance(initialMetadata.parameters?.tolerance ?? defaultConfig.parameters!.tolerance);
    setInitialization(initialMetadata.parameters?.initialization ?? defaultConfig.parameters!.initialization);
    setLinkage(initialMetadata.parameters?.linkage || 'ward');
    setEps(initialMetadata.parameters?.eps ?? 0.5);
    setMinPoints(initialMetadata.parameters?.minPoints ?? 5);
    setClusterColumn(initialMetadata.output?.clusterColumn ?? defaultConfig.output.clusterColumn);
    setIncludeCentroids(initialMetadata.output?.includeCentroids ?? defaultConfig.output.includeCentroids);
    setOutputStatistics(initialMetadata.output?.outputStatistics ?? defaultConfig.output.outputStatistics);
    setAlias(initialMetadata.output?.alias ?? defaultConfig.output.alias);
    setFilters(initialMetadata.filters || []);
    setInputLimit(initialMetadata.inputLimit);
  }, [initialMetadata]);

  const handleSave = () => {
    // Build config object
    const config: ClusterConfig = {
      columns,
      method,
      distanceMetric,
      scaling,
      output: {
        clusterColumn,
        includeCentroids,
        outputStatistics,
        alias,
      },
      filters,
      inputLimit,
    };

    // Add conditional fields
    if (method === 'kmeans' || method === 'kmedoids') {
      config.numberOfClusters = numberOfClusters;
    }
    if (scaling) {
      config.scalingMethod = scalingMethod;
    }
    // Add advanced parameters if any are set (using non‑default values)
    const params: any = {};
    if (maxIterations !== defaultConfig.parameters!.maxIterations) params.maxIterations = maxIterations;
    if (tolerance !== defaultConfig.parameters!.tolerance) params.tolerance = tolerance;
    if (initialization !== defaultConfig.parameters!.initialization) params.initialization = initialization;
    if (linkage !== 'ward') params.linkage = linkage;
    if (eps !== 0.5) params.eps = eps;
    if (minPoints !== 5) params.minPoints = minPoints;
    if (Object.keys(params).length > 0) config.parameters = params;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Clustering</h2>
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
              {/* Column selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Numeric Columns <span className="text-red-400">*</span>
                </label>
                <select
                  multiple
                  value={columns}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setColumns(selected);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-32"
                  required
                >
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple</p>
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="kmeans">K‑Means</option>
                  <option value="kmedoids">K‑Medoids</option>
                  <option value="hierarchical">Hierarchical</option>
                  <option value="dbscan">DBSCAN</option>
                  <option value="custom">Custom SQL</option>
                </select>
              </div>

              {/* Number of clusters (if applicable) */}
              {(method === 'kmeans' || method === 'kmedoids') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Number of Clusters (k)</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={numberOfClusters}
                    onChange={(e) => setNumberOfClusters(parseInt(e.target.value) || 3)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              )}

              {/* Distance Metric */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Distance Metric</label>
                <select
                  value={distanceMetric}
                  onChange={(e) => setDistanceMetric(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="euclidean">Euclidean</option>
                  <option value="manhattan">Manhattan</option>
                  <option value="cosine">Cosine</option>
                  <option value="chebyshev">Chebyshev</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Scaling */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={scaling}
                    onChange={(e) => setScaling(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Scale/Normalize data</span>
                </label>
                {scaling && (
                  <select
                    value={scalingMethod}
                    onChange={(e) => setScalingMethod(e.target.value as any)}
                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                  >
                    <option value="standard">Standard (z‑score)</option>
                    <option value="minmax">Min‑Max</option>
                    <option value="robust">Robust (IQR)</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Advanced Section */}
          <SectionHeader title="Advanced Parameters" icon={<Grid className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {method === 'kmeans' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Iterations</label>
                    <input
                      type="number"
                      min="1"
                      value={maxIterations}
                      onChange={(e) => setMaxIterations(parseInt(e.target.value) || 100)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tolerance</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={tolerance}
                      onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.0001)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Initialization</label>
                    <select
                      value={initialization}
                      onChange={(e) => setInitialization(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="random">Random</option>
                      <option value="kmeans++">k‑means++</option>
                      <option value="forgy">Forgy</option>
                    </select>
                  </div>
                </>
              )}
              {method === 'hierarchical' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Linkage Method</label>
                  <select
                    value={linkage}
                    onChange={(e) => setLinkage(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="ward">Ward</option>
                    <option value="complete">Complete</option>
                    <option value="average">Average</option>
                    <option value="single">Single</option>
                  </select>
                </div>
              )}
              {method === 'dbscan' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Epsilon (eps)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={eps}
                      onChange={(e) => setEps(parseFloat(e.target.value) || 0.5)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Min Points</label>
                    <input
                      type="number"
                      min="1"
                      value={minPoints}
                      onChange={(e) => setMinPoints(parseInt(e.target.value) || 5)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Output Section */}
          <SectionHeader title="Output Settings" icon={<Layers className="h-4 w-4" />} sectionKey="output" />
          {sections.output && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cluster Column Name</label>
                <input
                  type="text"
                  value={clusterColumn}
                  onChange={(e) => setClusterColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="cluster_id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Output Alias (table/view name)</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="clustering_output"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeCentroids}
                    onChange={(e) => setIncludeCentroids(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Include centroids in output</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={outputStatistics}
                    onChange={(e) => setOutputStatistics(e.target.checked)}
                    className="rounded border-gray-600 text-purple-500"
                  />
                  <span className="text-sm text-gray-200">Output cluster statistics (size, inertia)</span>
                </label>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <SectionHeader title="Filters & Limits" icon={<Filter className="h-4 w-4" />} sectionKey="filters" />
          {sections.filters && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
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
                    placeholder="e.g., amount > 100"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => setFilters(filters.filter((_, i) => i !== idx))}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newFilter: FilterCondition = {
                    id: crypto.randomUUID(),
                    expression: '',
                    type: 'where',
                  };
                  setFilters([...filters, newFilter]);
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Add Filter</span>
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Input Row Limit</label>
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