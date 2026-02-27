// src/types/metadata.ts – Analytics & Visualization Metadata

// ==================== CORE TYPES ====================

export type ComponentRole = 'INPUT' | 'ANALYTICS' | 'VISUALIZATION' | 'OUTPUT';
export type RelationType = 'FLOW' | 'FILTER' | 'ITERATE' | 'SPLIT'; // simplified
export type DataType = 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'DATE' | 'TIMESTAMP' | 'BINARY';
export type NodeStatus = 'default' | 'success' | 'error' | 'warning';

// ==================== FIELD AND SCHEMA DEFINITIONS ====================

export interface FieldSchema {
  id: string;
  name: string;
  type: DataType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  isKey: boolean;
  defaultValue?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SchemaDefinition {
  id: string;
  name: string;
  alias?: string;
  fields: FieldSchema[];
  sourceComponentId?: string;
  // Metadata
  isTemporary: boolean;
  isMaterialized: boolean;
  rowCount?: number;
  metadata?: Record<string, any>;
}

// ==================== COMPONENT‑SPECIFIC CONFIGURATIONS ====================

/**
 * Analytics Component Configuration
 * Describes an analytic operation (summary, filter, pivot, forecast, etc.)
 */
export interface AnalyticsComponentConfiguration {
  version: string;
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

  /** Operation‑specific parameters */
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

  /** Data sources (node IDs or table names) */
  dataSources: string[];

  /** Output schema produced by this analytic */
  outputSchema: SchemaDefinition;

  /** Execution hints */
  executionHints: {
    parallelizable: boolean;
    memoryHint?: 'LOW' | 'MEDIUM' | 'HIGH';
    batchSize?: number;
  };

  /** Compiler metadata */
  compilerMetadata: {
    lastModified: string;
    createdBy: string;
    validationStatus: 'VALID' | 'WARNING' | 'ERROR';
    warnings?: string[];
    dependencies: string[]; // dependent node IDs
    compiled?: {
      output?: any; // e.g., pre‑computed statistics, query plan
      timestamp?: string;
    };
  };
}

/**
 * Visualization Component Configuration
 * Describes how to render data (chart type, styling, axes, interactions)
 */
export interface VisualizationComponentConfiguration {
  title: string;
  version: string;
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

  /** Axes configuration (if applicable) */
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

  /** Data mapping: which fields are used for dimensions/measures */
  dataMapping: {
    dimensions: string[];
    measures: string[];
    colorBy?: string;
    sizeBy?: string;
    tooltipFields?: string[];
  };

  /** Rendering preferences */
  rendering: {
    interactive: boolean;
    exportable: boolean;
    animate: boolean;
  };

  /** Compiler metadata (e.g., pre‑rendered SVG/HTML) */
  compilerMetadata: {
    lastModified: string;
    createdBy: string;
    validationStatus: 'VALID' | 'WARNING' | 'ERROR';
    warnings?: string[];
    dependencies: string[]; // node IDs that provide data
    compiled?: {
      output?: any; // e.g., chart specification (Vega‑Lite, ECharts, etc.)
      timestamp?: string;
    };
  };
}

// ==================== UNIFIED COMPONENT CONFIGURATION ====================

export type ComponentConfiguration =
  | { type: 'ANALYTICS'; config: AnalyticsComponentConfiguration }
  | { type: 'VISUALIZATION'; config: VisualizationComponentConfiguration }
  | { type: 'INPUT'; config: Record<string, any> }   // kept for input nodes
  | { type: 'OUTPUT'; config: Record<string, any> }; // kept for output nodes

// ==================== NODE METADATA ====================

export interface FlowNodeMeta {
  // Component identification
  componentKey: string;
  componentType: ComponentRole;
  instanceNumber: number;

  // UI Display
  label: string;
  status: NodeStatus;

  // Unified component configuration
  configuration: ComponentConfiguration;

  // Schema information (simplified for analytics/visualization)
  schemas: {
    input?: SchemaDefinition[];      // incoming data
    output?: SchemaDefinition;       // data produced (for analytics) or rendered (for visualizations)
  };

  // Execution metadata
  execution: {
    lastExecuted?: string;
    executionTime?: number;
    rowsProcessed?: number;
    errors?: string[];
    warnings?: string[];
  };

  // Compiler‑friendly metadata (simplified)
  compilerMetadata: {
    nodeId: string;
    version: string;
    createdAt: string;
    lastModified: string;

    dependencies: {
      upstream: string[];   // node IDs that this node depends on
      downstream: string[]; // node IDs that depend on this node
    };

    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
      validationTimestamp: string;
    };

    incremental: {
      lastCompilationHash: string;
      requiresFullRecompile: boolean;
      changedFields: string[];
    };
  };

  // General metadata
  metadata: Record<string, any>;
}

// ==================== EDGE METADATA ====================

export interface FlowEdgeMeta {
  relationType: RelationType;

  // Relation configuration
  configuration: Record<string, any>;

  // Schema validation
  schemaValidation: {
    sourceFields: string[];
    targetFields: string[];
    isSchemaCompatible: boolean;
    validationErrors?: string[];
    fieldMapping: Array<{
      sourceField: string;
      targetField: string;
      compatible: boolean;
      typeConversion?: string;
    }>;
  };

  // Compiler metadata
  compilerMetadata: {
    edgeId: string;
    version: string;

    dataFlow: {
      isConditional: boolean;
      conditionExpression?: string;
      dataFlowOrder: number;
      batchSize?: number;
      parallelExecution: boolean;
    };

    lineage: {
      sourceNodeId: string;
      targetNodeId: string;
      fieldsTransferred: string[];
      transformationApplied: boolean;
    };
  };

  metadata: Record<string, any>;
}

// ==================== METADATA UPDATE STRATEGIES ====================

export interface MetadataUpdate<T extends ComponentConfiguration['type']> {
  nodeId: string;
  timestamp: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'PARTIAL_UPDATE';
  componentType: T;
  updates: Partial<
    T extends 'ANALYTICS' ? AnalyticsComponentConfiguration :
    T extends 'VISUALIZATION' ? VisualizationComponentConfiguration :
    never
  >;
  changedFields: string[];
  lineage: {
    previousHash: string;
    newHash: string;
    parentOperationId?: string;
  };
  validation?: {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  };
}

export function createMetadataUpdate<T extends ComponentConfiguration['type']>(
  nodeId: string,
  componentType: T,
  updates: MetadataUpdate<T>['updates'],
  previousHash: string
): MetadataUpdate<T> {
  const timestamp = new Date().toISOString();
  const newHash = computeMetadataHash(updates);
  const operation = previousHash ? 'UPDATE' : 'CREATE';
  const changedFields = Object.keys(updates).filter(key =>
    updates[key as keyof typeof updates] !== undefined
  );

  return {
    nodeId,
    timestamp,
    operation,
    componentType,
    updates,
    changedFields,
    lineage: {
      previousHash,
      newHash,
      parentOperationId: undefined
    }
  } as MetadataUpdate<T>;
}

function computeMetadataHash(data: any): string {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  return btoa(jsonString).substring(0, 32);
}

export function applyMetadataUpdate<T extends ComponentConfiguration['type']>(
  nodeMeta: FlowNodeMeta,
  update: MetadataUpdate<T>
): FlowNodeMeta {
  const updatedMeta = { ...nodeMeta };

  // Update configuration based on component type
  if (update.componentType === 'ANALYTICS' && nodeMeta.configuration.type === 'ANALYTICS') {
    updatedMeta.configuration = {
      type: 'ANALYTICS',
      config: {
        ...nodeMeta.configuration.config,
        ...update.updates
      } as AnalyticsComponentConfiguration
    };
  } else if (update.componentType === 'VISUALIZATION' && nodeMeta.configuration.type === 'VISUALIZATION') {
    updatedMeta.configuration = {
      type: 'VISUALIZATION',
      config: {
        ...nodeMeta.configuration.config,
        ...update.updates
      } as VisualizationComponentConfiguration
    };
  }

  // Update compiler metadata
  updatedMeta.compilerMetadata = {
    ...nodeMeta.compilerMetadata,
    lastModified: update.timestamp,
    incremental: {
      ...nodeMeta.compilerMetadata?.incremental,
      lastCompilationHash: update.lineage.newHash,
      requiresFullRecompile: true,
      changedFields: update.changedFields
    },
    validation: {
      ...nodeMeta.compilerMetadata?.validation,
      isValid: update.validation?.isValid ?? nodeMeta.compilerMetadata?.validation?.isValid ?? true,
      errors: update.validation?.errors ?? nodeMeta.compilerMetadata?.validation?.errors ?? [],
      warnings: update.validation?.warnings ?? nodeMeta.compilerMetadata?.validation?.warnings ?? [],
      validationTimestamp: update.timestamp
    }
  };

  return updatedMeta;
}

// ==================== TYPE GUARDS ====================

export function isAnalyticsConfiguration(
  config: ComponentConfiguration
): config is { type: 'ANALYTICS'; config: AnalyticsComponentConfiguration } {
  return config.type === 'ANALYTICS';
}

export function isVisualizationConfiguration(
  config: ComponentConfiguration
): config is { type: 'VISUALIZATION'; config: VisualizationComponentConfiguration } {
  return config.type === 'VISUALIZATION';
}

// ==================== INITIAL NODE METADATA ====================

export function createInitialNodeMetadata(
  componentKey: string,
  componentType: ComponentRole,
  label: string,
  configuration: ComponentConfiguration
): FlowNodeMeta {
  const nodeId = `node-${Date.now()}-${componentKey}`;
  const timestamp = new Date().toISOString();

  return {
    componentKey,
    componentType,
    instanceNumber: 1,
    label,
    status: 'default',
    configuration,
    schemas: {
      input: undefined,
      output: undefined
    },
    execution: {},
    compilerMetadata: {
      nodeId,
      version: '1.0',
      createdAt: timestamp,
      lastModified: timestamp,
      dependencies: {
        upstream: [],
        downstream: []
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        validationTimestamp: timestamp
      },
      incremental: {
        lastCompilationHash: '',
        requiresFullRecompile: true,
        changedFields: []
      }
    },
    metadata: {}
  };
}