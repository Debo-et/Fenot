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