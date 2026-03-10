// XMLMetadataWizard.tsx – Enhanced with adaptive flattening, dynamic data grid, and proper saving
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle,
  Code,
  AlertCircle,
  FolderTree,
  Table
} from 'lucide-react';
import {
  XMLMetadataFormData,
  XMLMetadataWizardProps,
  XMLElement
} from '../types/types';

// ----- Types for the flattened structure -----
interface FlattenedColumn {
  name: string;          // relative path (e.g. "author/name", "@id")
  type: string;           // inferred data type
  sample?: string;        // first non‑null value for preview
}

interface FlattenedRow {
  [key: string]: string | null;
}

const XMLMetadataWizard: React.FC<XMLMetadataWizardProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<XMLMetadataFormData & {
    columns?: FlattenedColumn[];
    schema?: FlattenedColumn[];    // for saving
    rowXPath?: string;              // for saving
  }>({
    name: '',
    purpose: '',
    description: '',
    file: null,
    filePath: '',
    rootElement: '',
    namespace: '',
    schemaType: 'inferred',
    elements: [],
    attributes: [],
    structure: [],
    columns: [],
    schema: [],
    rowXPath: ''
  });

  const [, setXmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setParsedStructure] = useState<any>(null);

  // Preview state (flattened grid)
  const [previewRows, setPreviewRows] = useState<FlattenedRow[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'structure' | 'preview'>('structure');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 5;

  // ---------- XML parsing utilities ----------
  const parseXML = (xmlString: string): Element => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) throw new Error('XML parsing error: ' + parseError.textContent);
      return xmlDoc.documentElement;
    } catch (err: any) {
      throw new Error(`Failed to parse XML: ${err.message}`);
    }
  };

  const extractXMLMetadata = (rootElement: Element) => {
    const elements: XMLElement[] = [];
    const attributes: Array<{ name: string; value: string; element: string }> = [];
    const structure: any[] = [];

    const extractFromNode = (node: Element, level: number = 0, path: string = ''): any => {
      const currentPath = path ? `${path}.${node.nodeName}` : node.nodeName;
      
      elements.push({
        name: node.nodeName,
        type: node.childElementCount > 0 ? 'complex' : 'simple',
        path: currentPath,
        level,
        hasChildren: node.childElementCount > 0,
        hasAttributes: node.attributes.length > 0,
        sampleData: node.textContent?.trim() || ''
      });

      Array.from(node.attributes).forEach(attr => {
        attributes.push({ name: attr.name, value: attr.value, element: node.nodeName });
      });

      const nodeStructure = {
        name: node.nodeName,
        type: node.childElementCount > 0 ? 'complex' : 'simple',
        path: currentPath,
        level,
        attributes: Array.from(node.attributes).map(attr => ({ name: attr.name, value: attr.value })),
        children: [] as any[]
      };

      Array.from(node.children).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          nodeStructure.children.push(extractFromNode(child as Element, level + 1, currentPath));
        }
      });

      structure.push(nodeStructure);
      return nodeStructure;
    };

    extractFromNode(rootElement);
    return { elements, attributes, structure, rootElement: rootElement.nodeName };
  };

  // ---------- Adaptive flattening & schema inference ----------
  const inferDataTypeFromValues = (values: (string | null)[]): string => {
    const nonNull = values.filter(v => v !== null && v !== undefined) as string[];
    if (nonNull.length === 0) return 'String';

    const allNumbers = nonNull.every(v => !isNaN(Number(v)) && v.trim() !== '');
    if (allNumbers) {
      const allIntegers = nonNull.every(v => Number.isInteger(Number(v)));
      return allIntegers ? 'Integer' : 'Decimal';
    }

    const bools = ['true', 'false', 'yes', 'no', '1', '0'];
    const allBooleans = nonNull.every(v => bools.includes(v.toLowerCase()));
    if (allBooleans) return 'Boolean';

    const datePattern = /^\d{4}-\d{2}-\d{2}/;
    const allDates = nonNull.every(v => datePattern.test(v) && !isNaN(new Date(v).getTime()));
    if (allDates) return 'Date';

    return 'String';
  };

  const flattenXMLAndInferSchema = (root: Element): {
    columns: FlattenedColumn[];
    rows: FlattenedRow[];
    recordPath: string;
  } => {
    // 1. Collect all unique paths in the entire document
    const allPaths = new Set<string>();
    const traversePaths = (node: Element, path: string) => {
      const currentPath = path ? `${path}.${node.nodeName}` : node.nodeName;
      allPaths.add(currentPath);
      Array.from(node.attributes).forEach(attr => {
        allPaths.add(`${currentPath}/@${attr.name}`);
      });
      Array.from(node.children).forEach(child => traversePaths(child as Element, currentPath));
    };
    traversePaths(root, '');

    // 2. Count occurrences of each path to find the most frequent (record path)
    const pathCounts = new Map<string, number>();
    const countNodes = (node: Element, path: string) => {
      const currentPath = path ? `${path}.${node.nodeName}` : node.nodeName;
      if (currentPath) pathCounts.set(currentPath, (pathCounts.get(currentPath) || 0) + 1);
      Array.from(node.children).forEach(child => countNodes(child as Element, currentPath));
    };
    countNodes(root, '');
    pathCounts.delete(''); // remove root

    let recordPath = '';
    let maxCount = 0;
    for (const [p, cnt] of pathCounts.entries()) {
      if (cnt > maxCount) {
        maxCount = cnt;
        recordPath = p;
      }
    }
    if (!recordPath) recordPath = root.nodeName; // fallback

    // 3. Collect all nodes that match the record path
    const recordNodes: Element[] = [];
    const findRecordNodes = (node: Element, path: string) => {
      const currentPath = path ? `${path}.${node.nodeName}` : node.nodeName;
      if (currentPath === recordPath) recordNodes.push(node);
      Array.from(node.children).forEach(child => findRecordNodes(child as Element, currentPath));
    };
    findRecordNodes(root, '');

    // 4. Build the set of relative paths under the record path
    const allRelativePaths = new Set<string>();
    for (const p of allPaths) {
      if (p.startsWith(recordPath)) {
        const rel = p.substring(recordPath.length + 1); // remove recordPath and dot
        if (rel) allRelativePaths.add(rel);
      }
    }

    // 5. Helper to extract a value given a relative path and a record node
    const extractValue = (recordNode: Element, relPath: string): string | null => {
      const segments = relPath.split('.');
      let current: Element | null = recordNode;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg.startsWith('@')) {
          // attribute
          if (!current) return null;
          return current.getAttribute(seg.substring(1)) || null;
        } else {
          // element – find first child with this tag
          const children = current?.children;
          if (!children) return null;
          let found: Element | null = null;
          for (let j = 0; j < children.length; j++) {
            if (children[j].nodeName === seg) {
              found = children[j] as Element;
              break;
            }
          }
          if (!found) return null;
          current = found;
          if (i === segments.length - 1) {
            // last segment – return text content
            return current.textContent?.trim() || null;
          }
        }
      }
      return null;
    };

    // 6. Build rows
    const rows: FlattenedRow[] = recordNodes.map(node => {
      const row: FlattenedRow = {};
      allRelativePaths.forEach(relPath => {
        row[relPath] = extractValue(node, relPath);
      });
      return row;
    });

    // 7. Infer column types
    const columns: FlattenedColumn[] = Array.from(allRelativePaths).map(relPath => {
      const values = rows.map(r => r[relPath]);
      const type = inferDataTypeFromValues(values);
      const sample = values.find(v => v !== null && v !== undefined) || undefined;
      return { name: relPath, type, sample };
    });

    return { columns, rows, recordPath };
  };

  // ---------- File selection handler (updated) ----------
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.xml'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      setError('Please select a valid XML file (.xml)');
      return;
    }

    setError(null);
    setIsLoading(true);
    setPreviewLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setXmlContent(content);

        const rootElement = parseXML(content);
        const metadata = extractXMLMetadata(rootElement);
        setParsedStructure(metadata);

        // Flatten and infer schema – now returns recordPath
        const { columns, rows, recordPath } = flattenXMLAndInferSchema(rootElement);
        setPreviewRows(rows.slice(0, 100)); // limit for performance
        setPreviewColumns(columns.map(c => c.name));
        setPreviewLoading(false);

        // Update form data with both raw structure and flattened columns + rowXPath + schema
        setFormData(prev => ({
          ...prev,
          file,
          filePath: file.name,
          rootElement: metadata.rootElement,
          elements: metadata.elements,
          attributes: metadata.attributes,
          structure: metadata.structure,
          columns: columns,
          schema: columns,        // <-- store flattened columns for saving
          rowXPath: recordPath    // <-- store the detected repeating element path
        }));

        setIsLoading(false);
      } catch (err: any) {
        setError(`Failed to process XML file: ${err.message}`);
        setIsLoading(false);
        setPreviewLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsLoading(false);
      setPreviewLoading(false);
    };
    reader.readAsText(file);
  };

  // ---------- Form update helpers ----------
  const updateFormData = (updates: Partial<XMLMetadataFormData & { columns: FlattenedColumn[]; schema: FlattenedColumn[]; rowXPath: string }>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateColumnType = (index: number, newType: string) => {
    if (!formData.columns) return;
    const updatedColumns = [...formData.columns];
    updatedColumns[index] = { ...updatedColumns[index], type: newType };
    // Keep both columns (for UI) and schema (for saving) in sync
    setFormData(prev => ({
      ...prev,
      columns: updatedColumns,
      schema: updatedColumns
    }));
  };

  // ---------- Wizard navigation ----------
  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleSave = () => {
    // onSave expects metadata with rowXPath and schema (columns)
    onSave(formData);
    handleClose();
  };
  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setFormData({
      name: '', purpose: '', description: '', file: null, filePath: '',
      rootElement: '', namespace: '', schemaType: 'inferred',
      elements: [], attributes: [], structure: [], columns: [], schema: [], rowXPath: ''
    });
    setXmlContent('');
    setParsedStructure(null);
    setError(null);
    setPreviewRows([]);
    setPreviewColumns([]);
    setActiveTab('structure');
  };

  // ---------- UI rendering helpers ----------
  const renderStructureTree = () => {
    if (!formData.structure || formData.structure.length === 0) {
      return (
        <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 text-center">
          <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-gray-500 dark:text-gray-400">No XML structure available</p>
        </div>
      );
    }

    // Fix duplicate keys by adding index to path
    const renderNode = (node: any, level: number = 0, index: number = 0) => {
      const paddingLeft = level * 20;
      const uniqueKey = `${node.path}-${index}`;   // <-- unique key
      return (
        <div key={uniqueKey} className="mb-1">
          <div className="flex items-center space-x-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
               style={{ paddingLeft }}>
            <FolderTree className="h-3 w-3 text-blue-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{node.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
              {node.type}
            </span>
            {node.attributes.length > 0 && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {node.attributes.length} attr
              </span>
            )}
          </div>
          {node.children.map((child: any, childIndex: number) => renderNode(child, level + 1, childIndex))}
        </div>
      );
    };

    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 max-h-64 overflow-y-auto">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          XML Structure Tree
        </div>
        {formData.structure.map((node, idx) => renderNode(node, 0, idx))}
      </div>
    );
  };

  const renderAttributesTable = () => {
    if (!formData.attributes || formData.attributes.length === 0) {
      return (
        <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">No attributes found</p>
        </div>
      );
    }

    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Attributes ({formData.attributes.length} found)
          </h4>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left">Element</th>
                <th className="px-3 py-2 text-left">Attribute</th>
                <th className="px-3 py-2 text-left">Value</th>
                <th className="px-3 py-2 text-left">Inferred Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {formData.attributes.map((attr, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2">{attr.element}</td>
                  <td className="px-3 py-2">@{attr.name}</td>
                  <td className="px-3 py-2">{attr.value}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {inferDataTypeFromValues([attr.value])}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render flattened data preview (dynamic grid)
  const renderDataPreview = () => {
    if (previewLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Generating preview...</span>
        </div>
      );
    }

    if (!previewRows.length) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No preview data available. The XML structure may be empty or irregular.</p>
        </div>
      );
    }

    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Flattened Data Preview ({previewRows.length} rows, {previewColumns.length} columns)
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Inferred types shown in headers
          </span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
              <tr>
                {previewColumns.map(col => {
                  const colDef = formData.columns?.find(c => c.name === col);
                  return (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 whitespace-nowrap"
                    >
                      <div className="flex flex-col">
                        <span>{col}</span>
                        <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
                          {colDef?.type || 'String'}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {previewRows.slice(0, 20).map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {previewColumns.map(col => (
                    <td
                      key={col}
                      className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-xs truncate"
                      title={row[col] || ''}
                    >
                      {row[col] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewRows.length > 20 && (
            <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              Showing first 20 of {previewRows.length} rows
            </div>
          )}
        </div>
      </div>
    );
  };

  // RENDER STEP 4 – using flattened columns
  const renderColumnDefinitionStep = () => {
    if (!formData.columns || formData.columns.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No flattened columns available. Please complete previous steps.</p>
        </div>
      );
    }

    const dataTypes = ['String', 'Integer', 'Decimal', 'Date', 'Boolean', 'Complex'];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Define Column Schema
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review and adjust the data types for each flattened column. These will become the foreign table columns.
        </p>

        <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Column Path
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Data Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Sample Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {formData.columns.map((col, index) => (
                <tr key={col.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {col.name}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={col.type}
                      onChange={(e) => updateColumnType(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {dataTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate block">
                      {col.sample || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ---------- Main render ----------
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              XML Metadata Wizard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                General Properties
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter a name for the metadata entry. Optionally, add a purpose and description.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter metadata name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => updateFormData({ purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter purpose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                File Selection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse and select your XML file. The application will parse it and extract both the raw structure and a flattened data preview.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xml"
                className="hidden"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  XML File *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.filePath}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                    placeholder="No file selected"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Parsing...' : 'Browse'}
                  </Button>
                </div>
                {formData.file && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✓ File selected: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}

              {formData.rootElement && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">XML parsed successfully!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Root element: <strong>{formData.rootElement}</strong> | 
                    Columns: <strong>{formData.columns?.length || 0}</strong> | 
                    Rows: <strong>{previewRows.length}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                XML Structure Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review the extracted XML structure (tree and attributes) and the flattened data preview.
              </p>

              {!formData.rootElement ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No XML file loaded. Please go back to Step 2.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex border-b border-gray-200 dark:border-gray-600">
                    <button
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'structure'
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('structure')}
                    >
                      Structure
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'preview'
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('preview')}
                    >
                      Data Preview
                    </button>
                  </div>

                  {activeTab === 'structure' && (
                    <div className="space-y-6">
                      <div>{renderStructureTree()}</div>
                      <div>{renderAttributesTable()}</div>
                    </div>
                  )}

                  {activeTab === 'preview' && renderDataPreview()}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && renderColumnDefinitionStep()}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Finish and Save
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review your XML metadata configuration and click Finish to save it to the Repository.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to save</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Your XML metadata configuration is complete.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Configuration Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{formData.name || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">File:</span>
                      <span className="text-gray-900 dark:text-white">{formData.filePath || 'No file selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Root Element:</span>
                      <span className="text-gray-900 dark:text-white">{formData.rootElement || 'Not detected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Record XPath:</span>
                      <span className="text-gray-900 dark:text-white">{formData.rowXPath || 'Not detected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Columns:</span>
                      <span className="text-gray-900 dark:text-white">{formData.schema?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Preview Rows:</span>
                      <span className="text-gray-900 dark:text-white">{previewRows.length}</span>
                    </div>
                  </div>
                </div>

                {formData.schema && formData.schema.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Column Preview</h4>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2 text-sm">
                        {formData.schema.slice(0, 10).map(col => (
                          <div key={col.name} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{col.name}</span>
                            <span className="text-gray-900 dark:text-white text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                              {col.type}
                            </span>
                          </div>
                        ))}
                        {formData.schema.length > 10 && (
                          <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
                            ... and {formData.schema.length - 10} more columns
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={currentStep === 1 ? handleClose : handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={(currentStep === 2 && !formData.file) || (currentStep === 3 && !formData.rootElement)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finish & Save to Repository
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default XMLMetadataWizard;