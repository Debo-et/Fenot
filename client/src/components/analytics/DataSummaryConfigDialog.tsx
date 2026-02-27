import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sigma,
  Activity,
  Layers,
  Save,
  Plus,
  Trash2,
  Filter,
  Hash,
  Calculator,
  Eye,
  Search,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { SortableItem } from '../ui/SortableItem'; // we'll define a simple sortable item component

// ==================== ADVANCED TYPES ====================

export type AggregationFunction =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'stddev'
  | 'variance'
  | 'median'
  | 'percentile_25'
  | 'percentile_75'
  | 'percentile_90'
  | 'percentile_95'
  | 'custom';

export interface ColumnAggregation {
  id: string; // unique identifier for UI
  column: string;
  functions: AggregationFunction[];
  alias?: string;
  customExpression?: string; // used when functions includes 'custom'
  filter?: FilterCondition; // per‑aggregation filter (conditional aggregation)
}

export type GroupByType = 'column' | 'rollup' | 'cube';

export interface GroupByConfig {
  id: string;
  type: GroupByType;
  columns: string[]; // for 'column' it's a single column; for rollup/cube it's a set
}

export interface FilterCondition {
  id: string;
  expression: string; // simple string, could be replaced with a structured builder
  type: 'where' | 'having';
}

export interface WindowFunctionConfig {
  id: string;
  function: 'row_number' | 'rank' | 'dense_rank' | 'lag' | 'lead' | 'first_value' | 'last_value' | 'sum' | 'avg' | 'count' | 'custom';
  column?: string;
  partitionBy?: string[];
  orderBy?: Array<{ column: string; direction: 'asc' | 'desc' }>;
  frame?: { start: string; end: string }; // e.g., '1 preceding' etc.
  alias?: string;
  customExpression?: string;
}

export interface DataSummaryConfig {
  /** Columns to include in output (if not covered by aggregations) – optional, can be inferred from aggregations */
  columns?: string[];
  /** Per‑column aggregations */
  aggregations: ColumnAggregation[];
  /** Group by configuration (multiple levels) */
  groupBy: GroupByConfig[];
  /** Filters applied before aggregation (WHERE) */
  preFilters: FilterCondition[];
  /** Filters applied after aggregation (HAVING) */
  postFilters: FilterCondition[];
  /** Window functions */
  windowFunctions: WindowFunctionConfig[];
  /** Output table name (optional) */
  outputTable?: string;
  /** Additional options */
  options?: {
    decimalPlaces?: number;
    includeNulls?: boolean;
    distinct?: boolean; // SELECT DISTINCT
    limit?: number;
  };
}

interface DataSummaryConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<DataSummaryConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: DataSummaryConfig) => void;
}

// ==================== DEFAULT CONFIGURATION ====================

const defaultAggregation: ColumnAggregation = {
  id: crypto.randomUUID(),
  column: '',
  functions: ['count'],
};

const defaultGroupBy: GroupByConfig = {
  id: crypto.randomUUID(),
  type: 'column',
  columns: [],
};

const defaultPreFilter: FilterCondition = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
};

const defaultPostFilter: FilterCondition = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'having',
};

const defaultWindowFunction: WindowFunctionConfig = {
  id: crypto.randomUUID(),
  function: 'row_number',
  column: '',
  partitionBy: [],
  orderBy: [],
  alias: '',
};

const defaultOptions = {
  decimalPlaces: 2,
  includeNulls: false,
  distinct: false,
  limit: undefined,
};

// ==================== HELPER COMPONENTS ====================


// ==================== MAIN DIALOG COMPONENT ====================

export const DataSummaryConfigDialog: React.FC<DataSummaryConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];

  // Form state – now using the advanced structure
  const [aggregations, setAggregations] = useState<ColumnAggregation[]>(
    initialMetadata.aggregations || [{ ...defaultAggregation, id: crypto.randomUUID() }]
  );
  const [groupBy, setGroupBy] = useState<GroupByConfig[]>(initialMetadata.groupBy || []);
  const [preFilters, setPreFilters] = useState<FilterCondition[]>(initialMetadata.preFilters || []);
  const [postFilters, setPostFilters] = useState<FilterCondition[]>(initialMetadata.postFilters || []);
  const [windowFunctions, setWindowFunctions] = useState<WindowFunctionConfig[]>(
    initialMetadata.windowFunctions || []
  );
  const [outputTable, setOutputTable] = useState(initialMetadata.outputTable || 'summary_output');
  const [options, setOptions] = useState({ ...defaultOptions, ...initialMetadata.options });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'aggregations' | 'grouping' | 'filters' | 'windows' | 'advanced'>('aggregations');

  // Schema preview – derived from current configuration
  const outputColumns = useMemo(() => {
    const cols: string[] = [];
    // Add group by columns first
    groupBy.forEach(g => {
      if (g.type === 'column') {
        cols.push(...g.columns);
      } else {
        // For rollup/cube, we might have multiple columns; just add them as placeholders
        cols.push(...g.columns);
      }
    });
    // Add aggregation aliases
    aggregations.forEach(a => {
      a.functions.forEach(fn => {
        const alias = a.alias ? a.alias : `${fn}_${a.column}`;
        cols.push(alias);
      });
    });
    // Add window function aliases
    windowFunctions.forEach(w => {
      cols.push(w.alias || `${w.function}_${w.column || 'window'}`);
    });
    return cols;
  }, [aggregations, groupBy, windowFunctions]);

  // Sync with initialMetadata when it changes (e.g., different node selected)
  useEffect(() => {
    setAggregations(initialMetadata.aggregations || [{ ...defaultAggregation, id: crypto.randomUUID() }]);
    setGroupBy(initialMetadata.groupBy || []);
    setPreFilters(initialMetadata.preFilters || []);
    setPostFilters(initialMetadata.postFilters || []);
    setWindowFunctions(initialMetadata.windowFunctions || []);
    setOutputTable(initialMetadata.outputTable || 'summary_output');
    setOptions({ ...defaultOptions, ...initialMetadata.options });
  }, [initialMetadata]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, items: any[], setItems: (items: any[]) => void) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over?.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleSave = () => {
    onSave({
      aggregations,
      groupBy,
      preFilters,
      postFilters,
      windowFunctions,
      outputTable,
      options,
    });
    onClose();
  };

  const addAggregation = () => {
    setAggregations([...aggregations, { ...defaultAggregation, id: crypto.randomUUID() }]);
  };

  const removeAggregation = (id: string) => {
    setAggregations(aggregations.filter(a => a.id !== id));
  };

  const updateAggregation = (id: string, updater: Partial<ColumnAggregation>) => {
    setAggregations(aggregations.map(a => (a.id === id ? { ...a, ...updater } : a)));
  };

  const addGroupBy = () => {
    setGroupBy([...groupBy, { ...defaultGroupBy, id: crypto.randomUUID() }]);
  };

  const removeGroupBy = (id: string) => {
    setGroupBy(groupBy.filter(g => g.id !== id));
  };

  const updateGroupBy = (id: string, updater: Partial<GroupByConfig>) => {
    setGroupBy(groupBy.map(g => (g.id === id ? { ...g, ...updater } : g)));
  };

  const addPreFilter = () => {
    setPreFilters([...preFilters, { ...defaultPreFilter, id: crypto.randomUUID() }]);
  };

  const removePreFilter = (id: string) => {
    setPreFilters(preFilters.filter(f => f.id !== id));
  };

  const updatePreFilter = (id: string, updater: Partial<FilterCondition>) => {
    setPreFilters(preFilters.map(f => (f.id === id ? { ...f, ...updater } : f)));
  };

  const addPostFilter = () => {
    setPostFilters([...postFilters, { ...defaultPostFilter, id: crypto.randomUUID() }]);
  };

  const removePostFilter = (id: string) => {
    setPostFilters(postFilters.filter(f => f.id !== id));
  };

  const updatePostFilter = (id: string, updater: Partial<FilterCondition>) => {
    setPostFilters(postFilters.map(f => (f.id === id ? { ...f, ...updater } : f)));
  };

  const addWindowFunction = () => {
    setWindowFunctions([...windowFunctions, { ...defaultWindowFunction, id: crypto.randomUUID() }]);
  };

  const removeWindowFunction = (id: string) => {
    setWindowFunctions(windowFunctions.filter(w => w.id !== id));
  };

  const updateWindowFunction = (id: string, updater: Partial<WindowFunctionConfig>) => {
    setWindowFunctions(windowFunctions.map(w => (w.id === id ? { ...w, ...updater } : w)));
  };

  if (!open) return null;

  const filteredColumns = availableColumns.filter(col =>
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const functionOptions: { value: AggregationFunction; label: string }[] = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'stddev', label: 'StdDev' },
    { value: 'variance', label: 'Variance' },
    { value: 'median', label: 'Median' },
    { value: 'percentile_25', label: '25th Percentile' },
    { value: 'percentile_75', label: '75th Percentile' },
    { value: 'percentile_90', label: '90th Percentile' },
    { value: 'percentile_95', label: '95th Percentile' },
    { value: 'custom', label: 'Custom Expression' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Data Summary (Advanced)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50 px-4">
          {[
            { id: 'aggregations', label: 'Aggregations', icon: <Sigma className="h-4 w-4" /> },
            { id: 'grouping', label: 'Grouping', icon: <Layers className="h-4 w-4" /> },
            { id: 'filters', label: 'Filters', icon: <Filter className="h-4 w-4" /> },
            { id: 'windows', label: 'Window Functions', icon: <Hash className="h-4 w-4" /> },
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

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Global search for columns (optional) */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ========== AGGREGATIONS TAB ========== */}
          {activeTab === 'aggregations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Per‑Column Aggregations</h3>
                <button
                  onClick={addAggregation}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Aggregation</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, aggregations, setAggregations)}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={aggregations.map(a => a.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {aggregations.map((agg) => (
                      <SortableItem key={agg.id} id={agg.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeAggregation(agg.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-start space-x-3">
                            <div className="cursor-grab text-gray-500 mt-2">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Column</label>
                                <select
                                  value={agg.column}
                                  onChange={(e) => updateAggregation(agg.id, { column: e.target.value })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="">Select column</option>
                                  {filteredColumns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Functions</label>
                                <select
                                  multiple
                                  value={agg.functions}
                                  onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, opt => opt.value as AggregationFunction);
                                    updateAggregation(agg.id, { functions: selected });
                                  }}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm h-24"
                                >
                                  {functionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple</p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Alias (optional)</label>
                                <input
                                  type="text"
                                  value={agg.alias || ''}
                                  onChange={(e) => updateAggregation(agg.id, { alias: e.target.value })}
                                  placeholder="e.g., total_sales"
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                />
                              </div>
                              {agg.functions.includes('custom') && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs text-gray-400 mb-1">Custom Expression</label>
                                  <input
                                    type="text"
                                    value={agg.customExpression || ''}
                                    onChange={(e) => updateAggregation(agg.id, { customExpression: e.target.value })}
                                    placeholder="e.g., SUM(CASE WHEN amount > 100 THEN amount ELSE 0 END)"
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {aggregations.length === 0 && (
                <p className="text-gray-500 text-sm italic">No aggregations defined. Add one to start.</p>
              )}
            </div>
          )}

          {/* ========== GROUPING TAB ========== */}
          {activeTab === 'grouping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Group By</h3>
                <button
                  onClick={addGroupBy}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Group Level</span>
                </button>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, groupBy, setGroupBy)}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={groupBy.map(g => g.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {groupBy.map((g) => (
                      <SortableItem key={g.id} id={g.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeGroupBy(g.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-start space-x-3">
                            <div className="cursor-grab text-gray-500 mt-2">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Type</label>
                                <select
                                  value={g.type}
                                  onChange={(e) => updateGroupBy(g.id, { type: e.target.value as GroupByType })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="column">Column</option>
                                  <option value="rollup">Rollup</option>
                                  <option value="cube">Cube</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Columns</label>
                                <select
                                  multiple
                                  value={g.columns}
                                  onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                                    updateGroupBy(g.id, { columns: selected });
                                  }}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm h-20"
                                >
                                  {filteredColumns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {groupBy.length === 0 && (
                <p className="text-gray-500 text-sm italic">No grouping defined. All rows will be aggregated into a single row.</p>
              )}
            </div>
          )}

          {/* ========== FILTERS TAB ========== */}
          {activeTab === 'filters' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-semibold text-white mb-2">Pre‑Aggregation Filters (WHERE)</h3>
                {preFilters.map((f) => (
                  <div key={f.id} className="flex items-start space-x-2 mb-2">
                    <input
                      type="text"
                      value={f.expression}
                      onChange={(e) => updatePreFilter(f.id, { expression: e.target.value })}
                      placeholder="e.g., amount > 100"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                    />
                    <button
                      onClick={() => removePreFilter(f.id)}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPreFilter}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add WHERE Condition</span>
                </button>
              </div>

              <div>
                <h3 className="text-md font-semibold text-white mb-2">Post‑Aggregation Filters (HAVING)</h3>
                {postFilters.map((f) => (
                  <div key={f.id} className="flex items-start space-x-2 mb-2">
                    <input
                      type="text"
                      value={f.expression}
                      onChange={(e) => updatePostFilter(f.id, { expression: e.target.value })}
                      placeholder="e.g., SUM(amount) > 1000"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                    />
                    <button
                      onClick={() => removePostFilter(f.id)}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPostFilter}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add HAVING Condition</span>
                </button>
              </div>
            </div>
          )}

          {/* ========== WINDOW FUNCTIONS TAB ========== */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Window Functions</h3>
                <button
                  onClick={addWindowFunction}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Window Function</span>
                </button>
              </div>
              {windowFunctions.map((wf) => (
                <div key={wf.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 relative">
                  <button
                    onClick={() => removeWindowFunction(wf.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Function</label>
                      <select
                        value={wf.function}
                        onChange={(e) => updateWindowFunction(wf.id, { function: e.target.value as any })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="row_number">Row Number</option>
                        <option value="rank">Rank</option>
                        <option value="dense_rank">Dense Rank</option>
                        <option value="lag">Lag</option>
                        <option value="lead">Lead</option>
                        <option value="first_value">First Value</option>
                        <option value="last_value">Last Value</option>
                        <option value="sum">Sum</option>
                        <option value="avg">Average</option>
                        <option value="count">Count</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Column (if applicable)</label>
                      <select
                        value={wf.column || ''}
                        onChange={(e) => updateWindowFunction(wf.id, { column: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="">None</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Partition By</label>
                      <select
                        multiple
                        value={wf.partitionBy || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                          updateWindowFunction(wf.id, { partitionBy: selected });
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm h-20"
                      >
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Order By</label>
                      <div className="space-y-1">
                        {(wf.orderBy || []).map((ob, idx) => (
                          <div key={idx} className="flex space-x-1">
                            <select
                              value={ob.column}
                              onChange={(e) => {
                                const newOrderBy = [...(wf.orderBy || [])];
                                newOrderBy[idx].column = e.target.value;
                                updateWindowFunction(wf.id, { orderBy: newOrderBy });
                              }}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              {availableColumns.map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                            <select
                              value={ob.direction}
                              onChange={(e) => {
                                const newOrderBy = [...(wf.orderBy || [])];
                                newOrderBy[idx].direction = e.target.value as 'asc' | 'desc';
                                updateWindowFunction(wf.id, { orderBy: newOrderBy });
                              }}
                              className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="asc">ASC</option>
                              <option value="desc">DESC</option>
                            </select>
                            <button
                              onClick={() => {
                                const newOrderBy = (wf.orderBy || []).filter((_, i) => i !== idx);
                                updateWindowFunction(wf.id, { orderBy: newOrderBy });
                              }}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
<button
  onClick={() => {
    const newEntry = { column: '', direction: 'asc' as const };
    const newOrderBy = [...(wf.orderBy || []), newEntry];
    updateWindowFunction(wf.id, { orderBy: newOrderBy });
  }}
  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
>
                          <Plus className="h-3 w-3" />
                          <span>Add Order</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Alias</label>
                      <input
                        type="text"
                        value={wf.alias || ''}
                        onChange={(e) => updateWindowFunction(wf.id, { alias: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        placeholder="e.g., running_total"
                      />
                    </div>
                    {wf.function === 'custom' && (
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Custom Expression</label>
                        <input
                          type="text"
                          value={wf.customExpression || ''}
                          onChange={(e) => updateWindowFunction(wf.id, { customExpression: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm font-mono"
                          placeholder="e.g., SUM(amount) OVER (PARTITION BY category)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {windowFunctions.length === 0 && (
                <p className="text-gray-500 text-sm italic">No window functions defined.</p>
              )}
            </div>
          )}

          {/* ========== ADVANCED TAB ========== */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Output Table Name
                </label>
                <input
                  type="text"
                  value={outputTable}
                  onChange={(e) => setOutputTable(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="summary_output"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Decimal Places</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={options.decimalPlaces}
                    onChange={(e) => setOptions({ ...options, decimalPlaces: parseInt(e.target.value) || 2 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Limit Rows</label>
                  <input
                    type="number"
                    min="0"
                    value={options.limit || ''}
                    onChange={(e) => setOptions({ ...options, limit: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="No limit"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeNulls}
                    onChange={(e) => setOptions({ ...options, includeNulls: e.target.checked })}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">Include null counts in summary</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.distinct}
                    onChange={(e) => setOptions({ ...options, distinct: e.target.checked })}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">Select DISTINCT rows</span>
                </label>
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