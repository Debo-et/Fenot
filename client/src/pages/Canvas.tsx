import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlowInstance,
  NodeTypes,
  useReactFlow,
  ConnectionLineType,
  SelectionMode,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  MarkerType,
  Node,
  Viewport
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import unified architecture
import TalendNode from './TalendNode';
import { COMPONENT_REGISTRY } from './ComponentRegistry';
import { nameGenerator } from './NameGenerator';

// Import context
import { useCanvas } from './CanvasContext';

// Import metadata types
import {
  FlowNodeMeta,
  FlowEdgeMeta,
  RelationType,
  FieldSchema,
  DataType,
  ComponentConfiguration,
  AnalyticsComponentConfiguration,
  VisualizationComponentConfiguration,
  createInitialNodeMetadata
} from '../types/metadata';

// Import configuration types (new)
import { DataSummaryConfig } from '../types/analytics-configs';
import { BoxPlotConfig } from '../types/visualization-configs';

// Import persistence service
import { canvasPersistence, CanvasRecord } from '../services/canvas-persistence.service';

// ==================== CONFIGURATION DIALOGS ====================
import { DataSummaryConfigDialog } from '../components/analytics/DataSummaryConfigDialog';
import { BoxPlotConfigDialog } from '../components/visualization/BoxPlotConfigDialog';

// ==================== CONNECTION VALIDATION ====================
import { validateConnection } from '../utils/connectionValidation';

// ==================== TYPES ====================
interface ReactFlowDragData {
  type: 'reactflow-component';
  componentId: string;
  source: 'sidebar' | 'rightPanel';
  metadata?: Record<string, any>;
}

interface CanvasNodeData extends FlowNodeMeta {}

interface ExtendedCanvasProps {
  job?: any;
  onJobUpdate?: (updates: any) => void;
  jobDesign?: any;
  onJobDesignUpdate?: (design: any) => void;
  canvasId?: string;
  onNodeMetadataUpdate?: (nodeId: string, metadata: FlowNodeMeta) => void;
  onEdgeMetadataUpdate?: (edgeId: string, metadata: FlowEdgeMeta) => void;
}

interface ConnectionFeedback {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  position: { x: number; y: number };
}

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  connectionFeedback: ConnectionFeedback;
  pendingDrop: any | null;
  viewport: { x: number; y: number; zoom: number };
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string;
}

// ==================== NODE TYPES ====================
const nodeTypes: NodeTypes = {
  talendNode: TalendNode,
};

// ==================== METADATA HELPER FUNCTIONS ====================

// 🛠️ FIX: Map component role to allowed types for createInitialNodeMetadata
const mapRole = (
  role: 'INPUT' | 'TRANSFORM' | 'OUTPUT' | 'ANALYTICS' | 'VISUALIZATION'
): 'INPUT' | 'OUTPUT' | 'ANALYTICS' | 'VISUALIZATION' => {
  if (role === 'TRANSFORM') return 'ANALYTICS';
  return role;
};

// 🛠️ FIX: Map component category (string) to allowed types for createInitialComponentConfiguration
const mapCategory = (
  cat: string
): 'analytics' | 'visualization' | 'input' | 'output' => {
  if (cat === 'transform') return 'analytics';
  return cat as any;
};

/**
 * Create initial component configuration based on component category
 */
const createInitialComponentConfiguration = (
  componentId: string,
  category: 'analytics' | 'visualization' | 'input' | 'output',
  metadata?: any
): ComponentConfiguration => {
  const timestamp = new Date().toISOString();

  if (category === 'analytics') {
    return {
      type: 'ANALYTICS',
      config: {
        version: '1.0',
        analyticType: 'summary',
        parameters: {},
        dataSources: [],
        outputSchema: {
          id: `${componentId}_output`,
          name: 'Analytics Output',
          fields: [],
          isTemporary: true,
          isMaterialized: false,
        },
        executionHints: {
          parallelizable: true,
          memoryHint: 'MEDIUM',
        },
        compilerMetadata: {
          lastModified: timestamp,
          createdBy: 'canvas',
          validationStatus: 'VALID',
          warnings: [],
          dependencies: [],
        },
      } as AnalyticsComponentConfiguration,
    };
  } else if (category === 'visualization') {
    return {
      type: 'VISUALIZATION',
      config: {
        version: '1.0',
        chartType: 'bar',
        title: 'Visualization',
        layout: {
          width: 400,
          height: 300,
          margin: { top: 20, right: 20, bottom: 30, left: 40 },
        },
        styling: {},
        interactions: {
          tooltips: true,
          zoom: false,
          pan: false,
        },
        dataMapping: {
          dimensions: [],
          measures: [],
        },
        rendering: {
          interactive: true,
          exportable: true,
          animate: true,
        },
        compilerMetadata: {
          lastModified: timestamp,
          createdBy: 'canvas',
          validationStatus: 'VALID',
          warnings: [],
          dependencies: [],
        },
      } as VisualizationComponentConfiguration,
    };
  }

  return {
    type: category === 'input' ? 'INPUT' : 'OUTPUT',
    config: {
      ...metadata,
      version: '1.0',
      compilerMetadata: {
        lastModified: timestamp,
        warnings: [],
      },
    },
  };
};

/**
 * Extract columns from drag metadata (unchanged)
 */
const extractColumnsFromDragData = (metadata: any): any[] => {
  if (!metadata) return [];
  if (Array.isArray(metadata.columns)) return metadata.columns;
  if (Array.isArray(metadata.schema)) return metadata.schema;
  if (Array.isArray(metadata.fields)) return metadata.fields;
  if (Array.isArray(metadata.extractedColumns)) return metadata.extractedColumns;
  if (metadata.repositoryMetadata?.schema && Array.isArray(metadata.repositoryMetadata.schema)) {
    return metadata.repositoryMetadata.schema;
  }
  return [];
};

/**
 * Get repository metadata from a node (unchanged)
 */
const getNodeRepositoryMetadata = (node: Node<CanvasNodeData>): any => {
  return node.data?.metadata?.fullRepositoryMetadata ||
    node.data?.metadata?.repositoryMetadata ||
    node.data?.metadata?.dragMetadata?.repositoryMetadata;
};

/**
 * Get table name from a node (unchanged)
 */
const getNodeTableName = (node: Node<CanvasNodeData>): string => {
  const metadata = getNodeRepositoryMetadata(node);
  return metadata?.tableName ||
    metadata?.name ||
    node.data?.label ||
    node.id;
};

/**
 * Determine relation type – now always FLOW for analytics/visualization connections.
 */
const determineRelationType = (_sourceNode: Node<CanvasNodeData>, _targetNode: Node<CanvasNodeData>): RelationType => {
  return 'FLOW';
};

/**
 * Create default edge configuration – simplified.
 */
const createDefaultEdgeConfig = (
  _relationType: RelationType,
  _sourceNode: Node<CanvasNodeData>,
  _targetNode: Node<CanvasNodeData>
): Record<string, any> => {
  return {
    dataFlowOrder: 1,
    isConditional: false,
  };
};

/**
 * Create edge with metadata (simplified)
 */
const createEdgeWithMetadata = (
  connection: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  },
  sourceNode: Node<CanvasNodeData>,
  targetNode: Node<CanvasNodeData>
): Edge => {
  const edgeId = `edge-${connection.source}-${connection.target}-${Date.now()}`;

  const relationType = determineRelationType(sourceNode, targetNode);
  const sourceFields = sourceNode.data?.schemas?.output?.fields?.map(f => f.name) || [];
  const targetFields = targetNode.data?.schemas?.input?.[0]?.fields?.map(f => f.name) || [];

  const edgeMeta: FlowEdgeMeta = {
    relationType,
    configuration: createDefaultEdgeConfig(relationType, sourceNode, targetNode),
    schemaValidation: {
      sourceFields,
      targetFields,
      isSchemaCompatible: sourceFields.length > 0 && targetFields.length > 0,
      validationErrors: [],
      fieldMapping: sourceFields.map((sourceField, index) => ({
        sourceField,
        targetField: targetFields[index] || sourceField,
        compatible: true,
        typeConversion: undefined,
      })),
    },
    compilerMetadata: {
      edgeId,
      version: '1.0',
      dataFlow: {
        isConditional: false,
        dataFlowOrder: 1,
        parallelExecution: false,
      },
      lineage: {
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        fieldsTransferred: sourceFields,
        transformationApplied: false,
      },
    },
    metadata: {
      created: new Date().toISOString(),
      description: `Connection from ${sourceNode.data?.label || sourceNode.id} to ${targetNode.data?.label || targetNode.id}`,
      sourceComponent: sourceNode.data?.componentKey,
      targetComponent: targetNode.data?.componentKey,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourceTable: getNodeTableName(sourceNode),
      targetTable: getNodeTableName(targetNode),
    },
  };

  return {
    id: edgeId,
    type: 'smoothstep' as const,
    animated: false,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    data: edgeMeta,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle || null,
    targetHandle: connection.targetHandle || null,
  };
};

const mapDataType = (oldType: string): DataType => {
  const upperType = oldType.toUpperCase();
  if (upperType.includes('VARCHAR') || upperType.includes('CHAR') || upperType.includes('TEXT')) return 'STRING';
  if (upperType.includes('INT') || upperType.includes('BIGINT')) return 'INTEGER';
  if (upperType.includes('FLOAT') || upperType.includes('DOUBLE') || upperType.includes('DECIMAL')) return 'DECIMAL';
  if (upperType.includes('BOOL')) return 'BOOLEAN';
  if (upperType.includes('DATE')) return 'DATE';
  if (upperType.includes('TIMESTAMP') || upperType.includes('DATETIME')) return 'TIMESTAMP';
  if (upperType.includes('BLOB') || upperType.includes('BINARY')) return 'BINARY';
  return 'STRING';
};

// ==================== UTILITY FUNCTIONS ====================

const getDataSourceTypeFromKey = (componentKey: string): string => {
  if (componentKey.includes('Delimited') || componentKey.includes('Positional')) return 'file';
  if (componentKey.includes('XML') || componentKey.includes('Schema')) return 'xml';
  if (componentKey.includes('Excel')) return 'excel';
  if (componentKey.includes('Json') || componentKey.includes('Avro') || componentKey.includes('Parquet')) return 'json';
  if (componentKey.includes('Directory')) return 'directory';
  if (componentKey.includes('LDAP') || componentKey.includes('LDIF')) return 'ldap';
  if (componentKey.includes('MySQL') || componentKey.includes('Oracle') ||
      componentKey.includes('SQLServer') || componentKey.includes('DB2')) return 'database';
  return 'data_source';
};

// Helper to extract input schema from upstream nodes (used in double‑click)
const extractInputSchema = (nodeId: string, nodes: Node[], edges: Edge[]): Array<{ name: string; type: string }> => {
  const incomingEdges = edges.filter(e => e.target === nodeId);
  if (incomingEdges.length === 0) return [];

  // Take the first incoming edge's source node (simplified)
  const sourceNodeId = incomingEdges[0].source;
  const sourceNode = nodes.find(n => n.id === sourceNodeId);
  if (sourceNode && sourceNode.data?.schemas?.output?.fields) {
    return sourceNode.data.schemas.output.fields.map((f: any) => ({
      name: f.name,
      type: f.type || 'string'
    }));
  }
  return [];
};

// ==================== HELPER: Build output schema for Data Summary ====================
function buildSummaryOutputSchema(
  config: DataSummaryConfig,
  inputFields: FieldSchema[]
): { id: string; name: string; fields: FieldSchema[]; isTemporary: boolean; isMaterialized: boolean } {
  const fieldMap = new Map<string, DataType>();
  inputFields.forEach(f => fieldMap.set(f.name, f.type));

  const outputFields: FieldSchema[] = [];
  const usedNames = new Set<string>();

  // Helper to add a field ensuring unique name
  const addField = (name: string, type: DataType) => {
    let uniqueName = name;
    let counter = 1;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${name}_${counter++}`;
    }
    usedNames.add(uniqueName);
    outputFields.push({
      id: crypto.randomUUID(),
      name: uniqueName,
      type,
      nullable: true,
      isKey: false,
    });
  };

  // 1. Group‑by columns
  for (const g of config.groupBy) {
    for (const col of g.columns) {
      const type = fieldMap.get(col) || 'STRING';
      addField(col, type);
    }
  }

  // 2. Aggregations
  for (const agg of config.aggregations) {
    for (const fn of agg.functions) {
      let fieldName = agg.alias;
      if (!fieldName) {
        // Generate name like "count_sales"
        fieldName = `${fn}_${agg.column}`;
      }
      // Map function to data type
      let type: DataType = 'DECIMAL';
      if (fn === 'count') type = 'INTEGER';
      else if (fn === 'min' || fn === 'max') type = fieldMap.get(agg.column) || 'DECIMAL';
      else if (['avg', 'sum', 'stddev', 'variance', 'median', 'percentile_25', 'percentile_75', 'percentile_90', 'percentile_95'].includes(fn)) {
        type = 'DECIMAL';
      }
      addField(fieldName, type);
    }
  }

  // 3. Window functions
  for (const wf of config.windowFunctions) {
    let fieldName = wf.alias;
    if (!fieldName) {
      fieldName = `${wf.function}_${wf.column || 'window'}`;
    }
    let type: DataType = 'DECIMAL';
    if (wf.function === 'row_number' || wf.function === 'rank' || wf.function === 'dense_rank' || wf.function === 'count') {
      type = 'INTEGER';
    } else if (wf.function === 'lag' || wf.function === 'lead' || wf.function === 'first_value' || wf.function === 'last_value') {
      type = wf.column ? fieldMap.get(wf.column) || 'STRING' : 'STRING';
    }
    addField(fieldName, type);
  }

  return {
    id: `output-${crypto.randomUUID()}`,
    name: 'Data Summary Output',
    fields: outputFields,
    isTemporary: true,
    isMaterialized: false,
  };
}

// ==================== CANVAS COMPONENT ====================
const Canvas = forwardRef<{ forceSave: () => Promise<void> }, ExtendedCanvasProps>(({
  job,
  canvasId,
  onNodeMetadataUpdate,
  onEdgeMetadataUpdate
}, ref) => {
  const { syncNodesAndEdges, updateCanvasData } = useCanvas();
  const { screenToFlowPosition, addNodes, setViewport } = useReactFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const lastSaveStateRef = useRef<string>('');

  const lastLoadedCanvasIdRef = useRef<string | null>(null);
  const lastLoadedJobIdRef = useRef<string | null>(null);
  const localCanvasIdRef = useRef<string | null>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [state, setState] = useState<CanvasState>({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    connectionFeedback: {
      isVisible: false,
      message: '',
      type: 'info',
      position: { x: 0, y: 0 },
    },
    pendingDrop: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    autoSaveStatus: 'idle',
    lastSavedAt: undefined,
  });

  // State for configuration dialog (now includes nodeId and componentKey)
  const [configDialog, setConfigDialog] = useState<{
    nodeId: string;
    componentKey: string;
    initialMetadata: any;
  } | null>(null);

  // Sync nodes and edges with CanvasContext
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      syncNodesAndEdges(nodes, edges);
    }
  }, [nodes, edges, syncNodesAndEdges]);

  const showFeedback = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    position?: { x: number; y: number }
  ) => {
    const feedbackPosition = position || { x: 100, y: 100 };
    setState(prev => ({
      ...prev,
      connectionFeedback: {
        isVisible: true,
        message,
        type,
        position: feedbackPosition,
      },
    }));
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        connectionFeedback: { ...prev.connectionFeedback, isVisible: false },
      }));
    }, 3000);
  }, []);

  // ==================== AUTO-SAVE PERSISTENCE ====================
  const saveCanvasState = useCallback(async () => {
    if ((!job && !canvasId) || isSavingRef.current) return;

    try {
      isSavingRef.current = true;

      const currentStateHash = JSON.stringify({
        nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, data: e.data })),
        viewport: state.viewport,
      });

      if (currentStateHash === lastSaveStateRef.current) {
        console.log('No changes, skipping save');
        return;
      }

      console.log('Saving canvas state...');
      setState(prev => ({ ...prev, autoSaveStatus: 'saving' }));

      let savedRecord: CanvasRecord | null = null;

      if (canvasId) {
        await canvasPersistence.updateCanvas(canvasId, { nodes, edges, viewport: state.viewport });
        savedRecord = { id: canvasId } as CanvasRecord;
      } else if (localCanvasIdRef.current) {
        await canvasPersistence.updateCanvas(localCanvasIdRef.current, { nodes, edges, viewport: state.viewport });
        savedRecord = { id: localCanvasIdRef.current } as CanvasRecord;
      } else if (job) {
        const canvasName = job.name;
        savedRecord = await canvasPersistence.saveCanvas(
          canvasName,
          { nodes, edges, viewport: state.viewport },
          {
            description: `Auto-saved from job: ${job?.name}`,
            tags: [job?.name || 'unknown', 'auto-save', 'canvas'],
            compilerMetadata: {},
            otherUiState: {
              jobId: job?.id,
              jobName: job?.name,
              nodeCount: nodes.length,
              edgeCount: edges.length,
              savedAt: new Date().toISOString(),
            },
          }
        );
      } else {
        throw new Error('No canvas target (neither job nor canvasId)');
      }

      if (savedRecord && savedRecord.id) {
        lastSaveStateRef.current = currentStateHash;
        localCanvasIdRef.current = savedRecord.id;
        setState(prev => ({
          ...prev,
          autoSaveStatus: 'saved',
          lastSavedAt: new Date().toISOString(),
        }));
        showFeedback(`Saved canvas (${nodes.length} nodes, ${edges.length} edges)`, 'success');
      } else if (canvasId) {
        lastSaveStateRef.current = currentStateHash;
        setState(prev => ({ ...prev, autoSaveStatus: 'saved', lastSavedAt: new Date().toISOString() }));
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      setState(prev => ({ ...prev, autoSaveStatus: 'error' }));
      showFeedback(`Save failed: ${error.message}`, 'error');
    } finally {
      isSavingRef.current = false;
    }
  }, [job, canvasId, nodes, edges, state.viewport, showFeedback]);

  const debouncedAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if ((!job && !canvasId) || isSavingRef.current) return;
    saveTimeoutRef.current = setTimeout(() => saveCanvasState(), 1000);
  }, [job, canvasId, saveCanvasState]);

  useImperativeHandle(ref, () => ({ forceSave: saveCanvasState }), [saveCanvasState]);

  useEffect(() => {
    if (canvasId) localCanvasIdRef.current = canvasId;
  }, [canvasId]);

  // ==================== INITIALIZATION & LOADING ====================
  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasId && !job) return;

      if (canvasId && lastLoadedCanvasIdRef.current === canvasId) return;
      if (job?.id && lastLoadedJobIdRef.current === job.id) return;

      try {
        let loadedNodes: Node[] = [];
        let loadedEdges: Edge[] = [];
        let loadedViewport: Viewport = { x: 0, y: 0, zoom: 1 };

        if (canvasId) {
          const canvasData = await canvasPersistence.getCanvas(canvasId);
          if (canvasData) {
            loadedNodes = canvasData.reactFlow.nodes || [];
            loadedEdges = canvasData.reactFlow.edges || [];
            loadedViewport = canvasData.reactFlow.viewport || { x: 0, y: 0, zoom: 1 };
            localCanvasIdRef.current = canvasId;
          } else {
            showFeedback('Canvas data not found. Starting with empty canvas.', 'warning');
          }
        } else if (job) {
          const canvasName = job.name;
          const savedData = await canvasPersistence.getCanvasByName(canvasName);
          if (savedData) {
            loadedNodes = savedData.data.reactFlow.nodes || [];
            loadedEdges = savedData.data.reactFlow.edges || [];
            loadedViewport = savedData.data.reactFlow.viewport || { x: 0, y: 0, zoom: 1 };
            localCanvasIdRef.current = savedData.id;
          }
        }

        setNodes(loadedNodes);
        setEdges(loadedEdges);

        if (loadedViewport && reactFlowInstance) {
          setViewport(loadedViewport);
        }

        setState(prev => ({ ...prev, viewport: loadedViewport }));
        updateCanvasData({ nodes: loadedNodes, edges: loadedEdges, viewport: loadedViewport });

        if (loadedNodes.length > 0 || loadedEdges.length > 0) {
          showFeedback(`Loaded canvas with ${loadedNodes.length} nodes, ${loadedEdges.length} edges`, 'success');
        }

        if (canvasId) {
          lastLoadedCanvasIdRef.current = canvasId;
          lastLoadedJobIdRef.current = null;
        } else if (job?.id) {
          lastLoadedJobIdRef.current = job.id;
          lastLoadedCanvasIdRef.current = null;
        }
      } catch (error) {
        console.error('Failed to load canvas:', error);
        showFeedback('Failed to load canvas. Starting fresh.', 'error');
      }
    };

    initializeCanvas();

    return () => {
      if ((job || canvasId) && (lastLoadedCanvasIdRef.current || lastLoadedJobIdRef.current)) {
        saveCanvasState();
      }
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [job, canvasId, reactFlowInstance, setViewport, updateCanvasData, saveCanvasState, showFeedback]);

  // Initialize name generator with existing nodes
  useEffect(() => {
    const nodeLabels = nodes
      .filter(node => node.type === 'talendNode')
      .map(node => node.data?.label)
      .filter(Boolean);
    nameGenerator.initializeFromExistingNodes(nodeLabels);
  }, [nodes]);

  // ==================== UNIFIED REACT FLOW DROPZONE ====================
  const onDrop = useCallback(
  (event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowInstance) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const reactFlowData = event.dataTransfer.getData('application/reactflow');

    if (!reactFlowData) {
      console.warn('No React Flow data in drop event');
      return;
    }

    try {
      const data: ReactFlowDragData = JSON.parse(reactFlowData);
      if (data.type !== 'reactflow-component') {
        console.warn('Invalid drag data type:', data.type);
        return;
      }

      const componentDef = COMPONENT_REGISTRY[data.componentId];
      if (!componentDef) {
        console.warn(`Component not found: ${data.componentId}`);
        return;
      }

      let baseName = componentDef.displayName;
      if (data.metadata?.originalNodeName) {
        baseName = data.metadata.originalNodeName;
      } else if (data.metadata?.repositoryMetadata?.name) {
        baseName = data.metadata.repositoryMetadata.name;
      } else if (data.metadata?.name) {
        baseName = data.metadata.name;
      }

      const cleanBaseName = baseName
        .replace(/_(INPUT|OUTPUT|ANALYTICS|VISUALIZATION)_/i, '_')
        .replace(/_+$/, '');

      const finalRole = mapRole(componentDef.defaultRole);
      const finalCategory = mapCategory(componentDef.category);

      const label = nameGenerator.generate(cleanBaseName, finalRole);
      const instanceNumber = nameGenerator.extractBaseName(label)?.instance || 1;

      const columns = extractColumnsFromDragData(data.metadata);

      const configuration = createInitialComponentConfiguration(
        componentDef.id,
        finalCategory,
        data.metadata
      );

      // ✅ Set chartType for visualization nodes to the component ID
      if (finalCategory === 'visualization') {
        configuration.config.chartType = componentDef.id;
      }

      const nodeData: CanvasNodeData = createInitialNodeMetadata(
        componentDef.id,
        finalRole,
        label,
        configuration
      );

      nodeData.instanceNumber = instanceNumber;
      nodeData.metadata = {
        originalBaseName: cleanBaseName,
        originalDisplayName: componentDef.displayName,
        repositoryNodeId: data.metadata?.repositoryNodeId,
        repositoryNodeType: data.metadata?.repositoryNodeType,
        originalNodeName: data.metadata?.originalNodeName,
        originalNodeType: data.metadata?.originalNodeType,
        ...(data.metadata?.repositoryMetadata && { fullRepositoryMetadata: data.metadata.repositoryMetadata }),
        extractedColumns: columns,
        dragMetadata: data.metadata,
        source: data.source,
        sourceType: getDataSourceTypeFromKey(componentDef.id),
        createdAt: new Date().toISOString(),
        category: componentDef.category,
        isDataSource: componentDef.category === 'input' || componentDef.category === 'output',
        scaleFactor: 0.25,
        visualScaling: { fontSizeScale: 0.25, iconScale: 0.25, handleScale: 0.25 },
        configuration: configuration.config,
      };

      if (data.metadata?.repositoryMetadata?.postgresTableName) {
        nodeData.metadata.postgresTableName = data.metadata.repositoryMetadata.postgresTableName;
      } else if (data.metadata?.postgresTableName) {
        nodeData.metadata.postgresTableName = data.metadata.postgresTableName;
      }

      if (columns.length > 0) {
        const fields: FieldSchema[] = columns.map((col: any, index: number) => ({
          id: col.id || `${cleanBaseName}_${index}`,
          name: col.name || `Column_${index + 1}`,
          type: mapDataType(col.type || 'STRING'),
          length: col.length,
          precision: col.precision,
          scale: col.scale,
          nullable: col.nullable !== false,
          isKey: col.isKey || col.primaryKey || false,
          defaultValue: col.defaultValue,
          description: col.description,
          originalType: col.type,
          _original: col,
        }));

        if (finalRole === 'INPUT') {
          nodeData.schemas = {
            output: {
              id: `${cleanBaseName}_output_schema`,
              name: `${label} Output Schema`,
              fields,
              isTemporary: false,
              isMaterialized: false,
              metadata: { source: 'repository', columnCount: fields.length },
            },
          };
        } else if (finalRole === 'OUTPUT') {
          nodeData.schemas = {
            input: [{
              id: `${cleanBaseName}_input_schema`,
              name: `${label} Input Schema`,
              fields,
              isTemporary: false,
              isMaterialized: false,
              metadata: { source: 'repository', columnCount: fields.length },
            }],
          };
        } else {
          nodeData.schemas = {
            input: [{
              id: `${cleanBaseName}_input_schema`,
              name: `${label} Input Schema`,
              fields,
              isTemporary: false,
              isMaterialized: false,
              metadata: { source: 'repository', columnCount: fields.length },
            }],
            output: {
              id: `${cleanBaseName}_output_schema`,
              name: `${label} Output Schema`,
              fields: [...fields],
              isTemporary: false,
              isMaterialized: false,
              metadata: { source: 'repository', columnCount: fields.length },
            },
          };
        }
      }

      const defaultWidth = componentDef.defaultDimensions.width * 2;
      const defaultHeight = componentDef.defaultDimensions.height * 2;

      const newNode: Node<CanvasNodeData> = {
        id: `node-${Date.now()}-${cleanBaseName}`,
        type: 'talendNode',
        position,
        data: nodeData,
        style: { width: defaultWidth, height: defaultHeight },
        draggable: true,
        selectable: true,
        connectable: true,
      };

      addNodes(newNode);
      const updatedNodes = [...nodes, newNode];
      setTimeout(() => syncNodesAndEdges(updatedNodes, edges), 0);

      if (onNodeMetadataUpdate) {
        onNodeMetadataUpdate(newNode.id, nodeData);
      }

      debouncedAutoSave();
      showFeedback(`Added ${label}`, 'success', position);
    } catch (error) {
      console.error('Error processing drop:', error);
      showFeedback('Failed to add component', 'error', { x: event.clientX, y: event.clientY });
    }
  },
  [reactFlowInstance, screenToFlowPosition, addNodes, nodes, edges, syncNodesAndEdges, onNodeMetadataUpdate, debouncedAutoSave, showFeedback]
);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // ==================== REACT FLOW HANDLERS ====================
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      syncNodesAndEdges(updatedNodes, edges);
      if (job || canvasId) debouncedAutoSave();
    },
    [nodes, edges, syncNodesAndEdges, job, canvasId, debouncedAutoSave]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      syncNodesAndEdges(nodes, updatedEdges);
      if (job || canvasId) debouncedAutoSave();
    },
    [nodes, edges, syncNodesAndEdges, job, canvasId, debouncedAutoSave]
  );

  const onMove = useCallback((_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    setState(prev => ({ ...prev, viewport }));
    if (job || canvasId) debouncedAutoSave();
  }, [job, canvasId, debouncedAutoSave]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        showFeedback('Source and target are required', 'error');
        return;
      }

      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      if (!sourceNode || !targetNode) {
        showFeedback('Source or target node not found', 'error');
        return;
      }
      if (connection.source === connection.target) {
        showFeedback('Cannot connect a node to itself', 'error');
        return;
      }

      const validation = validateConnection(sourceNode, targetNode);
      if (!validation.allowed) {
        showFeedback(validation.reason || 'Connection not allowed', 'error');
        return;
      }

      const newEdge = createEdgeWithMetadata(
        { source: connection.source, target: connection.target, sourceHandle: connection.sourceHandle, targetHandle: connection.targetHandle },
        sourceNode as Node<CanvasNodeData>,
        targetNode as Node<CanvasNodeData>
      );

      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      syncNodesAndEdges(nodes, updatedEdges);

      if (onEdgeMetadataUpdate) {
        onEdgeMetadataUpdate(newEdge.id, newEdge.data);
      }

      if (job || canvasId) debouncedAutoSave();
      showFeedback(`Created ${newEdge.data.relationType} connection`, 'success');
    },
    [nodes, edges, showFeedback, onEdgeMetadataUpdate, syncNodesAndEdges, job, canvasId, debouncedAutoSave]
  );

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
    setState(prev => ({ ...prev, selectedNodeId: selectedNodes.length > 0 ? selectedNodes[0].id : null }));
  }, []);

  // ==================== VIEWPORT CENTERING ====================
  const centerNodes = useCallback(() => {
    if (nodes.length > 0 && reactFlowInstance && reactFlowWrapper.current) {
      const container = reactFlowWrapper.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const nodePositions = nodes.map(node => node.position);
      const nodeWidths = nodes.map(node => (node.style?.width ? parseFloat(node.style.width as string) : 100));
      const nodeHeights = nodes.map(node => (node.style?.height ? parseFloat(node.style.height as string) : 100));

      const minX = Math.min(...nodePositions.map((p) => p.x));
      const maxX = Math.max(...nodePositions.map((p, i) => p.x + nodeWidths[i]));
      const minY = Math.min(...nodePositions.map((p) => p.y));
      const maxY = Math.max(...nodePositions.map((p, i) => p.y + nodeHeights[i]));

      const nodesWidth = maxX - minX;
      const nodesHeight = maxY - minY;
      const centerX = minX + nodesWidth / 2;
      const centerY = minY + nodesHeight / 2;

      const viewportX = containerWidth / 2 - centerX;
      const viewportY = containerHeight / 2 - centerY;
      const newViewport = { x: viewportX, y: viewportY, zoom: 1 };

      reactFlowInstance.setViewport(newViewport);
      setState(prev => ({ ...prev, viewport: newViewport }));
      if (job || canvasId) debouncedAutoSave();
    }
  }, [nodes, reactFlowInstance, reactFlowWrapper, job, canvasId, debouncedAutoSave]);

  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance && (!state.viewport || state.viewport.zoom !== 1)) {
      const timer = setTimeout(() => centerNodes(), 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, reactFlowInstance, centerNodes, state.viewport]);

  // ==================== PER‑TYPE CONFIGURATION SAVE HANDLERS ====================
  const handleDataSummaryConfigSave = useCallback((nodeId: string, config: DataSummaryConfig) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        // Get input schema from node's current data (first input)
        const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
        const outputSchema = buildSummaryOutputSchema(config, inputFields);

        const updatedData = {
          ...node.data,
          metadata: {
            ...node.data.metadata,
            configuration: config
          },
          configuration: {
            ...node.data.configuration,
            config: {
              ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
              parameters: config,
              analyticType: 'summary'
            }
          },
          schemas: {
            ...node.data.schemas,
            output: outputSchema
          }
        };
        return { ...node, data: updatedData };
      }
      return node;
    }));
    syncNodesAndEdges(nodes, edges);
    debouncedAutoSave();
  }, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

  const handleBoxPlotConfigSave = useCallback((nodeId: string, config: BoxPlotConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'VISUALIZATION' ? node.data.configuration.config : {}),
            parameters: config,
            chartType: 'box-plot',  // ✅ Changed from 'box'
          }
        }
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

  // Unified dispatcher called by dialogs
  const handleConfigSave = useCallback((nodeId: string, componentKey: string, config: any) => {
    switch (componentKey) {
      case 'data-summary':
        handleDataSummaryConfigSave(nodeId, config);
        break;
      case 'box-plot':
        handleBoxPlotConfigSave(nodeId, config);
        break;
      default:
        console.warn(`Unknown component key: ${componentKey}`);
    }
    setConfigDialog(null);
  }, [handleDataSummaryConfigSave, handleBoxPlotConfigSave]);

  // ==================== DOUBLE‑CLICK HANDLER FOR CONFIGURATION ====================
  const handleCanvasNodeDoubleClick = useCallback((event: CustomEvent) => {
    const { componentMetadata } = event.detail;
    if (!componentMetadata) return;

    const nodeId = componentMetadata.id;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const componentKey = componentMetadata.componentKey;
    const existingConfig = node.data.metadata?.configuration || {};

    // Gather input schema from connected upstream nodes
    const inputSchema = extractInputSchema(nodeId, nodes, edges);

    if (componentKey === 'data-summary') {
      setConfigDialog({
        nodeId,
        componentKey,
        initialMetadata: {
          ...existingConfig,
          inputSchema,
          columns: existingConfig.columns || [],
          statistics: existingConfig.statistics || {
            count: true, sum: true, avg: true, min: true, max: true,
            stddev: false, variance: false
          },
          groupBy: existingConfig.groupBy || [],
          outputTable: existingConfig.outputTable || 'summary_output',
          options: existingConfig.options || { decimalPlaces: 2, includeNulls: false }
        }
      });
    } else if (componentKey === 'box-plot') {
      setConfigDialog({
        nodeId,
        componentKey,
        initialMetadata: {
          ...existingConfig,
          inputSchema,
          title: existingConfig.title || '',
          categoryField: existingConfig.categoryField || '',
          valueField: existingConfig.valueField || '',
          orientation: existingConfig.orientation || 'vertical',
          showOutliers: existingConfig.showOutliers ?? true,
          whiskerType: existingConfig.whiskerType || 'tukey',
          percentileRange: existingConfig.percentileRange || { lower: 5, upper: 95 },
          boxWidth: existingConfig.boxWidth || 40,
          colors: existingConfig.colors || '#3b82f6',
          showGrid: existingConfig.showGrid ?? true,
          showLegend: existingConfig.showLegend ?? false,
          dimensions: existingConfig.dimensions || { width: 500, height: 400 }
        }
      });
    }
  }, [nodes, edges]);

  // Attach double-click listener
  useEffect(() => {
    window.addEventListener('canvas-node-double-click', handleCanvasNodeDoubleClick as EventListener);
    return () => {
      window.removeEventListener('canvas-node-double-click', handleCanvasNodeDoubleClick as EventListener);
    };
  }, [handleCanvasNodeDoubleClick]);

  // ==================== RENDER ====================
  const renderConnectionFeedback = () => {
    if (!state.connectionFeedback.isVisible) return null;
    const { message, type, position } = state.connectionFeedback;
    const colors = {
      success: 'bg-green-100 border-green-400 text-green-700',
      error: 'bg-red-100 border-red-400 text-red-700',
      info: 'bg-blue-100 border-blue-400 text-blue-700',
      warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    };
    return (
      <div className="fixed z-[10000]" style={{ left: position.x, top: position.y }}>
        <div className={`px-3 py-2 rounded-lg border ${colors[type]} shadow-lg animate-fadeIn`}>
          <div className="text-sm font-medium">{message}</div>
        </div>
      </div>
    );
  };

  const renderAutoSaveStatus = () => {
    if ((!job && !canvasId) || state.autoSaveStatus === 'idle') return null;
    const statusConfig = {
      saving: { text: 'Saving...', color: 'bg-yellow-400', icon: '⏳' },
      saved: { text: 'Saved', color: 'bg-green-400', icon: '✅' },
      error: { text: 'Save failed', color: 'bg-red-400', icon: '❌' },
    };
    const config = statusConfig[state.autoSaveStatus];
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2">
        <div className={`${config.color} text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
          <span>{config.icon}</span>
          <span className="text-sm font-medium">{config.text}</span>
          {state.lastSavedAt && state.autoSaveStatus === 'saved' && (
            <span className="text-xs opacity-80">
              {new Date(state.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderConnectionFeedback()}
      {renderAutoSaveStatus()}

      {/* Configuration Dialogs – now conditional on componentKey */}
      {configDialog && configDialog.componentKey === 'data-summary' && (
        <DataSummaryConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'box-plot' && (
        <BoxPlotConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}

      <div
        ref={reactFlowWrapper}
        className="relative w-full h-full canvas-container bg-gray-50"
        style={{ width: '100%', height: '100%', position: 'relative', cursor: 'default' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          onSelectionChange={onSelectionChange}
          isValidConnection={(connection) => connection.source !== connection.target}
          onEdgeDoubleClick={(event, edge) => {
            event.stopPropagation();
            const customEvent = new CustomEvent('canvas-edge-double-click', {
              detail: { edgeId: edge.id, edgeMetadata: edge.data },
            });
            window.dispatchEvent(customEvent);
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onMove={onMove}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultViewport={{ x: state.viewport.x, y: state.viewport.y, zoom: state.viewport.zoom }}
          minZoom={0.1}
          maxZoom={4}
          defaultEdgeOptions={{
            animated: false,
            style: { strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          }}
          proOptions={{ hideAttribution: true }}
          selectionMode={SelectionMode.Partial}
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode={['Control', 'Meta']}
          selectionKeyCode={['Shift']}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={true}
          panOnDrag={[1, 2]}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnDoubleClick={false}
          onlyRenderVisibleElements={false}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
          <Controls />
        </ReactFlow>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .react-flow__node-talendNode { transform-box: fill-box !important; transform-origin: center !important; box-sizing: border-box !important; }
        .react-flow__node-talendNode:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); }
        .react-flow__node-talendNode.selected { box-shadow: 0 0 0 2px #3b82f6, 0 4px 12px rgba(0, 0, 0, 0.12); z-index: 10; }
        .react-flow__handle { opacity: 0.7; transition: opacity 0.2s ease, transform 0.2s ease; border: 1.5px solid white; width: 8px !important; height: 8px !important; }
        .react-flow__handle:hover { opacity: 1; transform: scale(1.2); }
        .react-flow__edge-path { stroke-width: 2; stroke: #4b5563; }
        .react-flow__edge.selected .react-flow__edge-path { stroke: #3b82f6; stroke-width: 2.5; }
        .canvas-container { position: absolute !important; width: 100% !important; height: 100% !important; top: 0; left: 0; right: 0; bottom: 0; }
        .react-flow { width: 100% !important; height: 100% !important; position: absolute !important; }
      `}} />
    </>
  );
});

export default Canvas;