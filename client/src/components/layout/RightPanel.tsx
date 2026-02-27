// src/components/layout/RightPanel.tsx – Analytics & Visualization Panel
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Maximize2,
  Minimize2,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  Table,
  Filter,
  Sliders,
  Drill,
  BarChart as BarChartIcon,
  Activity,
  TrendingUp,
  Hash,
  Target,
  Layers,
  Map,
  Gauge,
  Funnel,
  Trello,
  Waves,
  Circle,
  Grid,
  Sigma,
  FunctionSquare,
  GitBranch,
  LineChart as LineChartIcon,
  AreaChart,
  CircleDot,
  Kanban,
  Search
} from 'lucide-react';

// ==================== DRAG DATA INTERFACE ====================
export interface ReactFlowDragData {
  type: 'reactflow-component';
  componentId: string;
  source: 'rightPanel';
  metadata?: Record<string, any>;
}

// ==================== COMPONENT DEFINITIONS ====================
export type ComponentCategory = 'analytics' | 'visualization';
export type PortConfiguration = 'both' | 'left' | 'right' | 'none';

export interface AnalyticsComponentDefinition {
  id: string;
  displayName: string;
  icon: React.ReactNode;
  category: ComponentCategory;
  defaultDimensions: { width: number; height: number };
  description: string;
  /** Port configuration for the node (handles) */
  ports: PortConfiguration;
  /** Optional metadata that will be passed to the canvas on drop */
  initialMetadata?: Record<string, any>;
}

// ----- Enhanced Analytics Components (ports: both) -----
const analyticsComponents: AnalyticsComponentDefinition[] = [
  {
    id: 'data-summary',
    displayName: 'Data Summary',
    icon: <Table className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 240, height: 180 },
    description: 'Overview statistics: count, min, max, mean, nulls',
    ports: 'both',
  },
  {
    id: 'filter',
    displayName: 'Filter',
    icon: <Filter className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 220, height: 140 },
    description: 'Interactive row filter with condition builder',
    ports: 'both',
  },
  {
    id: 'slice',
    displayName: 'Slice',
    icon: <Sliders className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 220, height: 140 },
    description: 'Dimensional slice (filter by category)',
    ports: 'both',
  },
  {
    id: 'drill-down',
    displayName: 'Drill Down',
    icon: <Drill className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 220, height: 140 },
    description: 'Hierarchical drill‑down into dimensions',
    ports: 'both',
  },
  {
    id: 'pivot',
    displayName: 'Pivot Table',
    icon: <Layers className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 280, height: 200 },
    description: 'Cross‑tabulation with aggregation',
    ports: 'both',
  },
  {
    id: 'correlation',
    displayName: 'Correlation Matrix',
    icon: <Activity className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 260, height: 220 },
    description: 'Correlation coefficients between numeric columns',
    ports: 'both',
  },
  {
    id: 'outlier-detection',
    displayName: 'Outlier Detection',
    icon: <Target className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 240, height: 160 },
    description: 'Identify statistical outliers',
    ports: 'both',
  },
  // Advanced analytics
  {
    id: 'forecast',
    displayName: 'Forecast',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 280, height: 220 },
    description: 'Time series forecasting with confidence intervals',
    ports: 'both',
  },
  {
    id: 'cluster',
    displayName: 'Cluster',
    icon: <CircleDot className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 260, height: 200 },
    description: 'K‑means or hierarchical clustering',
    ports: 'both',
  },
  {
    id: 'reference-line',
    displayName: 'Reference Line',
    icon: <GitBranch className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 200, height: 120 },
    description: 'Add constant, average, or percentile lines',
    ports: 'both',
  },
  {
    id: 'trend-line',
    displayName: 'Trend Line',
    icon: <LineChartIcon className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 240, height: 160 },
    description: 'Linear, logarithmic, or exponential trend',
    ports: 'both',
  },
  {
    id: 'moving-average',
    displayName: 'Moving Average',
    icon: <Waves className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 240, height: 160 },
    description: 'Smooth fluctuations over a sliding window',
    ports: 'both',
  },
  {
    id: 'percentile',
    displayName: 'Percentile',
    icon: <Sigma className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 200, height: 140 },
    description: 'Compute percentiles for a measure',
    ports: 'both',
  },
  {
    id: 'rank',
    displayName: 'Rank',
    icon: <Hash className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 200, height: 140 },
    description: 'Rank dimension members by a measure',
    ports: 'both',
  },
  {
    id: 'running-total',
    displayName: 'Running Total',
    icon: <Sigma className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 220, height: 140 },
    description: 'Cumulative sum over a partition',
    ports: 'both',
  },
  {
    id: 'statistical-summary',
    displayName: 'Statistical Summary',
    icon: <FunctionSquare className="w-5 h-5" />,
    category: 'analytics',
    defaultDimensions: { width: 260, height: 200 },
    description: 'Detailed stats: skew, kurtosis, quartiles',
    ports: 'both',
  },
];

// ----- Enhanced Visualization Components (ports: left only) -----
const visualizationComponents: AnalyticsComponentDefinition[] = [
  {
    id: 'bar-chart',
    displayName: 'Bar Chart',
    icon: <BarChart className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 200 },
    description: 'Categorical comparison with bars',
    ports: 'left',
  },
  {
    id: 'line-chart',
    displayName: 'Line Chart',
    icon: <LineChart className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 200 },
    description: 'Trend over time or ordered categories',
    ports: 'left',
  },
  {
    id: 'pie-chart',
    displayName: 'Pie Chart',
    icon: <PieChart className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 240, height: 200 },
    description: 'Proportional parts of a whole',
    ports: 'left',
  },
  {
    id: 'scatter-plot',
    displayName: 'Scatter Plot',
    icon: <ScatterChart className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 240 },
    description: 'Relationship between two numeric variables',
    ports: 'left',
  },
  {
    id: 'histogram',
    displayName: 'Histogram',
    icon: <BarChartIcon className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 200 },
    description: 'Distribution of a single numeric variable',
    ports: 'left',
  },
  {
    id: 'heatmap',
    displayName: 'Heatmap',
    icon: <Activity className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 260, height: 220 },
    description: '2D intensity matrix',
    ports: 'left',
  },
  {
    id: 'box-plot',
    displayName: 'Box Plot',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 240, height: 200 },
    description: 'Distribution quartiles and outliers',
    ports: 'left',
  },
  {
    id: 'kpi',
    displayName: 'KPI Card',
    icon: <Hash className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 180, height: 100 },
    description: 'Single metric with optional comparison',
    ports: 'left',
  },
  // Advanced visualizations
  {
    id: 'map',
    displayName: 'Map',
    icon: <Map className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 320, height: 240 },
    description: 'Geographic data with markers or choropleth',
    ports: 'left',
  },
  {
    id: 'gauge',
    displayName: 'Gauge',
    icon: <Gauge className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 220, height: 180 },
    description: 'Single value against a target range',
    ports: 'left',
  },
  {
    id: 'funnel',
    displayName: 'Funnel',
    icon: <Funnel className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 240, height: 240 },
    description: 'Conversion stages and drop‑off',
    ports: 'left',
  },
  {
    id: 'treemap',
    displayName: 'Treemap',
    icon: <Trello className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 220 },
    description: 'Hierarchical proportions as nested rectangles',
    ports: 'left',
  },
  {
    id: 'waterfall',
    displayName: 'Waterfall',
    icon: <Waves className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 300, height: 200 },
    description: 'Cumulative effect of sequential values',
    ports: 'left',
  },
  {
    id: 'area-chart',
    displayName: 'Area Chart',
    icon: <AreaChart className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 200 },
    description: 'Filled line chart showing magnitude over time',
    ports: 'left',
  },
  {
    id: 'bubble-chart',
    displayName: 'Bubble Chart',
    icon: <Circle className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 300, height: 240 },
    description: 'Three dimensions: x, y, and bubble size',
    ports: 'left',
  },
  {
    id: 'scatter-matrix',
    displayName: 'Scatter Matrix',
    icon: <Grid className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 360, height: 300 },
    description: 'Matrix of scatter plots for multiple variables',
    ports: 'left',
  },
  {
    id: 'dual-axis',
    displayName: 'Dual‑Axis Chart',
    icon: <Layers className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 300, height: 220 },
    description: 'Combine bar and line with independent axes',
    ports: 'left',
  },
  {
    id: 'pareto',
    displayName: 'Pareto Chart',
    icon: <BarChartIcon className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 200 },
    description: 'Bar chart with cumulative percentage line',
    ports: 'left',
  },
  {
    id: 'word-cloud',
    displayName: 'Word Cloud',
    icon: <Kanban className="w-5 h-5" />,
    category: 'visualization',
    defaultDimensions: { width: 280, height: 220 },
    description: 'Frequency‑weighted text visualization',
    ports: 'left',
  },
];

// Combine all components for easy lookup
export const ALL_COMPONENTS = [...analyticsComponents, ...visualizationComponents];

// ==================== CATEGORY COLORS ====================
const getCategoryColor = (category: ComponentCategory): string => {
  return category === 'analytics' ? '#8b5cf6' : '#ec4899';
};

// ==================== DRAG HANDLER ====================
const handleDragStart = (
  event: React.DragEvent,
  component: AnalyticsComponentDefinition
) => {
  const dragData: ReactFlowDragData = {
    type: 'reactflow-component',
    componentId: component.id,
    source: 'rightPanel',
    metadata: {
      description: component.description,
      category: component.category,
      defaultDimensions: component.defaultDimensions,
      ports: component.ports,               // <-- port config added
      initialMetadata: component.initialMetadata,
    },
  };

  event.dataTransfer.clearData();
  event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
  event.dataTransfer.setData('text/plain', component.displayName);
  event.dataTransfer.effectAllowed = 'copy';

  // Custom drag image (optional)
  const dragImage = document.createElement('div');
  dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    left: -1000px;
    background: white;
    border: 2px solid #3b82f6;
    color: #1f2937;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  dragImage.innerHTML = `
    <div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;">
      ${component.displayName.charAt(0)}
    </div>
    <span>${component.displayName}</span>
  `;
  document.body.appendChild(dragImage);
  event.dataTransfer.setDragImage(dragImage, 30, 15);
  setTimeout(() => document.body.removeChild(dragImage), 0);
};

// ==================== COMPONENT PALETTE ====================
interface ComponentPaletteProps {
  expandedCategories: {
    analytics: boolean;
    visualization: boolean;
  };
  toggleCategory: (category: 'analytics' | 'visualization') => void;
  searchTerm: string;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  expandedCategories,
  toggleCategory,
  searchTerm,
}) => {
  // Filter components based on search
  const filterComponents = (
    components: AnalyticsComponentDefinition[]
  ): AnalyticsComponentDefinition[] => {
    if (!searchTerm) return components;
    const lower = searchTerm.toLowerCase();
    return components.filter(
      (c) =>
        c.displayName.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        c.id.toLowerCase().includes(lower)
    );
  };

  const filteredAnalytics = useMemo(
    () => filterComponents(analyticsComponents),
    [searchTerm]
  );
  const filteredVisualizations = useMemo(
    () => filterComponents(visualizationComponents),
    [searchTerm]
  );

  const renderCategory = (
    title: string,
    category: 'analytics' | 'visualization',
    components: AnalyticsComponentDefinition[],
    filtered: AnalyticsComponentDefinition[]
  ) => {
    const isExpanded = expandedCategories[category];
    const total = components.length;
    const shown = filtered.length;

    return (
      <div key={category} className="border border-gray-600 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-600/50 transition-colors text-white"
        >
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">{title}</span>
            <span className="bg-gray-600 text-gray-300 px-2 py-0.5 rounded text-xs">
              {shown} / {total}
            </span>
          </div>
          <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
        </button>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-800/30 p-2 border-t border-gray-600"
          >
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
              {filtered.map((comp) => (
                <ComponentItem key={comp.id} component={comp} />
              ))}
              {filtered.length === 0 && (
                <div className="text-gray-400 text-sm p-2">No matching components</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderCategory('Analytics', 'analytics', analyticsComponents, filteredAnalytics)}
      {renderCategory('Visualizations', 'visualization', visualizationComponents, filteredVisualizations)}
    </div>
  );
};

// Individual draggable component item
const ComponentItem: React.FC<{ component: AnalyticsComponentDefinition }> = ({
  component,
}) => {
  const categoryColor = getCategoryColor(component.category);
  // Optional: show a small indicator for port configuration
  const portIndicator = {
    both: '↔️',
    left: '←',
    right: '→',
    none: '⚫',
  }[component.ports];

  return (
    <div
      key={component.id}
      draggable
      onDragStart={(e) => handleDragStart(e, component)}
      className="flex items-center space-x-2 p-2 rounded-lg border border-transparent hover:bg-gray-600/30 hover:border-gray-500 transition-all cursor-grab active:cursor-grabbing group"
      title={`${component.description} (ports: ${component.ports})`}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}CC 100%)`,
        }}
      >
        {React.isValidElement(component.icon)
          ? React.cloneElement(component.icon as React.ReactElement, {
              className: 'w-4 h-4',
            })
          : component.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">
          {component.displayName}
        </div>
        <div className="text-xs text-gray-400 truncate">{component.id}</div>
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <span>{component.defaultDimensions.width}×{component.defaultDimensions.height}</span>
        <span className="text-gray-600" title={`Ports: ${component.ports}`}>
          {portIndicator}
        </span>
      </div>
    </div>
  );
};

// ==================== MAIN RIGHT PANEL ====================
interface RightPanelProps {
  /** Optional: currently selected job (unused in this simplified version) */
  currentJob?: any;
}

const RightPanel: React.FC<RightPanelProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    analytics: true,
    visualization: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (category: 'analytics' | 'visualization') => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const panelWidth = isExpanded ? 'w-96' : 'w-80';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${panelWidth} bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700 shadow-2xl flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/80">
        <h3 className="text-sm font-medium text-white">Components</h3>
        <button
          onClick={toggleExpand}
          className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded flex items-center justify-center"
          title={isExpanded ? 'Collapse Panel' : 'Expand Panel'}
        >
          {isExpanded ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Palette */}
      <div className="flex-1 overflow-y-auto p-3">
        <ComponentPalette
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          searchTerm={searchTerm}
        />
      </div>
    </motion.div>
  );
};

export default RightPanel;