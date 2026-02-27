// src/types/pipeline-types.ts

/**
 * Analytics & Visualization Pipeline Types
 * (No data transformation components)
 */

// ==================== ENUMS ====================

export enum NodeType {
  // Analytics Components
  DATA_SUMMARY = 'data-summary',
  FILTER = 'filter',
  SLICE = 'slice',
  DRILL_DOWN = 'drill-down',
  PIVOT = 'pivot',
  CORRELATION = 'correlation',
  OUTLIER_DETECTION = 'outlier-detection',
  FORECAST = 'forecast',
  CLUSTER = 'cluster',
  REFERENCE_LINE = 'reference-line',
  TREND_LINE = 'trend-line',
  MOVING_AVERAGE = 'moving-average',
  PERCENTILE = 'percentile',
  RANK = 'rank',
  RUNNING_TOTAL = 'running-total',
  STATISTICAL_SUMMARY = 'statistical-summary',

  // Visualization Components
  BAR_CHART = 'bar-chart',
  LINE_CHART = 'line-chart',
  PIE_CHART = 'pie-chart',
  SCATTER_PLOT = 'scatter-plot',
  HISTOGRAM = 'histogram',
  HEATMAP = 'heatmap',
  BOX_PLOT = 'box-plot',
  KPI = 'kpi',
  MAP = 'map',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  TREEMAP = 'treemap',
  WATERFALL = 'waterfall',
  AREA_CHART = 'area-chart',
  BUBBLE_CHART = 'bubble-chart',
  SCATTER_MATRIX = 'scatter-matrix',
  DUAL_AXIS = 'dual-axis',
  PARETO = 'pareto',
  WORD_CLOUD = 'word-cloud',

  // Fallback / Generic
  UNKNOWN = 'unknown'
}

export enum PortType {
  INPUT = 'input',
  OUTPUT = 'output'
}

export enum PortSide {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}

export enum ConnectionStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  WARNING = 'warning',
  PENDING = 'pending',
  UNVALIDATED = 'unvalidated',
  ACTIVE = 'active',
  VALIDATED = 'validated',
  PENDING_VALIDATION = 'pending_validation'
}

export enum NodeStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
  WARNING = 'warning',
  DISABLED = 'disabled'
}

export enum DataSourceType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLSERVER = 'sqlserver',
  ORACLE = 'oracle',
  SQLITE = 'sqlite',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  XML = 'xml',
  PARQUET = 'parquet',
  AVRO = 'avro',
  WEBSERVICE = 'webservice',
  KAFKA = 'kafka'
}

// ==================== INTERFACES ====================

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

export interface ConnectionPort {
  id: string;
  type: PortType;
  side: PortSide;
  position: number; // percentage from top/left (0–100)
  label?: string;
  maxConnections?: number;
  isConnected?: boolean;
}

// ==================== ANALYTICS & VISUALIZATION CONFIGURATIONS ====================

/**
 * Configuration for an Analytics node.
 * Analytics nodes process incoming data and produce analytical results
 * (statistics, aggregations, derived metrics, etc.).
 */
export interface AnalyticsConfig {
  /** The specific analytic operation */
  analyticType:
    | 'summary'
    | 'filter'
    | 'slice'
    | 'drill-down'
    | 'pivot'
    | 'correlation'
    | 'outlier'
    | 'forecast'
    | 'cluster'
    | 'reference-line'
    | 'trend-line'
    | 'moving-average'
    | 'percentile'
    | 'rank'
    | 'running-total'
    | 'statistical-summary';

  /** Parameters for the analytic operation */
  parameters: Record<string, any>;

  /** Aggregation rules (if any) */
  aggregation?: {
    groupBy: string[];
    functions: Array<{
      column: string;
      function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'STDDEV' | 'VARIANCE';
      alias: string;
    }>;
    having?: string;
  };

  /** Data source references (which tables/views are used) */
  dataSources: string[]; // node IDs or table names

  /** Output schema definition (fields produced by this analytic) */
  outputSchema: Array<{
    name: string;
    type: string; // data type
    description?: string;
  }>;
}

/**
 * Configuration for a Visualization node.
 * Visualization nodes consume data from upstream (usually an analytics node)
 * and render it using a specific chart type and styling.
 */
export interface VisualizationConfig {
  /** Chart type – corresponds to one of the visualization NodeType values */
  chartType:
    | 'bar'
    | 'line'
    | 'pie'
    | 'scatter'
    | 'histogram'
    | 'heatmap'
    | 'box'
    | 'kpi'
    | 'map'
    | 'gauge'
    | 'funnel'
    | 'treemap'
    | 'waterfall'
    | 'area'
    | 'bubble'
    | 'scatter-matrix'
    | 'dual-axis'
    | 'pareto'
    | 'word-cloud';

  /** Layout and dimensions */
  layout: {
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    position?: 'absolute' | 'relative';
  };

  /** Styling overrides */
  styling: {
    colors?: string[];
    font?: string;
    backgroundColor?: string;
    border?: string;
    [key: string]: any;
  };

  /** Axis configuration (for charts that use axes) */
  axes?: {
    x?: {
      field: string;
      label?: string;
      type?: 'category' | 'linear' | 'time';
      format?: string;
    };
    y?: {
      field: string;
      label?: string;
      type?: 'linear' | 'log';
      format?: string;
    };
    y2?: {
      field: string;
      label?: string;
      type?: 'linear' | 'log';
      format?: string;
    };
  };

  /** Interaction settings */
  interactions: {
    tooltips?: boolean;
    zoom?: boolean;
    pan?: boolean;
    click?: boolean;
    hover?: boolean;
    drillDown?: boolean;
  };

  /** Data mapping: which fields from the input are used for dimensions/measures */
  dataMapping: {
    dimensions: string[];        // e.g., categories, x‑axis
    measures: string[];          // e.g., values, y‑axis, size
    colorBy?: string;            // field used for color encoding
    sizeBy?: string;             // field used for size (bubble charts)
    tooltipFields?: string[];
  };

  /** Rendering preferences (e.g., interactive, static, export) */
  rendering: {
    interactive: boolean;
    exportable: boolean;
    animate: boolean;
  };
}

// ==================== NODE METADATA ====================

export interface NodeMetadata {
  /** Analytics configuration (if node is an analytics node) */
  analyticsConfig?: AnalyticsConfig;

  /** Visualization configuration (if node is a visualization node) */
  visualizationConfig?: VisualizationConfig;

  /** Source metadata (for input-like nodes, e.g., when reading from foreign tables) */
  sourceMetadata?: {
    type: DataSourceType;
    connectionString?: string;
    query?: string;
    filePath?: string;
    sheetName?: string;
    headers?: boolean;
    delimiter?: string;
  };

  // General metadata
  description?: string;
  tags?: string[];
  version?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== NODE VALIDATION ====================

export interface NodeValidationResult {
  isValid: boolean;
  nodeId: string;
  nodeType: NodeType;
  issues: string[];
  suggestions: string[];
  metadata: {
    validatedAt: string;
    validatorVersion: string;
  };
}

// ==================== MAIN CANVAS NODE ====================

export interface CanvasNode {
  id: string;
  name: string;
  type: NodeType | string; // allow both enum and string
  nodeType?: 'input' | 'output' | 'analytics' | 'visualization';
  componentType?: 'processing' | 'standardized' | 'palette-component' | 'sidebar-item';
  componentCategory?: 'input' | 'output' | 'analytics' | 'visualization';

  position: NodePosition;
  size: NodeSize;

  connectionPorts?: ConnectionPort[];

  metadata?: NodeMetadata;

  status?: NodeStatus;

  draggable?: boolean;
  droppable?: boolean;
  dragType?: string;

  technology?: string;

  schemaName?: string;
  tableName?: string;
  fileName?: string;
  sheetName?: string;

  visualProperties?: {
    color?: string;
    icon?: string;
    borderColor?: string;
    backgroundColor?: string;
  };
}

// ==================== CANVAS CONNECTION ====================

export interface CanvasConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;

  dataFlow: {
    schemaMappings: Array<{
      sourceField: string;
      targetField: string;
      transformation?: string;
    }>;
    expectedVolume?: number;
    qualityRules?: Array<{
      rule: string;
      severity: 'ERROR' | 'WARNING' | 'INFO';
    }>;
  };

  status: ConnectionStatus;

  errors?: Array<{
    message: string;
    severity: 'ERROR' | 'WARNING';
    timestamp: string;
    details?: Record<string, any>;
  }>;

  metrics?: {
    latencyMs?: number;
    throughputRowsPerSecond?: number;
    dataSizeBytes?: number;
    lastUpdated?: string;
  };

  metadata?: {
    description?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt?: string;
  };
}

// ==================== GENERATED OUTPUT ====================

export interface GeneratedOutput {
  id: string;
  nodeId: string;
  nodeType: NodeType;
  content: any; // Could be a chart specification, table data, etc.
  format: 'json' | 'csv' | 'png' | 'svg' | 'html';
  metadata: {
    generatedAt: string;
    generatorVersion: string;
  };
}

// ==================== TYPE GUARDS ====================

export function isCanvasNode(node: any): node is CanvasNode {
  return (
    node &&
    typeof node.id === 'string' &&
    typeof node.name === 'string' &&
    typeof node.position === 'object' &&
    typeof node.position.x === 'number' &&
    typeof node.position.y === 'number' &&
    typeof node.size === 'object' &&
    typeof node.size.width === 'number' &&
    typeof node.size.height === 'number'
  );
}

export function isCanvasConnection(conn: any): conn is CanvasConnection {
  return (
    conn &&
    typeof conn.id === 'string' &&
    typeof conn.sourceNodeId === 'string' &&
    typeof conn.sourcePortId === 'string' &&
    typeof conn.targetNodeId === 'string' &&
    typeof conn.targetPortId === 'string' &&
    Object.values(ConnectionStatus).includes(conn.status)
  );
}

export function isAnalyticsNode(node: CanvasNode): boolean {
  return node.nodeType === 'analytics' || node.componentCategory === 'analytics';
}

export function isVisualizationNode(node: CanvasNode): boolean {
  return node.nodeType === 'visualization' || node.componentCategory === 'visualization';
}

export function isInputNode(node: CanvasNode): boolean {
  return node.nodeType === 'input' || node.componentCategory === 'input';
}

export function isOutputNode(node: CanvasNode): boolean {
  return node.nodeType === 'output' || node.componentCategory === 'output';
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get default port configuration for a node type.
 * - Analytics nodes: both input and output ports.
 * - Visualization nodes: only input port (left side).
 * - Input nodes: only output port (right side).
 * - Output nodes: only input port (left side).
 */
export function getDefaultPorts(nodeType: NodeType): ConnectionPort[] {
  // Determine category from node type
  const isAnalytics = [
    NodeType.DATA_SUMMARY,
    NodeType.FILTER,
    NodeType.SLICE,
    NodeType.DRILL_DOWN,
    NodeType.PIVOT,
    NodeType.CORRELATION,
    NodeType.OUTLIER_DETECTION,
    NodeType.FORECAST,
    NodeType.CLUSTER,
    NodeType.REFERENCE_LINE,
    NodeType.TREND_LINE,
    NodeType.MOVING_AVERAGE,
    NodeType.PERCENTILE,
    NodeType.RANK,
    NodeType.RUNNING_TOTAL,
    NodeType.STATISTICAL_SUMMARY
  ].includes(nodeType as NodeType);

  const isVisualization = [
    NodeType.BAR_CHART,
    NodeType.LINE_CHART,
    NodeType.PIE_CHART,
    NodeType.SCATTER_PLOT,
    NodeType.HISTOGRAM,
    NodeType.HEATMAP,
    NodeType.BOX_PLOT,
    NodeType.KPI,
    NodeType.MAP,
    NodeType.GAUGE,
    NodeType.FUNNEL,
    NodeType.TREEMAP,
    NodeType.WATERFALL,
    NodeType.AREA_CHART,
    NodeType.BUBBLE_CHART,
    NodeType.SCATTER_MATRIX,
    NodeType.DUAL_AXIS,
    NodeType.PARETO,
    NodeType.WORD_CLOUD
  ].includes(nodeType as NodeType);

  if (isAnalytics) {
    return [
      {
        id: 'input-1',
        type: PortType.INPUT,
        side: PortSide.LEFT,
        position: 50,
        maxConnections: 10
      },
      {
        id: 'output-1',
        type: PortType.OUTPUT,
        side: PortSide.RIGHT,
        position: 50,
        maxConnections: 10
      }
    ];
  }

  if (isVisualization) {
    return [
      {
        id: 'input-1',
        type: PortType.INPUT,
        side: PortSide.LEFT,
        position: 50,
        maxConnections: 1
      }
    ];
  }

  // Fallback for generic nodes (input/output)
  return [
    {
      id: 'input-1',
      type: PortType.INPUT,
      side: PortSide.LEFT,
      position: 50,
      maxConnections: 1
    },
    {
      id: 'output-1',
      type: PortType.OUTPUT,
      side: PortSide.RIGHT,
      position: 50,
      maxConnections: 10
    }
  ];
}

/**
 * Get default node size based on node type.
 */
export function getDefaultNodeSize(nodeType: NodeType): NodeSize {
  // Analytics nodes – slightly larger for configuration
  if ([
    NodeType.DATA_SUMMARY,
    NodeType.FILTER,
    NodeType.SLICE,
    NodeType.DRILL_DOWN,
    NodeType.PIVOT,
    NodeType.CORRELATION,
    NodeType.OUTLIER_DETECTION,
    NodeType.FORECAST,
    NodeType.CLUSTER,
    NodeType.STATISTICAL_SUMMARY
  ].includes(nodeType as NodeType)) {
    return { width: 240, height: 160 };
  }

  // Visualization nodes – can be larger
  if ([
    NodeType.BAR_CHART,
    NodeType.LINE_CHART,
    NodeType.SCATTER_PLOT,
    NodeType.HEATMAP,
    NodeType.MAP,
    NodeType.TREEMAP,
    NodeType.WATERFALL,
    NodeType.AREA_CHART,
    NodeType.BUBBLE_CHART,
    NodeType.SCATTER_MATRIX,
    NodeType.DUAL_AXIS,
    NodeType.PARETO,
    NodeType.WORD_CLOUD
  ].includes(nodeType as NodeType)) {
    return { width: 280, height: 200 };
  }

  // Default size
  return { width: 200, height: 120 };
}

/**
 * Create a new canvas node with sensible defaults.
 */
export function createCanvasNode(
  type: NodeType,
  name: string,
  position: NodePosition
): CanvasNode {
  const isAnalytics = [
    NodeType.DATA_SUMMARY,
    NodeType.FILTER,
    NodeType.SLICE,
    NodeType.DRILL_DOWN,
    NodeType.PIVOT,
    NodeType.CORRELATION,
    NodeType.OUTLIER_DETECTION,
    NodeType.FORECAST,
    NodeType.CLUSTER,
    NodeType.REFERENCE_LINE,
    NodeType.TREND_LINE,
    NodeType.MOVING_AVERAGE,
    NodeType.PERCENTILE,
    NodeType.RANK,
    NodeType.RUNNING_TOTAL,
    NodeType.STATISTICAL_SUMMARY
  ].includes(type as NodeType);

  const isVisualization = [
    NodeType.BAR_CHART,
    NodeType.LINE_CHART,
    NodeType.PIE_CHART,
    NodeType.SCATTER_PLOT,
    NodeType.HISTOGRAM,
    NodeType.HEATMAP,
    NodeType.BOX_PLOT,
    NodeType.KPI,
    NodeType.MAP,
    NodeType.GAUGE,
    NodeType.FUNNEL,
    NodeType.TREEMAP,
    NodeType.WATERFALL,
    NodeType.AREA_CHART,
    NodeType.BUBBLE_CHART,
    NodeType.SCATTER_MATRIX,
    NodeType.DUAL_AXIS,
    NodeType.PARETO,
    NodeType.WORD_CLOUD
  ].includes(type as NodeType);

  return {
    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    nodeType: isAnalytics ? 'analytics' : isVisualization ? 'visualization' : 'input',
    componentCategory: isAnalytics ? 'analytics' : isVisualization ? 'visualization' : 'input',
    position,
    size: getDefaultNodeSize(type),
    connectionPorts: getDefaultPorts(type),
    status: NodeStatus.IDLE,
    draggable: true,
    droppable: false,
    metadata: {
      description: `${name} - ${type}`,
      version: '1.0.0',
      createdAt: new Date().toISOString()
    }
  };
}

/**
 * Create a connection between two nodes.
 */
export function createCanvasConnection(
  sourceNodeId: string,
  sourcePortId: string,
  targetNodeId: string,
  targetPortId: string
): CanvasConnection {
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sourceNodeId,
    sourcePortId,
    targetNodeId,
    targetPortId,
    dataFlow: {
      schemaMappings: []
    },
    status: ConnectionStatus.UNVALIDATED,
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}