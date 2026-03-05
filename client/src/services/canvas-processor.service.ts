// src/services/canvas-processor.service.ts
import { Node, Edge } from 'reactflow';
import { DatabaseApiService } from './database-api.service';
import {
  FlowNodeMeta,
  isAnalyticsConfiguration,
  isVisualizationConfiguration,
  AnalyticsComponentConfiguration,
  VisualizationComponentConfiguration
} from '../types/metadata';

// Analytics configuration types – some may not be exported yet
import {
  DataSummaryConfig,
  ColumnAggregation,
  GroupByConfig,
  FilterConfig,
  SliceConfig,
  DrillDownConfig,
  CorrelationConfig,
  ForecastConfig,
  ClusterConfig,
  TrendLineConfig,
  MovingAverageConfig,
  PercentileConfig,
  RankConfig,
  RunningTotalConfig,
  StatisticalSummaryConfig,
  PivotConfig
  // OutlierDetectionConfig is NOT exported yet – we'll define locally
} from '../types/analytics-configs';

// Visualization configuration types
import {
  BarChartConfig,
  LineChartConfig,
  PieChartConfig,
  ScatterPlotConfig,
  HistogramConfig,
  HeatmapConfig,
  KpiConfig,
  MapConfig,
  GaugeConfig,
  FunnelConfig,
  TreemapConfig,
  WaterfallConfig,
  AreaChartConfig,
  DualAxisConfig,
  ParetoChartConfig,
  WordCloudConfig,
  BubbleChartConfig,
  ScatterMatrixConfig,
  BoxPlotConfig
} from '../types/visualization-configs';

// Import spec builders (placeholders – replace with real builders later)
import { buildBoxPlotSpec } from '../components/visualization/boxplot-spec.builder';

// ==================== LOCAL TYPE DEFINITIONS (if missing from imports) ====================
// Remove these once the real types are exported from analytics-configs
interface FilterCondition {
  expression: string;          // adjust property name to match your actual type
  // ... other fields
}

interface OutlierDetectionConfig {
  columns?: string[];
  method?: 'iqr' | 'zscore' | 'mad';
  threshold?: number;
  includeZScore?: boolean;
  options?: Record<string, any>;
  filters?: FilterCondition[];
  inputLimit?: number;
}
// =======================================================================================

export interface ProcessingResult {
  nodeId: string;
  nodeType: string;
  sql?: string;
  rows?: any[];
  chartSpec?: any;
  error?: string;
}

interface VisualizationHandler {
  buildSpec(vizConfig: VisualizationComponentConfiguration, rows: any[]): any;
}

// ==================== VISUALIZATION HANDLERS ====================
const visualizationHandlers: Record<string, VisualizationHandler> = {};

// Box plot
visualizationHandlers['box-plot'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    return buildBoxPlotSpec(vizConfig as unknown as BoxPlotConfig, rows);
  }
};

// Bar chart
visualizationHandlers['bar-chart'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as BarChartConfig;
    return { type: 'bar-chart', config, data: rows };
  }
};

// Line chart
visualizationHandlers['line-chart'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as LineChartConfig;
    return { type: 'line-chart', config, data: rows };
  }
};

// Pie chart
visualizationHandlers['pie-chart'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as PieChartConfig;
    return { type: 'pie-chart', config, data: rows };
  }
};

// Scatter plot
visualizationHandlers['scatter-plot'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as ScatterPlotConfig;
    return { type: 'scatter-plot', config, data: rows };
  }
};

// Histogram
visualizationHandlers['histogram'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as HistogramConfig;
    return { type: 'histogram', config, data: rows };
  }
};

// Heatmap
visualizationHandlers['heatmap'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as HeatmapConfig;
    return { type: 'heatmap', config, data: rows };
  }
};

// KPI
visualizationHandlers['kpi'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as KpiConfig;
    return { type: 'kpi', config, data: rows };
  }
};

// Map
visualizationHandlers['map'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as MapConfig;
    return { type: 'map', config, data: rows };
  }
};

// Gauge
visualizationHandlers['gauge'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as GaugeConfig;
    return { type: 'gauge', config, data: rows };
  }
};

// Funnel
visualizationHandlers['funnel'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as FunnelConfig;
    return { type: 'funnel', config, data: rows };
  }
};

// Treemap
visualizationHandlers['treemap'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as TreemapConfig;
    return { type: 'treemap', config, data: rows };
  }
};

// Waterfall
visualizationHandlers['waterfall'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as WaterfallConfig;
    return { type: 'waterfall', config, data: rows };
  }
};

// Area chart
visualizationHandlers['area-chart'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as AreaChartConfig;
    return { type: 'area-chart', config, data: rows };
  }
};

// Dual axis
visualizationHandlers['dual-axis'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as DualAxisConfig;
    return { type: 'dual-axis', config, data: rows };
  }
};

// Pareto
visualizationHandlers['pareto'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as ParetoChartConfig;
    return { type: 'pareto', config, data: rows };
  }
};

// Word cloud
visualizationHandlers['word-cloud'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as WordCloudConfig;
    return { type: 'word-cloud', config, data: rows };
  }
};

// Bubble chart
visualizationHandlers['bubble-chart'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as BubbleChartConfig;
    return { type: 'bubble-chart', config, data: rows };
  }
};

// Scatter matrix
visualizationHandlers['scatter-matrix'] = {
  buildSpec: (vizConfig: VisualizationComponentConfiguration, rows: any[]) => {
    const config = vizConfig as unknown as ScatterMatrixConfig;
    return { type: 'scatter-matrix', config, data: rows };
  }
};

// ==================== CONNECTION HELPER ====================
async function getActivePostgresConnectionId(apiService: DatabaseApiService): Promise<string | null> {
  try {
    const connections = await apiService.getActiveConnections();
    const pgConnections = connections.filter(c =>
      c.dbType === 'postgresql' || c.dbType === 'postgres'
    );
    if (pgConnections.length === 0) return null;
    pgConnections.sort((a, b) => {
      const extractTimestamp = (id: string) => {
        const parts = id.split('_');
        const timestamp = parts[3];
        return timestamp ? parseInt(timestamp, 10) : 0;
      };
      return extractTimestamp(b.connectionId) - extractTimestamp(a.connectionId);
    });
    return pgConnections[0].connectionId;
  } catch (error) {
    console.error('Failed to get active PostgreSQL connection:', error);
    return null;
  }
}

function getTableNameFromNode(node: Node<FlowNodeMeta>): string | null {
  const meta = node.data?.metadata || {};
  if (meta.name && typeof meta.name === 'string') {
    return meta.name
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }
  if (meta.postgresTableName) return meta.postgresTableName;
  if (meta.fullRepositoryMetadata?.postgresTableName) return meta.fullRepositoryMetadata.postgresTableName;
  if (meta.dragMetadata?.repositoryMetadata?.postgresTableName) return meta.dragMetadata.repositoryMetadata.postgresTableName;
  if (node.data?.label) {
    const sanitized = node.data.label
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
    console.warn(`⚠️ Input node ${node.id} has no explicit table name, using sanitized label: "${sanitized}"`);
    return sanitized;
  }
  return null;
}

export class CanvasProcessor {
  private apiService: DatabaseApiService;
  private logCallback: (message: string, type?: string) => void;
  private dedicatedConnectionId: string | null = null;
  private maxRetries = 5;
  private baseDelay = 1000;
  private nodeMap: Map<string, Node<FlowNodeMeta>> = new Map();

  constructor(
    apiService: DatabaseApiService,
    logCallback?: (message: string, type?: string) => void
  ) {
    this.apiService = apiService;
    this.logCallback = logCallback || ((msg, type) => console.log(`[CanvasProcessor] ${type}: ${msg}`));
  }

  /**
   * Establish a fresh dedicated connection and verify it is usable.
   */
  private async establishDedicatedConnection(): Promise<string> {
    const connections = await this.apiService.getActiveConnections();
    const pgConnections = connections.filter(c =>
      c.dbType === 'postgresql' || c.dbType === 'postgres'
    );
    if (pgConnections.length === 0) {
      throw new Error('No active PostgreSQL connection found.');
    }
    pgConnections.sort((a, b) => {
      const ts = (id: string) => {
        const parts = id.split('_');
        const timestamp = parts[3];
        return timestamp ? parseInt(timestamp, 10) : 0;
      };
      return ts(b.connectionId) - ts(a.connectionId);
    });
    const sourceConnection = pgConnections[0];

    const result = await this.apiService.connect(sourceConnection.dbType as any, sourceConnection.config);
    if (!result.success) {
      throw new Error(`Failed to create dedicated connection: ${result.error}`);
    }

    this.dedicatedConnectionId = result.connectionId;
    this.logCallback(`✅ Dedicated connection established: ${this.dedicatedConnectionId}`, 'success');

    try {
      const testResult = await this.apiService.executeQuery(this.dedicatedConnectionId, 'SELECT 1');
      if (!testResult.success) {
        await this.apiService.disconnect(this.dedicatedConnectionId).catch(() => {});
        this.dedicatedConnectionId = null;
        throw new Error(`Connection test failed: ${testResult.error}`);
      }
      this.logCallback(`✅ Dedicated connection validated`, 'debug');
    } catch (err: any) {
      if (err.message?.includes('57P03') || err.message?.includes('recovery mode')) {
        throw new Error('PostgreSQL server is in recovery mode. Please wait for recovery to complete and try again.');
      }
      throw err;
    }

    return this.dedicatedConnectionId;
  }

  /**
   * Execute a query on the dedicated connection with exponential backoff retry.
   */
  private async executeQuery(sql: string, nodeId: string): Promise<{ rows?: any[]; error?: string }> {
    if (!this.dedicatedConnectionId) {
      return { error: 'No dedicated connection available' };
    }

    const attempt = async (connId: string): Promise<{ rows?: any[]; error?: string; fatal?: boolean }> => {
      try {
        const execResult = await this.apiService.executeQuery(connId, sql);
        if (!execResult.success) {
          const errMsg = execResult.error || '';
          if (errMsg.includes('57P03') || errMsg.includes('recovery mode')) {
            return { error: errMsg, fatal: false };
          }
          return { error: errMsg };
        }

        console.log(`🔍 Raw response for node ${nodeId}:`, execResult);

        let rows: any[] = [];
        if (execResult.result && Array.isArray(execResult.result)) {
          rows = execResult.result;
          console.log(`📦 Extracted rows from execResult.result (array), count: ${rows.length}`);
        } else if (execResult.result?.rows && Array.isArray(execResult.result.rows)) {
          rows = execResult.result.rows;
          console.log(`📦 Extracted rows from execResult.result.rows, count: ${rows.length}`);
        } else if (execResult.rows && Array.isArray(execResult.rows)) {
          rows = execResult.rows;
          console.log(`📦 Extracted rows from execResult.rows, count: ${rows.length}`);
        } else {
          console.warn(`⚠️ No rows found in any expected location. Response structure:`, execResult);
        }

        // Convert string numbers to actual numbers
        rows = rows.map(row => {
          const converted: any = {};
          for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
              converted[key] = Number(value);
            } else {
              converted[key] = value;
            }
          }
          return converted;
        });

        if (rows.length > 0) {
          console.log('First row after numeric conversion:', rows[0]);
        }

        return { rows };
      } catch (err: any) {
        const errMsg = err.message || '';
        if (errMsg.includes('57P03') || errMsg.includes('recovery mode')) {
          return { error: errMsg, fatal: false };
        }
        return { error: errMsg };
      }
    };

    let result = await attempt(this.dedicatedConnectionId);
    let retryCount = 0;

    while (result.error && !result.fatal && retryCount < this.maxRetries) {
      const isRecoverable = result.error.includes('already been released') ||
                            result.error.includes('Connection terminated unexpectedly') ||
                            result.error.includes('57P03') ||
                            result.error.includes('recovery mode');
      if (!isRecoverable) break;

      retryCount++;
      const delay = this.baseDelay * Math.pow(2, retryCount - 1);
      this.logCallback(`⚠️ Retry ${retryCount}/${this.maxRetries} for node ${nodeId} after ${delay}ms (${result.error})`, 'warn');

      if (this.dedicatedConnectionId) {
        await this.apiService.disconnect(this.dedicatedConnectionId).catch(() => {});
      }

      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        await this.establishDedicatedConnection();
        result = await attempt(this.dedicatedConnectionId);
        if (!result.error) {
          this.logCallback(`✅ Retry ${retryCount} succeeded for node ${nodeId}`, 'success');
          break;
        }
      } catch (reconnectErr: any) {
        result = { error: `Reconnection failed: ${reconnectErr.message}` };
      }
    }

    if (result.error) {
      this.logCallback(`❌ Final error for node ${nodeId}: ${result.error}`, 'error');
    }
    return { rows: result.rows, error: result.error };
  }

  /**
   * Check if any downstream node is a box plot (with fallback detection).
   */
  private hasBoxPlotDownstream(nodeId: string, edges: Edge[]): boolean {
    const outgoing = edges.filter(e => e.source === nodeId);
    for (const edge of outgoing) {
      const targetNode = this.nodeMap.get(edge.target);
      if (!targetNode) continue;

      // Only check visualization nodes
      if (targetNode.data?.componentType !== 'VISUALIZATION') continue;

      // Safely access chartType – it exists on visualization configs
      const vizConfig = targetNode.data.configuration?.config as VisualizationComponentConfiguration | undefined;
      const chartType = vizConfig?.chartType;
      const componentKey = targetNode.data?.componentKey;

      if (chartType === 'box-plot' || componentKey?.includes('box')) {
        return true;
      }
    }
    return false;
  }

  async processCanvas(nodes: Node<FlowNodeMeta>[], edges: Edge[]): Promise<Map<string, ProcessingResult>> {
    this.nodeMap = new Map(nodes.map(n => [n.id, n]));

    try {
      await this.establishDedicatedConnection();
    } catch (err: any) {
      this.logCallback(`❌ Cannot start processing: ${err.message}`, 'error');
      return new Map();
    }

    const results = new Map<string, ProcessingResult>();

    const incomingEdges = new Map<string, Edge[]>();
    const outgoingEdges = new Map<string, Edge[]>();
    edges.forEach(edge => {
      if (!incomingEdges.has(edge.target)) incomingEdges.set(edge.target, []);
      incomingEdges.get(edge.target)!.push(edge);
      if (!outgoingEdges.has(edge.source)) outgoingEdges.set(edge.source, []);
      outgoingEdges.get(edge.source)!.push(edge);
    });

    const inDegree = new Map<string, number>();
    nodes.forEach(n => inDegree.set(n.id, 0));
    edges.forEach(e => inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1));

    const queue: string[] = [];
    inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

    const order: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      order.push(id);
      const outgoing = outgoingEdges.get(id) || [];
      outgoing.forEach(edge => {
        const target = edge.target;
        const newDeg = (inDegree.get(target) || 0) - 1;
        inDegree.set(target, newDeg);
        if (newDeg === 0) queue.push(target);
      });
    }

    if (order.length !== nodes.length) {
      throw new Error('Graph contains a cycle – cannot process');
    }

    for (const nodeId of order) {
      const node = this.nodeMap.get(nodeId)!;
      const nodeData = node.data;
      const nodeType = nodeData.componentType;

      if (nodeType === 'INPUT') {
        const tableName = getTableNameFromNode(node);
        if (tableName) {
          results.set(nodeId, { nodeId, nodeType: 'INPUT', sql: `SELECT * FROM "${tableName}"` });
          this.logCallback(`Input node ${nodeId} will use table: "${tableName}"`, 'info');
        } else {
          this.logCallback(`Input node ${nodeId} has no table identifier; cannot generate source SQL.`, 'error');
        }
        continue;
      }

      if (nodeType === 'ANALYTICS') {
        const config = nodeData.configuration;
        if (!isAnalyticsConfiguration(config)) {
          results.set(nodeId, { nodeId, nodeType: 'ANALYTICS', error: 'Invalid analytics configuration' });
          continue;
        }
        const analyticsConfig = config.config as AnalyticsComponentConfiguration;

        // --- BEGIN AUTO‑CONFIGURATION FOR BOX PLOT ---
        if (analyticsConfig.analyticType === 'summary' && this.hasBoxPlotDownstream(nodeId, edges)) {
          const params = analyticsConfig.parameters as DataSummaryConfig;
          const aggregations = params?.aggregations || [];

          console.log(`[AutoConfig] Node ${nodeId} – aggregations before:`, JSON.stringify(aggregations));

          const hasOnlyCount = aggregations.length === 1 &&
                               aggregations[0].functions.length === 1 &&
                               aggregations[0].functions[0] === 'count';

          // Avoid auto‑config if multiple group‑by columns exist (ambiguous)
          const hasMultipleGroupBy = (params?.groupBy?.length || 0) > 1 ||
                                     params?.groupBy?.some(g => g.columns.length > 1);

          if ((aggregations.length === 0 || hasOnlyCount) && !hasMultipleGroupBy) {
            this.logCallback(`📊 Auto‑configuring Data Summary node ${nodeId} for box plot`, 'info');

            // Infer value column from input schema
            const inputFields = node.data?.schemas?.input?.[0]?.fields || [];
            const numericColumn = inputFields.find(f => ['INTEGER','DECIMAL','FLOAT','DOUBLE'].includes(f.type))?.name;
            const valueColumn = numericColumn || aggregations[0]?.column || 'value';

            // Create five‑number summary aggregations
            const boxPlotAggregations: ColumnAggregation[] = [
              { id: crypto.randomUUID(), column: valueColumn, functions: ['min'], alias: 'min' },
              { id: crypto.randomUUID(), column: valueColumn, functions: ['percentile_25'], alias: 'q1' },
              { id: crypto.randomUUID(), column: valueColumn, functions: ['median'], alias: 'median' },
              { id: crypto.randomUUID(), column: valueColumn, functions: ['percentile_75'], alias: 'q3' },
              { id: crypto.randomUUID(), column: valueColumn, functions: ['max'], alias: 'max' }
            ];

            // Preserve existing groupBy
            const groupBy = params?.groupBy || [];

            // Update the parameters in‑memory
            analyticsConfig.parameters = {
              ...params,
              aggregations: boxPlotAggregations,
              groupBy
            };

            console.log(`[AutoConfig] Node ${nodeId} – new aggregations:`, JSON.stringify(boxPlotAggregations));
          } else {
            console.log(`[AutoConfig] Node ${nodeId} – skipping (aggregations non‑empty or multiple group‑by)`);
          }
        }
        // --- END AUTO‑CONFIGURATION ---

        const sourceTables: string[] = [];
        const incoming = incomingEdges.get(nodeId) || [];
        for (const edge of incoming) {
          const sourceNode = this.nodeMap.get(edge.source);
          if (!sourceNode) continue;
          const sourceResult = results.get(edge.source);
          if (sourceResult?.sql) {
            sourceTables.push(sourceResult.sql.replace(/^SELECT \* FROM "/i, '').replace(/"$/, '').trim());
          }
        }
        if (sourceTables.length === 0 && analyticsConfig.dataSources.length) {
          sourceTables.push(...analyticsConfig.dataSources);
        }

        if (sourceTables.length === 0) {
          const errorMsg = `No data source found for analytics node ${nodeId}. Ensure an input node with a valid foreign table is connected.`;
          this.logCallback(errorMsg, 'error');
          results.set(nodeId, { nodeId, nodeType: 'ANALYTICS', error: errorMsg });
          continue;
        }

        const sql = this.buildAnalyticsSQL(analyticsConfig, sourceTables);
        if (!sql) {
          const errorMsg = `Unsupported analytic type: ${analyticsConfig.analyticType}`;
          this.logCallback(errorMsg, 'error');
          results.set(nodeId, { nodeId, nodeType: 'ANALYTICS', error: errorMsg });
          continue;
        }

        this.logCallback(`📝 SQL for node ${nodeId}:\n${sql}`, 'debug');

        const execResult = await this.executeQuery(sql, nodeId);
        if (execResult.error) {
          results.set(nodeId, { nodeId, nodeType: 'ANALYTICS', error: execResult.error, sql });
        } else {
          console.log(`📊 Node ${nodeId} returned ${execResult.rows?.length || 0} rows`);
          if (execResult.rows && execResult.rows.length > 0) {
            console.log('First row after processing:', execResult.rows[0]);
          }
          results.set(nodeId, {
            nodeId,
            nodeType: 'ANALYTICS',
            sql,
            rows: execResult.rows || []
          });
          this.logCallback(`✅ Node ${nodeId} returned ${execResult.rows?.length || 0} rows`, 'success');
        }
      }

      if (nodeType === 'VISUALIZATION') {
        const config = nodeData.configuration;
        if (!isVisualizationConfiguration(config)) {
          results.set(nodeId, { nodeId, nodeType: 'VISUALIZATION', error: 'Invalid visualization configuration' });
          continue;
        }
        const vizConfig = config.config as VisualizationComponentConfiguration;

        const incoming = incomingEdges.get(nodeId) || [];
        if (incoming.length === 0) {
          results.set(nodeId, { nodeId, nodeType: 'VISUALIZATION', error: 'No input data' });
          continue;
        }
        const sourceId = incoming[0].source;
        const sourceResult = results.get(sourceId);
        if (!sourceResult || !sourceResult.rows || sourceResult.rows.length === 0) {
          results.set(nodeId, { nodeId, nodeType: 'VISUALIZATION', error: 'Upstream data not available or empty' });
          continue;
        }

        const handler = visualizationHandlers[vizConfig.chartType];
        if (!handler) {
          results.set(nodeId, { nodeId, nodeType: 'VISUALIZATION', error: `Unsupported chart type: ${vizConfig.chartType}` });
          continue;
        }

        try {
          console.log(`📦 Visualization ${nodeId} received ${sourceResult.rows.length} rows from node ${sourceId}`);
          console.log('Sample row:', sourceResult.rows[0]);

          const chartSpec = handler.buildSpec(vizConfig, sourceResult.rows);
          console.log(`📈 Chart spec for ${nodeId}:`, JSON.stringify(chartSpec).substring(0, 200) + '...');

          results.set(nodeId, { nodeId, nodeType: 'VISUALIZATION', chartSpec });
          this.logCallback(`✅ Visualization node ${nodeId} ready`, 'success');
        } catch (err: any) {
          results.set(nodeId, { nodeId, nodeType: 'VISUALIZATION', error: `Failed to build chart spec: ${err.message}` });
        }
      }
    }

    // Clean up: close the dedicated connection
    try {
      if (this.dedicatedConnectionId) {
        await this.apiService.disconnect(this.dedicatedConnectionId);
        this.logCallback(`🔌 Dedicated connection closed.`, 'info');
      }
    } catch (err) {
      this.logCallback(`⚠️ Error closing dedicated connection: ${err}`, 'warn');
    }

    return results;
  }

  private buildAnalyticsSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    switch (config.analyticType) {
      case 'summary':
        return this.buildSummarySQL(config, sourceTables);
      case 'filter':
        return this.buildFilterSQL(config, sourceTables);
      case 'slice':
        return this.buildSliceSQL(config, sourceTables);
      case 'drill-down':
        return this.buildDrillDownSQL(config, sourceTables);
      case 'correlation':
        return this.buildCorrelationSQL(config, sourceTables);
      case 'forecast':
        return this.buildForecastSQL(config, sourceTables);
      case 'cluster':
        return this.buildClusterSQL(config, sourceTables);
      case 'trend-line':
        return this.buildTrendLineSQL(config, sourceTables);
      case 'moving-average':
        return this.buildMovingAverageSQL(config, sourceTables);
      case 'percentile':
        return this.buildPercentileSQL(config, sourceTables);
      case 'rank':
        return this.buildRankSQL(config, sourceTables);
      case 'running-total':
        return this.buildRunningTotalSQL(config, sourceTables);
      case 'statistical-summary':
        return this.buildStatisticalSummarySQL(config, sourceTables);
      case 'pivot':
        return this.buildPivotSQL(config, sourceTables);
      case 'outlier-detection':
        return this.buildOutlierDetectionSQL(config, sourceTables);
      default:
        return null;
    }
  }

  // ==================== ANALYTICS SQL BUILDERS ====================

  private buildSummarySQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as DataSummaryConfig;
    if (!params) return null;

    const source = sourceTables[0] || (config.dataSources && config.dataSources[0]);
    if (!source) return null;

    const {
      aggregations = [],
      groupBy = [],
      preFilters = [],
      postFilters = [],
      windowFunctions = [],
      options = {}
    } = params;

    const selectColumns: string[] = [];
    const groupExprs: string[] = [];

    groupBy.forEach(g => {
      if (g.type === 'column') {
        g.columns.forEach(col => {
          groupExprs.push(`"${col}"`);
          selectColumns.push(`"${col}"`);
        });
      } else if (g.type === 'rollup') {
        groupExprs.push(`ROLLUP(${g.columns.map(c => `"${c}"`).join(', ')})`);
        g.columns.forEach(col => selectColumns.push(`"${col}"`));
      } else if (g.type === 'cube') {
        groupExprs.push(`CUBE(${g.columns.map(c => `"${c}"`).join(', ')})`);
        g.columns.forEach(col => selectColumns.push(`"${col}"`));
      }
    });

    aggregations.forEach(agg => {
      agg.functions.forEach(fn => {
        let expr: string;
        const col = agg.column ? `"${agg.column}"` : '*';

        if (fn === 'custom' && agg.customExpression) {
          expr = agg.customExpression;
        } else {
          switch (fn) {
            case 'count': expr = `COUNT(${col})`; break;
            case 'sum': expr = `SUM(${col})`; break;
            case 'avg': expr = `AVG(${col})`; break;
            case 'min': expr = `MIN(${col})`; break;
            case 'max': expr = `MAX(${col})`; break;
            case 'stddev': expr = `STDDEV(${col})`; break;
            case 'variance': expr = `VARIANCE(${col})`; break;
            case 'median': expr = `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${col})`; break;
            case 'percentile_25': expr = `PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ${col})`; break;
            case 'percentile_75': expr = `PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ${col})`; break;
            case 'percentile_90': expr = `PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY ${col})`; break;
            case 'percentile_95': expr = `PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${col})`; break;
            default: expr = `COUNT(*)`;
          }
        }
        const alias = agg.alias ? ` AS "${agg.alias}"` : '';
        selectColumns.push(`${expr}${alias}`);
      });
    });

    if (selectColumns.length === 0) {
      selectColumns.push('*');
    }

    // Safely extract filter expressions – adjust property name if needed
    const whereClause = preFilters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ');
    const havingClause = postFilters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ');
    const hasWindowFunctions = windowFunctions.length > 0;

    const buildBaseSelect = () => {
      let sql = `SELECT`;
      if (options.distinct) sql += ` DISTINCT`;
      sql += `\n  ${selectColumns.join(',\n  ')}\nFROM "${source}"`;

      if (whereClause) sql += `\nWHERE ${whereClause}`;

      if (groupExprs.length > 0) {
        sql += `\nGROUP BY ${groupExprs.join(', ')}`;
        if (havingClause) sql += `\nHAVING ${havingClause}`;
      }
      return sql;
    };

    let finalSql: string;
    if (hasWindowFunctions) {
      const innerSQL = buildBaseSelect();
      const outerItems: string[] = ['*'];
      windowFunctions.forEach(wf => {
        let expr: string;
        if (wf.function === 'custom' && wf.customExpression) {
          expr = wf.customExpression;
        } else {
          const overParts: string[] = [];
          if (wf.partitionBy?.length) {
            overParts.push(`PARTITION BY ${wf.partitionBy.map(p => `"${p}"`).join(', ')}`);
          }
          if (wf.orderBy?.length) {
            overParts.push(`ORDER BY ${wf.orderBy.map(o => `"${o.column}" ${o.direction}`).join(', ')}`);
          }
          const over = overParts.length ? ` OVER (${overParts.join(' ')})` : '';

          const col = wf.column ? `"${wf.column}"` : '*';
          switch (wf.function) {
            case 'row_number': expr = `ROW_NUMBER()${over}`; break;
            case 'rank': expr = `RANK()${over}`; break;
            case 'dense_rank': expr = `DENSE_RANK()${over}`; break;
            case 'lag': expr = `LAG(${col})${over}`; break;
            case 'lead': expr = `LEAD(${col})${over}`; break;
            case 'first_value': expr = `FIRST_VALUE(${col})${over}`; break;
            case 'last_value': expr = `LAST_VALUE(${col})${over}`; break;
            case 'sum': expr = `SUM(${col})${over}`; break;
            case 'avg': expr = `AVG(${col})${over}`; break;
            case 'count': expr = `COUNT(${col})${over}`; break;
            default: expr = '';
          }
        }
        const alias = wf.alias ? ` AS "${wf.alias}"` : '';
        outerItems.push(`${expr}${alias}`);
      });

      finalSql = `WITH aggregated AS (\n${innerSQL}\n)\nSELECT\n  ${outerItems.join(',\n  ')}\nFROM aggregated`;
    } else {
      finalSql = buildBaseSelect();
    }

    if (options.limit) {
      finalSql += `\nLIMIT ${options.limit}`;
    }

    console.log(`🔍 SQL generated for summary node:\n${finalSql}`);
    return finalSql;
  }

  private buildFilterSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as FilterConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    // Adjust property access to match your actual FilterCondition type
    const conditions = (params.conditions || [])
      .map(c => (c as any).expression || '1=1')
      .join(` ${params.logicalOperator || 'AND'} `);
    const selectColumns = params.outputColumns?.map(c => `"${c}"`).join(', ') || '*';

    let sql = `SELECT ${selectColumns} FROM "${source}" WHERE ${conditions}`;
    if (params.options?.limit) sql += ` LIMIT ${params.options.limit}`;
    return sql;
  }

  private buildSliceSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as SliceConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    // Adjust property name – assuming slice has a `condition` field
    const condition = (params as any).condition || '1=1';
    return `SELECT * FROM "${source}" WHERE ${condition}`;
  }

  private buildDrillDownSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as DrillDownConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const groupBy = params.hierarchy.map(h => `"${h}"`).join(', ');
    const measures = params.measures.map(m => {
      let expr: string;
      const col = m.column ? `"${m.column}"` : '*';
      switch (m.aggregation) {
        case 'count': expr = `COUNT(${col})`; break;
        case 'sum': expr = `SUM(${col})`; break;
        case 'avg': expr = `AVG(${col})`; break;
        case 'min': expr = `MIN(${col})`; break;
        case 'max': expr = `MAX(${col})`; break;
        default: expr = `COUNT(*)`;
      }
      const alias = m.alias ? ` AS "${m.alias}"` : '';
      return `${expr}${alias}`;
    }).join(', ');

    const whereClause = (params.filters || []).map(f => (f as any).expression || '').filter(Boolean).join(' AND ') || '';

    let sql = `SELECT ${groupBy}, ${measures} FROM "${source}"`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    if (groupBy) sql += ` GROUP BY ${groupBy}`;
    if (params.options?.limit) sql += ` LIMIT ${params.options.limit}`;
    return sql;
  }

  private buildCorrelationSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as CorrelationConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const columns = params.columns;
    if (!columns || columns.length < 2) return null;

    const pairs: string[] = [];
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        pairs.push(`CORR("${columns[i]}", "${columns[j]}") AS corr_${columns[i]}_${columns[j]}`);
      }
    }
    const select = pairs.join(',\n  ');
    return `SELECT\n  ${select}\nFROM "${source}"`;
  }

  private buildForecastSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as ForecastConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const timeCol = params.timeColumn;
    const valueCol = params.valueColumn;
    const groupBy = params.groupBy?.map(g => `"${g}"`).join(', ');
    const filters = (params.filters || []).map(f => (f as any).expression || '').filter(Boolean).join(' AND ') || '';

    let sql = `SELECT ${timeCol ? `"${timeCol}"` : ''}, "${valueCol}"`;
    if (groupBy) sql += `, ${groupBy}`;
    sql += `\nFROM "${source}"`;
    if (filters) sql += `\nWHERE ${filters}`;
    if (params.inputLimit) sql += `\nLIMIT ${params.inputLimit}`;
    return sql;
  }

  private buildClusterSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as ClusterConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const columns = params.columns?.map(c => `"${c}"`).join(', ') || '*';
    const filters = (params.filters || []).map(f => (f as any).expression || '').filter(Boolean).join(' AND ') || '';
    let sql = `SELECT ${columns} FROM "${source}"`;
    if (filters) sql += ` WHERE ${filters}`;
    if (params.inputLimit) sql += ` LIMIT ${params.inputLimit}`;
    return sql;
  }

  private buildTrendLineSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as TrendLineConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const xCol = params.xColumn;
    const yCol = params.yColumn;
    const groupBy = params.groupBy?.map(g => `"${g}"`).join(', ');
    const filters = (params.filters || []).map(f => (f as any).expression || '').filter(Boolean).join(' AND ') || '';

    let sql = `SELECT "${xCol}", "${yCol}"`;
    if (groupBy) sql += `, ${groupBy}`;
    sql += `\nFROM "${source}"`;
    if (filters) sql += `\nWHERE ${filters}`;
    if (params.inputLimit) sql += `\nLIMIT ${params.inputLimit}`;
    return sql;
  }

  private buildMovingAverageSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as MovingAverageConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const orderBy = params.orderByColumn;
    const valueCol = params.valueColumn;
    const partitionBy = params.partitionBy?.map(p => `"${p}"`).join(', ');
    const windowSize = params.windowSize || 3;

    const over = `OVER (${partitionBy ? `PARTITION BY ${partitionBy} ` : ''}ORDER BY "${orderBy}" ROWS BETWEEN ${windowSize-1} PRECEDING AND CURRENT ROW)`;
    const avgExpr = `AVG("${valueCol}") ${over} AS "${params.alias || 'moving_avg'}"`;

    let sql = `SELECT *, ${avgExpr} FROM "${source}"`;
    if (params.filters?.length) {
      const filterClause = params.filters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ');
      sql += ` WHERE ${filterClause}`;
    }
    if (params.limit) sql += ` LIMIT ${params.limit}`;
    return sql;
  }

  private buildPercentileSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as PercentileConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const valueCol = params.valueColumn;
    const percentiles = params.percentiles || [0.25, 0.5, 0.75];
    const groupBy = params.groupBy?.map(g => `"${g}"`).join(', ');

    const percentileExprs = percentiles.map(p => {
      const alias = params.output?.aliasBase ? `${params.output.aliasBase}${Math.round(p*100)}` : `p${Math.round(p*100)}`;
      return `PERCENTILE_CONT(${p}) WITHIN GROUP (ORDER BY "${valueCol}") AS "${alias}"`;
    }).join(',\n  ');

    let sql = `SELECT`;
    if (groupBy) sql += ` ${groupBy},`;
    sql += `\n  ${percentileExprs}\nFROM "${source}"`;
    if (groupBy) sql += `\nGROUP BY ${groupBy}`;
    if (params.filters?.length) {
      const filterClause = params.filters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ');
      sql += ` WHERE ${filterClause}`;
    }
    if (params.options?.limit) sql += ` LIMIT ${params.options.limit}`;
    return sql;
  }

  private buildRankSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as RankConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const orderBy = params.orderBy.map(o => `"${o.column}" ${o.direction}`).join(', ');
    const partitionBy = params.partitionBy?.map(p => `"${p}"`).join(', ');

    let rankFunc: string;
    switch (params.function) {
      case 'row_number': rankFunc = 'ROW_NUMBER()'; break;
      case 'rank': rankFunc = 'RANK()'; break;
      case 'dense_rank': rankFunc = 'DENSE_RANK()'; break;
      case 'ntile': rankFunc = `NTILE(${params.ntileBuckets || 4})`; break;
      default: rankFunc = 'ROW_NUMBER()';
    }

    const overParts = [];
    if (partitionBy) overParts.push(`PARTITION BY ${partitionBy}`);
    if (orderBy) overParts.push(`ORDER BY ${orderBy}`);
    const over = overParts.length ? ` OVER (${overParts.join(' ')})` : '';

    const alias = params.alias || 'rank';
    const select = params.includeAllColumns ? '*' : `${orderBy ? orderBy.split(', ').map(c => c.split(' ')[0]).join(', ') : ''}, ${rankFunc}${over} AS "${alias}"`;

    let sql = `SELECT ${select} FROM "${source}"`;
    if (params.filters?.length) {
      sql += ` WHERE ${params.filters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ')}`;
    }
    if (params.limit) sql += ` LIMIT ${params.limit}`;
    return sql;
  }

  private buildRunningTotalSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as RunningTotalConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const orderBy = params.orderBy.map(o => `"${o.column}" ${o.direction}`).join(', ');
    const partitionBy = params.partitionBy?.map(p => `"${p}"`).join(', ');

    const over = `OVER (${partitionBy ? `PARTITION BY ${partitionBy} ` : ''}ORDER BY ${orderBy} ROWS UNBOUNDED PRECEDING)`;
    const sumExpr = `SUM("${params.valueColumn}") ${over} AS "${params.alias || 'running_total'}"`;

    let sql = `SELECT *, ${sumExpr} FROM "${source}"`;
    if (params.filters?.length) {
      sql += ` WHERE ${params.filters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ')}`;
    }
    if (params.limit) sql += ` LIMIT ${params.limit}`;
    return sql;
  }

  private buildStatisticalSummarySQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as StatisticalSummaryConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const columns = params.columns || [];
    const stats = params.statistics || { count: true, sum: true, avg: true, min: true, max: true };
    const groupBy = params.groupBy?.map(g => `"${g}"`).join(', ');

    const exprs: string[] = [];
    columns.forEach(col => {
      if (stats.count) exprs.push(`COUNT("${col}") AS count_${col}`);
      if (stats.sum) exprs.push(`SUM("${col}") AS sum_${col}`);
      if (stats.avg) exprs.push(`AVG("${col}") AS avg_${col}`);
      if (stats.min) exprs.push(`MIN("${col}") AS min_${col}`);
      if (stats.max) exprs.push(`MAX("${col}") AS max_${col}`);
      if (stats.stddev) exprs.push(`STDDEV("${col}") AS stddev_${col}`);
      if (stats.variance) exprs.push(`VARIANCE("${col}") AS variance_${col}`);
      if (stats.skewness) exprs.push(`SKEWNESS("${col}") AS skew_${col}`);
      if (stats.kurtosis) exprs.push(`KURTOSIS("${col}") AS kurt_${col}`);
    });

    let sql = `SELECT`;
    if (groupBy) sql += ` ${groupBy},`;
    sql += `\n  ${exprs.join(',\n  ')}\nFROM "${source}"`;
    if (groupBy) sql += `\nGROUP BY ${groupBy}`;
    if (params.filters?.length) {
      sql += ` WHERE ${params.filters.map(f => (f as any).expression || '').filter(Boolean).join(' AND ')}`;
    }
    if (params.options?.limit) sql += ` LIMIT ${params.options.limit}`;
    return sql;
  }

  private buildPivotSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    const params = config.parameters as PivotConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    // Pivot is complex; for simplicity we generate a crosstab query using tablefunc extension.
    // This requires the extension to be installed. We'll assume it is.
    const rowColumns = params.rows.map(r => `"${r}"`).join(', ');
    const colColumn = params.columns[0]; // simplified: first column only
    const valueColumn = params.values[0]; // simplified: first value only
    const aggFunc = 'SUM'; // could be configurable

    // We need to know all possible column values to pivot; hard to do dynamically.
    // Return a placeholder query.
    return `-- PIVOT not fully implemented; using placeholder\nSELECT * FROM "${source}"`;
  }

  private buildOutlierDetectionSQL(config: AnalyticsComponentConfiguration, sourceTables: string[]): string | null {
    // Use local OutlierDetectionConfig type (defined at top of file)
    const params = config.parameters as OutlierDetectionConfig;
    if (!params) return null;
    const source = sourceTables[0];
    if (!source) return null;

    const columns = params.columns || [];
    const method = params.method || 'iqr';
    const threshold = params.threshold || 3;

    // For IQR method we'd need to compute quartiles and flag outliers.
    // This is complex; we return a simple query that adds a flag column using a subquery.
    if (method === 'iqr') {
      const col = columns[0]; // simplify
      const sql = `
WITH stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY "${col}") AS q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY "${col}") AS q3
  FROM "${source}"
)
SELECT
  *,
  CASE
    WHEN "${col}" < (q1 - ${threshold} * (q3 - q1)) OR "${col}" > (q3 + ${threshold} * (q3 - q1))
    THEN true ELSE false
  END AS is_outlier
FROM "${source}", stats
`;
      return sql;
    }
    return `SELECT *, false AS is_outlier FROM "${source}"`;
  }
}