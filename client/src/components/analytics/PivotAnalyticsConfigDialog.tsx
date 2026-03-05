// src/components/analytics/PivotAnalyticsConfigDialog.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ArrowUpDown,
  Filter,
  Hash,
  Layers,
  Table,
  Settings,
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
import { SortableItem } from '../ui/SortableItem';

// ==================== TYPES ====================
export type AggregationFunction =
  | 'count' | 'sum' | 'avg' | 'min' | 'max' | 'stddev' | 'variance'
  | 'median' | 'percentile_25' | 'percentile_75' | 'percentile_90' | 'percentile_95'
  | 'custom';

export interface PivotMeasure {
  id: string;
  column: string;
  aggregation: AggregationFunction;
  alias?: string;
  customExpression?: string; // when aggregation = 'custom'
  format?: string; // e.g., '0.00' – can be used later by visualization
}

export type PivotDimension = {
  id: string;
  column: string;
  // future: sorting, subtotals, etc.
};

export interface PivotFilter {
  id: string;
  expression: string; // simple SQL expression (could be enhanced later)
  type: 'where' | 'having';
}

export interface PivotSort {
  id: string;
  column: string;
  direction: 'asc' | 'desc';
}

export interface PivotConfig {
  rows: PivotDimension[];
  columns: PivotDimension[]; // for cross‑tab (pivot) – optional
  values: PivotMeasure[];
  filters: PivotFilter[];
  sort: PivotSort[];
  options: {
    includeGrandTotals?: boolean;
    includeSubtotals?: boolean;
    emptyCellValue?: string | number;
    distinct?: boolean;
    limit?: number;
  };
}

// ==================== DEFAULT VALUES ====================
const defaultRow = (): PivotDimension => ({
  id: crypto.randomUUID(),
  column: '',
});
const defaultColumn = (): PivotDimension => ({
  id: crypto.randomUUID(),
  column: '',
});
const defaultMeasure = (): PivotMeasure => ({
  id: crypto.randomUUID(),
  column: '',
  aggregation: 'sum',
  alias: '',
});
const defaultFilter = (): PivotFilter => ({
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
});
const defaultSort = (): PivotSort => ({
  id: crypto.randomUUID(),
  column: '',
  direction: 'asc',
});

// ==================== PROPS ====================
interface PivotAnalyticsConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<PivotConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: PivotConfig) => void;
}

// ==================== HELPER COMPONENTS ====================
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

// ==================== MAIN DIALOG ====================
export const PivotAnalyticsConfigDialog: React.FC<PivotAnalyticsConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];

  // State for each section
  const [rows, setRows] = useState<PivotDimension[]>(
    initialMetadata.rows || [{ ...defaultRow() }]
  );
  const [columns, setColumns] = useState<PivotDimension[]>(
    initialMetadata.columns || []
  );
  const [values, setValues] = useState<PivotMeasure[]>(
    initialMetadata.values || [{ ...defaultMeasure() }]
  );
  const [filters, setFilters] = useState<PivotFilter[]>(
    initialMetadata.filters || []
  );
  const [sort, setSort] = useState<PivotSort[]>(
    initialMetadata.sort || []
  );
  const [options, setOptions] = useState(
    initialMetadata.options || {
      includeGrandTotals: false,
      includeSubtotals: false,
      emptyCellValue: '',
      distinct: false,
      limit: undefined,
    }
  );

  // UI: active tab
  const [activeTab, setActiveTab] = useState<'rows' | 'columns' | 'values' | 'filters' | 'sort' | 'options'>('rows');

  // Sync with incoming metadata when it changes (e.g., different node selected)
  useEffect(() => {
    setRows(initialMetadata.rows || [{ ...defaultRow() }]);
    setColumns(initialMetadata.columns || []);
    setValues(initialMetadata.values || [{ ...defaultMeasure() }]);
    setFilters(initialMetadata.filters || []);
    setSort(initialMetadata.sort || []);
    setOptions(initialMetadata.options || {
      includeGrandTotals: false,
      includeSubtotals: false,
      emptyCellValue: '',
      distinct: false,
      limit: undefined,
    });
  }, [initialMetadata]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = <T extends { id: string }>(
    event: DragEndEvent,
    items: T[],
    setItems: (items: T[]) => void
  ) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over?.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  // Add/remove helpers
  const addRow = () => setRows([...rows, defaultRow()]);
  const removeRow = (id: string) => setRows(rows.filter(r => r.id !== id));
  const updateRow = (id: string, column: string) =>
    setRows(rows.map(r => (r.id === id ? { ...r, column } : r)));

  const addColumn = () => setColumns([...columns, defaultColumn()]);
  const removeColumn = (id: string) => setColumns(columns.filter(c => c.id !== id));
  const updateColumn = (id: string, column: string) =>
    setColumns(columns.map(c => (c.id === id ? { ...c, column } : c)));

  const addValue = () => setValues([...values, defaultMeasure()]);
  const removeValue = (id: string) => setValues(values.filter(v => v.id !== id));
  const updateValue = (id: string, updater: Partial<PivotMeasure>) =>
    setValues(values.map(v => (v.id === id ? { ...v, ...updater } : v)));

  const addFilter = () => setFilters([...filters, defaultFilter()]);
  const removeFilter = (id: string) => setFilters(filters.filter(f => f.id !== id));
  const updateFilter = (id: string, updater: Partial<PivotFilter>) =>
    setFilters(filters.map(f => (f.id === id ? { ...f, ...updater } : f)));

  const addSort = () => setSort([...sort, defaultSort()]);
  const removeSort = (id: string) => setSort(sort.filter(s => s.id !== id));
  const updateSort = (id: string, updater: Partial<PivotSort>) =>
    setSort(sort.map(s => (s.id === id ? { ...s, ...updater } : s)));

  const handleSave = () => {
    onSave({
      rows,
      columns,
      values,
      filters,
      sort,
      options,
    });
    onClose();
  };

  if (!open) return null;

  // Generate preview columns (simplified)
  const previewColumns = useMemo(() => {
    const cols: string[] = [];
    rows.forEach(r => cols.push(r.column || '(row)'));
    columns.forEach(c => cols.push(c.column || '(col)'));
    values.forEach(v => {
      const name = v.alias || `${v.aggregation}_${v.column}`;
      cols.push(name);
    });
    return cols;
  }, [rows, columns, values]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Table className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Configure Pivot Analytics (Data Logic)</h2>
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
            { id: 'rows', label: 'Rows', icon: <Layers className="h-4 w-4" /> },
            { id: 'columns', label: 'Columns', icon: <Layers className="h-4 w-4 rotate-90" /> },
            { id: 'values', label: 'Values', icon: <Hash className="h-4 w-4" /> },
            { id: 'filters', label: 'Filters', icon: <Filter className="h-4 w-4" /> },
            { id: 'sort', label: 'Sort', icon: <ArrowUpDown className="h-4 w-4" /> },
            { id: 'options', label: 'Options', icon: <Settings className="h-4 w-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
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
          {/* ===== ROWS ===== */}
          {activeTab === 'rows' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Row Dimensions</h3>
                <button
                  onClick={addRow}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Row</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, rows, setRows)}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {rows.map(row => (
                      <SortableItem key={row.id} id={row.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeRow(row.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-start space-x-3">
                            <div className="cursor-grab text-gray-500 mt-2">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Column</label>
                              <select
                                value={row.column}
                                onChange={(e) => updateRow(row.id, e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              >
                                <option value="">Select column</option>
                                {availableColumns.map(col => (
                                  <option key={col} value={col}>{col}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {rows.length === 0 && (
                <p className="text-gray-500 text-sm italic">No rows defined. Add a dimension to group by.</p>
              )}
            </div>
          )}

          {/* ===== COLUMNS ===== */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Column Dimensions (for cross‑tab)</h3>
                <button
                  onClick={addColumn}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Column</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, columns, setColumns)}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={columns.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {columns.map(col => (
                      <SortableItem key={col.id} id={col.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeColumn(col.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-start space-x-3">
                            <div className="cursor-grab text-gray-500 mt-2">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Column</label>
                              <select
                                value={col.column}
                                onChange={(e) => updateColumn(col.id, e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              >
                                <option value="">Select column</option>
                                {availableColumns.map(col => (
                                  <option key={col} value={col}>{col}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {columns.length === 0 && (
                <p className="text-gray-500 text-sm italic">No columns defined. Values will be displayed in a single column per measure.</p>
              )}
            </div>
          )}

          {/* ===== VALUES ===== */}
          {activeTab === 'values' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Measures / Aggregations</h3>
                <button
                  onClick={addValue}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Measure</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, values, setValues)}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={values.map(v => v.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {values.map(measure => (
                      <SortableItem key={measure.id} id={measure.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeValue(measure.id)}
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
                                  value={measure.column}
                                  onChange={(e) => updateValue(measure.id, { column: e.target.value })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="">Select column</option>
                                  {availableColumns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Aggregation</label>
                                <select
                                  value={measure.aggregation}
                                  onChange={(e) => updateValue(measure.id, { aggregation: e.target.value as AggregationFunction })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  {functionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Alias (optional)</label>
                                <input
                                  type="text"
                                  value={measure.alias || ''}
                                  onChange={(e) => updateValue(measure.id, { alias: e.target.value })}
                                  placeholder="e.g., total_sales"
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                />
                              </div>
                              {measure.aggregation === 'custom' && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs text-gray-400 mb-1">Custom Expression</label>
                                  <input
                                    type="text"
                                    value={measure.customExpression || ''}
                                    onChange={(e) => updateValue(measure.id, { customExpression: e.target.value })}
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
              {values.length === 0 && (
                <p className="text-gray-500 text-sm italic">No measures defined. Add at least one measure.</p>
              )}
            </div>
          )}

          {/* ===== FILTERS ===== */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Filters</h3>
                <button
                  onClick={addFilter}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Filter</span>
                </button>
              </div>

              <div className="space-y-2">
                {filters.map(filter => (
                  <div key={filter.id} className="flex items-start space-x-2 bg-gray-800 border border-gray-700 rounded-md p-2">
                    <select
                      value={filter.type}
                      onChange={(e) => updateFilter(filter.id, { type: e.target.value as 'where' | 'having' })}
                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-24"
                    >
                      <option value="where">WHERE</option>
                      <option value="having">HAVING</option>
                    </select>
                    <input
                      type="text"
                      value={filter.expression}
                      onChange={(e) => updateFilter(filter.id, { expression: e.target.value })}
                      placeholder="e.g., amount > 100 OR category = 'A'"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm font-mono"
                    />
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {filters.length === 0 && (
                <p className="text-gray-500 text-sm italic">No filters defined.</p>
              )}
            </div>
          )}

          {/* ===== SORT ===== */}
          {activeTab === 'sort' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white">Sorting</h3>
                <button
                  onClick={addSort}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Sort</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, sort, setSort)}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={sort.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sort.map(s => (
                      <SortableItem key={s.id} id={s.id}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                          <button
                            onClick={() => removeSort(s.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-start space-x-3">
                            <div className="cursor-grab text-gray-500 mt-2">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Column</label>
                                <select
                                  value={s.column}
                                  onChange={(e) => updateSort(s.id, { column: e.target.value })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="">Select column</option>
                                  {[...rows, ...columns].map(d => d.column).filter(Boolean).map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Direction</label>
                                <select
                                  value={s.direction}
                                  onChange={(e) => updateSort(s.id, { direction: e.target.value as 'asc' | 'desc' })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="asc">Ascending</option>
                                  <option value="desc">Descending</option>
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
              {sort.length === 0 && (
                <p className="text-gray-500 text-sm italic">No sorting defined.</p>
              )}
            </div>
          )}

          {/* ===== OPTIONS ===== */}
          {activeTab === 'options' && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-white">Advanced Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeGrandTotals}
                      onChange={(e) => setOptions({ ...options, includeGrandTotals: e.target.checked })}
                      className="rounded border-gray-600 text-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Include grand totals</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeSubtotals}
                      onChange={(e) => setOptions({ ...options, includeSubtotals: e.target.checked })}
                      className="rounded border-gray-600 text-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Include subtotals</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.distinct}
                      onChange={(e) => setOptions({ ...options, distinct: e.target.checked })}
                      className="rounded border-gray-600 text-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Select DISTINCT rows</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Empty cell value</label>
                  <input
                    type="text"
                    value={options.emptyCellValue}
                    onChange={(e) => setOptions({ ...options, emptyCellValue: e.target.value })}
                    placeholder="e.g., 0 or '-'"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Limit rows</label>
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
            </div>
          )}

          {/* Schema Preview */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Table className="h-4 w-4" />
              <span className="text-sm font-medium">Output Columns Preview ({previewColumns.length})</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
              {previewColumns.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No output columns defined</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {previewColumns.map((col, idx) => (
                    <div key={idx} className="text-gray-300 bg-gray-700 px-2 py-1 rounded truncate" title={col}>
                      {col || '(empty)'}
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
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};