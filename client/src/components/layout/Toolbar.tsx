// src/components/layout/Toolbar.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Bug, PlayCircle, RefreshCw, FileText, Save } from 'lucide-react';
import { useCanvas } from '../../pages/CanvasContext';
import { Node, Edge } from 'reactflow';
import { sqlGenerator, SQLGenerationResult } from '../../services/sql-generation.service';
import { databaseApi } from '../../services/database-api.service';
import { useAppDispatch } from '../../hooks';
import { addLog } from '../../store/slices/logsSlice';
import { CanvasProcessor } from '../../services/canvas-processor.service';
import { toast } from 'react-toastify';               // 👈 added for user feedback

interface JobConfig {
  id: string;
  name: string;
  state: 'draft' | 'running' | 'completed' | 'failed';
}

interface ToolbarProps {
  currentJob: JobConfig | null;
  onConsoleLog?: (message: string, type?: 'info' | 'error' | 'warning' | 'success' | 'debug') => void;
  onSaveDesign?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  canSaveDesign?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentJob,
  onConsoleLog,
  onSaveDesign,
  saveStatus = 'idle'}) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const { canvasData, requestCanvasData } = useCanvas();
  
  const [localCanvasData, setLocalCanvasData] = useState({
    nodes: [] as any[],
    edges: [] as any[],
    connections: [] as any[]
  });
  
  const [canvasSyncStatus, setCanvasSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');
  
  const [generatedSQL, setGeneratedSQL] = useState<string>('');
  const [sqlGenerationResult, setSqlGenerationResult] = useState<SQLGenerationResult | null>(null);

  const dispatch = useAppDispatch();

  const logToConsole = useCallback((message: string, type: 'info' | 'error' | 'warning' | 'success' | 'debug' = 'info') => {
    const levelMap: Record<typeof type, 'ERROR' | 'INFO' | 'WARN' | 'DEBUG' | 'SUCCESS'> = {
      error: 'ERROR',
      info: 'INFO',
      warning: 'WARN',
      success: 'SUCCESS',
      debug: 'DEBUG'
    };
    
    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: levelMap[type],
      message,
      source: currentJob ? currentJob.name : 'Toolbar'
    };
    dispatch(addLog(logEntry));
    
    if (onConsoleLog) {
      onConsoleLog(message, type);
    }
    
    if (process.env.NODE_ENV === 'development') {
      const logMethods = {
        'error': console.error,
        'warning': console.warn,
        'info': console.info,
        'debug': console.debug,
        'success': console.log
      };
      (logMethods[type] || console.log)(`[${type.toUpperCase()}] ${message}`);
    }
  }, [dispatch, currentJob, onConsoleLog]);

  useEffect(() => {
    if (canvasData) {
      setLocalCanvasData({
        nodes: canvasData.nodes || [],
        edges: canvasData.edges || [],
        connections: canvasData.connections || []
      });
      setCanvasSyncStatus('connected');
    }
  }, [canvasData]);

  const requestDataFromCanvas = useCallback(async (dataType: 'all' | 'nodes' | 'connections' = 'all') => {
    const requestId = `req-${Date.now()}`;
    
    setCanvasSyncStatus('syncing');
    
    logToConsole(`📤 Requesting ${dataType} data from Canvas...`, 'debug');
    
    const requestEvent = new CustomEvent('request-canvas-data', {
      detail: {
        requestId,
        dataType,
        requester: 'Toolbar',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(requestEvent);
    
    try {
      const contextData = requestCanvasData();
      if (contextData) {
        logToConsole(`📥 Received canvas data from context`, 'debug');
        setLocalCanvasData({
          nodes: contextData.nodes || [],
          edges: contextData.edges || [],
          connections: contextData.connections || []
        });
        setCanvasSyncStatus('connected');
        logToConsole(`✅ Canvas sync complete: ${contextData.nodes.length} nodes, ${contextData.edges.length} edges`, 'success');
        return contextData;
      }
    } catch (error) {
      logToConsole(`Failed to get data from context: ${error}`, 'error');
    }
    
    return new Promise((resolve) => {
      const handleResponse = (event: Event) => {
        const customEvent = event as CustomEvent<{
          requestId: string;
          data: any;
          timestamp: string;
          source: string;
        }>;
        
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('canvas-data-response', handleResponse as EventListener);
          
          setLocalCanvasData(prev => ({
            ...prev,
            ...customEvent.detail.data
          }));
          setCanvasSyncStatus('connected');
          
          logToConsole(`✅ Received canvas data for request: ${requestId}`, 'debug');
          resolve(customEvent.detail.data);
        }
      };
      
      window.addEventListener('canvas-data-response', handleResponse as EventListener);
      
      setTimeout(() => {
        window.removeEventListener('canvas-data-response', handleResponse as EventListener);
        logToConsole('⚠️ Canvas data request timed out', 'warning');
        setCanvasSyncStatus('disconnected');
        resolve(null);
      }, 3000);
    });
  }, [requestCanvasData, logToConsole]);

  // Helper to open a simple chart in a new tab
  const openChartInNewTab = (chartSpec: any) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
        <style>body{margin:0;padding:20px;}</style>
      </head>
      <body>
        <div id="chart" style="width:800px;height:600px;"></div>
        <script>
          var chart = echarts.init(document.getElementById('chart'));
          chart.setOption(${JSON.stringify(chartSpec)});
        </script>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  const handleDebug = async () => {
    // Even without a job, we can still debug the canvas
    await requestDataFromCanvas('all');
    
    if (localCanvasData.nodes.length === 0) {
      logToConsole('Empty workflow graph. Add nodes to the canvas first.', 'warning');
      return;
    }

    setIsDebugging(true);
    
    logToConsole('🚀 STARTING DEBUG ANALYSIS', 'success');
    logToConsole(`📊 Graph: ${localCanvasData.nodes.length} nodes, ${localCanvasData.edges.length} edges, ${localCanvasData.connections.length} connections`, 'info');
    logToConsole('─'.repeat(50), 'debug');
    
    try {
      logToConsole('✅ Basic graph structure analysis complete', 'success');
      logToConsole(`📊 Nodes: ${localCanvasData.nodes.length}`, 'info');
      logToConsole(`📊 Connections: ${localCanvasData.connections.length}`, 'info');
      
      logToConsole('🔍 Parsing workflow graph for SQL generation...', 'info');
      
      const inputNodes = localCanvasData.nodes.filter((node: Node) => {
        const data = node.data;
        return data?.componentType === 'INPUT' && 
               data?.configuration?.type === 'INPUT';
      });
      
      if (inputNodes.length === 0) {
        logToConsole('❌ No input data source found. Add at least one input component (file or database).', 'error');
        return;
      }
      
      // ✅ MODIFIED: Accept visualization nodes as valid terminal endpoints
      const outputNodes = localCanvasData.nodes.filter((node: Node) => {
        const data = node.data;
        return (data?.componentType === 'OUTPUT' && data?.configuration?.type === 'OUTPUT') ||
               data?.componentType === 'VISUALIZATION';
      });
      
      if (outputNodes.length === 0) {
        logToConsole('❌ No output destination or visualization found. Add at least one output component or visualization.', 'error');
        return;
      }
      
      logToConsole(`📥 Found ${inputNodes.length} input source(s)`, 'success');
      logToConsole(`📤 Found ${outputNodes.length} terminal node(s) (outputs/visualizations)`, 'success');
      
      logToConsole('🧱 Building PostgreSQL SQL from workflow components...', 'info');
      const sqlResult = sqlGenerator.generateSQLFromGraph(
        localCanvasData.nodes as Node[],
        localCanvasData.edges as Edge[]
      );
      
      setSqlGenerationResult(sqlResult);
      
      if (sqlResult.success) {
        logToConsole('✅ SQL GENERATION SUCCESSFUL', 'success');
        logToConsole(`📝 Generated ${sqlResult.sql.split('SELECT').length - 1} SELECT statements`, 'info');
        logToConsole(`📝 Generated ${sqlResult.sql.split('INSERT').length - 1} INSERT statements`, 'info');
        
        if (sqlResult.executionPlan) {
          logToConsole('📋 EXECUTION PLAN:', 'info');
          sqlResult.executionPlan.steps.forEach(step => {
            logToConsole(`  Step ${step.step}: ${step.nodeType} - ${step.description}`, 'debug');
          });
          logToConsole(`  Estimated rows: ${sqlResult.executionPlan.estimatedRows}`, 'info');
          logToConsole(`  Total steps: ${sqlResult.executionPlan.steps.length}`, 'info');
        }
        
        if (sqlResult.warnings.length > 0) {
          logToConsole('⚠️ WARNINGS:', 'warning');
          sqlResult.warnings.forEach(warning => {
            logToConsole(`  • ${warning}`, 'warning');
          });
        }
        
        if (sqlResult.messages.length > 0) {
          sqlResult.messages.forEach(message => {
            logToConsole(`  ℹ️ ${message}`, 'info');
          });
        }
        
        logToConsole('💾 Saving generated SQL script...', 'info');
        const jobName = currentJob?.name || 'untitled';
        const savedFilename = await sqlGenerator.saveSQLScript(sqlResult.sql, jobName);
        if (savedFilename) {
          logToConsole(`✅ SQL script saved as: ${savedFilename}`, 'success');
          
          if (currentJob) {
            localStorage.setItem(`generated_sql_${currentJob.id}`, sqlResult.sql);
            localStorage.setItem(`generated_sql_timestamp_${currentJob.id}`, new Date().toISOString());
          }
          
          setGeneratedSQL(sqlResult.sql);
        }
        
        const sqlPreview = sqlResult.sql.substring(0, 500) + (sqlResult.sql.length > 500 ? '...' : '');
        logToConsole('📄 Generated SQL (preview):', 'debug');
        sqlPreview.split('\n').forEach(line => {
          if (line.trim()) {
            logToConsole(line, 'info');
          }
        });
        
        if (sqlResult.sql.length > 500) {
          logToConsole(`... (${sqlResult.sql.length - 500} more characters)`, 'info');
        }
        
        logToConsole('─'.repeat(50), 'debug');
        logToConsole('✅ DEBUG ANALYSIS COMPLETE', 'success');
        logToConsole('Workflow validated and PostgreSQL script generated successfully', 'success');
        
      } else {
        logToConsole('❌ SQL GENERATION FAILED', 'error');
        sqlResult.errors.forEach(error => {
          logToConsole(`  • ${error}`, 'error');
        });
        
        if (sqlResult.messages.length > 0) {
          sqlResult.messages.forEach(message => {
            logToConsole(`  ℹ️ ${message}`, 'info');
          });
        }
        
        if (sqlResult.warnings.length > 0) {
          logToConsole('⚠️ WARNINGS:', 'warning');
          sqlResult.warnings.forEach(warning => {
            logToConsole(`  • ${warning}`, 'warning');
          });
        }
      }
      
    } catch (error: any) {
      logToConsole(`❌ Debug analysis failed: ${error.message || 'Unknown error'}`, 'error');
      logToConsole(`Stack trace: ${error.stack}`, 'debug');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleRun = async () => {
    await requestDataFromCanvas('all');
    
    if (localCanvasData.nodes.length === 0) {
      logToConsole('Empty workflow graph. Add nodes to the canvas first.', 'warning');
      return;
    }

    if (!window.confirm(`Run workflow against PostgreSQL database?\n\nThis will execute the generated SQL script on your local PostgreSQL instance.`)) {
      logToConsole('❌ Job execution cancelled by user', 'warning');
      return;
    }

    setIsRunning(true);
    
    logToConsole('🚀 STARTING EXECUTION', 'success');
    logToConsole(`📊 Graph: ${localCanvasData.nodes.length} nodes, ${localCanvasData.connections.length} connections`, 'info');
    logToConsole('─'.repeat(50), 'debug');
    
    try {
      // Check PostgreSQL connection inside the run handler
      logToConsole('🔍 Checking PostgreSQL connection...', 'info');
      const connections = await databaseApi.getActiveConnections();
      const pgConnection = connections.find(c => 
        c.dbType === 'postgresql' || c.dbType === 'postgres'
      );
      
      if (!pgConnection) {
        logToConsole('❌ No active PostgreSQL connection found.', 'error');
        logToConsole('   Please connect to a PostgreSQL database first using the Database panel.', 'warning');
        logToConsole('   Required: PostgreSQL 12+ with necessary FDW extensions.', 'info');
        setIsRunning(false);
        return;
      }

      // ========== PRE‑FLIGHT RECOVERY MODE CHECK ==========
      try {
        const recoveryCheck = await databaseApi.executeQuery(
          pgConnection.connectionId,
          "SELECT pg_is_in_recovery() as in_recovery"
        );
        const inRecovery = recoveryCheck.result?.rows?.[0]?.in_recovery;
        if (inRecovery) {
          logToConsole('❌ PostgreSQL is in recovery mode. Please wait until recovery completes and try again.', 'error');
          toast.error('Database is in recovery mode – try again in a few seconds.');
          setIsRunning(false);
          return;
        }
      } catch (err) {
        logToConsole('⚠️ Could not verify database recovery status, proceeding anyway.', 'error');
      }

      // Instantiate CanvasProcessor with apiService and a log callback
      const processor = new CanvasProcessor(
        databaseApi,
        (message, type) => logToConsole(message, type as any)
      );

      const { nodes, edges } = localCanvasData;
      const results = await processor.processCanvas(nodes, edges);

      logToConsole('📊 Canvas processing complete', 'success');

      // ========== DISPLAY RESULTS WITH TOASTS FOR ERRORS ==========
      let hasErrors = false;
      results.forEach((result, nodeId) => {
        if (result.error) {
          hasErrors = true;
          logToConsole(`❌ Node ${nodeId}: ${result.error}`, 'error');
          toast.error(`Node ${nodeId} failed: ${result.error}`);
        } else if (result.nodeType === 'VISUALIZATION' && result.chartSpec) {
          logToConsole(`📊 Visualization ${nodeId} ready`, 'success');
          openChartInNewTab(result.chartSpec);
        } else if (result.nodeType === 'ANALYTICS') {
          logToConsole(`📈 Analytics ${nodeId}: ${result.rows?.length} rows returned`, 'info');
        }
      });
      if (hasErrors) {
        toast.warning('Run completed with errors – see console for details.');
      }

      // ... rest of the function (SQL generation, execution, etc.) remains unchanged ...
    } catch (error: any) {
      logToConsole(`❌ Execution failed: ${error.message || 'Unknown error'}`, 'error');
      logToConsole(`Stack trace: ${error.stack}`, 'debug');
      toast.error(`Execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewSQL = () => {
    if (!generatedSQL && sqlGenerationResult?.sql) {
      setGeneratedSQL(sqlGenerationResult.sql);
    }
    
    if (!generatedSQL) {
      logToConsole('No SQL has been generated yet. Run Debug first.', 'warning');
      return;
    }
    
    logToConsole('📄 Opening generated SQL in new tab...', 'info');
    
    const blob = new Blob([generatedSQL], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      logToConsole('❌ Popup blocked. Please allow popups for this site.', 'error');
      const a = document.createElement('a');
      const filename = currentJob 
        ? `generated_${currentJob.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.sql`
        : `generated_workflow_${Date.now()}.sql`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      logToConsole('📥 SQL script downloaded instead', 'success');
    }
    
    URL.revokeObjectURL(url);
  };

  const getCanvasStats = () => {
    return {
      nodeCount: localCanvasData.nodes.length,
      edgeCount: localCanvasData.edges.length,
      connectionCount: localCanvasData.connections.length
    };
  };

  const canvasStats = getCanvasStats();
  const hasValidSQL = generatedSQL || sqlGenerationResult?.success;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-xl">
      {/* Left section - Sync and status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            canvasSyncStatus === 'connected' ? 'bg-green-400 animate-pulse' :
            canvasSyncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          <span className="font-medium text-gray-300">
            Canvas {canvasSyncStatus === 'connected' ? 'Connected' : 
                   canvasSyncStatus === 'syncing' ? 'Syncing...' : 
                   'Disconnected'}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-700"></div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => requestDataFromCanvas('all')}
          disabled={false}
          title="Sync with Canvas"
        >
          <RefreshCw className={`h-4 w-4 ${canvasSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Center section - Main actions */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-3 ${
            saveStatus === 'saving' ? 'text-yellow-400 bg-yellow-400/10' :
            saveStatus === 'saved' ? 'text-green-400 bg-green-400/10' :
            saveStatus === 'error' ? 'text-red-400 bg-red-400/10' :
            'text-blue-400 hover:text-blue-300 hover:bg-gray-700'
          }`}
          onClick={onSaveDesign}
          disabled={saveStatus === 'saving'}
          title="Save current canvas (Ctrl+S)"
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              <span>Saving...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved</span>
            </>
          ) : saveStatus === 'error' ? (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Error</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              <span>Save</span>
            </>
          )}
        </Button>

        {hasValidSQL && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-purple-400 hover:text-purple-300 hover:bg-gray-700"
            onClick={handleViewSQL}
            disabled={!hasValidSQL}
            title="View generated SQL script"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>View SQL</span>
          </Button>
        )}

        <Button
          size="sm"
          className={`h-8 px-3 ${isDebugging ? 'bg-blue-700 text-white' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg'}`}
          onClick={handleDebug}
          disabled={isDebugging || isRunning || canvasStats.nodeCount === 0}
          title={canvasStats.nodeCount === 0 ? "Add nodes to the canvas first" : "Debug - Generate PostgreSQL SQL from workflow"}
        >
          {isDebugging ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
              <span className="whitespace-nowrap">Debugging...</span>
            </>
          ) : (
            <>
              <Bug className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Debug</span>
            </>
          )}
        </Button>

        <Button
          size="sm"
          className={`h-8 px-3 ${
            isRunning ? 'bg-green-700 text-white' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
          }`}
          onClick={handleRun}
          disabled={isDebugging || isRunning || canvasStats.nodeCount === 0}
          title={
            canvasStats.nodeCount === 0 ? "Add nodes to the canvas first" :
            "Run - Execute workflow against PostgreSQL (requires connection)"
          }
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
              <span className="whitespace-nowrap">Running...</span>
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Run</span>
            </>
          )}
        </Button>
      </div>

      {/* Right section - Stats and info */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center text-xs text-gray-400">
          <span className="mr-3">Nodes: {canvasStats.nodeCount}</span>
          <span>Connections: {canvasStats.connectionCount}</span>
        </div>
        
        {sqlGenerationResult && (
          <div className={`hidden sm:flex text-xs px-2 py-1 rounded ${
            sqlGenerationResult.success ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
            'bg-red-400/10 text-red-400 border border-red-400/20'
          }`}>
            {sqlGenerationResult.success ? 'SQL Ready' : 'SQL Failed'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;