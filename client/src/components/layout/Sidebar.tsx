
import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import modular components
import ExcelMetadataWizard from '../../Wizard/ExcelMetadataWizard';
import XMLMetadataWizard from '../../Wizard/XMLMetadataWizard';
import DelimitedFileMetadataWizard from '../../Wizard/DelimitedFileMetadataWizard';
import PositionalFileMetadataWizard from '../../Wizard/PositionalFileMetadataWizard';
import FileSchemaMetadataWizard from '../../Wizard/FileSchemaMetadataWizard';
import JsonAvroParquetMetadataWizard from '../../Wizard/JsonAvroParquetMetadataWizard';
import RegexMetadataWizard from '../../Wizard/RegexMetadataWizard';
import LDIFMetadataWizard from '../../Wizard/LDIFMetadataWizard';
import WebServiceMetadataWizard from '../../Wizard/WebServiceMetadataWizard';
import DatabaseMetadataWizard from '../../Wizard/DatabaseMetadataWizard';

// Import React components from Wizard
import ContextMenu from '../../Wizard/ContextMenu';

// Import split modules
import * as Layout from './SidebarLayout';
import * as State from './SidebarState';
import * as Handlers from './SidebarHandlers';
import * as Utils from './SidebarUtils';

// Import types
import {
  RepositoryNode,
  ExcelMetadataFormData,
  DeletionHistoryItem
} from '../../types/types';

// Import icons
import { Plus, Layers, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

// Import Canvas Design Service and Hook
import { CanvasDesignManager } from '../../services/canvas-design.service';
import { useCanvasDesign } from '../../hooks/useCanvasDesign';
import { COMPONENT_REGISTRY, getCategoryColor } from '@/pages/ComponentRegistry';

// ==================== DATABASE CONTEXT & FOREIGN TABLE HELPERS ====================
import { DatabaseContext } from '../../App';
import { DatabaseApiService } from '../../services/database-api.service';
import { ColumnDefinition } from '../../api/postgres-foreign-table';


// ==================== REVERSE METADATA IMPORTS ====================
import {
  getForeignTablesInSchema,
  reverseForeignTableMetadata
} from '../../api/postgres-foreign-table-reverse';

// ==================== CANVAS PERSISTENCE ====================
import { canvasPersistence } from '../../services/canvas-persistence.service';

// ============================================================================
// 🛡️ MODULE-LEVEL CACHE – survives component remounts
// ============================================================================
let __globalRepositoryCache: RepositoryNode[] | null = null;

// ============================================================================
// Interface
// ============================================================================
interface ReactFlowDragData {
  type: 'reactflow-component';
  componentId: string;
  source: 'sidebar' | 'rightPanel';
  metadata?: Record<string, any>;
}

interface EnhancedRepositorySidebarProps extends Omit<State.RepositorySidebarProps, 'onDragStart' | 'onDrop' | 'onCreateJob'> {
  onCreateJob?: (jobName: string, jobId?: string) => void;
  onCanvasDesignCreate?: (design: any) => void;
  onCanvasDesignDelete?: (designId: string) => void;
  onCanvasDesignSwitch?: (designId: string | null) => void;
  onCanvasDesignDuplicate?: (sourceId: string, newDesign: any) => void;
  activeCanvasDesignId?: string | null;
  activeCanvasId?: string | null;
  // NEW: Callback to notify App to load a canvas by ID
  onCanvasSelect?: (canvasId: string) => void;
}

// ============================================================================
// ✅ EXACT REPOSITORY STRUCTURE FROM LOGS – 8 root nodes, file categories under "metadata"
// ============================================================================
const getDefaultRepositoryStructure = (): RepositoryNode[] => {
  return [
    {
      id: 'job-designs',
      name: 'Job Designs',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'contexts',
      name: 'Contexts',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'metadata',
      name: 'Metadata',
      type: 'folder',
      children: [
        { id: 'db-connections', name: 'Database Connections', type: 'folder', children: [], draggable: false, metadata: { type: 'folder', count: 0 } },
        { id: 'sap-connection', name: 'SAP Connection', type: 'folder', children: [], draggable: false, metadata: { type: 'folder', count: 0 } },
        { id: 'file-delimited', name: 'Delimited Files', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-positional', name: 'Positional Files', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-xml', name: 'XML Files', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-excel', name: 'Excel Files', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-schema', name: 'File Schema', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-regex', name: 'Regex Patterns', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-ldif', name: 'LDIF', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'file-json-avro-parquet', name: 'JSON/Avro/Parquet', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'web-service', name: 'Web Service', type: 'category', children: [], draggable: false, metadata: { type: 'category', count: 0 } },
        { id: 'ldap', name: 'LDAP', type: 'folder', children: [], draggable: false, metadata: { type: 'folder', count: 0 } },
        { id: 'ftp-sftp', name: 'FTP/SFTP', type: 'folder', children: [], draggable: false, metadata: { type: 'folder', count: 0 } },
        { id: 'salesforce', name: 'Salesforce', type: 'folder', children: [], draggable: false, metadata: { type: 'folder', count: 0 } }
      ],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'code',
      name: 'Code',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'sql-templates',
      name: 'SQL Templates',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'business-models',
      name: 'Business Models',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'documentation',
      name: 'Documentation',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    },
    {
      id: 'recycle-bin',
      name: 'Recycle Bin',
      type: 'folder',
      children: [],
      draggable: false,
      metadata: { type: 'folder', count: 0, system: true }
    }
  ];
};

// ============================================================================
// Helper: map fileType to repository folder ID (these are now nested under "metadata")
// ============================================================================
function determineFolderId(fileType: string): string | null {
  switch (fileType?.toLowerCase()) {
    case 'excel': return 'file-excel';
    case 'xml': return 'file-xml';
    case 'csv':
    case 'tsv':
    case 'delimited':
    case 'txt': return 'file-delimited';
    case 'fixed':
    case 'positional': return 'file-positional';
    case 'schema': return 'file-schema';
    case 'json':
    case 'avro':
    case 'parquet': return 'file-json-avro-parquet';
    case 'regex': return 'file-regex';
    case 'ldif': return 'file-ldif';
    case 'web-service': return 'web-service';
    case 'database': return 'database';
    default: return null;
  }
}

// ============================================================================
// Helper: create a RepositoryNode from reversed foreign table metadata
// ============================================================================
function createNodeFromMetadata(
  meta: any,
  folderId: string,
  connectionId: string
): RepositoryNode {
  const columns = (meta.columns || []).map((col: any) => ({
    name: col.name,
    dataType: col.type,
    type: col.type,
    length: col.length,
    precision: col.precision,
    scale: col.scale,
    nullable: col.nullable ?? true,
    defaultValue: col.defaultValue,
  }));

  const nodeId = `${meta.fileType}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    id: nodeId,
    name: meta.tableName,
    type: 'item',
    metadata: {
      ...meta,
      postgresTableName: meta.tableName,
      filePath: meta.filePath,
      options: meta.options,
      columns,
      oid: meta.oid,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      connection: { connectionId },
    },
    draggable: true,
    droppable: false,
    parentId: folderId,
  };
}

// ============================================================================
// Helper: get the most recent active PostgreSQL connection ID
// ============================================================================
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

// ============================================================================
// 🔍 RECURSIVE TREE UTILITIES – find & update nested nodes
// ============================================================================
function findNodeAndParent(
  nodes: RepositoryNode[],
  nodeId: string,
  parent: RepositoryNode | null = null
): { node: RepositoryNode; parent: RepositoryNode | null; path: number[] } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === nodeId) {
      return { node, parent, path: [i] };
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeAndParent(node.children, nodeId, node);
      if (found) {
        return { ...found, path: [i, ...found.path] };
      }
    }
  }
  return null;
}

function updateNodeInTree(
  nodes: RepositoryNode[],
  targetId: string,
  updater: (node: RepositoryNode) => RepositoryNode
): RepositoryNode[] {
  return nodes.map(node => {
    if (node.id === targetId) {
      return updater(node);
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNodeInTree(node.children, targetId, updater)
      };
    }
    return node;
  });
}

// ============================================================================
// Main Component
// ============================================================================
const RepositorySidebar: React.FC<EnhancedRepositorySidebarProps> = ({
  onNodeSelect,
  onCreateItem,
  currentJob,
  onCreateJob,
  reactFlowInstance,
  onNodeCreate,
  onNodeUpdate,
  onCanvasDesignDelete,
  onCanvasDesignSwitch,
  activeCanvasDesignId,
  onCanvasSelect, // NEW
}) => {
  // ==================== DATABASE CONTEXT ====================
  const databaseContext = useContext(DatabaseContext);
  const { apiService, isConnected, testConnection } = databaseContext;

  // ==================== STATE MANAGEMENT ====================
  // 🛡️ ENHANCED INITIALIZER: uses global cache + merges saved data, never loses categories
  const [repositoryData, _setRepositoryData] = useState<RepositoryNode[]>(() => {
    // 1. Restore from global cache if available (remount protection)
    if (__globalRepositoryCache) {
      console.log('♻️ Restoring repository data from global cache');
      return __globalRepositoryCache;
    }

    // 2. Start with the full 8-root structure from logs
    const fullStructure = getDefaultRepositoryStructure();

    // 3. Try to merge any saved data from State, but NEVER drop categories
    try {
      const savedData = State.getDefaultRepositoryData(currentJob);
      if (savedData && Array.isArray(savedData) && savedData.length > 0) {
        // Simple merge – we trust the cache for remounts
        __globalRepositoryCache = fullStructure;
        return fullStructure;
      }
    } catch (error) {
      console.warn('Failed to load repository data from State:', error);
    }

    // 4. Fallback to full structure
    __globalRepositoryCache = fullStructure;
    return fullStructure;
  });

  // 🛡️ WRAPPED SETTER – updates cache + prevents destructive resets to default empty structure
  const defaultStructure = useRef(getDefaultRepositoryStructure()).current;
  const setRepositoryData = useCallback((value: React.SetStateAction<RepositoryNode[]>) => {
    _setRepositoryData(prev => {
      const next = typeof value === 'function' ? value(prev) : value;

      // 🛡️ GUARD: Prevent resetting to the default empty structure if we already have non-zero children
      const hasNonZeroChildren = (nodes: RepositoryNode[]): boolean => {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) return true;
          if (node.children && hasNonZeroChildren(node.children)) return true;
        }
        return false;
      };

      const isDefaultReset = JSON.stringify(next) === JSON.stringify(defaultStructure);
      if (isDefaultReset && hasNonZeroChildren(prev)) {
        console.warn('⛔ Prevented reset of repositoryData to default empty structure');
        __globalRepositoryCache = prev;
        return prev;
      }

      // ✅ Normal update – store in cache and return
      __globalRepositoryCache = next;
      return next;
    });
  }, [defaultStructure]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const rootNodeIds = repositoryData.map(node => node.id);
    return new Set(rootNodeIds);
  });

  const [expandedMetadataNodes, setExpandedMetadataNodes] = useState<Set<string>>(() => new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Metadata settings state
  const [metadataSettings] = useState({
    showAll: false,
    autoExpandNew: true,
    compactMode: false,
    showIcons: true,
    maxItemsVisible: 10,
    sortOrder: 'asc' as const,
  });

  const [showMetadataSettings, setShowMetadataSettings] = useState(false);

  // Canvas Design State using hook
  const { deleteDesign } = useCanvasDesign(currentJob?.id);
  const [activeDesignId, setActiveDesignId] = useState<string | null>(activeCanvasDesignId || null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<RepositoryNode | null>(null);
  const [, setDeletionHistory] = useState<DeletionHistoryItem[]>([]);

  const [jobDesignContextMenu, setJobDesignContextMenu] = useState<{
    node: RepositoryNode;
    position: { x: number; y: number };
  } | null>(null);

  const [searchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{ node: RepositoryNode; position: { x: number; y: number } } | null>(null);
  const [, setJobCreationDialogOpen] = useState(false);

  // Wizard states
  const [excelWizardOpen, setExcelWizardOpen] = useState(false);
  const [xmlWizardOpen, setXmlWizardOpen] = useState(false);
  const [delimitedWizardOpen, setDelimitedWizardOpen] = useState(false);
  const [positionalWizardOpen, setPositionalWizardOpen] = useState(false);
  const [fileSchemaWizardOpen, setFileSchemaWizardOpen] = useState(false);
  const [jsonAvroParquetWizardOpen, setJsonAvroParquetWizardOpen] = useState(false);
  const [regexWizardOpen, setRegexWizardOpen] = useState(false);
  const [ldifWizardOpen, setLdifWizardOpen] = useState(false);
  const [webServiceWizardOpen, setWebServiceWizardOpen] = useState(false);
  const [databaseWizardOpen, setDatabaseWizardOpen] = useState(false);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const jobDesignContextMenuRef = useRef<HTMLDivElement>(null);

  // ==================== CANVAS LOADING INSIDE SIDEBAR (NEW) ====================
  // Sidebar.tsx – add state variables
const [, setCanvasLoading] = useState(false);
const [, setCanvasError] = useState<string | null>(null);
const [isDeletingForeignTable, setIsDeletingForeignTable] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

useEffect(() => {
  if (!isConnected) return;

  const loadCanvases = async () => {
    setCanvasLoading(true);
    setCanvasError(null);
    try {
      console.log('🎨 [Sidebar] Loading canvases from database...');
      const canvasesList = await canvasPersistence.listCanvases();
      console.log('🎨 [Sidebar] Fetched canvases:', canvasesList);

      if (canvasesList.length === 0) {
        console.log('🎨 [Sidebar] No canvases found.');
        return;
      }

      // Update repository tree with canvas nodes
      setRepositoryData(prev => {
        const jobDesignsIndex = prev.findIndex(n => n.id === 'job-designs');
        if (jobDesignsIndex === -1) {
          console.warn('🎨 [Sidebar] job-designs folder not found!');
          return prev;
        }

        const jobDesignsNode = prev[jobDesignsIndex];
        const nonCanvasChildren = (jobDesignsNode.children || []).filter(
          child => child.type !== 'canvas'
        );
        const canvasNodes = canvasesList.map(canvas => ({
          id: `canvas-${canvas.id}`,
          name: canvas.name,
          type: 'canvas' as const,
          metadata: {
            canvasId: canvas.id,
            createdAt: canvas.updated_at,
            updatedAt: canvas.updated_at,
          },
          draggable: true,
          droppable: false,
          parentId: 'job-designs',
        }));

        const newChildren = [...canvasNodes, ...nonCanvasChildren];
        console.log('🎨 [Sidebar] New children under job-designs:', newChildren.map(c => ({ id: c.id, name: c.name })));

        const updatedNode = {
          ...jobDesignsNode,
          children: newChildren,
          metadata: {
            ...jobDesignsNode.metadata,
            count: newChildren.length,
          },
        };
        const newTree = [...prev];
        newTree[jobDesignsIndex] = updatedNode;
        return newTree;
      });

      // Expand the Job Designs folder
      setExpandedNodes(prev => new Set([...prev, 'job-designs']));

      // Notify parent to load the most recent canvas
      if (onCanvasSelect && canvasesList.length > 0) {
        onCanvasSelect(canvasesList[0].id);
      }
    } catch (error: any) {
      console.error('❌ [Sidebar] Failed to load canvases:', error);
      setCanvasError(error.message || 'Failed to load canvases');
      toast.error('Failed to load canvases. Please refresh.');
    } finally {
      setCanvasLoading(false);
    }
  };

  loadCanvases();
}, [isConnected, setRepositoryData, setExpandedNodes, onCanvasSelect]);
  // ==================== METADATA CREATION EVENT LISTENER ====================
  useEffect(() => {
    const handleMetadataCreated = (event: CustomEvent) => {
      console.log('📥 metadata-created event received:', event.detail);
      const { metadata, type, folderId } = event.detail;

      const nodeId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newNode: RepositoryNode = {
        id: nodeId,
        name: metadata.name || `New ${type}`,
        type: 'item',
        metadata: {
          ...metadata,
          type: type,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        },
        draggable: true,
        droppable: false,
        parentId: folderId
      };

      console.log('🆕 New repository node created:', newNode);

      setRepositoryData(prev => {
        // Recursively find the folder and add the child
        const found = findNodeAndParent(prev, folderId);
        if (!found) {
          console.warn(`Folder ${folderId} not found, cannot add node`);
          return prev;
        }
        return updateNodeInTree(prev, folderId, folder => {
          const existingChildren = folder.children || [];
          const isDuplicate = existingChildren.some(
            child => child.id === nodeId || child.name === newNode.name
          );
          if (!isDuplicate) {
            return {
              ...folder,
              children: [...existingChildren, newNode],
              metadata: {
                ...folder.metadata,
                count: (folder.metadata?.count || 0) + 1
              }
            };
          }
          return folder;
        });
      });

      setSelectedNode(nodeId);

      toast.success(`✅ "${newNode.name}" created successfully`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    };

    const listener = handleMetadataCreated as EventListener;
    window.addEventListener('metadata-created', listener);
    return () => {
      window.removeEventListener('metadata-created', listener);
    };
  }, [setRepositoryData]);

  // ==================== METADATA EXPANSION HANDLERS ====================
  const handleToggleMetadata = useCallback((nodeId: string) => {
    setExpandedMetadataNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // ==================== HELPER FUNCTIONS ====================
  const createNodeInTree = useCallback((type: string, parentId: string, name?: string): RepositoryNode => {
    const nodeName = name || (type === 'folder' ? 'New Folder' : type === 'job' ? 'New Job' : 'New Item');
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nodeName,
      type: type as any,
      children: type === 'folder' || type === 'job-designs' ? [] : undefined,
      parentId: parentId
    };
  }, []);

  const updateRepositoryTree = useCallback((parentId: string, newNode: RepositoryNode) => {
    setRepositoryData(prev => {
      const found = findNodeAndParent(prev, parentId);
      if (!found) {
        console.warn(`Parent ${parentId} not found, cannot add node`);
        return prev;
      }
      return updateNodeInTree(prev, parentId, node => ({
        ...node,
        children: [...(node.children || []), newNode],
        metadata: {
          ...node.metadata,
          count: (node.metadata?.count || 0) + 1
        }
      }));
    });
    setExpandedNodes(prev => new Set([...prev, parentId]));
  }, []);

  // ==================== CANVAS DESIGN FUNCTIONS ====================
  const handleDeleteCanvasDesign = useCallback((designId: string, designName: string) => {
    if (window.confirm(`⚠️ Delete Canvas Design\n\nAre you sure you want to delete the design "${designName}"?\n\nThis will remove all canvas nodes, connections, and persisted state. This action cannot be undone.`)) {
      const success = deleteDesign(designId);
      if (success && onCanvasDesignDelete) {
        onCanvasDesignDelete(designId);
      }

      setRepositoryData(prev => {
        const removeNode = (nodes: RepositoryNode[]): RepositoryNode[] => {
          return nodes.filter(n => {
            if (n.type === 'job' && n.metadata?.canvasDesignId === designId) {
              return false;
            }
            if (n.children && n.children.length > 0) {
              n.children = removeNode(n.children);
            }
            return true;
          });
        };
        return removeNode(prev);
      });

      if (activeDesignId === designId) {
        setActiveDesignId(null);
        if (onCanvasDesignSwitch) {
          onCanvasDesignSwitch(null);
        }
      }

      toast.success(`🗑️ Canvas design "${designName}" deleted`, {
        position: "bottom-right",
        autoClose: 3000,
      });

      window.dispatchEvent(new CustomEvent('repository-updated'));
    }
  }, [deleteDesign, onCanvasDesignDelete, onCanvasDesignSwitch, activeDesignId, setRepositoryData]);

  // ==================== OTHER HANDLERS ====================
  const handleCreateItem = useCallback((type: string, parentId?: string) => {
    if (type === 'job') {
      setJobCreationDialogOpen(true);
    } else if (parentId) {
      const newNode = createNodeInTree(type, parentId);
      updateRepositoryTree(parentId, newNode);
    }

    if (onCreateItem) {
      onCreateItem(type, parentId);
    }

    setContextMenu(null);
    setJobDesignContextMenu(null);
  }, [createNodeInTree, updateRepositoryTree, onCreateItem]);

const handleCreateJobWizard = useCallback(() => {
  const jobName = window.prompt('Enter job name:');
  if (!jobName || !jobName.trim()) {
    setContextMenu(null);
    return;
  }

  // 1. Create the new job node
  const newNode: RepositoryNode = {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: jobName.trim(),
    type: 'job',
    children: [],               // jobs can have canvas children later
    metadata: {
      createdAt: new Date().toISOString(),
      // you may add more fields (author, version, etc.) as needed
    },
    draggable: true,
    droppable: true,            // allow canvas nodes to be added
    parentId: 'job-designs',    // hardcoded because the wizard is only for this folder
  };

  // 2. Update the repository tree
  setRepositoryData(prev => {
    const updated = updateNodeInTree(prev, 'job-designs', folder => ({
      ...folder,
      children: [...(folder.children || []), newNode],
      metadata: {
        ...folder.metadata,
        count: (folder.metadata?.count || 0) + 1,
      },
    }));
    return updated;
  });

  // 3. Ensure the folder is expanded
  setExpandedNodes(prev => new Set([...prev, 'job-designs']));

  // 4. (Optional) select the new job
  setSelectedNode(newNode.id);

  // 5. Call the parent callback (if any)
  onCreateJob?.(jobName.trim());

  // 6. Close the context menu
  setContextMenu(null);
}, [onCreateJob, setRepositoryData, setExpandedNodes, setSelectedNode]);

  // ==================== EVENT HANDLERS ====================
  const handleToggle = useCallback((nodeId: string) => {
    Handlers.handleToggle(nodeId, expandedNodes, setExpandedNodes);
  }, [expandedNodes]);

  const handleSelect = useCallback((node: RepositoryNode) => {
    Handlers.handleSelect(node, setSelectedNode, onNodeSelect);
  }, [onNodeSelect]);

  const handleContextMenu = useCallback((node: RepositoryNode, position: { x: number; y: number }) => {
    const adjustedX = Math.min(position.x, window.innerWidth - 220);
    const adjustedY = Math.min(position.y, window.innerHeight - 250);

    if (node.type === 'job') {
      setJobDesignContextMenu({ node, position: { x: adjustedX, y: adjustedY } });
    } else {
      setContextMenu({ node, position: { x: adjustedX, y: adjustedY } });
    }
  }, []);

  const handleDeleteItem = useCallback((node: RepositoryNode) => {
    handleDeleteNode(node);
  }, []);

  const handleDeleteNode = useCallback((node: RepositoryNode) => {
  // Job deletion (canvas) – unchanged
  if (node.type === 'job') {
    const designId = node.metadata?.canvasDesignId;
    if (designId) {
      const design = CanvasDesignManager.getDesign(designId);
      handleDeleteCanvasDesign(designId, design?.name || node.name);
    }
    setRepositoryData(prev => {
      const removeNode = (nodes: RepositoryNode[]): RepositoryNode[] => {
        return nodes.filter(n => n.id !== node.id).map(n => ({
          ...n,
          children: n.children ? removeNode(n.children) : undefined
        }));
      };
      return removeNode(prev);
    });
    return;
  }

  // Check if this node represents a PostgreSQL foreign table
  const isForeignTable = node.metadata?.postgresTableName && node.metadata?.connection?.connectionId;
  if (isForeignTable) {
    setNodeToDelete(node);
    setIsDeletingForeignTable(true);
    setDeleteDialogOpen(true);
    return;
  }

    Handlers.handleDeleteNodeRequest(
    node,
    currentJob,
    State.isNodeDeletable,
    setNodeToDelete,
    setDeleteDialogOpen
  );
}, [currentJob, handleDeleteCanvasDesign, setRepositoryData]);

 const confirmDeleteNode = useCallback(async () => {
  if (!nodeToDelete || isDeleting) return;

  // Foreign table deletion path
  if (isDeletingForeignTable) {
    setIsDeleting(true);

    const connectionId = nodeToDelete.metadata?.connection?.connectionId;
    const tableName = nodeToDelete.metadata?.postgresTableName;
    const schema = nodeToDelete.metadata?.schema || 'public';

    if (!connectionId || !tableName) {
      toast.error('Cannot delete: missing connection or table name.');
      setIsDeletingForeignTable(false);
      setDeleteDialogOpen(false);
      setNodeToDelete(null);
      setIsDeleting(false);
      return;
    }

    // Guard against missing apiService
    if (!apiService) {
      toast.error('Database API service is not available.');
      setIsDeletingForeignTable(false);
      setDeleteDialogOpen(false);
      setNodeToDelete(null);
      setIsDeleting(false);
      return;
    }

    try {
      const sql = `DROP FOREIGN TABLE IF EXISTS ${schema}.${tableName} CASCADE;`;
      const result = await apiService.executeQuery(connectionId, sql);

      if (!result.success) {
        throw new Error(result.error || 'Failed to drop foreign table');
      }

      // Success: remove from UI using the existing handler
      await Handlers.confirmDeleteNode(
        nodeToDelete,
        repositoryData,
        selectedNode,
        setRepositoryData,
        setExpandedNodes,
        setSelectedNode,
        setDeletionHistory,
        setDeleteDialogOpen,
        setNodeToDelete,
        async () => {}, // onSuccess (already handled)
        () => {}        // onError
      );

      toast.success(`Foreign table "${tableName}" dropped successfully.`);
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
      console.error('Foreign table deletion error:', error);
      setDeleteDialogOpen(false);
      setNodeToDelete(null);
    } finally {
      setIsDeletingForeignTable(false);
      setIsDeleting(false);
    }
  } else {
    // Regular deletion (non-foreign table)
    await Handlers.confirmDeleteNode(
      nodeToDelete,
      repositoryData,
      selectedNode,
      setRepositoryData,
      setExpandedNodes,
      setSelectedNode,
      setDeletionHistory,
      setDeleteDialogOpen,
      setNodeToDelete,
      async () => {},
      () => {}
    );
  }
}, [
  nodeToDelete,
  isDeletingForeignTable,
  repositoryData,
  selectedNode,
  setRepositoryData,
  setExpandedNodes,
  setSelectedNode,
  setDeletionHistory,
  setDeleteDialogOpen,
  setNodeToDelete,
  apiService,
  isDeleting
]);
  // ==================== DRAG HANDLER ====================
  const handleDragStart = useCallback((node: RepositoryNode, event: React.DragEvent) => {
    let componentKey = 'delimited-file'; // Default fallback

    if (node.metadata?.type) {
      const metadataType = node.metadata.type.toLowerCase();
      const metadataTypeMap: Record<string, string> = {
        'excel': 'excel-file',
        'xml': 'xml-file',
        'delimited': 'delimited-file',
        'positional': 'positional-file',
        'schema': 'file-schema-input',
        'json': 'json-avro-parquet',
        'avro': 'json-avro-parquet',
        'parquet': 'json-avro-parquet',
        'regex': 'regex-input',
        'ldif': 'ldap-input',
        'database': 'database-input',
        'web-service': 'web-service-input',
        'ldap': 'ldap-input',
        'directory': 'directory-input'
      };
      componentKey = metadataTypeMap[metadataType] || 'delimited-file';
    } else if (node.name || node.metadata?.name || node.metadata?.fileName) {
      const fileName = (node.name || node.metadata?.name || node.metadata?.fileName || '').toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || node.metadata?.fileType === 'excel') {
        componentKey = 'excel-file';
      } else if (fileName.endsWith('.xml') || node.metadata?.fileType === 'xml') {
        componentKey = 'xml-file';
      } else if (fileName.endsWith('.json') || fileName.endsWith('.avro') || fileName.endsWith('.parquet')) {
        componentKey = 'json-avro-parquet';
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || node.metadata?.delimiter) {
        componentKey = 'delimited-file';
      } else if (node.metadata?.fixedWidth || node.metadata?.positional) {
        componentKey = 'positional-file';
      } else if (node.metadata?.schema || fileName.endsWith('.schema')) {
        componentKey = 'file-schema-input';
      } else if (node.metadata?.connection || node.metadata?.databaseType) {
        componentKey = 'database-input';
      }
    }

    const legacyComponentMap: Record<string, string> = {
      'excel': 'excel-file',
      'xml': 'xml-file',
      'delimited': 'delimited-file',
      'positional': 'positional-file',
      'json-avro-parquet': 'json-avro-parquet',
      'database': 'database-input',
      'web-service': 'web-service-input',
      'regex': 'regex-input',
      'ldif': 'ldap-input',
      'schema': 'file-schema-input',
      'folder': 'directory-input',
    };

    if (componentKey === 'delimited-file' && node.type in legacyComponentMap) {
      componentKey = legacyComponentMap[node.type];
    }

    const componentDef = COMPONENT_REGISTRY[componentKey] || COMPONENT_REGISTRY['delimited-file'];

    const dragMetadata: Record<string, any> = {
      description: componentDef.description,
      category: componentDef.category,
      createdAt: new Date().toISOString(),
      version: '1.0',
      isRepositoryNode: true,
      componentCategory: componentDef.category,
      originalNodeName: node.name,
      originalNodeType: node.type,
      talendDefinition: componentDef,
      defaultWidth: componentDef.defaultDimensions.width,
      defaultHeight: componentDef.defaultDimensions.height,
      defaultRole: componentDef.defaultRole,
      repositoryNodeId: node.id,
      repositoryNodeType: node.type,
      hasExistingMetadata: !!node.metadata,
      detectedComponentType: componentKey,
      ...(node.metadata && {
        repositoryMetadata: node.metadata,
        fileType: node.metadata.type || node.metadata.fileType,
        fileName: node.metadata.name || node.metadata.fileName,
        schema: node.metadata.schema || node.metadata.columns || node.metadata.fields,
        ...(node.metadata.type === 'excel' && {
          excelMetadata: {
            sheet: node.metadata.sheet,
            hasHeaders: node.metadata.hasHeaders,
            range: node.metadata.range
          }
        }),
        ...(node.metadata.type === 'xml' && {
          xmlMetadata: {
            rootElement: node.metadata.rootElement,
            xpath: node.metadata.xpath,
            namespace: node.metadata.namespace
          }
        }),
        ...(node.metadata.type === 'delimited' && {
          delimitedMetadata: {
            delimiter: node.metadata.delimiter,
            quoteChar: node.metadata.quoteChar,
            escapeChar: node.metadata.escapeChar
          }
        })
      })
    };

    const dragData: ReactFlowDragData = {
      type: 'reactflow-component',
      componentId: componentKey,
      source: 'sidebar',
      metadata: dragMetadata
    };

    event.dataTransfer.clearData();
    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';

    const dragImage = document.createElement('div');
    const categoryColor = getCategoryColor(componentDef.category);

    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}08 100%);
      border: 2px solid ${categoryColor}40;
      color: #374151;
      padding: 8px 12px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    `;

    dragImage.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}CC 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      ">${componentDef.displayName.charAt(0)}</div>
      <span style="white-space: nowrap;">${componentDef.displayName}</span>
    `;

    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 60, 15);
    setTimeout(() => document.body.removeChild(dragImage), 0);

    const nodeElement = event.currentTarget as HTMLElement;
    if (nodeElement) {
      nodeElement.classList.add('dragging');
      setTimeout(() => {
        nodeElement.classList.remove('dragging');
      }, 100);
    }

    console.log('📤 Enhanced drag started:', {
      nodeName: node.name,
      nodeType: node.type,
      nodeMetadata: node.metadata,
      detectedComponentKey: componentKey,
      componentDisplayName: componentDef.displayName,
      dragData
    });
  }, []);

  // ==================== REACT FLOW INTEGRATION ====================
  const createNodeDirectly = useCallback((node: RepositoryNode, position: { x: number, y: number }) => {
    const nodeData = Utils.createReactFlowNodeData(node, position);
    if (onNodeCreate) {
      onNodeCreate(nodeData, position);
    } else {
      const event = new CustomEvent('sidebar-node-create', {
        detail: { nodeData, position }
      });
      window.dispatchEvent(event);
    }
  }, [onNodeCreate]);

  const findNodeByIdWrapper = useCallback((nodes: RepositoryNode[], nodeId: string): RepositoryNode | null => {
    const found = findNodeAndParent(nodes, nodeId);
    return found ? found.node : null;
  }, []);

  // ==================== WIZARD OPEN HANDLERS ====================
  const handleOpenExcelWizard = useCallback(() => {
    console.log('🔵 Opening Excel wizard');
    setExcelWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenXMLWizard = useCallback(() => {
    console.log('🔵 Opening XML wizard');
    setXmlWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenDelimitedWizard = useCallback(() => {
    console.log('🔵 Opening Delimited wizard');
    setDelimitedWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenPositionalWizard = useCallback(() => {
    console.log('🔵 Opening Positional wizard');
    setPositionalWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenFileSchemaWizard = useCallback(() => {
    console.log('🔵 Opening File Schema wizard');
    setFileSchemaWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenJsonAvroParquetWizard = useCallback(() => {
    console.log('🔵 Opening JSON/Avro/Parquet wizard');
    setJsonAvroParquetWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenRegexWizard = useCallback(() => {
    console.log('🔵 Opening Regex wizard');
    setRegexWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenLDIFWizard = useCallback(() => {
    console.log('🔵 Opening LDIF wizard');
    setLdifWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenWebServiceWizard = useCallback(() => {
    console.log('🔵 Opening Web Service wizard');
    setWebServiceWizardOpen(true);
    setContextMenu(null);
  }, []);

  const handleOpenDatabaseWizard = useCallback(() => {
    console.log('🔵 Opening Database wizard');
    setDatabaseWizardOpen(true);
    setContextMenu(null);
  }, []);

  // ==================== CREATE CANVAS FROM JOB ====================
  const handleCreateCanvasFromJob = useCallback(async (jobNode: RepositoryNode) => {
    const jobName = jobNode.name;

    try {
      // 1. Check for existing canvas with the same name (optional, but good UX)
      const existing = await canvasPersistence.getCanvasByName(jobName);
      if (existing) {
        toast.error(`A canvas named "${jobName}" already exists.`);
        return;
      }

      // 2. Initial empty canvas data
      const initialData = {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      // 3. Save via canvasPersistence – passing ownerId = null (no auth yet)
      const newCanvas = await canvasPersistence.saveCanvas(
        jobName,                     // canvas name (matches job name)
        initialData,                 // empty React Flow state
        {
          description: `Created from job: ${jobName}`,
          tags: ['job-design', 'auto-created'],
          otherUiState: { jobId: jobNode.id }
        },
        null                         // ownerId – will be replaced with actual user ID when auth is added
      );

      if (!newCanvas) {
        throw new Error('Failed to save canvas – no record returned.');
      }

      // 4. Create a child node under the job to represent the canvas
      const canvasNode: RepositoryNode = {
        id: `canvas-${newCanvas.id}`,
        name: jobName,
        type: 'canvas',
        metadata: {
          canvasId: newCanvas.id,    // store the database ID for later loading
          createdAt: new Date().toISOString()
        },
        draggable: false,
        droppable: false,
        parentId: jobNode.id
      };

      // 5. Update repository tree (PREPEND canvas node so newest appears at top)
      setRepositoryData(prev => {
        const updateNode = (nodes: RepositoryNode[]): RepositoryNode[] => {
          return nodes.map(node => {
            if (node.id === jobNode.id) {
              return {
                ...node,
                children: [canvasNode, ...(node.children || [])], // prepend
                metadata: {
                  ...node.metadata,
                  count: (node.metadata?.count || 0) + 1
                }
              };
            }
            if (node.children) {
              return { ...node, children: updateNode(node.children) };
            }
            return node;
          });
        };
        return updateNode(prev);
      });

      // Ensure the job folder is expanded so the user sees the new canvas node
      setExpandedNodes(prev => new Set([...prev, jobNode.id]));

      toast.success(`Canvas "${jobName}" created.`);

       //OPTIONAL: Automatically load the new canvas
       if (onCanvasSelect) {
         onCanvasSelect(newCanvas.id);
       }
    } catch (error: any) {
      console.error('Failed to create canvas:', error);
      toast.error(`Failed to create canvas: ${error.message || 'Unknown error'}`);
    }
  }, [setRepositoryData, setExpandedNodes, onCanvasSelect]);

  // ==================== WIZARD SAVE HANDLERS (WITH FOREIGN TABLE CREATION) ====================
  const handleSaveExcelMetadata = useCallback(async (metadata: ExcelMetadataFormData) => {
  if (!apiService) {
    toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
    return;
  }

  try {
    // 1. Ensure PostgreSQL connection is active
    console.log('🔍 [Excel] Checking PostgreSQL connection...');
    if (!isConnected) {
      const connected = await testConnection();
      if (!connected) {
        toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
        return;
      }
    }

    const connectionId = await getActivePostgresConnectionId(apiService);
    if (!connectionId) {
      toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
      return;
    }
    console.log('✅ [Excel] Using connection ID:', connectionId);

    // 2. Validate that we have a file and a selected sheet
    if (!metadata.file) {
      toast.error('❌ No Excel file provided.', { autoClose: 5000 });
      return;
    }
    if (!metadata.selectedSheet) {
      toast.error('❌ No sheet selected.', { autoClose: 5000 });
      return;
    }
    console.log('📄 [Excel] File:', metadata.file.name, 'Size:', metadata.file.size, 'Sheet:', metadata.selectedSheet);

    // 3. Read the Excel file as ArrayBuffer
    console.log('📖 [Excel] Reading Excel file...');
    const fileReader = new FileReader();
    const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsArrayBuffer(metadata.file);
    });
    console.log('✅ [Excel] File read complete, size:', fileBuffer.byteLength, 'bytes');

    // 4. Parse the workbook and extract the chosen sheet
    console.log('📊 [Excel] Parsing workbook...');
    const workbook = XLSX.read(new Uint8Array(fileBuffer), { type: 'array' });
    const worksheet = workbook.Sheets[metadata.selectedSheet];
    if (!worksheet) {
      toast.error(`❌ Sheet "${metadata.selectedSheet}" not found in workbook.`, { autoClose: 5000 });
      return;
    }
    console.log('✅ [Excel] Sheet found');

    // 5. Convert the sheet to CSV
    console.log('🔄 [Excel] Converting sheet to CSV...');
    const csvString = XLSX.utils.sheet_to_csv(worksheet, { FS: ',' });
    console.log('✅ [Excel] CSV conversion complete, length:', csvString.length, 'characters');

    // 6. Upload CSV to backend
    const formData = new FormData();
    const safeName = metadata.name.replace(/[^a-z0-9]/gi, '_');
    const csvFileName = `${safeName}_${Date.now()}.csv`;
    const csvBlob = new Blob([csvString], { type: 'text/csv' });
    formData.append('file', csvBlob, csvFileName);

    console.log('📤 [Excel] Uploading CSV to /api/upload-csv...');
    const uploadResponse = await fetch('http://localhost:3000/api/upload-csv',  {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [Excel] Upload failed with status:', uploadResponse.status);
      console.error('❌ [Excel] Response body:', errorText);
      throw new Error(`CSV upload failed (${uploadResponse.status}): ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    const csvPath = uploadResult.filePath;
    console.log('✅ [Excel] CSV uploaded successfully, path:', csvPath);

    // 7. Prepare column definitions (from wizard's inferred schema)
    const columns = metadata.schema.map(col => ({
      name: col.name,
      type: col.type,          // app type like 'String', 'Integer', etc.
      length: col.length,
      nullable: true,          // default; can be refined later
    }));
    console.log('📋 [Excel] Column definitions:', columns);

    // 8. Options for the delimited FDW – include the custom tag
    const options = {
      delimiter: ',',
      header: metadata.hasHeaders ? 'true' : 'false',
      format: 'csv',
      original_file_type: 'excel',   // <-- tag for reverse‑engineering
    };

    // 9. Create the foreign table using the existing 'fdw_delimited' server
    console.log('🛠️ [Excel] Creating foreign table with name:', metadata.name);
    const result = await apiService.createForeignTable(
      connectionId,
      metadata.name,            // table name
      columns,
      'delimited',              // fileType – triggers fdw_delimited server
      csvPath,
      options
    );

    if (!result.success) {
      throw new Error(result.error || 'Foreign table creation failed');
    }

    console.log('✅ [Excel] Foreign table created successfully, result:', result);

    // 10. Store the resulting PostgreSQL table name in metadata
    metadata.postgresTableName = result.tableName || metadata.name;

    // 11. Dispatch event to add node to the repository (still under "Excel Files")
    window.dispatchEvent(new CustomEvent('metadata-created', {
      detail: {
        metadata,
        type: 'excel',
        folderId: 'file-excel'
      }
    }));

    toast.success(`✅ Excel foreign table "${metadata.name}" created successfully!`, { autoClose: 5000 });

  } catch (error: any) {
    console.error('❌ [Excel] Failed to create Excel foreign table:', error);
    toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
  }
}, [apiService, isConnected, testConnection]);

  const handleSaveXMLMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'xml');
      const columns = extractColumnsFromMetadata(metadata, 'xml');
      const filePath = extractFilePath(metadata, 'xml');
      const options = extractOptions(metadata, 'xml');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in XML metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'xml',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'xml',
          folderId: 'file-xml'
        }
      }));

      toast.success(`✅ XML foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create XML foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveDelimitedMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'delimited');
      const columns = extractColumnsFromMetadata(metadata, 'delimited');
      const filePath = extractFilePath(metadata, 'delimited');
      const options = extractOptions(metadata, 'delimited');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in delimited file metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'delimited',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'delimited',
          folderId: 'file-delimited'
        }
      }));

      toast.success(`✅ Delimited file foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create delimited foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSavePositionalMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'positional');
      const columns = extractColumnsFromMetadata(metadata, 'positional');
      const filePath = extractFilePath(metadata, 'positional');
      const options = extractOptions(metadata, 'positional');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in positional file metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'positional',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'positional',
          folderId: 'file-positional'
        }
      }));

      toast.success(`✅ Positional file foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create positional foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveFileSchemaMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'schema');
      const columns = extractColumnsFromMetadata(metadata, 'schema');
      const filePath = extractFilePath(metadata, 'schema');
      const options = extractOptions(metadata, 'schema');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in file schema metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'schema',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'schema',
          folderId: 'file-schema'
        }
      }));

      toast.success(`✅ File schema foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create file schema foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveJsonAvroParquetMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'json-avro-parquet');
      const columns = extractColumnsFromMetadata(metadata, 'json-avro-parquet');
      const filePath = extractFilePath(metadata, 'json-avro-parquet');
      const options = extractOptions(metadata, 'json-avro-parquet');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in JSON/Avro/Parquet metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'json-avro-parquet',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'json-avro-parquet',
          folderId: 'file-json-avro-parquet'
        }
      }));

      toast.success(`✅ JSON/Avro/Parquet foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create JSON/Avro/Parquet foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveRegexMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'regex');
      const columns = extractColumnsFromMetadata(metadata, 'regex');
      const filePath = extractFilePath(metadata, 'regex');
      const options = extractOptions(metadata, 'regex');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in regex metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'regex',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'regex',
          folderId: 'file-regex'
        }
      }));

      toast.success(`✅ Regex foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create regex foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveLDIFMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'ldif');
      const columns = extractColumnsFromMetadata(metadata, 'ldif');
      const filePath = extractFilePath(metadata, 'ldif');
      const options = extractOptions(metadata, 'ldif');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in LDIF metadata.', { autoClose: 5000 });
        return;
      }

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'ldif',
        filePath,
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'ldif',
          folderId: 'file-ldif'
        }
      }));

      toast.success(`✅ LDIF foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create LDIF foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveDatabaseMetadata = useCallback(async (metadata: any) => {
    if (!apiService) {
      toast.error('❌ Database API service is not initialized.', { autoClose: 5000 });
      return;
    }

    try {
      if (!isConnected) {
        const connected = await testConnection();
        if (!connected) {
          toast.error('❌ No active PostgreSQL connection. Please connect first.', { autoClose: 5000 });
          return;
        }
      }

      const connectionId = await getActivePostgresConnectionId(apiService);
      if (!connectionId) {
        toast.error('❌ No active PostgreSQL connection found.', { autoClose: 5000 });
        return;
      }

      const tableName = generateForeignTableName(metadata, 'database');
      const columns = extractColumnsFromMetadata(metadata, 'database');

      if (columns.length === 0) {
        toast.error('❌ No columns defined in database metadata.', { autoClose: 5000 });
        return;
      }

      const options: Record<string, string> = {
        host: metadata.host || 'localhost',
        port: String(metadata.port || '5432'),
        dbname: metadata.database || metadata.dbname || 'postgres',
        table_name: metadata.remoteTable || metadata.table || 'unknown',
        user: metadata.user || '',
        password: metadata.password || '',
        ...(metadata.schema ? { schema_name: metadata.schema } : {})
      };

      const result = await apiService.createForeignTable(
        connectionId,
        tableName,
        columns,
        'postgresql',
        '',
        options
      );

      if (!result.success) {
        throw new Error(result.error || 'Foreign table creation failed');
      }

      metadata.postgresTableName = result.tableName || tableName;

      window.dispatchEvent(new CustomEvent('metadata-created', {
        detail: {
          metadata,
          type: 'database',
          folderId: 'database'
        }
      }));

      toast.success(`✅ Remote database foreign table "${tableName}" created successfully!`, { autoClose: 5000 });
    } catch (error: any) {
      console.error('❌ Failed to create database foreign table:', error);
      toast.error(`❌ ${error.message || 'Could not create foreign table'}`, { autoClose: 5000 });
    }
  }, [apiService, isConnected, testConnection]);

  const handleSaveWebServiceMetadata = useCallback(async (metadata: any) => {
    window.dispatchEvent(new CustomEvent('metadata-created', {
      detail: {
        metadata,
        type: 'web-service',
        folderId: 'web-service'
      }
    }));
    toast.success(`✅ Web service "${metadata.name}" saved`, { autoClose: 3000 });
  }, []);

  // ============================================================================
  // ✅ FIXED: INITIAL SYNC FROM POSTGRESQL – now works with nested categories
  // ============================================================================
  useEffect(() => {
    if (!apiService || !isConnected || isSyncing) {
      return;
    }

    const syncExistingForeignTables = async () => {
      setIsSyncing(true);
      console.log('🔄 Starting foreign table synchronization (nested categories)...');

      try {
        const connectionId = await getActivePostgresConnectionId(apiService);
        if (!connectionId) {
          console.warn('⚠️ No active PostgreSQL connection, skipping foreign table sync');
          return;
        }

        const schema = 'public';
        console.log(`🔍 Syncing foreign tables from schema "${schema}" using connection ${connectionId}...`);

        const tables = await getForeignTablesInSchema(apiService, connectionId, schema);
        if (!tables || tables.length === 0) {
          console.log('📭 No existing foreign tables found, sync complete');
          return;
        }

        console.log(`📋 Found ${tables.length} foreign tables, fetching metadata...`);

        const metadataPromises = tables.map(async (table) => {
          try {
            const meta = await reverseForeignTableMetadata(
              apiService,
              connectionId,
              schema,
              table.tablename
            );
            return { ...meta, oid: table.oid };
          } catch (err) {
            console.error(`❌ Failed to reverse metadata for ${table.tablename}:`, err);
            return null;
          }
        });

        const metadataList = await Promise.all(metadataPromises);
        const validMetadata = metadataList
          .filter((m): m is NonNullable<typeof m> & { oid: number } => m !== null)
          .sort((a, b) => a.oid - b.oid);

        if (validMetadata.length === 0) {
          console.log('📭 No valid metadata could be retrieved');
          return;
        }

        // ========== COLLECT ALL CHANGES LOCALLY ==========
        const updates: Array<{ folderId: string; newNode: RepositoryNode }> = [];
        const foldersToExpand = new Set<string>();

        validMetadata.forEach((meta) => {
          const folderId = determineFolderId(meta.fileType);
          if (!folderId) {
            console.warn(`Unknown file type "${meta.fileType}" for table ${meta.tableName}, skipping`);
            return;
          }

          foldersToExpand.add(folderId);
          const newNode = createNodeFromMetadata(meta, folderId, connectionId);
          updates.push({ folderId, newNode });

          console.log(`✅ Prepared foreign table node:`, {
            tableName: meta.tableName,
            folderId,
            nodeId: newNode.id,
            columnsCount: newNode.metadata?.columns?.length || 0
          });
        });

        // ========== SINGLE ATOMIC UPDATE TO REPOSITORY DATA ==========
        setRepositoryData((prev) => {
          let newTree = prev;

          updates.forEach(({ folderId, newNode }) => {
            // Find the folder node (nested anywhere)
            const found = findNodeAndParent(newTree, folderId);
            if (!found) {
              console.warn(`⚠️ Category "${folderId}" not found, skipping`);
              return;
            }

            newTree = updateNodeInTree(newTree, folderId, (folder) => {
              const existingNames = new Set(folder.children.map((c) => c.name));
              if (existingNames.has(newNode.name)) {
                return folder; // duplicate, skip
              }
              return {
                ...folder,
                children: [...folder.children, newNode].sort((a, b) =>
                  a.name.localeCompare(b.name)
                ),
                metadata: {
                  ...folder.metadata,
                  count: (folder.metadata?.count || 0) + 1
                }
              };
            });
          });

          return newTree;
        });

        // ========== SINGLE UPDATE TO EXPANDED NODES ==========
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          foldersToExpand.forEach((id) => next.add(id));
          console.log('🔽 Expanded nodes AFTER sync:', Array.from(next));
          return next;
        });

        console.log('✅ Foreign table synchronization complete (atomic, nested)');
      } catch (error) {
        console.error('❌ Failed to synchronize foreign tables:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncExistingForeignTables();
  }, [apiService, isConnected, setRepositoryData]);

  // ==================== METADATA EXPANSION ON NEW NODES ====================
  useEffect(() => {
    if (metadataSettings.autoExpandNew) {
      const newNodesWithMetadata = repositoryData
        .flatMap(node => node.children || [])
        .filter(child => child.metadata && !expandedMetadataNodes.has(child.id));

      if (newNodesWithMetadata.length > 0) {
        setExpandedMetadataNodes(prev => {
          const newSet = new Set(prev);
          newNodesWithMetadata.forEach(node => newSet.add(node.id));
          return newSet;
        });
      }
    }
  }, [repositoryData, metadataSettings.autoExpandNew, expandedMetadataNodes]);

  useEffect(() => {
    if (activeCanvasDesignId !== undefined) {
      setActiveDesignId(activeCanvasDesignId);
    }
  }, [activeCanvasDesignId]);

  useEffect(() => {
    console.log('📊 repositoryData changed. Excel children count:',
      repositoryData.find(n => n.id === 'metadata')?.children?.find(c => c.id === 'file-excel')?.children?.length ?? 0,
      '\nFull repositoryData:', repositoryData
    );
  }, [repositoryData]);

  // 🔥 Force expand metadata and any category that has children
  useEffect(() => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      const addChildrenWithContent = (nodes: RepositoryNode[]) => {
        nodes.forEach(node => {
          if (node.children?.length) {
            next.add(node.id);
            addChildrenWithContent(node.children);
          }
        });
      };
      addChildrenWithContent(repositoryData);
      return next;
    });
  }, [repositoryData]);

  // ==================== GLOBAL CONTEXT MENU FALLBACK ====================
  useEffect(() => {
    const container = document.getElementById('app-sidebar');
    if (!container) return;

    const handleContainerContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const nodeElement = target.closest('[data-node-id]');
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id');
        if (!nodeId) return;

        const found = findNodeAndParent(repositoryData, nodeId);
        if (found?.node) {
          e.preventDefault();
          e.stopPropagation();
          handleContextMenu(found.node, { x: e.clientX, y: e.clientY });
        }
      }
    };

    container.addEventListener('contextmenu', handleContainerContextMenu);
    return () => container.removeEventListener('contextmenu', handleContainerContextMenu);
  }, [repositoryData, handleContextMenu]);

  // ==================== 🛡️ DIRECT CONTEXT MENU CLICK HANDLER ====================
  // Guarantees that clicking a menu item opens the wizard, regardless of ContextMenu's internal implementation.
  useEffect(() => {
    if (!contextMenuRef.current) return;

    const menuContainer = contextMenuRef.current;
    const handleMenuItemClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Try to find the button that was clicked
      const button = target.closest('button');
      if (!button) return;

      const buttonText = button.textContent?.trim().toLowerCase() || '';
      console.log('📌 Context menu button clicked:', buttonText);

      // Map button text to wizard open handler
      if (buttonText.includes('excel')) {
        handleOpenExcelWizard();
      } else if (buttonText.includes('xml')) {
        handleOpenXMLWizard();
      } else if (buttonText.includes('delimited') || buttonText.includes('csv')) {
        handleOpenDelimitedWizard();
      } else if (buttonText.includes('positional')) {
        handleOpenPositionalWizard();
      } else if (buttonText.includes('schema')) {
        handleOpenFileSchemaWizard();
      } else if (buttonText.includes('json') || buttonText.includes('avro') || buttonText.includes('parquet')) {
        handleOpenJsonAvroParquetWizard();
      } else if (buttonText.includes('regex')) {
        handleOpenRegexWizard();
      } else if (buttonText.includes('ldif')) {
        handleOpenLDIFWizard();
      } else if (buttonText.includes('web service')) {
        handleOpenWebServiceWizard();
      } else if (buttonText.includes('database')) {
        handleOpenDatabaseWizard();
      }
    };

    menuContainer.addEventListener('click', handleMenuItemClick);
    return () => menuContainer.removeEventListener('click', handleMenuItemClick);
  }, [
    contextMenu,
    handleOpenExcelWizard,
    handleOpenXMLWizard,
    handleOpenDelimitedWizard,
    handleOpenPositionalWizard,
    handleOpenFileSchemaWizard,
    handleOpenJsonAvroParquetWizard,
    handleOpenRegexWizard,
    handleOpenLDIFWizard,
    handleOpenWebServiceWizard,
    handleOpenDatabaseWizard
  ]);

  // ==================== RENDER ====================
  return (
    <>
      <div
        className="flex-none h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden sidebar-container"
        style={{
          width: '280px',
          minWidth: '280px',
          maxWidth: '280px',
          flexShrink: 0,
          flexGrow: 0,
          position: 'relative',
          height: '100%'
        }}
        id="app-sidebar"
        aria-label="Application sidebar"
        data-testid="sidebar-container"
        data-sidebar-mode="default"
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Repository
          </h2>
          <div className="flex items-center space-x-1">
            <button
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh repository"
              aria-label="Refresh repository"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleCreateItem('folder')}
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center"
              title="Create new folder"
              aria-label="Create new folder"
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowMetadataSettings(!showMetadataSettings)}
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center"
              title="Metadata display settings"
              aria-label="Metadata display settings"
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tree View */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {repositoryData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Layers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No repository data available.</p>
              <button
                onClick={() => setRepositoryData(getDefaultRepositoryStructure())}
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label="Load default repository structure"
              >
                Load Default Structure
              </button>
            </div>
          ) : (
            <Layout.TreeView
              key={`tree-${repositoryData.map(c => c.children?.length ?? 0).join('-')}-${Array.from(expandedNodes).sort().join('-')}`}
              repositoryData={repositoryData}
              expandedNodes={expandedNodes}
              selectedNode={selectedNode}
              searchTerm={searchTerm}
              expandedMetadataNodes={expandedMetadataNodes}
              onToggle={handleToggle}
              onSelect={handleSelect}
              onDoubleClick={undefined}
              onContextMenu={handleContextMenu}
              onDelete={handleDeleteNode}
              onDragStart={handleDragStart}
              onToggleMetadata={handleToggleMetadata}
            />
          )}
        </div>

        {/* React Flow Integration Panel */}
        <Layout.ReactFlowIntegrationPanel
          reactFlowInstance={reactFlowInstance}
          onNodeCreate={onNodeCreate}
          onNodeUpdate={onNodeUpdate}
          selectedNode={selectedNode}
          findNodeById={findNodeByIdWrapper}
          repositoryData={repositoryData}
          createNodeDirectly={createNodeDirectly}
          isDebugOpen={false}
          setIsDebugOpen={() => {}}
        />

        {/* Metadata Expansion Status */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Repository: {repositoryData.reduce((acc, cat) => acc + (cat.children?.length || 0), 0)} items
              </span>
            </div>
            <button
              onClick={() => setShowMetadataSettings(true)}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="Open metadata settings"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Context Menus */}
        {contextMenu && (
          <div ref={contextMenuRef}>
            <ContextMenu
              node={contextMenu.node}
              position={contextMenu.position}
              onClose={() => setContextMenu(null)}
              onCreateItem={handleCreateItem}
              onDelete={handleDeleteItem}
              onOpenExcelWizard={handleOpenExcelWizard}
              onOpenXMLWizard={handleOpenXMLWizard}
              onOpenDelimitedWizard={handleOpenDelimitedWizard}
              onOpenPositionalWizard={handleOpenPositionalWizard}
              onOpenFileSchemaWizard={handleOpenFileSchemaWizard}
              onOpenJsonAvroParquetWizard={handleOpenJsonAvroParquetWizard}
              onOpenRegexWizard={handleOpenRegexWizard}
              onOpenLDIFWizard={handleOpenLDIFWizard}
              onCreateJobWizard={handleCreateJobWizard} 
              onOpenWebServiceWizard={handleOpenWebServiceWizard}
              onOpenDatabaseWizard={handleOpenDatabaseWizard}
            />
          </div>
        )}

        {/* Job Design Context Menu */}
        {jobDesignContextMenu && (
          <div
            ref={jobDesignContextMenuRef}
            className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]"
            style={{
              left: `${jobDesignContextMenu.position.x}px`,
              top: `${jobDesignContextMenu.position.y}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {jobDesignContextMenu.node.name}
              </p>
            </div>
            {/* 🔥 New "Create Canvas" button */}
            <button
              onClick={() => handleCreateCanvasFromJob(jobDesignContextMenu.node)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Create Canvas
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
              <button
                onClick={() => setJobDesignContextMenu(null)}
                className="w-full px-3 py-1 text-xs text-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
<Layout.DeleteConfirmationDialog
  isOpen={deleteDialogOpen}
  node={nodeToDelete}
  onClose={() => {
    setDeleteDialogOpen(false);
    setNodeToDelete(null);
    setIsDeletingForeignTable(false);
    setIsDeleting(false);
  }}
  onConfirm={confirmDeleteNode}
  calculateDeleteStats={Utils.calculateDeleteStats}
/>

      {/* Wizards */}
      <ExcelMetadataWizard
        isOpen={excelWizardOpen}
        onClose={() => setExcelWizardOpen(false)}
        onSave={handleSaveExcelMetadata}
      />

      <XMLMetadataWizard
        isOpen={xmlWizardOpen}
        onClose={() => setXmlWizardOpen(false)}
        onSave={handleSaveXMLMetadata}
      />

      <DelimitedFileMetadataWizard
        isOpen={delimitedWizardOpen}
        onClose={() => setDelimitedWizardOpen(false)}
        onSave={handleSaveDelimitedMetadata}
      />

      <PositionalFileMetadataWizard
        isOpen={positionalWizardOpen}
        onClose={() => setPositionalWizardOpen(false)}
        onSave={handleSavePositionalMetadata}
      />

      <FileSchemaMetadataWizard
        isOpen={fileSchemaWizardOpen}
        onClose={() => setFileSchemaWizardOpen(false)}
        onSave={handleSaveFileSchemaMetadata}
      />

      <JsonAvroParquetMetadataWizard
        isOpen={jsonAvroParquetWizardOpen}
        onClose={() => setJsonAvroParquetWizardOpen(false)}
        onSave={handleSaveJsonAvroParquetMetadata}
      />

      <RegexMetadataWizard
        isOpen={regexWizardOpen}
        onClose={() => setRegexWizardOpen(false)}
        onSave={handleSaveRegexMetadata}
      />

      <LDIFMetadataWizard
        isOpen={ldifWizardOpen}
        onClose={() => setLdifWizardOpen(false)}
        onSave={handleSaveLDIFMetadata}
      />

      <WebServiceMetadataWizard
        isOpen={webServiceWizardOpen}
        onClose={() => setWebServiceWizardOpen(false)}
        onSave={handleSaveWebServiceMetadata}
      />

      <DatabaseMetadataWizard
        isOpen={databaseWizardOpen}
        onClose={() => setDatabaseWizardOpen(false)}
        onSave={handleSaveDatabaseMetadata}
      />

      <Layout.ToastContainerWrapper />
    </>
  );
};

// ============================================================================
// Helper functions used in wizard save handlers
// ============================================================================
function generateForeignTableName(metadata: any, type: string): string {
  const base = metadata.name || metadata.fileName || `etl_${type}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 63);
}

function extractColumnsFromMetadata(metadata: any, _type: string): ColumnDefinition[] {
  const columnsArray = metadata.columns || metadata.schema || metadata.fields || [];
  if (!Array.isArray(columnsArray) || columnsArray.length === 0) {
    return [];
  }
  return columnsArray.map((col: any) => ({
    name: col.name || col.columnName || 'column',
    type: col.type || col.dataType || 'TEXT',
    length: col.length || col.maxLength,
    precision: col.precision,
    scale: col.scale,
    nullable: col.nullable !== false,
    defaultValue: col.defaultValue,
  }));
}

function extractFilePath(metadata: any, _type: string): string {
  return metadata.filePath || metadata.fileName || metadata.path || '';
}

function extractOptions(metadata: any, _type: string): Record<string, string> {
  const options: Record<string, string> = {};
  if (metadata.delimiter) options.delimiter = metadata.delimiter;
  if (metadata.header !== undefined) options.header = metadata.header ? 'true' : 'false';
  if (metadata.encoding) options.encoding = metadata.encoding;
  if (metadata.sheet) options.sheet = metadata.sheet;
  if (metadata.recordLength) options.recordLength = String(metadata.recordLength);
  if (metadata.pattern) options.pattern = metadata.pattern;
  if (metadata.format) options.format = metadata.format;
  if (metadata.textQualifier) options.textQualifier = metadata.textQualifier;
  if (metadata.escape) options.escape = metadata.escape;
  if (metadata.compression) options.compression = metadata.compression;
  if (metadata.flags) options.flags = metadata.flags;
  if (metadata.schemaType) options.schemaType = metadata.schemaType;
  return options;
}

export default RepositorySidebar;