// src/types/analytics-configs.ts

export type AggregationFunction =
  | 'count' | 'sum' | 'avg' | 'min' | 'max' | 'stddev' | 'variance'
  | 'median' | 'percentile_25' | 'percentile_75' | 'percentile_90' | 'percentile_95'
  | 'custom';

export interface ColumnAggregation {
  id: string;
  column: string;
  functions: AggregationFunction[];
  alias?: string;
  customExpression?: string;
  filter?: FilterCondition; // optional per‑aggregation filter
}

export type GroupByType = 'column' | 'rollup' | 'cube';

export interface GroupByConfig {
  id: string;
  type: GroupByType;
  columns: string[];
}

export interface FilterCondition {
  id: string;
  expression: string;
  type: 'where' | 'having';
}

export type FilterOperator =
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'LIKE'
  | 'NOT LIKE'
  | 'IN'
  | 'NOT IN'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'BETWEEN';

// New: FilterRule – a single condition in a filter
export interface FilterRule {
  id: string;
  column: string;
  operator: FilterOperator;
  value?: any;          // for most operators
  value2?: any;         // for BETWEEN
}

export interface FilterConfig {
  logicalOperator: 'AND' | 'OR';
  conditions: FilterRule[];
  outputColumns?: string[];
  options?: {
    limit?: number;
    caseSensitive?: boolean;
    parameterize?: boolean;
    nullHandling?: 'include' | 'exclude';
  };
}


export interface DrillDownConfig {
  /** Ordered hierarchy columns (from highest to lowest granularity) */
  hierarchy: string[];

  /** Measures with their aggregations */
  measures: Array<{
    column: string;                     // source column
    aggregation: AggregationFunction;   // e.g. 'sum', 'avg', 'count'
    alias?: string;                     // optional output column name
  }>;

  /** Optional filters applied before aggregation (WHERE) */
  filters?: FilterCondition[];

  /** Additional options */
  options?: {
    limit?: number;
    distinct?: boolean;
    includeNulls?: boolean;
  };
}

export interface PivotMeasure {
  id: string;
  column: string;
  aggregation: AggregationFunction;
  alias?: string;
  customExpression?: string;
  format?: string; // optional formatting hint
}

export interface PivotDimension {
  id: string;
  column: string;
}

export interface PivotFilter {
  id: string;
  expression: string;
  type: 'where' | 'having';
}

export interface PivotSort {
  id: string;
  column: string;
  direction: 'asc' | 'desc';
}

export interface PivotConfig {
  rows: PivotDimension[];
  columns: PivotDimension[];
  values: PivotMeasure[];
  filters: PivotFilter[];
  sort: PivotSort[];
  options: {
    includeGrandTotals?: boolean;
    includeSubtotals?: boolean;
    emptyCellValue?: string | number;
    distinct?: boolean;
    limit?: number;
  };
}

/**
 * Configuration for a correlation analysis (Pearson, Spearman, Kendall).
 * The output can be a matrix (pivoted) or a list of pairs.
 */
export interface CorrelationConfig {
  /** The numeric columns to correlate. Must contain at least two columns. */
  columns: string[];
  /** Correlation method */
  method: 'pearson' | 'spearman' | 'kendall';
  /** How to handle missing values */
  missingHandling: 'pairwise' | 'listwise' | 'omit';
  /** Output format: matrix (square) or pairs (list) */
  outputFormat: 'matrix' | 'pairs';
  /** Optional p‑value threshold for significance filtering */
  pValueThreshold?: number;
  /** Whether to include p‑values in the output */
  includePValues?: boolean;
  /** Optional alias for the output table/view */
  alias?: string;
}

/**
 * Configuration for a time‑series forecast component.
 * This interface contains only the data‑logic parameters,
 * separate from any visualization styling.
 */
export interface ForecastConfig {
  /** The column containing the time dimension (date/timestamp) */
  timeColumn: string;

  /** The column containing the numeric value to forecast */
  valueColumn: string;

  /** Number of future periods to forecast */
  horizon: number;

  /** Optional grouping columns for multiple time series (e.g., region, product) */
  groupBy?: string[];

  /** Seasonality settings */
  seasonality?: {
    /** 'auto' to detect, or a fixed integer period (e.g., 7 for weekly, 12 for monthly) */
    period: 'auto' | number;
    /** Whether to include seasonal components */
    enabled: boolean;
  };

  /** Confidence level for prediction intervals (0 to 1) */
  confidenceLevel?: number;

  /** Model type or method to use */
  model: 'linear' | 'exponential_smoothing' | 'arima' | 'custom';

  /** Custom SQL expression for the forecast logic (if model is 'custom') */
  customSql?: string;

  /** Additional transformations applied to the value before forecasting */
  transformations?: Array<{
    type: 'log' | 'diff' | 'scale';
    // additional parameters can be added later
  }>;

  /** Output configuration */
  output: {
    /** Include historical data in the result */
    includeHistorical: boolean;
    /** Include prediction intervals (lower/upper bounds) */
    includeConfidence: boolean;
    /** Alias for the forecast column(s) */
    forecastAlias?: string;
  };

  /** Filters applied before forecast (WHERE) */
  filters?: FilterCondition[];

  /** Optional limit on input data (e.g., last N periods) */
  inputLimit?: number;
}

export interface ClusterConfig {
  /** The numeric columns to use for clustering */
  columns: string[];

  /** Clustering method */
  method: 'kmeans' | 'kmedoids' | 'hierarchical' | 'dbscan' | 'custom';

  /** Number of clusters (k) – required for k‑means/k‑medoids */
  numberOfClusters?: number;

  /** Distance metric */
  distanceMetric: 'euclidean' | 'manhattan' | 'cosine' | 'chebyshev' | 'custom';

  /** Whether to scale/normalize the data */
  scaling: boolean;

  /** Scaling method if scaling is true */
  scalingMethod?: 'standard' | 'minmax' | 'robust';

  /** Additional parameters for advanced algorithms */
  parameters?: {
    maxIterations?: number;      // e.g. for k‑means
    tolerance?: number;          // convergence threshold
    initialization?: 'random' | 'kmeans++' | 'forgy';
    linkage?: 'ward' | 'complete' | 'average' | 'single'; // for hierarchical
    eps?: number;                // for DBSCAN
    minPoints?: number;          // for DBSCAN
  };

  /** Output configuration */
  output: {
    /** Name of the column that will contain cluster assignment */
    clusterColumn: string;

    /** Whether to include centroids in output (if applicable) */
    includeCentroids?: boolean;

    /** Whether to output a separate table of cluster statistics */
    outputStatistics?: boolean;

    /** Alias for the output table/view */
    alias?: string;
  };

  /** Filters applied before clustering (WHERE) */
  filters?: FilterCondition[];

  /** Optional limit on input data */
  inputLimit?: number;
}

export type ReferenceLineType = 'constant' | 'average' | 'median' | 'percentile' | 'custom';

export interface ReferenceLineDefinition {
  id: string;
  type: ReferenceLineType;
  column?: string;               // for average, median, percentile
  value?: number;                // for constant, or percentile value (0-100)
  customExpression?: string;      // for custom
  alias?: string;                 // output column name
}

export interface ReferenceLineConfig {
  definitions: ReferenceLineDefinition[];
  groupBy?: string[];             // columns to partition by (optional)
  filters?: FilterCondition[];    // optional WHERE filters
  options?: {
    distinct?: boolean;
    limit?: number;
  };
}

// ==================== TREND LINE CONFIGURATION ====================
export type TrendModelType = 'linear' | 'logarithmic' | 'exponential' | 'power' | 'polynomial' | 'custom';

export interface TrendLineConfig {
  /** Column for the independent variable (typically time or a numeric field) */
  xColumn: string;
  /** Column for the dependent variable (the measure to be predicted) */
  yColumn: string;
  /** Optional grouping columns for multiple series */
  groupBy?: string[];
  /** Model type */
  model: TrendModelType;
  /** For polynomial model, the degree (e.g., 2, 3) */
  polynomialDegree?: number;
  /** Custom SQL expression when model = 'custom' */
  customSql?: string;
  /** Whether to include confidence/prediction intervals */
  includeConfidence?: boolean;
  /** Confidence level (e.g., 0.95) */
  confidenceLevel?: number;
  /** Output configuration */
  output: {
    /** Include fitted values in the result */
    fittedValues: boolean;
    /** Include model coefficients (slope, intercept, R², etc.) */
    includeStatistics: boolean;
    /** Alias for the fitted value column */
    fittedAlias?: string;
    /** Alias for the lower bound (if confidence enabled) */
    lowerBoundAlias?: string;
    /** Alias for the upper bound (if confidence enabled) */
    upperBoundAlias?: string;
    /** Name of the output table/view (optional) */
    alias?: string;
  };
  /** Filters applied before trend calculation (WHERE) */
  filters?: FilterCondition[];
  /** Optional limit on input data */
  inputLimit?: number;
}

export interface MovingAverageConfig {
  /** Column to order by (time/sequence) */
  orderByColumn: string;
  /** Column to average */
  valueColumn: string;
  /** Optional partition columns (e.g., category, region) */
  partitionBy?: string[];
  /** Window size (number of preceding rows to include) */
  windowSize: number;
  /** Output column alias */
  alias?: string;
  /** Filters applied before calculation */
  filters?: FilterCondition[];
  /** Optional row limit */
  limit?: number;
}

export interface PercentileConfig {
  /** The numeric column for which percentiles are computed */
  valueColumn: string;

  /** List of percentiles to compute (values between 0 and 1, e.g. 0.25, 0.5, 0.75) */
  percentiles: number[];

  /** Optional grouping columns (dimensions) */
  groupBy?: string[];

  /** Filters applied before aggregation (WHERE clause) */
  filters?: FilterCondition[];

  /** Output configuration */
  output?: {
    /** Base name for percentile columns; actual names become base_pXX (e.g., sales_p90) */
    aliasBase?: string;
    /** Optional explicit output table name */
    tableName?: string;
  };

  
  /** Additional options */
  options?: {
    /** Use SELECT DISTINCT? */
    distinct?: boolean;
    /** Maximum number of rows to return */
    limit?: number;
    /** Whether to use continuous (percentile_cont) or discrete (percentile_disc) */
    method?: 'continuous' | 'discrete';
  };
}

// src/types/analytics-configs.ts

export interface StatisticalSummaryConfig {
  /** Columns to analyze (if empty, all numeric columns from input schema) */
  columns?: string[];
  /** Statistics to compute */
  statistics: {
    count?: boolean;
    sum?: boolean;
    avg?: boolean;
    min?: boolean;
    max?: boolean;
    stddev?: boolean;
    variance?: boolean;
    skewness?: boolean;
    kurtosis?: boolean;
    median?: boolean;
    percentiles?: number[]; // e.g. [0.25, 0.5, 0.75, 0.9, 0.95]
  };
  /** Group by columns (dimensions) */
  groupBy?: string[];
  /** Filters applied before aggregation (WHERE) */
  filters?: FilterCondition[];
  /** Output table name (optional) */
  outputTable?: string;
  /** Additional options */
  options?: {
    decimalPlaces?: number;
    includeNulls?: boolean;
    distinct?: boolean;
    limit?: number;
  };
}

export interface RunningTotalConfig {
  /** Optional columns to partition by (reset the running total per group) */
  partitionBy?: string[];

  /** Columns to order by – required for running total (determines the sequence) */
  orderBy: Array<{ column: string; direction: 'asc' | 'desc' }>;

  /** The numeric column to sum */
  valueColumn: string;

  /** Output column alias (default: 'running_total') */
  alias?: string;

  /** Optional window frame (defaults to UNBOUNDED PRECEDING TO CURRENT ROW) */
  frame?: {
    start: string;   // e.g. 'UNBOUNDED PRECEDING', '1 PRECEDING'
    end: string;     // e.g. 'CURRENT ROW'
  };

  /** Pre‑aggregation filters (WHERE) */
  filters?: FilterCondition[];

  /** Optional row limit */
  limit?: number;

  /** Whether to include all input columns in the output (default true) */
  includeAllColumns?: boolean;
}

export interface RankConfig {
  /** The column(s) to order by (required) – each with direction */
  orderBy: Array<{ column: string; direction: 'asc' | 'desc' }>;

  /** Optional partition by columns (to restart rank per group) */
  partitionBy?: string[];

  /** The ranking function to use */
  function: 'row_number' | 'rank' | 'dense_rank' | 'percent_rank' | 'cume_dist' | 'ntile';

  /** For ntile: number of buckets */
  ntileBuckets?: number;

  /** Output column alias (default: function name) */
  alias?: string;

  /** Optional custom SQL expression (overrides all above) */
  customExpression?: string;

  /** Filters applied before ranking (WHERE) */
  filters?: FilterCondition[];

  /** Optional limit on input rows */
  limit?: number;

  /** Whether to include all input columns in the output (default true) */
  includeAllColumns?: boolean;
}

export interface SliceConfig {
  /** The categorical column to slice on */
  column: string;

  /** Operator to apply: IN / NOT IN (multi-value) or = / != / LIKE / NOT LIKE (single value) */
  operator: 'IN' | 'NOT IN' | '=' | '!=' | 'LIKE' | 'NOT LIKE';

  /**
   * Values for the operator.
   * - For IN / NOT IN: an array of strings.
   * - For other operators: a single string (the first element of the array after parsing).
   */
  values: string[];

  /** Whether to include rows where the column is NULL (adds "OR column IS NULL") */
  includeNulls?: boolean;

  /** Whether string comparisons should be case sensitive (LIKE vs ILIKE) */
  caseSensitive?: boolean;
}

export interface WindowFunctionConfig {
  id: string;
  function: 'row_number' | 'rank' | 'dense_rank' | 'lag' | 'lead' | 'first_value' | 'last_value' | 'sum' | 'avg' | 'count' | 'custom';
  column?: string;
  partitionBy?: string[];
  orderBy?: Array<{ column: string; direction: 'asc' | 'desc' }>;
  frame?: { start: string; end: string };
  alias?: string;
  customExpression?: string;
}

export interface DataSummaryConfig {
  aggregations: ColumnAggregation[];
  groupBy: GroupByConfig[];
  preFilters: FilterCondition[];
  postFilters: FilterCondition[];
  windowFunctions: WindowFunctionConfig[];
  outputTable?: string;
  options?: {
    decimalPlaces?: number;
    includeNulls?: boolean;
    distinct?: boolean;
    limit?: number;
  };
}