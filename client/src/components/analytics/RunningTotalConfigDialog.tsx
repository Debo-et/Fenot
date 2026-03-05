import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Eye,
  GripVertical,
  Sigma,
  ArrowUpDown,
  Layers,
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
import { RunningTotalConfig, FilterCondition } from '../../types/analytics-configs';

// Local type for order entries with an id for drag‑and‑drop
type OrderEntry = {
  id: string;
  column: string;
  direction: 'asc' | 'desc';
};

interface RunningTotalConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<RunningTotalConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: RunningTotalConfig) => void;
}

const defaultOrderEntry = (): OrderEntry => ({
  id: crypto.randomUUID(),
  column: '',
  direction: 'asc',
});

const defaultFilter: FilterCondition = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
};

export const RunningTotalConfigDialog: React.FC<RunningTotalConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];

  // State
  const [partitionBy, setPartitionBy] = useState<string[]>(initialMetadata.partitionBy || []);
  const [orderBy, setOrderBy] = useState<OrderEntry[]>(() => {
    if (initialMetadata.orderBy?.length) {
      return initialMetadata.orderBy.map(item => ({
        id: crypto.randomUUID(),
        column: item.column,
        direction: item.direction,
      }));
    }
    return [defaultOrderEntry()];
  });
  const [valueColumn, setValueColumn] = useState(initialMetadata.valueColumn || '');
  const [alias, setAlias] = useState(initialMetadata.alias || 'running_total');
  const [frame, setFrame] = useState(initialMetadata.frame || { start: 'UNBOUNDED PRECEDING', end: 'CURRENT ROW' });
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [limit, setLimit] = useState<number | undefined>(initialMetadata.limit);
  const [includeAllColumns, setIncludeAllColumns] = useState(initialMetadata.includeAllColumns ?? true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  // Sync with initialMetadata changes
  useEffect(() => {
    setPartitionBy(initialMetadata.partitionBy || []);
    if (initialMetadata.orderBy?.length) {
      setOrderBy(initialMetadata.orderBy.map(item => ({
        id: crypto.randomUUID(),
        column: item.column,
        direction: item.direction,
      })));
    } else {
      setOrderBy([defaultOrderEntry()]);
    }
    setValueColumn(initialMetadata.valueColumn || '');
    setAlias(initialMetadata.alias || 'running_total');
    setFrame(initialMetadata.frame || { start: 'UNBOUNDED PRECEDING', end: 'CURRENT ROW' });
    setFilters(initialMetadata.filters || []);
    setLimit(initialMetadata.limit);
    setIncludeAllColumns(initialMetadata.includeAllColumns ?? true);
  }, [initialMetadata]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent, items: any[], setItems: (items: any[]) => void) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over?.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const addOrderBy = () => {
    setOrderBy([...orderBy, defaultOrderEntry()]);
  };

  const removeOrderBy = (id: string) => {
    setOrderBy(orderBy.filter(o => o.id !== id));
  };

  const updateOrderBy = (id: string, updater: Partial<{ column: string; direction: 'asc' | 'desc' }>) => {
    setOrderBy(orderBy.map(o => (o.id === id ? { ...o, ...updater } : o)));
  };

  const addFilter = () => {
    setFilters([...filters, { ...defaultFilter, id: crypto.randomUUID() }]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updater: Partial<FilterCondition>) => {
    setFilters(filters.map(f => (f.id === id ? { ...f, ...updater } : f)));
  };

  // Output columns preview
  const outputColumns = useMemo(() => {
    const cols: string[] = [];
    if (includeAllColumns) {
      cols.push(`... all input columns (${availableColumns.length})`);
    }
    partitionBy.forEach(p => cols.push(`${p} (partition)`));
    orderBy.forEach(o => cols.push(`${o.column} (order)`));
    if (valueColumn) cols.push(`${valueColumn} (value)`);
    cols.push(`${alias} (running total)`);
    return cols;
  }, [includeAllColumns, partitionBy, orderBy, valueColumn, alias, availableColumns.length]);

  const filteredColumns = availableColumns.filter(col =>
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const config: RunningTotalConfig = {
      partitionBy: partitionBy.length ? partitionBy : undefined,
      orderBy: orderBy.map(({ column, direction }) => ({ column, direction })),
      valueColumn,
      alias: alias || undefined,
      frame,
      filters: filters.length ? filters : undefined,
      limit: limit || undefined,
      includeAllColumns,
    };
    onSave(config);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[800px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Sigma className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Running Total</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50 px-4">
          {[
            { id: 'basic', label: 'Basic', icon: <ArrowUpDown className="h-4 w-4" /> },
            { id: 'advanced', label: 'Advanced', icon: <Layers className="h-4 w-4" /> },
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Global column search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md pl-4 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Partition By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Partition By (optional)
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
                  {filteredColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple. The running total resets per partition.</p>
              </div>

              {/* Order By */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Order By (required)</label>
                  <button
                    onClick={addOrderBy}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Order</span>
                  </button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, orderBy, setOrderBy)}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext items={orderBy.map(o => o.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {orderBy.map((o) => (
                        <SortableItem key={o.id} id={o.id}>
                          <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                            <button
                              onClick={() => removeOrderBy(o.id)}
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
                                    value={o.column}
                                    onChange={(e) => updateOrderBy(o.id, { column: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                  >
                                    <option value="">Select column</option>
                                    {filteredColumns.map(col => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Direction</label>
                                  <select
                                    value={o.direction}
                                    onChange={(e) => updateOrderBy(o.id, { direction: e.target.value as 'asc' | 'desc' })}
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
                {orderBy.length === 0 && (
                  <p className="text-gray-500 text-sm italic">Add at least one order column</p>
                )}
              </div>

              {/* Value Column */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Value Column (to sum)
                </label>
                <select
                  value={valueColumn}
                  onChange={(e) => setValueColumn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select column</option>
                  {filteredColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Alias */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Running Total Column Alias
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="running_total"
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Pre‑Aggregation Filters (WHERE)</label>
                  <button
                    onClick={addFilter}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Filter</span>
                  </button>
                </div>
                {filters.map((f) => (
                  <div key={f.id} className="flex items-start space-x-2 mb-2">
                    <input
                      type="text"
                      value={f.expression}
                      onChange={(e) => updateFilter(f.id, { expression: e.target.value })}
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
                {filters.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No filters applied</p>
                )}
              </div>

              {/* Window Frame */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Window Frame
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start</label>
                    <select
                      value={frame.start}
                      onChange={(e) => setFrame({ ...frame, start: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="UNBOUNDED PRECEDING">UNBOUNDED PRECEDING</option>
                      <option value="CURRENT ROW">CURRENT ROW</option>
                      <option value="1 PRECEDING">1 PRECEDING</option>
                      <option value="2 PRECEDING">2 PRECEDING</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End</label>
                    <select
                      value={frame.end}
                      onChange={(e) => setFrame({ ...frame, end: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="CURRENT ROW">CURRENT ROW</option>
                      <option value="UNBOUNDED FOLLOWING">UNBOUNDED FOLLOWING</option>
                      <option value="1 FOLLOWING">1 FOLLOWING</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Limit Rows
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

              {/* Include All Columns */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAllColumns}
                    onChange={(e) => setIncludeAllColumns(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">Include all input columns in output</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">If unchecked, only partition, order, value, and alias columns are returned.</p>
              </div>
            </div>
          )}

          {/* Output Schema Preview */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Output Schema Preview ({outputColumns.length} items)</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
              {outputColumns.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No columns defined</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
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