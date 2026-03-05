import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Filter,
  Hash,
  Layers,
  ChevronDown,
  ChevronRight,
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
import { AggregationFunction, FilterCondition, DrillDownConfig } from '../../types/analytics-configs';

interface DrillDownConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialMetadata?: Partial<DrillDownConfig> & {
    inputSchema?: Array<{ name: string; type: string }>;
  };
  onSave: (config: DrillDownConfig) => void;
}

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
];

const defaultMeasure = {
  column: '',
  aggregation: 'sum' as AggregationFunction,
  alias: '',
};

const defaultFilter = {
  id: crypto.randomUUID(),
  expression: '',
  type: 'where' as const,
};

export const DrillDownConfigDialog: React.FC<DrillDownConfigDialogProps> = ({
  open,
  onClose,
  initialMetadata = {},
  onSave,
}) => {
  const availableColumns = initialMetadata.inputSchema?.map(col => col.name) || [];

  // State
  const [hierarchy, setHierarchy] = useState<string[]>(initialMetadata.hierarchy || []);
  const [measures, setMeasures] = useState(initialMetadata.measures || [{ ...defaultMeasure }]);
  const [filters, setFilters] = useState<FilterCondition[]>(initialMetadata.filters || []);
  const [options, setOptions] = useState({
    limit: initialMetadata.options?.limit,
    distinct: initialMetadata.options?.distinct || false,
    includeNulls: initialMetadata.options?.includeNulls || false,
  });

  const [expandedSections, setExpandedSections] = useState({
    hierarchy: true,
    measures: true,
    filters: false,
    options: false,
  });

  // Sync with initialMetadata when it changes
  useEffect(() => {
    setHierarchy(initialMetadata.hierarchy || []);
    setMeasures(initialMetadata.measures || [{ ...defaultMeasure }]);
    setFilters(initialMetadata.filters || []);
    setOptions({
      limit: initialMetadata.options?.limit,
      distinct: initialMetadata.options?.distinct || false,
      includeNulls: initialMetadata.options?.includeNulls || false,
    });
  }, [initialMetadata]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleHierarchyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = hierarchy.findIndex(item => item === active.id);
      const newIndex = hierarchy.findIndex(item => item === over?.id);
      setHierarchy(arrayMove(hierarchy, oldIndex, newIndex));
    }
  };

  const addHierarchyColumn = (column: string) => {
    if (!hierarchy.includes(column)) {
      setHierarchy([...hierarchy, column]);
    }
  };

  const removeHierarchyColumn = (column: string) => {
    setHierarchy(hierarchy.filter(c => c !== column));
  };

  const addMeasure = () => {
    setMeasures([...measures, { ...defaultMeasure }]);
  };

  const updateMeasure = (index: number, field: keyof typeof defaultMeasure, value: any) => {
    const newMeasures = [...measures];
    newMeasures[index] = { ...newMeasures[index], [field]: value };
    setMeasures(newMeasures);
  };

  const removeMeasure = (index: number) => {
    setMeasures(measures.filter((_, i) => i !== index));
  };

  const addFilter = () => {
    setFilters([...filters, { ...defaultFilter, id: crypto.randomUUID() }]);
  };

  const updateFilter = (id: string, expression: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, expression } : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleSave = () => {
    if (hierarchy.length === 0) {
      alert('Please define at least one hierarchy column.');
      return;
    }
    if (measures.length === 0 || measures.every(m => !m.column)) {
      alert('Please define at least one measure.');
      return;
    }

    onSave({
      hierarchy,
      measures: measures.filter(m => m.column), // remove empty entries
      filters: filters.filter(f => f.expression.trim() !== ''),
      options,
    });
    onClose();
  };

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!open) return null;

  const SectionHeader = ({ title, icon, sectionKey }: { title: string; icon: React.ReactNode; sectionKey: keyof typeof expandedSections }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-2 text-gray-200">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      {expandedSections[sectionKey] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configure Drill‑Down Analytics</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Hierarchy Section */}
          <SectionHeader title="Hierarchy Levels" icon={<Layers className="h-4 w-4" />} sectionKey="hierarchy" />
          {expandedSections.hierarchy && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              <div className="flex items-center space-x-2">
                <select
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  value=""
                  onChange={(e) => addHierarchyColumn(e.target.value)}
                >
                  <option value="" disabled>Add a column to hierarchy...</option>
                  {availableColumns
                    .filter(col => !hierarchy.includes(col))
                    .map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                </select>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleHierarchyDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={hierarchy} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {hierarchy.map((col) => (
                      <SortableItem key={col} id={col}>
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-500 cursor-grab" />
                            <span className="text-sm text-white">{col}</span>
                          </div>
                          <button
                            onClick={() => removeHierarchyColumn(col)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {hierarchy.length === 0 && (
                <p className="text-gray-500 text-sm italic">No hierarchy defined. Add at least one column.</p>
              )}
            </div>
          )}

          {/* Measures Section */}
          <SectionHeader title="Measures" icon={<Hash className="h-4 w-4" />} sectionKey="measures" />
          {expandedSections.measures && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              {measures.map((measure, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-md p-3 relative">
                  <button
                    onClick={() => removeMeasure(idx)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Column</label>
                      <select
                        value={measure.column}
                        onChange={(e) => updateMeasure(idx, 'column', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="">Select</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Aggregation</label>
                      <select
                        value={measure.aggregation}
                        onChange={(e) => updateMeasure(idx, 'aggregation', e.target.value as AggregationFunction)}
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
                        onChange={(e) => updateMeasure(idx, 'alias', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        placeholder="e.g., total_sales"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addMeasure}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Measure</span>
              </button>
            </div>
          )}

          {/* Filters Section */}
          <SectionHeader title="Filters (WHERE)" icon={<Filter className="h-4 w-4" />} sectionKey="filters" />
          {expandedSections.filters && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={filter.expression}
                    onChange={(e) => updateFilter(filter.id, e.target.value)}
                    placeholder="e.g., amount > 100"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => removeFilter(filter.id)}
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
                <span>Add Filter</span>
              </button>
            </div>
          )}

          {/* Options Section */}
          <SectionHeader title="Advanced Options" icon={<Filter className="h-4 w-4" />} sectionKey="options" />
          {expandedSections.options && (
            <div className="space-y-3 pl-2 border-l-2 border-gray-700">
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
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.distinct}
                    onChange={(e) => setOptions({ ...options, distinct: e.target.checked })}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">Select DISTINCT rows</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeNulls}
                    onChange={(e) => setOptions({ ...options, includeNulls: e.target.checked })}
                    className="rounded border-gray-600 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">Include null values in aggregations</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700 bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};