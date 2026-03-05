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
import { ClusterConfig, CorrelationConfig, DataSummaryConfig, DrillDownConfig, FilterConfig, ForecastConfig, MovingAverageConfig, PercentileConfig, PivotConfig, ReferenceLineConfig, RunningTotalConfig, SliceConfig, TrendLineConfig } from '../types/analytics-configs';
import { BarChartConfig, BoxPlotConfig, FunnelConfig, HeatmapConfig, HistogramConfig, KpiConfig, LineChartConfig, ParetoChartConfig, ScatterPlotConfig, WaterfallConfig } from '../types/visualization-configs';

// Import persistence service
import { canvasPersistence, CanvasRecord } from '../services/canvas-persistence.service';

// ==================== CONFIGURATION DIALOGS ====================
import { DataSummaryConfigDialog } from '../components/analytics/DataSummaryConfigDialog';
import { BoxPlotConfigDialog } from '../components/visualization/BoxPlotConfigDialog';
import { CorrelationConfigDialog } from '@/components/analytics/CorrelationConfigDialog';
import { ForecastConfigDialog } from '@/components/analytics/ForecastConfigDialog';
import { PivotAnalyticsConfigDialog } from '@/components/analytics/PivotAnalyticsConfigDialog';
import { ClusterConfigDialog } from '@/components/analytics/ClusterConfigDialog';
import { ReferenceLineConfigDialog } from '@/components/analytics/ReferenceLineConfigDialog';
import { TrendLineConfigDialog } from '@/components/analytics/TrendLineConfigDialog';
import { MovingAverageConfigDialog } from '@/components/analytics/MovingAverageConfigDialog';
import { PercentileConfigDialog } from '@/components/analytics/PercentileConfigDialog';
import { RankConfigDialog } from '@/components/analytics/RankConfigDialog';
import { RunningTotalConfigDialog } from '@/components/analytics/RunningTotalConfigDialog';
import { StatisticalSummaryConfigDialog } from '@/components/analytics/StatisticalSummaryConfigDialog';
import { BarChartConfigDialog } from '@/components/visualization/BarChartConfigDialog';
import { LineChartConfigDialog } from '@/components/visualization/LineChartConfigDialog';
import { PieChartConfigDialog } from '@/components/visualization/PieChartConfigDialog';
import { ScatterPlotConfigDialog } from '@/components/visualization/ScatterPlotConfigDialog';
import { HistogramConfigDialog } from '@/components/visualization/HistogramConfigDialog';
import { HeatmapConfigDialog } from '@/components/visualization/HeatmapConfigDialog';
import { KpiConfigDialog } from '@/components/visualization/KpiConfigDialog';
import { MapConfigDialog } from '@/components/visualization/MapConfigDialog';
import { GaugeConfigDialog } from '@/components/visualization/GaugeConfigDialog';
import { FunnelConfigDialog } from '@/components/visualization/FunnelConfigDialog';
import { TreemapConfigDialog } from '@/components/visualization/TreemapConfigDialog';
import { AreaChartConfigDialog } from '@/components/visualization/AreaChartConfigDialog';
import { ScatterMatrixConfigDialog } from '@/components/visualization/ScatterMatrixConfigDialog';
import { DualAxisConfigDialog } from '@/components/visualization/DualAxisConfigDialog';
import { ParetoChartConfigDialog } from '@/components/visualization/ParetoChartConfigDialog';
import { WordCloudConfigDialog } from '@/components/visualization/WordCloudConfigDialog';

// ==================== NEW DIALOGS ====================
import { OutlierDetectionConfigDialog } from '@/components/analytics/OutlierDetectionConfigDialog';
import { BubbleChartConfigDialog } from '@/components/visualization/BubbleChartConfigDialog';

// ==================== MISSING ANALYTICS DIALOGS (ADDED) ====================
import { SliceConfigDialog } from '@/components/analytics/SliceConfigDialog';
import { DrillDownConfigDialog } from '@/components/analytics/DrillDownConfigDialog';
import { FilterConfigDialog } from '@/components/analytics/FilterConfigDialog';

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
  const sourceFields = sourceNode.data?.schemas?.output?.fields?.map((f: FieldSchema) => f.name) || [];
  const targetFields = targetNode.data?.schemas?.input?.[0]?.fields?.map((f: FieldSchema) => f.name) || [];

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
    return sourceNode.data.schemas.output.fields.map((f: FieldSchema) => ({
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
  inputFields.forEach((f: FieldSchema) => fieldMap.set(f.name, f.type));

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
const handleForecastConfigSave = useCallback((nodeId: string, config: ForecastConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema based on config
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields: FieldSchema[] = [];

      // Add grouping columns if any
      if (config.groupBy) {
        config.groupBy.forEach(col => {
          const field = inputFields.find((f: FieldSchema) => f.name === col);
          if (field) {
            // Preserve original field metadata including isKey
            outputFields.push({ ...field, id: `${nodeId}_${col}` });
          } else {
            // Fallback if column not found in input (should not happen)
            outputFields.push({
              id: `${nodeId}_${col}`,
              name: col,
              type: 'STRING',
              nullable: true,
              isKey: false,
            });
          }
        });
      }

      // Add time column
      const timeField = inputFields.find((f: FieldSchema) => f.name === config.timeColumn);
      if (timeField) {
        outputFields.push({ ...timeField, id: `${nodeId}_time` });
      } else {
        outputFields.push({
          id: `${nodeId}_time`,
          name: config.timeColumn,
          type: 'TIMESTAMP', // assume timestamp; adjust if needed
          nullable: true,
          isKey: false,
        });
      }

      // Add forecast value column
      outputFields.push({
        id: `${nodeId}_forecast_value`,
        name: config.output.forecastAlias || 'forecast',
        type: 'DECIMAL',
        nullable: true,
        isKey: false,
      });

      // Add confidence intervals if requested
      if (config.output.includeConfidence) {
        outputFields.push({
          id: `${nodeId}_lower_bound`,
          name: 'lower_bound',
          type: 'DECIMAL',
          nullable: true,
          isKey: false,
        });
        outputFields.push({
          id: `${nodeId}_upper_bound`,
          name: 'upper_bound',
          type: 'DECIMAL',
          nullable: true,
          isKey: false,
        });
      }

      const outputSchema = {
        id: `${nodeId}_output`,
        name: 'Forecast Output',
        fields: outputFields,
        isTemporary: true,
        isMaterialized: false,
      };

      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config,
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'forecast',
          },
        },
        schemas: {
          ...node.data.schemas,
          output: outputSchema,
        },
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

const handleRunningTotalConfigSave = useCallback((nodeId: string, config: RunningTotalConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields: FieldSchema[] = [];

      // If includeAllColumns, keep all input fields
      if (config.includeAllColumns) {
        outputFields.push(...inputFields);
      } else {
        // Otherwise add partition columns, order columns, and value column (keeping original types)
        const addField = (name: string) => {
          const field = inputFields.find((f: FieldSchema) => f.name === name);
          if (field) {
            outputFields.push({ ...field, id: `${nodeId}_${name}` });
          } else {
            outputFields.push({
              id: `${nodeId}_${name}`,
              name,
              type: 'STRING', // fallback
              nullable: true,
              isKey: false,
            });
          }
        };
        config.partitionBy?.forEach(addField);
        config.orderBy.forEach(o => addField(o.column));
        addField(config.valueColumn);
      }

      // Add running total alias
      outputFields.push({
        id: `${nodeId}_${config.alias || 'running_total'}`,
        name: config.alias || 'running_total',
        type: 'DECIMAL', // running total is numeric
        nullable: true,
        isKey: false,
      });

      const outputSchema = {
        id: `${nodeId}_output`,
        name: 'Running Total Output',
        fields: outputFields,
        isTemporary: true,
        isMaterialized: false,
      };

      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config,
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'running-total',
          },
        },
        schemas: {
          ...node.data.schemas,
          output: outputSchema,
        },
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

const handleLineChartConfigSave = useCallback((nodeId: string, config: LineChartConfig) => {
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
            chartType: 'line-chart',
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

const handleBarChartConfigSave = useCallback((nodeId: string, config: BarChartConfig) => {
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
            chartType: 'bar-chart',
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

// Inside Canvas.tsx, add handler
const handlePercentileConfigSave = useCallback((nodeId: string, config: PercentileConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields: FieldSchema[] = [];

      // Add group by columns (preserve types from input)
      config.groupBy?.forEach(col => {
        const field = inputFields.find((f: FieldSchema) => f.name === col);
        outputFields.push({
          id: `${nodeId}_${col}`,
          name: col,
          type: field?.type || 'STRING',
          nullable: true,
          isKey: false,
        });
      });

      // Add percentile columns (always DECIMAL)
      const aliasBase = config.output?.aliasBase || 'p';
      config.percentiles.forEach(p => {
        const alias = `${aliasBase}${Math.round(p * 100)}`;
        outputFields.push({
          id: `${nodeId}_${alias}`,
          name: alias,
          type: 'DECIMAL',
          nullable: true,
          isKey: false,
        });
      });

      const outputSchema = {
        id: `${nodeId}_output`,
        name: 'Percentile Output',
        fields: outputFields,
        isTemporary: true,
        isMaterialized: false,
      };

      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config,
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'percentile',
          },
        },
        schemas: {
          ...node.data.schemas,
          output: outputSchema,
        },
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

const handleMovingAverageConfigSave = useCallback((nodeId: string, config: MovingAverageConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema: keep partition columns + order column + value column + alias
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields: FieldSchema[] = [];

      // Add partition columns
      if (config.partitionBy) {
        config.partitionBy.forEach(col => {
          const field = inputFields.find((f: FieldSchema) => f.name === col);
          if (field) outputFields.push({ ...field, id: `${nodeId}_${col}` });
        });
      }

      // Add order column
      const orderField = inputFields.find((f: FieldSchema) => f.name === config.orderByColumn);
      if (orderField) outputFields.push({ ...orderField, id: `${nodeId}_${config.orderByColumn}` });

      // Add value column
      const valueField = inputFields.find((f: FieldSchema) => f.name === config.valueColumn);
      if (valueField) outputFields.push({ ...valueField, id: `${nodeId}_${config.valueColumn}` });

      // Add moving average alias
      outputFields.push({
        id: `${nodeId}_${config.alias}`,
        name: config.alias || 'moving_avg',
        type: 'DECIMAL', // moving average yields decimal
        nullable: true,
        isKey: false,
      });

      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config,
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'moving-average',
          },
        },
        schemas: {
          ...node.data.schemas,
          output: {
            id: `${nodeId}_output`,
            name: 'Moving Average Output',
            fields: outputFields,
            isTemporary: true,
            isMaterialized: false,
          },
        },
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

const handleTrendLineConfigSave = useCallback((nodeId: string, config: TrendLineConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Update node's configuration and schemas (output schema is dynamic)
      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config,
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'trend-line',
          },
        },
        // Optionally update output schema based on config
        schemas: {
          ...node.data.schemas,
          output: {
            id: `${node.id}_output`,
            name: 'Trend Line Output',
            fields: [], // Could be built from config, but processor will handle
            isTemporary: true,
            isMaterialized: false,
          },
        },
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);


const handleReferenceLineConfigSave = useCallback((nodeId: string, config: ReferenceLineConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema: keep all input fields + new reference line columns
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields = [...inputFields];

      config.definitions.forEach(def => {
        const alias = def.alias || `${def.type}_${def.column || 'value'}`;
        // Determine data type (simplified: for constant, use number; for others, keep numeric)
        let type: DataType = 'DECIMAL';
        if (def.type === 'constant') type = 'DECIMAL';
        else if (def.type === 'average' || def.type === 'median' || def.type === 'percentile') type = 'DECIMAL';
        else if (def.type === 'custom') type = 'STRING'; // fallback

        outputFields.push({
          id: `${nodeId}_${alias}`,
          name: alias,
          type,
          nullable: true,
          isKey: false,
        });
      });

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
            analyticType: 'reference-line'
          }
        },
        schemas: {
          ...node.data.schemas,
          output: {
            id: `${nodeId}_output`,
            name: 'Reference Line Output',
            fields: outputFields,
            isTemporary: true,
            isMaterialized: false
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

const handleClusterConfigSave = useCallback((nodeId: string, config: ClusterConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema based on config
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields: FieldSchema[] = [];

      // Add all original numeric columns? Or just cluster assignment? Usually we want original columns + cluster id.
      // Here we keep all input columns (since clustering doesn't change them) and add the cluster column.
      outputFields.push(...inputFields);

      // Add cluster assignment column
      outputFields.push({
        id: `${nodeId}_${config.output.clusterColumn}`,
        name: config.output.clusterColumn,
        type: 'INTEGER', // cluster IDs are integers
        nullable: true,
        isKey: false,
      });

      // Optionally add centroid columns if includeCentroids is true – depends on SQL implementation
      // For simplicity we just add the cluster column.

      const outputSchema = {
        id: `${nodeId}_output`,
        name: 'Cluster Output',
        fields: outputFields,
        isTemporary: true,
        isMaterialized: false,
      };

      const updatedData = {
        ...node.data,
        metadata: {
          ...node.data.metadata,
          configuration: config,
        },
        configuration: {
          ...node.data.configuration,
          config: {
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'cluster', // you may need to add 'cluster' to AnalyticType
          },
        },
        schemas: {
          ...node.data.schemas,
          output: outputSchema,
        },
      };
      return { ...node, data: updatedData };
    }
    return node;
  }));
  syncNodesAndEdges(nodes, edges);
  debouncedAutoSave();
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);


const handleKpiConfigSave = useCallback((nodeId: string, config: KpiConfig) => {
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
            chartType: 'kpi',
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

const handleHeatmapConfigSave = useCallback((nodeId: string, config: HeatmapConfig) => {
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
            chartType: 'heatmap',
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

const handleHistogramConfigSave = useCallback((nodeId: string, config: HistogramConfig) => {
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
            chartType: 'histogram',
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


const handleScatterPlotConfigSave = useCallback((nodeId: string, config: ScatterPlotConfig) => {
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
            chartType: 'scatter-plot', // ensure chartType matches
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


const handleFunnelConfigSave = useCallback((nodeId: string, config: FunnelConfig) => {
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
            chartType: 'funnel',
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

const handleWaterfallConfigSave = useCallback((nodeId: string, config: WaterfallConfig) => {
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
            chartType: 'waterfall',
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


const handleParetoConfigSave = useCallback((nodeId: string, config: ParetoChartConfig) => {
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
            chartType: 'pareto',
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

  const handlePivotConfigSave = useCallback((nodeId: string, config: PivotConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Update node's configuration and schemas (output schema is dynamic, we might not compute it here)
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
            analyticType: 'pivot'
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

const handleFilterConfigSave = useCallback((nodeId: string, config: FilterConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Output schema: either selected columns or all input columns
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      let outputFields = inputFields;
      if (config.outputColumns && config.outputColumns.length > 0) {
        outputFields = inputFields.filter((f: FieldSchema) => config.outputColumns!.includes(f.name));
      }

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
            analyticType: 'filter'
          }
        },
        schemas: {
          ...node.data.schemas,
          output: {
            id: `${node.id}_output`,
            name: 'Filter Output',
            fields: outputFields,
            isTemporary: true,
            isMaterialized: false
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

const handleCorrelationConfigSave = useCallback((nodeId: string, config: CorrelationConfig) => {
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
            ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
            parameters: config,
            analyticType: 'correlation'
          }
        },
        // Optionally update output schema (simple version: pairs or matrix columns)
        schemas: {
          ...node.data.schemas,
          output: {
            id: `${node.id}_output`,
            name: 'Correlation Output',
            fields: [], // Could build from config, but processor will handle
            isTemporary: true,
            isMaterialized: false
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


const handleDrillDownConfigSave = useCallback((nodeId: string, config: DrillDownConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Build output schema: hierarchy columns + measure aliases
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
      const outputFields: { id: string; name: string; type: any; nullable: boolean; }[] = [];

      // Hierarchy columns (use original names)
      config.hierarchy.forEach(colName => {
        const field = inputFields.find((f: FieldSchema) => f.name === colName);
        outputFields.push({
          id: `${colName}_hierarchy`,
          name: colName,
          type: field?.type || 'STRING',
          nullable: true,
        });
      });

      // Measure columns (use alias if provided, else column_aggregation)
      config.measures.forEach(m => {
        if (!m.column) return;
        const alias = m.alias || `${m.aggregation}_${m.column}`;
        // Determine data type from aggregation
        let type: DataType = 'DECIMAL';
        if (m.aggregation === 'count') type = 'INTEGER';
        else if (['min', 'max'].includes(m.aggregation)) {
          const field = inputFields.find((f: FieldSchema) => f.name === m.column);
          type = field?.type || 'DECIMAL';
        }
        outputFields.push({
          id: alias,
          name: alias,
          type,
          nullable: true,
        });
      });

      const outputSchema = {
        id: `${node.id}_output`,
        name: 'Drill‑Down Output',
        fields: outputFields,
        isTemporary: true,
        isMaterialized: false,
      };

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
            analyticType: 'drilldown'  // you may need to add this to your AnalyticsComponentConfiguration
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

const handleSliceConfigSave = useCallback((nodeId: string, config: SliceConfig) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      // Update output schema: same as input (no structural change)
      const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
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
            analyticType: 'slice'
          }
        },
        schemas: {
          ...node.data.schemas,
          output: {
            id: `${node.id}_output`,
            name: 'Slice Output',
            fields: inputFields,  // same fields, just filtered rows
            isTemporary: true,
            isMaterialized: false
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
    case 'filter':
      handleFilterConfigSave(nodeId, config);
      break;
    case 'slice':
      handleSliceConfigSave(nodeId, config);
      break;
    case 'drill-down':
      handleDrillDownConfigSave(nodeId, config);
      break;
    case 'correlation':
      handleCorrelationConfigSave(nodeId, config);
      break;
    case 'forecast':
      handleForecastConfigSave(nodeId, config);
      break;    
    case 'bar-chart':
      handleBarChartConfigSave(nodeId, config);
      break;
    case 'line-chart':
      handleLineChartConfigSave(nodeId, config);
      break;
    case 'scatter-plot':
      handleScatterPlotConfigSave(nodeId, config);
      break;
    case 'histogram':
      handleHistogramConfigSave(nodeId, config);
      break;
    case 'heatmap':
      handleHeatmapConfigSave(nodeId, config);
      break;
    case 'kpi':
      handleKpiConfigSave(nodeId, config);
      break;
    case 'waterfall':
      handleWaterfallConfigSave(nodeId, config);
      break;
    case 'pareto':
      handleParetoConfigSave(nodeId, config);
      break;
    case 'pivot':
      handlePivotConfigSave(nodeId, config);
      // Inline pivot logic (or call a dedicated function)
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
                ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
                parameters: config,
                analyticType: 'pivot'
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'cluster':
      handleClusterConfigSave(nodeId, config);
      break;
    case 'reference-line':
      handleReferenceLineConfigSave(nodeId, config);
      break;
    case 'trend-line':
      handleTrendLineConfigSave(nodeId, config);
      break;
    case 'moving-average':
      handleMovingAverageConfigSave(nodeId, config);
      break;
    case 'percentile':
      handlePercentileConfigSave(nodeId, config);
      break;
    case 'running-total':
      handleRunningTotalConfigSave(nodeId, config);
      break;
    case 'rank':
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
                ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
                parameters: config,
                analyticType: 'rank'
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'statistical-summary':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              configuration: config,
            },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
                parameters: config,
                analyticType: 'statistical-summary',
              },
            },
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'pie-chart':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: { ...node.data.metadata, configuration: config },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'VISUALIZATION' ? node.data.configuration.config : {}),
                parameters: config,
                chartType: 'pie-chart',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'map':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: { ...node.data.metadata, configuration: config },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'VISUALIZATION' ? node.data.configuration.config : {}),
                parameters: config,
                chartType: 'map',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'gauge':
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
                chartType: 'gauge',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'treemap':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: { ...node.data.metadata, configuration: config },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'VISUALIZATION' ? node.data.configuration.config : {}),
                parameters: config,
                chartType: 'treemap',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'area-chart':
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
                chartType: 'area-chart',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'dual-axis':
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
                chartType: 'dual-axis',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'word-cloud':
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
                chartType: 'word-cloud',
              }
            }
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    // ==================== NEW CASES ====================
    case 'outlier-detection':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: { ...node.data.metadata, configuration: config },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'ANALYTICS' ? node.data.configuration.config : {}),
                parameters: config,
                analyticType: 'outlier-detection',
              },
            },
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'bubble-chart':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: { ...node.data.metadata, configuration: config },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'VISUALIZATION' ? node.data.configuration.config : {}),
                parameters: config,
                chartType: 'bubble-chart',
              },
            },
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    case 'scatter-matrix':
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          const updatedData = {
            ...node.data,
            metadata: { ...node.data.metadata, configuration: config },
            configuration: {
              ...node.data.configuration,
              config: {
                ...(node.data.configuration.type === 'VISUALIZATION' ? node.data.configuration.config : {}),
                parameters: config,
                chartType: 'scatter-matrix',
              },
            },
          };
          return { ...node, data: updatedData };
        }
        return node;
      }));
      syncNodesAndEdges(nodes, edges);
      debouncedAutoSave();
      break;
    default:
      console.warn(`Unknown component key: ${componentKey}`);
  }
  setConfigDialog(null);
}, [nodes, edges, syncNodesAndEdges, debouncedAutoSave]);

  // ==================== DOUBLE‑CLICK HANDLER FOR CONFIGURATION ====================
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
  } else if (componentKey === 'filter') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        logicalOperator: existingConfig.logicalOperator || 'AND',
        conditions: existingConfig.conditions || [],
        outputColumns: existingConfig.outputColumns || [],
        options: existingConfig.options || {}
      }
    });
  }
  // 🆕 SLICE BRANCH ADDED
  else if (componentKey === 'slice') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        column: existingConfig.column || '',
        operator: existingConfig.operator || 'IN',
        values: existingConfig.values || [],
        includeNulls: existingConfig.includeNulls ?? false,
        caseSensitive: existingConfig.caseSensitive ?? false,
      }
    });
  }
  else if (componentKey === 'drill-down') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        hierarchy: existingConfig.hierarchy || [],
        measures: existingConfig.measures || [],
        filters: existingConfig.filters || [],
        options: existingConfig.options || {}
      }
    });
  }
  else if (componentKey === 'pivot') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        rows: existingConfig.rows || [],
        columns: existingConfig.columns || [],
        values: existingConfig.values || [],
        filters: existingConfig.filters || [],
        sort: existingConfig.sort || [],
        options: existingConfig.options || {},
      },
    });
  }
  else if (componentKey === 'correlation') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        columns: existingConfig.columns || [],
        method: existingConfig.method || 'pearson',
        missingHandling: existingConfig.missingHandling || 'pairwise',
        outputFormat: existingConfig.outputFormat || 'pairs',
        includePValues: existingConfig.includePValues ?? false,
        pValueThreshold: existingConfig.pValueThreshold,
        alias: existingConfig.alias || 'correlation_output',
      }
    });
  }
  else if (componentKey === 'forecast') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        timeColumn: existingConfig.timeColumn || '',
        valueColumn: existingConfig.valueColumn || '',
        horizon: existingConfig.horizon || 12,
        groupBy: existingConfig.groupBy || [],
        seasonality: existingConfig.seasonality || { enabled: true, period: 'auto' },
        confidenceLevel: existingConfig.confidenceLevel || 0.95,
        model: existingConfig.model || 'linear',
        customSql: existingConfig.customSql || '',
        transformations: existingConfig.transformations || [],
        output: existingConfig.output || { includeHistorical: true, includeConfidence: true },
        filters: existingConfig.filters || [],
        inputLimit: existingConfig.inputLimit,
      }
    });
  }
  else if (componentKey === 'cluster') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        columns: existingConfig.columns || [],
        method: existingConfig.method || 'kmeans',
        numberOfClusters: existingConfig.numberOfClusters || 3,
        distanceMetric: existingConfig.distanceMetric || 'euclidean',
        scaling: existingConfig.scaling ?? true,
        scalingMethod: existingConfig.scalingMethod || 'standard',
        parameters: existingConfig.parameters || {},
        output: existingConfig.output || { clusterColumn: 'cluster_id', alias: 'clustering_output' },
        filters: existingConfig.filters || [],
        inputLimit: existingConfig.inputLimit,
      }
    });
  }
  else if (componentKey === 'reference-line') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        definitions: existingConfig.definitions || [],
        groupBy: existingConfig.groupBy || [],
        filters: existingConfig.filters || [],
        options: existingConfig.options || {},
      }
    });
  }
  else if (componentKey === 'trend-line') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        xColumn: existingConfig.xColumn || '',
        yColumn: existingConfig.yColumn || '',
        groupBy: existingConfig.groupBy || [],
        model: existingConfig.model || 'linear',
        polynomialDegree: existingConfig.polynomialDegree || 2,
        customSql: existingConfig.customSql || '',
        includeConfidence: existingConfig.includeConfidence ?? false,
        confidenceLevel: existingConfig.confidenceLevel || 0.95,
        output: existingConfig.output || {
          fittedValues: true,
          includeStatistics: true,
          fittedAlias: 'trend_value',
          lowerBoundAlias: 'lower_bound',
          upperBoundAlias: 'upper_bound',
          alias: 'trend_output',
        },
        filters: existingConfig.filters || [],
        inputLimit: existingConfig.inputLimit,
      },
    });
  }
  else if (componentKey === 'moving-average') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        orderByColumn: existingConfig.orderByColumn || '',
        valueColumn: existingConfig.valueColumn || '',
        partitionBy: existingConfig.partitionBy || [],
        windowSize: existingConfig.windowSize ?? 3,
        alias: existingConfig.alias || 'moving_avg',
        filters: existingConfig.filters || [],
        limit: existingConfig.limit,
      },
    });
  }
  else if (componentKey === 'percentile') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        valueColumn: existingConfig.valueColumn || '',
        percentiles: existingConfig.percentiles || [0.25, 0.5, 0.75],
        groupBy: existingConfig.groupBy || [],
        filters: existingConfig.filters || [],
        output: existingConfig.output || { aliasBase: 'p', tableName: 'percentile_output' },
        options: existingConfig.options || { method: 'continuous', distinct: false, limit: undefined },
      },
    });
  }
  else if (componentKey === 'rank') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        orderBy: existingConfig.orderBy || [],
        partitionBy: existingConfig.partitionBy || [],
        function: existingConfig.function || 'rank',
        ntileBuckets: existingConfig.ntileBuckets || 4,
        alias: existingConfig.alias || '',
        customExpression: existingConfig.customExpression || '',
        filters: existingConfig.filters || [],
        limit: existingConfig.limit,
        includeAllColumns: existingConfig.includeAllColumns ?? true,
      },
    });
  }
  else if (componentKey === 'running-total') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        partitionBy: existingConfig.partitionBy || [],
        orderBy: existingConfig.orderBy || [{ column: '', direction: 'asc' }],
        valueColumn: existingConfig.valueColumn || '',
        alias: existingConfig.alias || 'running_total',
        frame: existingConfig.frame || { start: 'UNBOUNDED PRECEDING', end: 'CURRENT ROW' },
        filters: existingConfig.filters || [],
        limit: existingConfig.limit,
        includeAllColumns: existingConfig.includeAllColumns ?? true,
      },
    });
  }
  else if (componentKey === 'statistical-summary') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        columns: existingConfig.columns || [],
        statistics: existingConfig.statistics || {
          count: true, sum: true, avg: true, min: true, max: true,
          stddev: false, variance: false, skewness: false, kurtosis: false,
          median: false, percentiles: [],
        },
        groupBy: existingConfig.groupBy || [],
        filters: existingConfig.filters || [],
        outputTable: existingConfig.outputTable || 'statistical_summary',
        options: existingConfig.options || { decimalPlaces: 2, includeNulls: false, distinct: false, limit: undefined },
      },
    });
  }
  else if (componentKey === 'line-chart') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        xField: existingConfig.xField || '',
        yField: existingConfig.yField || '',
        colorField: existingConfig.colorField || '',
        sizeField: existingConfig.sizeField || '',
        facetField: existingConfig.facetField || '',
        lineType: existingConfig.lineType || 'linear',
        lineWidth: existingConfig.lineWidth ?? 2,
        showMarkers: existingConfig.showMarkers ?? false,
        fillArea: existingConfig.fillArea ?? false,
        stackSeries: existingConfig.stackSeries ?? false,
        showLegend: existingConfig.showLegend ?? false,
        showGrid: existingConfig.showGrid ?? true,
        dimensions: existingConfig.dimensions || { width: 600, height: 400 },
      }
    });
  }
  else if (componentKey === 'pie-chart') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        angleField: existingConfig.angleField || '',
        colorField: existingConfig.colorField || '',
        seriesField: existingConfig.seriesField || '',
        multiPieMode: existingConfig.multiPieMode || 'single',
        innerRadius: existingConfig.innerRadius ?? 0,
        outerRadius: existingConfig.outerRadius ?? 0.8,
        startAngle: existingConfig.startAngle ?? 0,
        endAngle: existingConfig.endAngle ?? 360,
        roseType: existingConfig.roseType ?? false,
        clockwise: existingConfig.clockwise ?? true,
        avoidLabelOverlap: existingConfig.avoidLabelOverlap ?? false,
        labelLine: existingConfig.labelLine || { show: true, length: 15, length2: 15 },
        colorScheme: existingConfig.colorScheme || '#3b82f6',
        opacity: existingConfig.opacity ?? 1,
        labels: existingConfig.labels || { show: true, position: 'outside', fontSize: 12 },
        showLegend: existingConfig.showLegend ?? true,
        legend: existingConfig.legend || { position: 'top', orient: 'horizontal' },
        tooltip: existingConfig.tooltip || { show: true },
        interactivity: existingConfig.interactivity || { hoverHighlight: true },
        animation: existingConfig.animation || { enabled: true },
        dimensions: existingConfig.dimensions || { width: 500, height: 400 },
        exportable: existingConfig.exportable ?? true,
        responsive: existingConfig.responsive || { enabled: true },
      }
    });
  }
  else if (componentKey === 'scatter-plot') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      }
    });
  }
  else if (componentKey === 'histogram') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        xField: existingConfig.xField || '',
        colorField: existingConfig.colorField || '',
        facetField: existingConfig.facetField || '',
        binning: existingConfig.binning || { method: 'auto', bins: 30 },
        orientation: existingConfig.orientation || 'vertical',
        normalization: existingConfig.normalization || 'count',
        cumulative: existingConfig.cumulative ?? false,
        barStyle: existingConfig.barStyle || {
          fillColor: '#3b82f6',
          fillOpacity: 0.7,
          borderColor: '#1e3a8a',
          borderWidth: 1,
          borderRadius: 0,
          gap: 1,
        },
        colorScheme: existingConfig.colorScheme || '#3b82f6',
        colorGradient: existingConfig.colorGradient ?? false,
        gradientDirection: existingConfig.gradientDirection || 'vertical',
        xAxis: existingConfig.xAxis || {
          visible: true,
          title: '',
          tickFormat: '',
          tickCount: undefined,
          tickLabelRotation: 0,
          lineColor: '#cccccc',
          lineWidth: 1,
          tickColor: '#999999',
          tickSize: 6,
          scaleType: 'linear',
        },
        yAxis: existingConfig.yAxis || {
          visible: true,
          title: '',
          tickFormat: '',
          tickCount: undefined,
          lineColor: '#cccccc',
          lineWidth: 1,
          tickColor: '#999999',
          tickSize: 6,
          scaleType: 'linear',
          zeroBaseline: true,
        },
        showGrid: existingConfig.showGrid ?? true,
        grid: existingConfig.grid || { color: '#e5e5e5', width: 0.5, dash: '', xLines: false, yLines: true },
        showLegend: existingConfig.showLegend ?? false,
        legend: existingConfig.legend || { position: 'top', orient: 'horizontal', itemGap: 10 },
        tooltip: existingConfig.tooltip || { show: true, trigger: 'axis' },
        dataLabels: existingConfig.dataLabels || { show: false, position: 'top', fontSize: 11 },
        interactivity: existingConfig.interactivity || { zoom: true, pan: true, selection: 'none' },
        animation: existingConfig.animation || { enabled: true, duration: 300, easing: 'ease' },
        dimensions: existingConfig.dimensions || { width: 600, height: 400 },
        responsive: existingConfig.responsive || { enabled: true },
        exportable: existingConfig.exportable ?? true,
        exportFormats: existingConfig.exportFormats || ['png', 'svg', 'pdf'],
        accessibility: existingConfig.accessibility || { ariaLabel: 'Histogram chart', highContrast: false, focusable: true },
        performance: existingConfig.performance || { downsampling: false, progressive: false },
      }
    });
  }
  else if (componentKey === 'heatmap') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        xField: existingConfig.xField || '',
        yField: existingConfig.yField || '',
        valueField: existingConfig.valueField || '',
        groupField: existingConfig.groupField || '',
      }
    });
  }
  else if (componentKey === 'kpi') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        primaryValueField: existingConfig.primaryValueField || '',
        secondaryValueField: existingConfig.secondaryValueField || '',
        labelField: existingConfig.labelField || '',
        numberFormat: existingConfig.numberFormat || ',.2f',
        prefix: existingConfig.prefix || '',
        suffix: existingConfig.suffix || '',
        decimalPlaces: existingConfig.decimalPlaces ?? 2,
        comparison: existingConfig.comparison || { type: 'none' },
        primaryColor: existingConfig.primaryColor || '#000000',
        labelColor: existingConfig.labelColor || '#666666',
        backgroundColor: existingConfig.backgroundColor || '#ffffff',
        border: existingConfig.border || { color: '#ccc', width: 1, radius: 4, style: 'solid' },
        shadow: existingConfig.shadow ?? false,
        padding: existingConfig.padding || { top: 8, right: 8, bottom: 8, left: 8 },
        typography: existingConfig.typography || {},
        sparkline: existingConfig.sparkline || { enabled: false },
        tooltip: existingConfig.tooltip || { show: false },
        clickAction: existingConfig.clickAction || 'none',
        hoverEffect: existingConfig.hoverEffect ?? true,
        responsive: existingConfig.responsive || { enabled: false },
        exportable: existingConfig.exportable ?? true,
        exportFormats: existingConfig.exportFormats || ['png'],
        accessibility: existingConfig.accessibility || {},
        dimensions: existingConfig.dimensions || { width: 200, height: 100 },
      }
    });
  }
  else if (componentKey === 'map') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      }
    });
  }
  else if (componentKey === 'gauge') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      }
    });
  }
  else if (componentKey === 'funnel') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        stageField: existingConfig.stageField || '',
        valueField: existingConfig.valueField || '',
        groupField: existingConfig.groupField || '',
        orientation: existingConfig.orientation || 'vertical',
        shape: existingConfig.shape || 'trapezoid',
        barWidth: existingConfig.barWidth,
        barGap: existingConfig.barGap ?? 2,
        stageOrder: existingConfig.stageOrder || 'descending',
        customStageOrder: existingConfig.customStageOrder || [],
        barStyle: existingConfig.barStyle || {
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          borderColor: '#1e3a8a',
          borderWidth: 1,
          borderRadius: 0
        },
        colorScheme: existingConfig.colorScheme || '#3b82f6',
        colorGradient: existingConfig.colorGradient ?? false,
        gradientDirection: existingConfig.gradientDirection || 'vertical',
        showGrid: existingConfig.showGrid ?? true,
        showLegend: existingConfig.showLegend ?? false,
        dimensions: existingConfig.dimensions || { width: 600, height: 400 },
        dataLabels: existingConfig.dataLabels || { show: false, position: 'inside', fontSize: 11 },
        tooltip: existingConfig.tooltip || { show: true },
        legend: existingConfig.legend || { show: false, position: 'top' },
        interactivity: existingConfig.interactivity || { zoom: false, pan: false, selection: 'none' },
        animation: existingConfig.animation || { enabled: true },
        responsive: existingConfig.responsive || { enabled: true },
        exportable: existingConfig.exportable ?? true,
        exportFormats: existingConfig.exportFormats || ['png', 'svg', 'pdf'],
      }
    });
  }
  else if (componentKey === 'treemap') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      }
    });
  }
  else if (componentKey === 'waterfall') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      },
    });
  }
  else if (componentKey === 'area-chart') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        xField: existingConfig.xField || '',
        yField: existingConfig.yField || '',
        colorField: existingConfig.colorField || '',
        sizeField: existingConfig.sizeField || '',
        facetField: existingConfig.facetField || '',
        fillOpacity: existingConfig.fillOpacity ?? 0.7,
        fillGradient: existingConfig.fillGradient ?? false,
        gradientDirection: existingConfig.gradientDirection || 'vertical',
        curve: existingConfig.curve || 'monotone',
        stackMode: existingConfig.stackMode || 'none',
        baseline: existingConfig.baseline || 'zero',
        dimensions: existingConfig.dimensions || { width: 600, height: 400 },
      }
    });
  }
  else if (componentKey === 'dual-axis') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        description: existingConfig.description || '',
        xField: existingConfig.xField || '',
        series: existingConfig.series || [],
        leftAxis: existingConfig.leftAxis || {},
        rightAxis: existingConfig.rightAxis || {},
        showGrid: existingConfig.showGrid ?? true,
        grid: existingConfig.grid || {},
        showLegend: existingConfig.showLegend ?? true,
        legend: existingConfig.legend || {},
        tooltip: existingConfig.tooltip || {},
        interactivity: existingConfig.interactivity || {},
        annotations: existingConfig.annotations || [],
        animation: existingConfig.animation || {},
        dimensions: existingConfig.dimensions || { width: 600, height: 400 },
        responsive: existingConfig.responsive || {},
        exportable: existingConfig.exportable ?? true,
        exportFormats: existingConfig.exportFormats || ['png'],
        accessibility: existingConfig.accessibility || {},
        performance: existingConfig.performance || {},
      }
    });
  }
  else if (componentKey === 'pareto') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      }
    });
  }
  else if (componentKey === 'word-cloud') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
      }
    });
  }
  // ==================== NEW CASES ====================
  else if (componentKey === 'outlier-detection') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        columns: existingConfig.columns || [],
        method: existingConfig.method || 'iqr',
        threshold: existingConfig.threshold ?? 3,
        includeZScore: existingConfig.includeZScore ?? false,
        options: existingConfig.options || {},
      },
    });
  }
  else if (componentKey === 'bubble-chart') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        xField: existingConfig.xField || '',
        yField: existingConfig.yField || '',
        sizeField: existingConfig.sizeField || '',
        colorField: existingConfig.colorField || '',
        shapeField: existingConfig.shapeField || '',
        facetField: existingConfig.facetField || '',
        point: existingConfig.point || {
          symbol: 'circle',
          sizeScale: 'linear',
          sizeMin: 5,
          sizeMax: 30,
          baseSize: 10,
          opacity: 0.7,
          color: '#3b82f6',
          borderColor: '#ffffff',
          borderWidth: 1,
        },
        xAxis: existingConfig.xAxis || { visible: true, title: '' },
        yAxis: existingConfig.yAxis || { visible: true, title: '' },
        showGrid: existingConfig.showGrid ?? true,
        showLegend: existingConfig.showLegend ?? true,
        dimensions: existingConfig.dimensions || { width: 600, height: 400 },
      },
    });
  }
  else if (componentKey === 'scatter-matrix') {
    setConfigDialog({
      nodeId,
      componentKey,
      initialMetadata: {
        ...existingConfig,
        inputSchema,
        title: existingConfig.title || '',
        columns: existingConfig.columns || [],
        colorField: existingConfig.colorField || '',
        sizeField: existingConfig.sizeField || '',
        matrix: existingConfig.matrix || {
          columnsPerRow: 3,
          spacing: 10,
          diagonalContent: 'histogram',
          showDiagonalLabels: true,
          labelPosition: 'corner',
          sharedAxes: true,
        },
        point: existingConfig.point || {
          symbol: 'circle',
          size: 5,
          color: '#3b82f6',
          opacity: 0.7,
          borderColor: '#ffffff',
          borderWidth: 1,
        },
        xAxis: existingConfig.xAxis || { visible: true },
        yAxis: existingConfig.yAxis || { visible: true },
        showGrid: existingConfig.showGrid ?? true,
        showLegend: existingConfig.showLegend ?? true,
        dimensions: existingConfig.dimensions || { width: 800, height: 600 },
      },
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
      {configDialog && configDialog.componentKey === 'correlation' && (
        <CorrelationConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'forecast' && (
        <ForecastConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'pivot' && (
        <PivotAnalyticsConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'cluster' && (
        <ClusterConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'reference-line' && (
        <ReferenceLineConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'trend-line' && (
        <TrendLineConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'moving-average' && (
        <MovingAverageConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'percentile' && (
        <PercentileConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'rank' && (
        <RankConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'running-total' && (
        <RunningTotalConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'statistical-summary' && (
        <StatisticalSummaryConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'bar-chart' && (
        <BarChartConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'line-chart' && (
        <LineChartConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'pie-chart' && (
        <PieChartConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'scatter-plot' && (
        <ScatterPlotConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'histogram' && (
        <HistogramConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'heatmap' && (
        <HeatmapConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'kpi' && (
        <KpiConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'map' && (
        <MapConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'gauge' && (
        <GaugeConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'funnel' && (
        <FunnelConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'treemap' && (
        <TreemapConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'area-chart' && (
        <AreaChartConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'scatter-matrix' && (
        <ScatterMatrixConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'dual-axis' && (
        <DualAxisConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'pareto' && (
        <ParetoChartConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'word-cloud' && (
        <WordCloudConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {/* ==================== NEW DIALOGS ==================== */}
      {configDialog && configDialog.componentKey === 'outlier-detection' && (
        <OutlierDetectionConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'bubble-chart' && (
        <BubbleChartConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {/* ==================== ADDED MISSING DIALOGS ==================== */}
      {configDialog && configDialog.componentKey === 'slice' && (
        <SliceConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'drill-down' && (
        <DrillDownConfigDialog
          open={true}
          onClose={() => setConfigDialog(null)}
          initialMetadata={configDialog.initialMetadata}
          onSave={(config) => handleConfigSave(configDialog.nodeId, configDialog.componentKey, config)}
        />
      )}
      {configDialog && configDialog.componentKey === 'filter' && (
        <FilterConfigDialog
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