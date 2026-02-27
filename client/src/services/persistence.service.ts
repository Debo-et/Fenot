// src/services/persistence.service.ts - CORRECTED WITH SINGLETON EXPORT

import { RepositoryNode } from '../Wizard/TreeNode';
import { DatabaseConfig } from './database-api.service';
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

// ==================== PERSISTENCE TYPES ====================
export interface PersistedState {
  repositoryData: RepositoryNode[];
  expandedNodes: string[];
  expandedMetadataNodes: string[];
  selectedNode: string | null;
  metadataSettings: {
    showAll: boolean;
    autoExpandNew: boolean;
    compactMode: boolean;
    showIcons: boolean;
    maxItemsVisible: number;
    sortOrder: 'asc';
  };
  deletionHistory: Array<{
    node: RepositoryNode;
    deletedAt: string;
    timestamp: string;
  }>;
  connectionConfig: DatabaseConfig;
  currentConnectionId: string | null;
  isPostgresConnected: boolean;
  activeDesignId: string | null;
  lastUpdated: string;
  version: string;
}

export interface PersistenceConfig {
  storageType: 'localStorage' | 'sessionStorage' | 'indexedDB';
  appName: string;
  version: string;
  autoSave: boolean;
  maxSizeMB: number;
  backupCount: number;
}

export interface StorageStats {
  totalItems: number;
  totalSize: number;
  lastBackup: string | null;
  storageType: string;
  quotaUsage: number;
}

// ==================== LOCALSTORAGE ADAPTER ====================
class LocalStorageAdapter {
  private static readonly APP_PREFIX = 'talend-designer-';
  private static readonly BACKUP_PREFIX = 'backup-';
  
  static save(key: string, data: any): boolean {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(`${this.APP_PREFIX}${key}`, serialized);
      return true;
    } catch (error) {
      console.error('LocalStorage save error:', error);
      return false;
    }
  }
  
  static load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.APP_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return null;
    }
  }
  
  static remove(key: string): void {
    localStorage.removeItem(`${this.APP_PREFIX}${key}`);
  }
  
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.APP_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  static createBackup(state: PersistedState, backupName: string): boolean {
    const backupKey = `${this.BACKUP_PREFIX}${backupName}-${Date.now()}`;
    return this.save(backupKey, {
      ...state,
      backupCreatedAt: new Date().toISOString()
    });
  }
  
  static getBackups(): Array<{name: string, date: string, size: number}> {
    const backups: Array<{name: string, date: string, size: number}> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.APP_PREFIX}${this.BACKUP_PREFIX}`)) {
        const item = localStorage.getItem(key);
        if (item) {
          const backupName = key.replace(`${this.APP_PREFIX}${this.BACKUP_PREFIX}`, '');
          backups.push({
            name: backupName,
            date: new Date(JSON.parse(item).backupCreatedAt).toISOString(),
            size: item.length
          });
        }
      }
    }
    return backups;
  }
  
  static getStats(): StorageStats {
    let totalSize = 0;
    let itemCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.APP_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += key.length + item.length;
          itemCount++;
        }
      }
    }
    
    return {
      totalItems: itemCount,
      totalSize: totalSize,
      lastBackup: this.getBackups().sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]?.date || null,
      storageType: 'localStorage',
      quotaUsage: totalSize / (5 * 1024 * 1024) * 100 // 5MB is typical localStorage quota
    };
  }
}

// ==================== INDEXEDDB ADAPTER ====================
class IndexedDBAdapter {
  private static readonly DB_NAME = 'talend-designer-db';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'app-state';
  
  private static async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('by-timestamp', 'timestamp', { unique: false });
          store.createIndex('by-type', 'type', { unique: false });
        }
      };
    });
  }
  
  static async save(key: string, data: any): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const record = {
          key,
          data,
          timestamp: new Date().toISOString(),
          type: 'state'
        };
        
        const request = store.put(record);
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error('IndexedDB save error:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('IndexedDB connection error:', error);
      return false;
    }
  }
  
  static async load<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => {
          console.error('IndexedDB load error:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('IndexedDB connection error:', error);
      return null;
    }
  }
  
  static async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB remove error:', error);
    }
  }
  
  static async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  }
  
  static async createBackup(state: PersistedState, backupName: string): Promise<boolean> {
    const backupKey = `backup-${backupName}-${Date.now()}`;
    return this.save(backupKey, {
      ...state,
      backupCreatedAt: new Date().toISOString(),
      type: 'backup'
    });
  }
  
  static async getBackups(): Promise<Array<{name: string, date: string, size: number}>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('by-type');
        
        const backups: Array<{name: string, date: string, size: number}> = [];
        const request = index.openCursor(IDBKeyRange.only('backup'));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const backupName = cursor.key.toString().replace('backup-', '');
            backups.push({
              name: backupName,
              date: cursor.value.data.backupCreatedAt,
              size: JSON.stringify(cursor.value.data).length
            });
            cursor.continue();
          } else {
            resolve(backups);
          }
        };
        
        request.onerror = () => {
          console.error('IndexedDB backup list error:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.error('IndexedDB connection error:', error);
      return [];
    }
  }
  
  static async getStats(): Promise<StorageStats> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        
        let totalSize = 0;
        let itemCount = 0;
        
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            itemCount++;
            totalSize += JSON.stringify(cursor.value).length;
            cursor.continue();
          } else {
            resolve({
              totalItems: itemCount,
              totalSize: totalSize,
              lastBackup: null,
              storageType: 'indexedDB',
              quotaUsage: 0
            });
          }
        };
        
        request.onerror = () => {
          console.error('IndexedDB stats error:', request.error);
          resolve({
            totalItems: 0,
            totalSize: 0,
            lastBackup: null,
            storageType: 'indexedDB',
            quotaUsage: 0
          });
        };
      });
    } catch (error) {
      console.error('IndexedDB connection error:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        lastBackup: null,
        storageType: 'indexedDB',
        quotaUsage: 0
      };
    }
  }
}

// ==================== PERSISTENCE MANAGER ====================
export class PersistenceManager {
  private config: PersistenceConfig;
  private lastSaveTime: number = 0;
  private saveQueue: Array<{key: string, data: any}> = [];
  private isSaving: boolean = false;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  
  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = {
      storageType: 'localStorage',
      appName: 'talend-designer',
      version: '1.0.0',
      autoSave: true,
      maxSizeMB: 10,
      backupCount: 5,
      ...config
    };
    
    this.init();
  }
  
  private init(): void {
    // Check storage availability
    if (!this.isStorageAvailable()) {
      console.warn('Storage not available, persistence disabled');
      this.config.autoSave = false;
      return;
    }
    
    // Setup auto-save if enabled
    if (this.config.autoSave) {
      this.autoSaveInterval = setInterval(() => {
        this.processSaveQueue();
      }, 5000); // Auto-save every 5 seconds
    }
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.forceSave();
      }
    });
    
    // Listen for beforeunload
    window.addEventListener('beforeunload', () => {
      this.forceSave();
    });
  }
  
  private isStorageAvailable(): boolean {
    try {
      if (this.config.storageType === 'localStorage') {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } else if (this.config.storageType === 'indexedDB') {
        return 'indexedDB' in window;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  private async processSaveQueue(): Promise<void> {
    if (this.isSaving || this.saveQueue.length === 0) return;
    
    this.isSaving = true;
    const batch = [...this.saveQueue];
    this.saveQueue = [];
    
    for (const item of batch) {
      await this.saveToStorage(item.key, item.data);
    }
    
    this.isSaving = false;
    this.lastSaveTime = Date.now();
  }
  
  private async saveToStorage(key: string, data: any): Promise<boolean> {
    try {
      if (this.config.storageType === 'localStorage') {
        return LocalStorageAdapter.save(key, data);
      } else if (this.config.storageType === 'indexedDB') {
        return await IndexedDBAdapter.save(key, data);
      }
      return false;
    } catch (error) {
      console.error('Save to storage error:', error);
      return false;
    }
  }
  
  private async loadFromStorage<T>(key: string): Promise<T | null> {
    try {
      if (this.config.storageType === 'localStorage') {
        return LocalStorageAdapter.load<T>(key);
      } else if (this.config.storageType === 'indexedDB') {
        return await IndexedDBAdapter.load<T>(key);
      }
      return null;
    } catch (error) {
      console.error('Load from storage error:', error);
      return null;
    }
  }
  
  // Public API
  async saveState(state: PersistedState): Promise<boolean> {
    const key = `${this.config.appName}-state`;
    const enhancedState = {
      ...state,
      lastUpdated: new Date().toISOString(),
      version: this.config.version
    };
    
    // Queue for saving
    this.saveQueue.push({ key, data: enhancedState });
    
    // If auto-save is enabled, process immediately
    if (this.config.autoSave) {
      await this.processSaveQueue();
    }
    
    return true;
  }
  
  async loadState(): Promise<PersistedState | null> {
    const key = `${this.config.appName}-state`;
    const state = await this.loadFromStorage<PersistedState>(key);
    
    if (state) {
      // Validate state structure
      if (this.isValidState(state)) {
        return state;
      } else {
        console.warn('Loaded state is invalid, using default');
        this.createBackup('corrupted-state-backup', state);
        return null;
      }
    }
    
    return null;
  }
  
  async createBackup(name: string, state?: PersistedState): Promise<boolean> {
    try {
      const backupState = state || await this.loadState();
      if (!backupState) return false;
      
      if (this.config.storageType === 'localStorage') {
        return LocalStorageAdapter.createBackup(backupState, name);
      } else if (this.config.storageType === 'indexedDB') {
        return await IndexedDBAdapter.createBackup(backupState, name);
      }
      return false;
    } catch (error) {
      console.error('Create backup error:', error);
      return false;
    }
  }
  
  async restoreBackup(backupName: string): Promise<boolean> {
    try {
      const backupKey = `backup-${backupName}`;
      const backup = await this.loadFromStorage<PersistedState>(backupKey);
      
      if (backup && this.isValidState(backup)) {
        await this.saveState(backup);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Restore backup error:', error);
      return false;
    }
  }
  
  async getBackups(): Promise<Array<{name: string, date: string, size: number}>> {
    if (this.config.storageType === 'localStorage') {
      return LocalStorageAdapter.getBackups();
    } else if (this.config.storageType === 'indexedDB') {
      return await IndexedDBAdapter.getBackups();
    }
    return [];
  }
  
  async getStorageStats(): Promise<StorageStats> {
    if (this.config.storageType === 'localStorage') {
      return LocalStorageAdapter.getStats();
    } else if (this.config.storageType === 'indexedDB') {
      return await IndexedDBAdapter.getStats();
    }
    return {
      totalItems: 0,
      totalSize: 0,
      lastBackup: null,
      storageType: this.config.storageType,
      quotaUsage: 0
    };
  }
  
  async clearStorage(): Promise<void> {
    try {
      if (this.config.storageType === 'localStorage') {
        LocalStorageAdapter.clear();
      } else if (this.config.storageType === 'indexedDB') {
        await IndexedDBAdapter.clear();
      }
    } catch (error) {
      console.error('Clear storage error:', error);
    }
  }
  
  async forceSave(): Promise<void> {
    await this.processSaveQueue();
  }
  
  private isValidState(state: any): state is PersistedState {
    return (
      state &&
      typeof state === 'object' &&
      Array.isArray(state.repositoryData) &&
      Array.isArray(state.expandedNodes) &&
      typeof state.metadataSettings === 'object' &&
      state.version === this.config.version
    );
  }
  
  dispose(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.forceSave();
  }
}

// ==================== PERSISTENCE SERVICE SINGLETON ====================
// Create a singleton instance for non-hook usage
export const persistenceService = new PersistenceManager();

// ==================== REACT HOOK FOR PERSISTENCE ====================
export function usePersistence(
  config?: Partial<PersistenceConfig>
) {
  const persistenceManager = useRef<PersistenceManager | null>(null);
  
  const initialize = useCallback(() => {
    if (!persistenceManager.current) {
      persistenceManager.current = new PersistenceManager(config);
    }
    return persistenceManager.current;
  }, [config]);
  
  const saveState = useCallback(async (state: PersistedState) => {
    const manager = initialize();
    const success = await manager.saveState(state);
    
    if (success) {
      console.log('💾 State saved successfully');
    }
    
    return success;
  }, [initialize]);
  
  const loadState = useCallback(async () => {
    const manager = initialize();
    const state = await manager.loadState();
    
    if (state) {
      console.log('📂 State loaded from storage');
      toast.info('Previous session restored', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
    
    return state;
  }, [initialize]);
  
  const createBackup = useCallback(async (name: string, state?: PersistedState) => {
    const manager = initialize();
    const success = await manager.createBackup(name, state);
    
    if (success) {
      toast.success(`Backup "${name}" created`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
    
    return success;
  }, [initialize]);
  
  const restoreBackup = useCallback(async (backupName: string) => {
    const manager = initialize();
    const success = await manager.restoreBackup(backupName);
    
    if (success) {
      toast.success(`Backup "${backupName}" restored`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
    
    return success;
  }, [initialize]);
  
  const getStats = useCallback(async () => {
    const manager = initialize();
    return await manager.getStorageStats();
  }, [initialize]);
  
  const clearStorage = useCallback(async () => {
    const manager = initialize();
    await manager.clearStorage();
    toast.info('Storage cleared', {
      position: "bottom-right",
      autoClose: 3000,
    });
  }, [initialize]);
  
  useEffect(() => {
    // Initialize on mount
    initialize();
    
    // Cleanup on unmount
    return () => {
      if (persistenceManager.current) {
        persistenceManager.current.dispose();
      }
    };
  }, [initialize]);
  
  return {
    saveState,
    loadState,
    createBackup,
    restoreBackup,
    getStats,
    clearStorage,
    getBackups: () => persistenceManager.current?.getBackups() || Promise.resolve([])
  };
}