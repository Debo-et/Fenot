import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Filter,
  Hash,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sliders,
  Code,
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
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableItem } from '../ui/SortableItem'; // adjust path as needed

// Import the rank config type
import { RankConfig, FilterCondition } from '../../types/analytics-configs';

interface RankConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<RankConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: RankConfig) => void;
}

const defaultOrderBy = { column: '', direction: 'asc' as const };
const defaultFilter: FilterCondition = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
};

export const RankConfigDialog: React.FC<RankConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];

  // Basic state
  const [orderBy, setOrderBy] = useState<Array<{ column: string; direction: 'asc' | 'desc' }>>(
    initialMetadata.orderBy || [{ ...defaultOrderBy, column: availableColumns[0] || '' }]
  );
  const [partitionBy, setPartitionBy] = useState<string[]>(initialMetadata.partitionBy || []);
  const [function_, setFunction_] = useState<RankConfig['function']>(
    initialMetadata.function || 'rank'
  );
  const [ntileBuckets, setNtileBuckets] = useState<number>(initialMetadata.ntileBuckets || 4);
  const [alias, setAlias] = useState(initialMetadata.alias || '');
  const [customExpression, setCustomExpression] = useState(initialMetadata.customExpression || '');
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [limit, setLimit] = useState<number | undefined>(initialMetadata.limit);
  const [includeAllColumns, setIncludeAllColumns] = useState<boolean>(
    initialMetadata.includeAllColumns ?? true
  );

  // UI sections
  const [sections, setSections] = useState({
    basic: true,
    advanced: false,
    filters: false,
    sql: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync with initialMetadata
  useEffect(() => {
    setOrderBy(initialMetadata.orderBy || [{ ...defaultOrderBy, column: availableColumns[0] || '' }]);
    setPartitionBy(initialMetadata.partitionBy || []);
    setFunction_(initialMetadata.function || 'rank');
    setNtileBuckets(initialMetadata.ntileBuckets || 4);
    setAlias(initialMetadata.alias || '');
    setCustomExpression(initialMetadata.customExpression || '');
    setFilters(initialMetadata.filters || []);
    setLimit(initialMetadata.limit);
    setIncludeAllColumns(initialMetadata.includeAllColumns ?? true);
  }, [initialMetadata, availableColumns]);

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
    setOrderBy([...orderBy, { column: '', direction: 'asc' }]);
  };

  const removeOrderBy = (index: number) => {
    setOrderBy(orderBy.filter((_, i) => i !== index));
  };

  const updateOrderBy = (index: number, field: 'column' | 'direction', value: string) => {
    const newOrderBy = [...orderBy];
    newOrderBy[index] = { ...newOrderBy[index], [field]: value };
    setOrderBy(newOrderBy);
  };

  const addPartitionColumn = (col: string) => {
    if (!partitionBy.includes(col)) {
      setPartitionBy([...partitionBy, col]);
    }
  };

  const removePartitionColumn = (col: string) => {
    setPartitionBy(partitionBy.filter(c => c !== col));
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
    // Basic validation
    if (orderBy.length === 0 || orderBy.every(o => !o.column)) {
      alert('At least one ORDER BY column is required.');
      return;
    }
    if (function_ === 'ntile' && (!ntileBuckets || ntileBuckets < 1)) {
      alert('Number of buckets for NTILE must be >= 1.');
      return;
    }

    const config: RankConfig = {
      orderBy: orderBy.filter(o => o.column.trim() !== ''),
      partitionBy: partitionBy.length > 0 ? partitionBy : undefined,
      function: function_,
      ...(function_ === 'ntile' && { ntileBuckets }),
      alias: alias || undefined,
      customExpression: customExpression || undefined,
      filters: filters.filter(f => f.expression.trim() !== ''),
      limit: limit || undefined,
      includeAllColumns,
    };
    onSave(config);
    onClose();
  };

  if (!open) return null;

  const functionOptions = [
    { value: 'row_number', label: 'Row Number' },
    { value: 'rank', label: 'Rank' },
    { value: 'dense_rank', label: 'Dense Rank' },
    { value: 'percent_rank', label: 'Percent Rank' },
    { value: 'cume_dist', label: 'Cume Dist' },
    { value: 'ntile', label: 'NTile' },
  ];

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
            <Hash className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configure Rank Analytics</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content – scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Section */}
          <SectionHeader title="Basic Settings" icon={<Sliders className="h-4 w-4" />} sectionKey="basic" />
          {sections.basic && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              {/* ORDER BY */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ORDER BY <span className="text-red-400">*</span>
                </label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, orderBy, setOrderBy)}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext items={orderBy.map((_, i) => `order-${i}`)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {orderBy.map((ob, idx) => (
                        <SortableItem key={`order-${idx}`} id={`order-${idx}`}>
                          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-md">
                            <div className="cursor-grab text-gray-500">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <select
                              value={ob.column}
                              onChange={(e) => updateOrderBy(idx, 'column', e.target.value)}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="">Select column</option>
                              {availableColumns.map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                            <select
                              value={ob.direction}
                              onChange={(e) => updateOrderBy(idx, 'direction', e.target.value as 'asc' | 'desc')}
                              className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="asc">ASC</option>
                              <option value="desc">DESC</option>
                            </select>
                            <button
                              onClick={() => removeOrderBy(idx)}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                              disabled={orderBy.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <button
                  onClick={addOrderBy}
                  className="mt-2 flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add ORDER BY column</span>
                </button>
              </div>

              {/* PARTITION BY */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">PARTITION BY (optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {partitionBy.map(col => (
                    <span
                      key={col}
                      className="inline-flex items-center bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-sm"
                    >
                      {col}
                      <button
                        onClick={() => removePartitionColumn(col)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => addPartitionColumn(e.target.value)}
                  value=""
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="">Add partition column...</option>
                  {availableColumns
                    .filter(col => !partitionBy.includes(col))
                    .map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                </select>
              </div>

              {/* Rank function */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rank Function</label>
                <select
                  value={function_}
                  onChange={(e) => setFunction_(e.target.value as RankConfig['function'])}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  {functionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {function_ === 'ntile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Number of buckets</label>
                  <input
                    type="number"
                    min="1"
                    value={ntileBuckets}
                    onChange={(e) => setNtileBuckets(parseInt(e.target.value) || 1)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Output Column Alias (optional)</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="e.g., rank_num"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeAllColumns}
                  onChange={(e) => setIncludeAllColumns(e.target.checked)}
                  className="rounded border-gray-600 text-purple-500"
                />
                <span className="text-sm text-gray-200">Include all input columns in output</span>
              </label>
            </div>
          )}

          {/* Filters Section */}
          <SectionHeader title="Filters (WHERE)" icon={<Filter className="h-4 w-4" />} sectionKey="filters" />
          {sections.filters && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              {filters.map((f) => (
                <div key={f.id} className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={f.expression}
                    onChange={(e) => updateFilter(f.id, e.target.value)}
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
              <button
                onClick={addFilter}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add WHERE Condition</span>
              </button>
            </div>
          )}

          {/* Advanced Section */}
          <SectionHeader title="Advanced" icon={<Code className="h-4 w-4" />} sectionKey="advanced" />
          {sections.advanced && (
            <div className="space-y-4 pl-2 border-l-2 border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Limit rows (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={limit || ''}
                  onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  placeholder="No limit"
                />
              </div>
            </div>
          )}

          {/* SQL Override Section */}
          <SectionHeader title="Custom SQL Expression" icon={<Code className="h-4 w-4" />} sectionKey="sql" />
          {sections.sql && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
              <textarea
                value={customExpression}
                onChange={(e) => setCustomExpression(e.target.value)}
                placeholder="e.g., ROW_NUMBER() OVER (ORDER BY sales DESC) AS row_num"
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                If provided, this expression overrides all other settings. Use it for advanced SQL.
              </p>
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