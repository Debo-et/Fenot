import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Sigma,
  Eye,
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
import { SortableItem } from '../ui/SortableItem'; // adjust path as needed
import { ReferenceLineConfig, ReferenceLineDefinition, FilterCondition } from '../../types/analytics-configs';

interface ReferenceLineConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<ReferenceLineConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: ReferenceLineConfig) => void;
}

const defaultDefinition = (): ReferenceLineDefinition => ({
  id: crypto.randomUUID(),
  type: 'average',
  column: '',
  alias: '',
});

const defaultFilter = (): FilterCondition => ({
  id: crypto.randomUUID(),
  expression: '',
  type: 'where',
});

export const ReferenceLineConfigDialog: React.FC<ReferenceLineConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema || [];

  // Form state
  const [definitions, setDefinitions] = useState<ReferenceLineDefinition[]>(
    initialMetadata.definitions || [defaultDefinition()]
  );
  const [groupBy, setGroupBy] = useState<string[]>(initialMetadata.groupBy || []);
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [options, setOptions] = useState(initialMetadata.options || {});

  const [searchTerm, setSearchTerm] = useState('');
  const filteredColumns = availableColumns.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setDefinitions(initialMetadata.definitions || [defaultDefinition()]);
    setGroupBy(initialMetadata.groupBy || []);
    setFilters(initialMetadata.filters || []);
    setOptions(initialMetadata.options || {});
  }, [initialMetadata]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = definitions.findIndex(d => d.id === active.id);
      const newIndex = definitions.findIndex(d => d.id === over?.id);
      setDefinitions(arrayMove(definitions, oldIndex, newIndex));
    }
  };

  const addDefinition = () => setDefinitions([...definitions, defaultDefinition()]);
  const removeDefinition = (id: string) => {
    if (definitions.length === 1) return; // keep at least one
    setDefinitions(definitions.filter(d => d.id !== id));
  };
  const updateDefinition = (id: string, updater: Partial<ReferenceLineDefinition>) => {
    setDefinitions(definitions.map(d => (d.id === id ? { ...d, ...updater } : d)));
  };

  const addFilter = () => setFilters([...filters, defaultFilter()]);
  const removeFilter = (id: string) => setFilters(filters.filter(f => f.id !== id));
  const updateFilter = (id: string, updater: Partial<FilterCondition>) => {
    setFilters(filters.map(f => (f.id === id ? { ...f, ...updater } : f)));
  };

  const handleSave = () => {
    // Validate: each definition must have a column if needed
    for (const def of definitions) {
      if (def.type !== 'constant' && def.type !== 'custom' && !def.column) {
        alert(`Please select a column for definition of type "${def.type}".`);
        return;
      }
      if (def.type === 'percentile' && (def.value === undefined || def.value < 0 || def.value > 100)) {
        alert('Percentile value must be between 0 and 100.');
        return;
      }
      if (def.type === 'custom' && !def.customExpression) {
        alert('Please enter a custom SQL expression.');
        return;
      }
    }

    onSave({
      definitions,
      groupBy,
      filters,
      options,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Sigma className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Configure Reference Line</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Column search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Definitions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-white">Reference Lines</h3>
              <button
                onClick={addDefinition}
                className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Line</span>
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={definitions.map(d => d.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {definitions.map((def) => (
                    <SortableItem key={def.id} id={def.id}>
                      <div className="bg-gray-800 border border-gray-700 rounded-md p-3 relative group">
                        <button
                          onClick={() => removeDefinition(def.id)}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          disabled={definitions.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-start space-x-3">
                          <div className="cursor-grab text-gray-500 mt-2">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Type</label>
                              <select
                                value={def.type}
                                onChange={(e) => updateDefinition(def.id, { type: e.target.value as any })}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              >
                                <option value="constant">Constant</option>
                                <option value="average">Average</option>
                                <option value="median">Median</option>
                                <option value="percentile">Percentile</option>
                                <option value="custom">Custom SQL</option>
                              </select>
                            </div>
                            {def.type !== 'constant' && def.type !== 'custom' && (
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Column</label>
                                <select
                                  value={def.column || ''}
                                  onChange={(e) => updateDefinition(def.id, { column: e.target.value })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                  <option value="">Select column</option>
                                  {filteredColumns.map(col => (
                                    <option key={col.name} value={col.name}>{col.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            {(def.type === 'constant' || def.type === 'percentile') && (
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                  {def.type === 'constant' ? 'Value' : 'Percentile (0-100)'}
                                </label>
                                <input
                                  type="number"
                                  value={def.value || ''}
                                  onChange={(e) => updateDefinition(def.id, { value: parseFloat(e.target.value) })}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                  step={def.type === 'percentile' ? 1 : 'any'}
                                />
                              </div>
                            )}
                            {def.type === 'custom' && (
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">SQL Expression</label>
                                <input
                                  type="text"
                                  value={def.customExpression || ''}
                                  onChange={(e) => updateDefinition(def.id, { customExpression: e.target.value })}
                                  placeholder="e.g., 42, AVG(sales) OVER()"
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm font-mono"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Alias (optional)</label>
                              <input
                                type="text"
                                value={def.alias || ''}
                                onChange={(e) => updateDefinition(def.id, { alias: e.target.value })}
                                placeholder="output column name"
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Group By */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-white">Group By (Partition)</h3>
            <select
              multiple
              value={groupBy}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                setGroupBy(selected);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
            >
              {availableColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Select columns to partition the reference line calculation (e.g., per category).</p>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-white">Filters (WHERE)</h3>
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
            <button
              onClick={addFilter}
              className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Filter</span>
            </button>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-white">Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Limit rows</label>
                <input
                  type="number"
                  min="0"
                  value={options.limit || ''}
                  onChange={(e) => setOptions({ ...options, limit: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="No limit"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.distinct || false}
                    onChange={(e) => setOptions({ ...options, distinct: e.target.checked })}
                    className="rounded border-gray-600 text-indigo-500"
                  />
                  <span className="text-sm text-gray-300">SELECT DISTINCT</span>
                </label>
              </div>
            </div>
          </div>

          {/* Output Schema Preview */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Output Schema Preview</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
              {availableColumns.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No input columns</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {availableColumns.map(col => (
                    <div key={col.name} className="text-gray-300 bg-gray-700 px-2 py-1 rounded truncate" title={col.name}>
                      {col.name}
                    </div>
                  ))}
                  {definitions.map(def => (
                    <div key={def.id} className="text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded truncate" title={def.alias || def.type}>
                      {def.alias || `${def.type}_${def.column || 'value'}`}
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
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};